import { useState, useEffect } from 'react';
import { Loader2, CalendarDays, AlertCircle, Crown, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { generate30DayCalendar } from '../api/tools';
import MultiStepLoader from '../components/MultiStepLoader';
import toast from 'react-hot-toast';

export default function ContentCalendar30Day({ onCreditsUpdate, userPlan }) {
  // ... existing state ...
  const [businessNiche, setBusinessNiche] = useState('');
  const [goal, setGoal] = useState('');
  const [tone, setTone] = useState('Professional');
  const [platforms, setPlatforms] = useState(['Instagram']);
  const [targetAudience, setTargetAudience] = useState('');
  const [month, setMonth] = useState(new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }));
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [downloadedFiles, setDownloadedFiles] = useState(null);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Drafting content strategy...",
    "Assigning platform specific posts...",
    "Formatting PDF and Excel files...",
    "Finalizing your 30-day calendar..."
  ];

  useEffect(() => {
    let interval;
    if (loading && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 3500); // 30-day calendar takes longer
    }
    return () => clearInterval(interval);
  }, [loading, currentStep]);

  // ... (togglePlatform and downloadBase64File logic same as before) ...

  const generateCalendar = async () => {
    // ... validations ...
    if (!businessNiche.trim() || !goal.trim()) {
      const msg = 'Please fill all required fields';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (userPlan !== 'premium') {
      toast.error('Premium plan required');
      return;
    }

    setError('');
    setLoading(true);
    setCurrentStep(0);
    setDownloadedFiles(null);

    try {
      const response = await generate30DayCalendar({
        business_niche: businessNiche.trim(),
        goal: goal.trim(),
        tone: tone,
        platforms: platforms,
        target_audience: targetAudience.trim() || undefined,
        month: month || undefined,
        business_website: businessWebsite.trim() || undefined,
        linkedin_url: linkedinUrl.trim() || undefined,
        instagram_url: instagramUrl.trim() || undefined,
      });

      if (response.success && response.data) {
        setDownloadedFiles(response.data);
        toast.success('Calendar generated successfully!');
      }

      if (onCreditsUpdate && response.remaining !== undefined) {
        onCreditsUpdate(response.remaining);
      }
    } catch (err) {
      const msg = err.message || 'Generation failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* ... premium badge and error message ... */}
      
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <MultiStepLoader steps={steps} currentStep={currentStep} isComplete={false} />
        </div>
      ) : (
        <>
          {!downloadedFiles && (
            <div className="space-y-4">
               {/* ... FORM CONTENT ... */}
               <button
                 onClick={generateCalendar}
                 disabled={loading}
                 className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:from-purple-700 hover:to-indigo-700 transition-all"
               >
                 <CalendarDays className="w-4 h-4" />
                 Generate 30-Day Content Calendar
               </button>
            </div>
          )}

          {downloadedFiles && (
            <div className="space-y-3 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 animate-in slide-in-from-bottom-4 duration-500">
               {/* ... DOWNLOAD RESULTS UI ... */}
               <button 
                 onClick={() => setDownloadedFiles(null)}
                 className="w-full py-2 text-xs font-medium text-slate-500 hover:text-indigo-600"
               >
                 Start over
               </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
