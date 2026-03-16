import { useState } from 'react';
import { Copy, Loader2, Mail, AlertCircle } from 'lucide-react';
import { generateEmailReply } from '../api/tools';

export default function EmailReplyGenerator({ userCredits, onCreditsUpdate }) {
  const [emailText, setEmailText] = useState('');
  const [tone, setTone] = useState('');
  const [goal, setGoal] = useState('');
  const [points, setPoints] = useState('');
  const [urgency, setUrgency] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const generateReply = async () => {
    if (!emailText || !tone || !goal) {
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
      const result = await generateEmailReply({
        emailContent: emailText.trim(),
        tone: tone.trim(),
        goal: goal.trim(),
        points: points.trim() || null,
        urgency: urgency.trim() || null,
      });
      
      if (result.success && result.data) {
        setResponse(result.data.email_replies);
      }

      // Update credits from API response
      if (onCreditsUpdate && result.remaining !== undefined) {
        onCreditsUpdate(result.remaining);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate email reply. Please try again.';
      setError(errorMessage);
      console.error('Email reply generation error:', err);
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
        {/* Email Text */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Email you received<span className="text-rose-500">*</span>
          </label>
          <textarea
            value={emailText}
            onChange={(e) => {
              setEmailText(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="Paste the email or key points"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>

        {/* Desired Tone */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Desired tone<span className="text-rose-500">*</span>
          </label>
          <textarea
            value={tone}
            onChange={(e) => {
              setTone(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="e.g. professional, friendly, formal, casual"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>

        {/* Response Goal */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Response goal<span className="text-rose-500">*</span>
          </label>
          <textarea
            value={goal}
            onChange={(e) => {
              setGoal(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="e.g. accept, decline, request info, follow up"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>

        {/* Specific Points */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Points to include <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            value={points}
            onChange={(e) => {
              setPoints(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="Points to include (optional)"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>

        {/* Urgency Level */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Urgency level <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            value={urgency}
            onChange={(e) => {
              setUrgency(e.target.value);
              autoResize(e);
            }}
            onInput={autoResize}
            placeholder="e.g. urgent, normal, no rush (optional)"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateReply}
        disabled={loading}
        className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Mail className="w-4 h-4" />}
        {loading ? 'Generating...' : 'Generate Email Reply'}
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
