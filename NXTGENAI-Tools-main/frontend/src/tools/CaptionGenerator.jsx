import { useState } from 'react';
import { Copy, Loader2, MessageSquare, AlertCircle, Check } from 'lucide-react';
import { generateCaption } from '../api/tools';
import toast from 'react-hot-toast';

export default function CaptionGenerator({ userCredits, onCreditsUpdate }) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(captions);
    setCopied(true);
    toast.success('Captions copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const generateCaptions = async () => {
    if (!topic || !platform || !tone) {
      const msg = 'Please fill all required fields!';
      setError(msg);
      toast.error(msg);
      return;
    }

    // Check if user has credits (skip if unlimited)
    if (userCredits !== 'unlimited' && userCredits !== '∞' && userCredits <= 0) {
      const msg = 'You have no credits left! Please upgrade your plan to continue.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setError('');
    setLoading(true);
    setCaptions('');

    try {
      // Generate captions
      const response = await generateCaption({
        topic: topic.trim(),
        platform,
        tone: tone.trim(),
        keywords: keywords.trim() || null,
      });
      
      if (response.success && response.data) {
        setCaptions(response.data.captions);
        toast.success('Captions generated successfully!');
      }
      
      // Update credits from API response
      if (onCreditsUpdate && response.remaining !== undefined) {
        onCreditsUpdate(response.remaining);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate captions. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Caption generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {/* Post Topic */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Post topic<span className="text-rose-500">*</span>
          </label>
          <textarea
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="What are you posting about?"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>

        {/* Platform */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Platform<span className="text-rose-500">*</span>
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option>Instagram</option>
            <option>Facebook</option>
            <option>LinkedIn</option>
            <option>Twitter/X</option>
            <option>TikTok</option>
          </select>
        </div>

        {/* Tone */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Tone & style<span className="text-rose-500">*</span>
          </label>
          <textarea
            value={tone}
            onChange={(e) => {
              setTone(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="e.g. friendly, casual, professional, funny"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>

        {/* Keywords/Hashtags/CTA */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Keywords, hashtags or call-to-action <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            value={keywords}
            onChange={(e) => {
              setKeywords(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="Keywords, hashtags or CTA (optional)"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>
      </div>

      <button
        onClick={generateCaptions}
        disabled={loading}
        className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
        {loading ? 'Generating...' : 'Generate Captions'}
      </button>

      {/* Captions Output */}
      {captions && (
        <div className="relative mt-2">
          <textarea
            value={captions}
            readOnly
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 resize-none overflow-hidden"
            rows={1}
            ref={(textarea) => {
              if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
              }
            }}
          />
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-all"
            title="Copy Result"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
