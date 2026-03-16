import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api/profile';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Users, 
  Megaphone, 
  FileText, 
  Save, 
  Loader2,
  Settings as SettingsIcon,
  ShieldCheck
} from 'lucide-react';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    business_niche: '',
    brand_tone: '',
    target_audience: '',
    brand_description: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile({
        business_niche: data.business_niche || '',
        brand_tone: data.brand_tone || '',
        target_audience: data.target_audience || '',
        brand_description: data.brand_description || ''
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      toast.error('Could not load brand profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile(profile);
      toast.success('Brand profile updated!');
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-600" />
          Account Settings
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Configure your brand details to get more personalized AI content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation / Info Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <h4 className="font-semibold text-indigo-900 text-sm flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4" />
              Brand Context
            </h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Saved details are automatically used by our AI tools to ensure consistency in your brand voice and target audience across all content.
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Business Niche */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  Business Niche
                </label>
                <input
                  type="text"
                  name="business_niche"
                  value={profile.business_niche}
                  onChange={handleChange}
                  placeholder="e.g. Digital Marketing Agency, Fitness Coach"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Brand Tone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-slate-400" />
                  Brand Tone
                </label>
                <input
                  type="text"
                  name="brand_tone"
                  value={profile.brand_tone}
                  onChange={handleChange}
                  placeholder="e.g. Professional, Casual, Energetic"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  Target Audience
                </label>
                <textarea
                  name="target_audience"
                  value={profile.target_audience}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe who you are talking to..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Brand Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Brand Description
                </label>
                <textarea
                  name="brand_description"
                  value={profile.brand_description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Provide more context about what your business does..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Brand Profile'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
