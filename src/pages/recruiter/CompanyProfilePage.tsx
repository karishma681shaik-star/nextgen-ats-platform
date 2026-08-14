import React, { useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Phone,
  Mail,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { recruiterService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Company } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const CompanyProfilePage: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newBenefitInput, setNewBenefitInput] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      setIsLoading(true);
      const data = await recruiterService.getCompanyProfile();
      setCompany(data);
    } catch (err) {
      console.error('Failed to load company profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    try {
      setIsSaving(true);
      const updated = await recruiterService.updateCompanyProfile(company);
      setCompany(updated);
      showToast({
        type: 'success',
        title: 'Company Profile Updated',
        message: 'Employer brand and perks saved.'
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update company profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBenefit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBenefitInput.trim() || !company) return;
    if (company.benefits.includes(newBenefitInput.trim())) return;

    const updated = {
      ...company,
      benefits: [...company.benefits, newBenefitInput.trim()]
    };
    setCompany(updated);
    setNewBenefitInput('');
    showToast({ type: 'info', title: 'Benefit Added', message: newBenefitInput.trim() });
  };

  const handleRemoveBenefit = (benefit: string) => {
    if (!company) return;
    const updated = {
      ...company,
      benefits: company.benefits.filter((b) => b !== benefit)
    };
    setCompany(updated);
  };

  if (isLoading || !company) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Employer Branding</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Company Profile</h1>
          <p className="text-xs text-slate-400">
            Showcase your organization's culture, perks, and brand to prospective candidates.
          </p>
        </div>

        {company.verified && (
          <Badge variant="success" dot size="md" className="self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 mr-1" /> Verified Employer
          </Badge>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Banner Card */}
        <Card glass className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
            <img
              src={company.logo}
              alt={company.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-glow"
            />
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-white">{company.name}</h3>
              <p className="text-xs text-indigo-400 font-semibold">{company.tagline}</p>
              <p className="text-[11px] text-slate-400">{company.industry} • {company.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              required
            />
            <Input
              label="Brand Tagline"
              value={company.tagline}
              onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
              required
            />
            <Input
              label="Primary Industry"
              value={company.industry}
              onChange={(e) => setCompany({ ...company, industry: e.target.value })}
              required
            />
            <Input
              label="Website URL"
              value={company.website}
              onChange={(e) => setCompany({ ...company, website: e.target.value })}
              leftIcon={<Globe className="w-4 h-4" />}
              required
            />
            <Input
              label="Headquarters Location"
              value={company.location}
              onChange={(e) => setCompany({ ...company, location: e.target.value })}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Company Size"
                value={company.size}
                onChange={(e) => setCompany({ ...company, size: e.target.value })}
                placeholder="e.g. 250-500 employees"
              />
              <Input
                label="Founded Year"
                value={company.foundedYear}
                onChange={(e) => setCompany({ ...company, foundedYear: e.target.value })}
                placeholder="2019"
              />
            </div>
          </div>

          <Textarea
            label="About Company / Mission"
            rows={4}
            value={company.description}
            onChange={(e) => setCompany({ ...company, description: e.target.value })}
            helperText="Provide a clear description of what your organization builds and the engineering problems you solve."
          />
        </Card>

        {/* Perks & Benefits Editor */}
        <Card glass className="p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Benefits & Employee Perks ({company.benefits.length})
          </h3>

          <div className="flex gap-2">
            <Input
              placeholder="e.g. 100% Covered Medical, $1500 Home Office Stipend, Unlimited PTO..."
              value={newBenefitInput}
              onChange={(e) => setNewBenefitInput(e.target.value)}
            />
            <Button type="button" variant="primary" onClick={handleAddBenefit} leftIcon={<Plus className="w-4 h-4" />}>
              Add Perk
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {company.benefits.map((benefit) => (
              <div
                key={benefit}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{benefit}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveBenefit(benefit)}
                  className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact Information */}
        <Card glass className="p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Recruitment & Talent Contact Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Careers Contact Email"
              type="email"
              value={company.contactEmail}
              onChange={(e) => setCompany({ ...company, contactEmail: e.target.value })}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Talent Acquisition Phone"
              value={company.contactPhone}
              onChange={(e) => setCompany({ ...company, contactPhone: e.target.value })}
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="glow" size="lg" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save Company Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
