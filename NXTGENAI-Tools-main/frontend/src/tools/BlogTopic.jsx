import { useState } from 'react';
import { Copy, Loader2, FileText, AlertCircle } from 'lucide-react';
import { generateBlogTopics } from '../api/tools';

export default function BlogTopicGenerator({ userCredits, onCreditsUpdate }) {
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [themes, setThemes] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const generateTopics = async () => {
    if (!niche || !audience || !goal) {
      setError('Please fill all required fields!');
      return;
    }

    // Check if user has credits (skip if unlimited)
    if (userCredits !== 'unlimited' && userCredits !== '∞' && userCredits <= 0) {
      setError('You have no credits left! Please upgrade your plan to continue.');
      return;
    }

    setError('');
    setLoading(true);
    setResponse('');

    try {
      const result = await generateBlogTopics({
        niche: niche.trim(),
        audience: audience.trim(),
        goal: goal.trim(),
        themes: themes.trim() || null,
      });
      
      if (result.success && result.data) {
        setResponse(result.data.blog_topics);
      }

      // Update credits from API response
      if (onCreditsUpdate && result.remaining !== undefined) {
        onCreditsUpdate(result.remaining);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate blog topics. Please try again.';
      setError(errorMessage);
      console.error('Blog topic generation error:', err);
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
        {/* Niche/Industry */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Niche or website topic<span className="text-rose-500">*</span>
          </label>
          <textarea
            value={niche}
            onChange={(e) => {
              setNiche(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="e.g. finance, marketing, skincare"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Target audience<span className="text-rose-500">*</span>
          </label>
          <textarea
            value={audience}
            onChange={(e) => {
              setAudience(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="Target audience (role, level, problems)"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>

        {/* Content Goal */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Content goal<span className="text-rose-500">*</span>
          </label>
          <textarea
            value={goal}
            onChange={(e) => {
              setGoal(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="e.g. rank for keywords, generate leads, build authority"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>

        {/* Specific Themes/Topics (Optional) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Themes or angles <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            value={themes}
            onChange={(e) => {
              setThemes(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="Specific themes or topics (optional)"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateTopics}
        disabled={loading}
        className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <FileText className="w-4 h-4" />}
        {loading ? 'Generating...' : 'Generate Blog Topics'}
      </button>

      {/* Output */}
      {response && (
        <div className="relative mt-2">
          <textarea
            value={response}
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
          <Copy
            className="absolute top-3 right-3 h-4 w-4 cursor-pointer text-slate-500 hover:text-indigo-600"
            onClick={() => navigator.clipboard.writeText(response)}
          />
        </div>
      )}
    </div>
  );
}
