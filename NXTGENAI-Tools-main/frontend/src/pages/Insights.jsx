import { useState, useEffect } from 'react';
import { getInsights } from '../api/insights';
import toast from 'react-hot-toast';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Sparkles, 
  Calendar,
  PieChart as PieIcon,
  ChevronRight
} from 'lucide-react';

const Insights = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getInsights();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      toast.error('Could not load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const totalGens = stats.total_generations || 0;
  const toolEntries = Object.entries(stats.tool_distribution || {});
  const maxUsage = Math.max(...toolEntries.map(([_, count]) => count), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Usage Insights
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track your content generation productivity.</p>
        </div>
        <div className="hidden sm:block px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Generations</p>
          <p className="text-2xl font-bold text-indigo-900">{totalGens}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tool Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <PieIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Tool Distribution</h3>
          </div>
          
          <div className="space-y-4">
            {toolEntries.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-sm italic">No tool usage recorded yet.</p>
            ) : (
              toolEntries.sort((a, b) => b[1] - a[1]).map(([tool, count]) => (
                <div key={tool} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="capitalize">{tool.replace('_', ' ')}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(count / maxUsage) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 7-Day Trend */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">7-Day Trend</h3>
          </div>

          <div className="flex items-end justify-between h-48 gap-2 pt-4">
            {stats.daily_usage.length === 0 ? (
              <div className="w-full flex items-center justify-center h-full text-slate-400 text-sm italic">
                Starting to track your activity...
              </div>
            ) : (
              stats.daily_usage.map((day, idx) => {
                const maxDay = Math.max(...stats.daily_usage.map(d => d.count), 1);
                const height = (day.count / maxDay) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative flex flex-col justify-end h-full">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {day.count} gens
                      </div>
                      <div 
                        className="w-full bg-indigo-100 hover:bg-indigo-600 rounded-t-lg transition-all duration-500"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium rotate-45 sm:rotate-0 mt-2">
                      {day.date.split('-').slice(1).join('/')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md">
          <Zap className="w-6 h-6 mb-3 opacity-80" />
          <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Top Tool</p>
          <h4 className="text-xl font-bold capitalize">
            {toolEntries.length > 0 ? toolEntries.sort((a,b) => b[1]-a[1])[0][0].replace('_', ' ') : 'None'}
          </h4>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <Sparkles className="w-6 h-6 mb-3 text-purple-500" />
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Favorite Gens</p>
          <h4 className="text-xl font-bold text-slate-900">Enabled</h4>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <Calendar className="w-6 h-6 mb-3 text-blue-500" />
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Activity Score</p>
          <h4 className="text-xl font-bold text-slate-900">
            {totalGens > 50 ? 'Power User' : totalGens > 10 ? 'Active' : 'Getting Started'}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Insights;
