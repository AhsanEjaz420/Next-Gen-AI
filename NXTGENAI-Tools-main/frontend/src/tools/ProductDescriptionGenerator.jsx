import { useState, useEffect } from 'react';
import { Loader2, Package, AlertCircle, Crown, Image as ImageIcon, Target, PenTool, Tag, DollarSign, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import { generateProductDescription } from '../api/tools';
import CopyButton from '../components/CopyButton';
import MultiStepLoader from '../components/MultiStepLoader';
import toast from 'react-hot-toast';

export default function ProductDescriptionGenerator({ onCreditsUpdate, userPlan }) {
  // ... existing state ...
  const [images, setImages] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Analyzing product features...",
    "Scanning images for details...",
    "Generating SEO-optimized copy...",
    "Finalizing descriptions..."
  ];

  // Simulated progress steps
  useEffect(() => {
    let interval;
    if (loading && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading, currentStep]);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCurrentStep(0);
    setResult(null);

    try {
      // ... validations ...
      if (!formData.productName.trim()) throw new Error('Please enter a product name');
      if (!formData.category.trim()) throw new Error('Please enter a product category');
      if (!formData.features.trim()) throw new Error('Please enter features');
      if (userPlan !== 'premium') throw new Error('Premium feature required');

      // Convert images to base64
      const base64Images = images.length > 0 ? await Promise.all(images.map(convertToBase64)) : [];

      const keyFeatures = formData.features.split('\n').map(f => f.trim()).filter(f => f.length > 0);
      const seoKeywords = formData.seoKeywords ? formData.seoKeywords.split(',').map(k => k.trim()) : [];

      const response = await generateProductDescription({
        product_name: formData.productName.trim(),
        product_category: formData.category.trim(),
        key_features: keyFeatures,
        target_audience: formData.targetAudience.trim(),
        tone: formData.tone,
        brand_name: formData.brandName.trim() || null,
        price_range: formData.priceRange.trim() || null,
        seo_keywords: seoKeywords.length > 0 ? seoKeywords : null,
        product_images: base64Images.length > 0 ? base64Images : null
      });

      if (response.success && response.data) {
        setResult(response.data);
        toast.success('Description generated!');
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
    <div className="space-y-6">
      {/* ... previous UI ... */}
      
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <MultiStepLoader steps={steps} currentStep={currentStep} isComplete={false} />
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className={result ? "hidden" : "space-y-6"}>
             {/* ... FORM CONTENT ... */}
          </form>
          
          {result && (
            <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
               {/* ... RESULTS UI ... */}
               <button 
                 onClick={() => setResult(null)}
                 className="w-full py-3 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
               >
                 Generate another description
               </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
