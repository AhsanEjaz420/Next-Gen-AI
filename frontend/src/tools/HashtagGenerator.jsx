import { useState } from 'react';
import { Copy, Loader2, Hash, AlertCircle } from 'lucide-react';
import { generateHashtags as generateHashtagsAPI } from '../api/tools';

export default function HashtagGenerator({ userCredits, onCreditsUpdate }) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [accountSize, setAccountSize] = useState('0-10k');
  const [audience, setAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState('');
  const [error, setError] = useState('');

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const generateHashtags = async () => {
    if (!topic || !platform || !accountSize) {
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
    setHashtags('');

    try {
      const response = await generateHashtagsAPI({
        topic: topic.trim(),
        platform,
        accountSize,
        audience: audience.trim() || 'general audience',
      });
      
      if (response.success && response.data) {
        setHashtags(response.data.hashtags);
      }

      // Update credits from API response
      if (onCreditsUpdate && response.remaining !== undefined) {
        onCreditsUpdate(response.remaining);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate hashtags. Please try again.';
      setError(errorMessage);
      console.error('Hashtag generation error:', err);
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
        {/* Post Topic/Niche */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Post topic or niche<span className="text-rose-500">*</span>
          </label>
          <textarea
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="e.g. coffee shop, fitness, fashion, tech"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>

        {/* Platform Dropdown */}
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
            <option>TikTok</option>
            <option>LinkedIn</option>
            <option>Twitter/X</option>
            <option>YouTube</option>
            <option>Pinterest</option>
          </select>
        </div>

        {/* Account Size Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Account size<span className="text-rose-500">*</span>
          </label>
          <select
            value={accountSize}
            onChange={(e) => setAccountSize(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="0-10k">Small: &lt;10K</option>
            <option value="10k-50k">Medium: 10K–50K</option>
            <option value="50k-100k">Large: 50K–100K</option>
            <option value="100k+">Very Large: 100K+</option>
          </select>
        </div>

        {/* Target Audience */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Target audience <span className="text-slate-400"></span>
          </label>
          <textarea
            value={audience}
            onChange={(e) => {
              setAudience(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="Target audience"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateHashtags}
        disabled={loading}
        className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Hash className="w-4 h-4" />}
        {loading ? 'Generating...' : 'Generate Hashtags'}
      </button>

      {/* Output */}
      {hashtags && (
        <div className="relative mt-2">
          <textarea
            value={hashtags}
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
            onClick={() => navigator.clipboard.writeText(hashtags)}
          />
        </div>
      )}
    </div>
  );
}
