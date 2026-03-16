import { useState, useEffect } from 'react';
import { getHistory, toggleFavorite, refineHistoryItem } from '../api/history';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Copy, 
  Check, 
  FileText, 
  MessageSquare, 
  Hash, 
  Lightbulb, 
  Mail, 
  CalendarDays, 
  Package,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  Sparkles,
  RefreshCw,
  Send
} from 'lucide-react';

// ... (ToolIcon remains same) ...

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
  // Refinement state
  const [refiningId, setRefiningId] = useState(null);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getHistory(50);
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      const msg = 'Could not load history. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async (id) => {
    if (!refineInstruction.trim()) return;
    try {
      setIsRefining(true);
      const newEntry = await refineHistoryItem(id, refineInstruction);
      setHistory(prev => [newEntry, ...prev]);
      setRefiningId(null);
      setRefineInstruction('');
      setExpandedId(newEntry.id);
      toast.success('Content refined successfully!');
    } catch (err) {
      toast.error(err.message || 'Refinement failed');
    } finally {
      setIsRefining(false);
    }
  };

  const handleToggleFavorite = async (e, id) => {
    e.stopPropagation();
    try {
      const updated = await toggleFavorite(id);
      setHistory(prev => prev.map(item => item.id === id ? updated : item));
      toast.success(updated.is_favorite ? 'Added to favorites!' : 'Removed from favorites');
    } catch (err) {
      toast.error('Failed to update favorite status');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.tool_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(item.input_data).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorite = showOnlyFavorites ? item.is_favorite : true;
    return matchesSearch && matchesFavorite;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900">Your Recent Generations</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              showOnlyFavorites 
                ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-amber-500 text-amber-500' : ''}`} />
            {showOnlyFavorites ? 'Showing Favorites' : 'Show Favorites'}
          </button>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {filteredHistory.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-4">
            {showOnlyFavorites ? <Star className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
          </div>
          <p className="text-slate-500">
            {showOnlyFavorites ? "No favorite generations yet." : "No history found."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredHistory.map((item) => (
            <div 
              key={item.id}
              className={`bg-white border rounded-xl overflow-hidden transition-all hover:shadow-md ${
                item.is_favorite ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ToolIcon name={item.tool_name} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 capitalize truncate">
                      {item.tool_name.replace('_', ' ')}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-500">{formatDate(item.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={(e) => handleToggleFavorite(e, item.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.is_favorite 
                        ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
                        : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                    }`}
                    title={item.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Star className={`w-4 h-4 ${item.is_favorite ? 'fill-amber-500' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRefiningId(refiningId === item.id ? null : item.id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      refiningId === item.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                    }`}
                    title="Refine this version"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.output_content, item.id);
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                    title="Copy Result"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <div className="p-2 text-slate-400">
                    {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Refinement Input */}
              {refiningId === item.id && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex gap-2 p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                    <input
                      type="text"
                      value={refineInstruction}
                      onChange={(e) => setRefineInstruction(e.target.value)}
                      placeholder="e.g. Make it shorter, use emojis, rewrite professionally..."
                      className="flex-1 bg-transparent border-none text-sm text-indigo-900 placeholder:text-indigo-300 focus:ring-0"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleRefine(item.id)}
                    />
                    <button
                      onClick={() => handleRefine(item.id)}
                      disabled={isRefining || !refineInstruction.trim()}
                      className="inline-flex items-center justify-center p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
                    >
                      {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-indigo-400 mt-1.5 ml-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Refining costs 1 credit
                  </p>
                </div>
              )}

              {/* Expanded Content */}
              {expandedId === item.id && (
                <div className="px-4 pb-4 border-t border-slate-50 pt-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div>
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Inputs</h5>
                    <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(item.input_data).map(([key, value]) => (
                        <div key={key} className="truncate">
                          <span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Output</h5>
                    <div className="bg-white border border-slate-100 rounded-lg p-4 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner max-h-96 overflow-y-auto">
                      {item.output_content}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
