import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Globe,
  MapPin,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users,
  Search
} from 'lucide-react';
import { adminService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Company } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const RecruiterVerificationPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies for verification', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVerification = async (company: Company) => {
    const newStatus = !company.verified;
    try {
      const updated = await adminService.verifyRecruiter(company.id, newStatus);
      setCompanies((prev) => prev.map((c) => (c.id === company.id ? updated : c)));
      showToast({
        type: newStatus ? 'success' : 'info',
        title: newStatus ? 'Employer Verified' : 'Verification Revoked',
        message: `${company.name} verified badge updated.`
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update company verification.' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Recruiter & Employer Verification</h1>
        <p className="text-xs text-slate-400">
          Verify legitimate employer organizations to safeguard candidate data and enable verified trust badges.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <div className="space-y-4">
          {companies.map((company) => (
            <Card key={company.id} glass className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-sm shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold text-white">{company.name}</h3>
                      {company.verified ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Employer
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Pending Verification
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-indigo-400 font-semibold">{company.tagline}</p>
                    <p className="text-xs text-slate-400">{company.description}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
                      <span>{company.industry}</span>
                      <span>•</span>
                      <span>{company.location}</span>
                      <span>•</span>
                      <span>{company.size}</span>
                      <span>•</span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" /> Visit Website
                      </a>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <Button
                    variant={company.verified ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleVerification(company)}
                  >
                    {company.verified ? 'Revoke Verification' : 'Verify Organization'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
