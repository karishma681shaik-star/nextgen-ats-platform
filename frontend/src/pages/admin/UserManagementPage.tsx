import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  UserX,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Calendar,
  Trash2,
  ShieldAlert,
  Download,
  RefreshCw,
  X,
  Copy,
  Check,
  Building2,
  Briefcase,
  Clock,
  Ban,
  Eye,
  FileText,
  Activity,
  ArrowRight,
  ExternalLink,
  Phone,
  Sparkles,
  AlertOctagon
} from 'lucide-react';
import { adminService, candidateService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { User, Role, UserStatus, AdminStats, SystemActivityLog, CandidateProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { formatFullDate } from '../../utils/formatters';

export const UserManagementPage: React.FC = () => {
  // State: Data
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<SystemActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');

  // Copy-to-clipboard state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected User Drawer
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CandidateProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Moderation Dialogs
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('Suspected fraudulent account');
  const [customSuspensionNote, setCustomSuspensionNote] = useState('');
  const [isSuspending, setIsSuspending] = useState(false);

  const [reactivateTarget, setReactivateTarget] = useState<User | null>(null);
  const [isReactivating, setIsReactivating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Audit Log Modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditSearchTerm, setAuditSearchTerm] = useState('');

  const { showToast } = useToast();

  // Debounce search input (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [fetchedUsers, fetchedStats, fetchedLogs] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getStats().catch(() => null),
        adminService.getActivityLogs().catch(() => [])
      ]);

      setUsers(fetchedUsers || []);
      if (fetchedStats) setStats(fetchedStats);
      setActivityLogs(fetchedLogs || []);
      setLastRefreshedAt(new Date());
    } catch (err: any) {
      console.error('Failed to load user management records:', err);
      setError(err?.message || 'Unable to load account records from PostgreSQL. Please retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch candidate profile when drawer opens
  useEffect(() => {
    if (selectedUser && selectedUser.role === 'candidate') {
      setIsLoadingProfile(true);
      candidateService.getUserProfile(selectedUser.id)
        .then((profile) => setSelectedProfile(profile))
        .catch(() => setSelectedProfile(null))
        .finally(() => setIsLoadingProfile(false));
    } else {
      setSelectedProfile(null);
    }
  }, [selectedUser]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && u.role.toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }

      // Account Status filter
      if (statusFilter !== 'all' && u.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Verification Status filter
      if (verificationFilter !== 'all') {
        if (verificationFilter === 'na') {
          if (u.role === 'recruiter') return false;
        } else if (verificationFilter === 'verified') {
          if (u.verificationStatus !== 'verified') return false;
        } else if (verificationFilter === 'pending') {
          if (u.verificationStatus !== 'pending') return false;
        } else if (verificationFilter === 'rejected') {
          if (u.verificationStatus !== 'rejected') return false;
        }
      }

      // Search term
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim();
        const nameMatch = u.name?.toLowerCase().includes(query);
        const emailMatch = u.email?.toLowerCase().includes(query);
        const idMatch = u.id?.toLowerCase().includes(query);
        const companyMatch = u.companyName?.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch && !idMatch && !companyMatch) {
          return false;
        }
      }

      return true;
    });
  }, [users, roleFilter, statusFilter, verificationFilter, debouncedSearch]);

  const hasActiveFilters = roleFilter !== 'all' || statusFilter !== 'all' || verificationFilter !== 'all' || searchTerm.trim().length > 0;

  const handleClearFilters = () => {
    setRoleFilter('all');
    setStatusFilter('all');
    setVerificationFilter('all');
    setSearchTerm('');
  };

  // Copy UUID
  const handleCopyId = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast({ type: 'info', title: 'Copied', message: 'Account UUID copied to clipboard.' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Safe Account Suspension
  const handleConfirmSuspension = async () => {
    if (!suspendTarget) return;

    if (suspendTarget.role === 'admin' || suspendTarget.email.toLowerCase() === 'admin@ai-ats.internal') {
      showToast({ type: 'error', title: 'Action Prohibited', message: 'The primary administrator account cannot be suspended.' });
      setSuspendTarget(null);
      return;
    }

    try {
      setIsSuspending(true);
      await adminService.setUserStatus(suspendTarget.id, 'suspended');
      showToast({
        type: 'warning',
        title: 'Account Suspended',
        message: `${suspendTarget.name} has been suspended. Platform access revoked.`
      });
      setSuspendTarget(null);
      setCustomSuspensionNote('');
      await loadAllData(true);
      if (selectedUser?.id === suspendTarget.id) {
        setSelectedUser((prev) => prev ? { ...prev, status: 'suspended' } : null);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Suspension Failed',
        message: err?.message || 'Failed to update account status in database.'
      });
    } finally {
      setIsSuspending(false);
    }
  };

  // Safe Account Reactivation
  const handleConfirmReactivation = async () => {
    if (!reactivateTarget) return;

    try {
      setIsReactivating(true);
      await adminService.setUserStatus(reactivateTarget.id, 'active');
      showToast({
        type: 'success',
        title: 'Account Reactivated',
        message: `${reactivateTarget.name} has been reactivated successfully.`
      });
      setReactivateTarget(null);
      await loadAllData(true);
      if (selectedUser?.id === reactivateTarget.id) {
        setSelectedUser((prev) => prev ? { ...prev, status: 'active' } : null);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Reactivation Failed',
        message: err?.message || 'Failed to reactivate account.'
      });
    } finally {
      setIsReactivating(false);
    }
  };

  // Safe Permanent Deletion
  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteConfirmInput.trim() !== 'DELETE' || isDeleting) return;

    if (deleteTarget.role === 'admin' || deleteTarget.email.toLowerCase() === 'admin@ai-ats.internal') {
      showToast({ type: 'error', title: 'Protected Administrator', message: 'The primary administrator account cannot be deleted.' });
      setDeleteTarget(null);
      return;
    }

    try {
      setIsDeleting(true);
      await adminService.deleteUser(deleteTarget.id);
      showToast({
        type: 'success',
        title: 'Account Permanently Deleted',
        message: `${deleteTarget.name} and related records removed from database.`
      });
      if (selectedUser?.id === deleteTarget.id) {
        setSelectedUser(null);
      }
      setDeleteTarget(null);
      setDeleteConfirmInput('');
      await loadAllData(true);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err?.message || 'Failed to permanently delete account from database.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export Records as CSV
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      showToast({ type: 'warning', title: 'No Records', message: 'No accounts match the current filter criteria to export.' });
      return;
    }

    const headers = ['Account ID', 'Full Name', 'Email', 'Role', 'Company', 'Verification Status', 'Account Status', 'Registered Date'];
    const rows = filteredUsers.map((u) => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.role.toUpperCase()}"`,
      `"${(u.companyName || '').replace(/"/g, '""')}"`,
      `"${u.role === 'recruiter' ? (u.verificationStatus || 'PENDING').toUpperCase() : 'N/A'}"`,
      `"${u.status.toUpperCase()}"`,
      `"${u.createdAt ? formatFullDate(u.createdAt) : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NextGen_ATS_Identity_Governance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({ type: 'info', title: 'Export Complete', message: `Exported ${filteredUsers.length} account records to CSV.` });
  };

  // Helper: Initials
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // User-specific audit events
  const userAuditLogs = useMemo(() => {
    if (!selectedUser) return [];
    const queryName = selectedUser.name.toLowerCase();
    const queryEmail = selectedUser.email.toLowerCase();
    const queryId = selectedUser.id.toLowerCase();

    return activityLogs.filter((log) => {
      const target = (log.target || '').toLowerCase();
      const action = (log.action || '').toLowerCase();
      return target.includes(queryName) || target.includes(queryEmail) || target.includes(queryId) || action.includes(queryName);
    });
  }, [selectedUser, activityLogs]);

  // General audit modal logs
  const filteredAuditLogs = useMemo(() => {
    if (!auditSearchTerm.trim()) return activityLogs;
    const q = auditSearchTerm.toLowerCase().trim();
    return activityLogs.filter((l) =>
      (l.action || '').toLowerCase().includes(q) ||
      (l.target || '').toLowerCase().includes(q) ||
      (l.actorName || '').toLowerCase().includes(q) ||
      (l.ipAddress || '').toLowerCase().includes(q)
    );
  }, [activityLogs, auditSearchTerm]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-100">
      {/* 1. PAGE HEADER & INFORMATION HIERARCHY */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 mb-1 tracking-wider uppercase">
            <span>Administrator</span>
            <span className="text-slate-600">/</span>
            <span className="text-violet-400">User Management</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Identity & Access Governance
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl">
            Manage registered candidates, recruiters, and account access using verified platform records.
          </p>
        </div>

        {/* Right Action Bar & Health Badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* PostgreSQL Connection Health Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{stats?.systemHealth || 'PostgreSQL Connected'}</span>
          </div>

          {/* Refresh Data */}
          <button
            onClick={() => loadAllData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all duration-200"
            title={lastRefreshedAt ? `Last refreshed: ${lastRefreshedAt.toLocaleTimeString()}` : 'Refresh database records'}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin text-violet-400' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Export Records */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all duration-200"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>

          {/* View Audit Log */}
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 hover:text-violet-200 border border-violet-500/30 text-xs font-semibold transition-all duration-200 shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-violet-400" />
            <span>Audit Log</span>
          </button>
        </div>
      </div>

      {/* 2. DATABASE-DRIVEN SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Accounts */}
        <button
          onClick={() => { setRoleFilter('all'); setStatusFilter('all'); setVerificationFilter('all'); }}
          className={`text-left p-4 rounded-2xl bg-slate-900/80 border transition-all duration-200 hover:bg-slate-900 hover:border-slate-700 ${
            roleFilter === 'all' && statusFilter === 'all' && verificationFilter === 'all'
              ? 'border-violet-500/60 ring-1 ring-violet-500/40 bg-slate-900'
              : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Accounts</span>
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-black text-white tracking-tight">
            {stats ? stats.totalUsers : users.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">Persisted platform accounts</p>
        </button>

        {/* Card 2: Candidates */}
        <button
          onClick={() => { setRoleFilter('candidate'); setStatusFilter('all'); setVerificationFilter('all'); }}
          className={`text-left p-4 rounded-2xl bg-slate-900/80 border transition-all duration-200 hover:bg-slate-900 hover:border-slate-700 ${
            roleFilter === 'candidate'
              ? 'border-sky-500/60 ring-1 ring-sky-500/40 bg-slate-900'
              : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Candidates</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-black text-sky-300 tracking-tight">
            {stats ? stats.totalCandidates : users.filter(u => u.role === 'candidate').length}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">Registered talent & job seekers</p>
        </button>

        {/* Card 3: Recruiters */}
        <button
          onClick={() => { setRoleFilter('recruiter'); setStatusFilter('all'); setVerificationFilter('all'); }}
          className={`text-left p-4 rounded-2xl bg-slate-900/80 border transition-all duration-200 hover:bg-slate-900 hover:border-slate-700 ${
            roleFilter === 'recruiter' && statusFilter === 'all' && verificationFilter === 'all'
              ? 'border-indigo-500/60 ring-1 ring-indigo-500/40 bg-slate-900'
              : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recruiters</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-black text-indigo-300 tracking-tight">
            {stats ? stats.totalRecruiters : users.filter(u => u.role === 'recruiter').length}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">Employer & recruiter profiles</p>
        </button>

        {/* Card 4: Pending Verification */}
        <button
          onClick={() => { setRoleFilter('recruiter'); setVerificationFilter('pending'); setStatusFilter('all'); }}
          className={`text-left p-4 rounded-2xl bg-slate-900/80 border transition-all duration-200 hover:bg-slate-900 hover:border-slate-700 ${
            verificationFilter === 'pending'
              ? 'border-amber-500/60 ring-1 ring-amber-500/40 bg-slate-900'
              : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-black text-amber-400 tracking-tight">
            {stats ? stats.pendingVerifications : users.filter(u => u.role === 'recruiter' && u.verificationStatus === 'pending').length}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">Awaiting employer validation</p>
        </button>

        {/* Card 5: Suspended Accounts */}
        <button
          onClick={() => { setStatusFilter('suspended'); setRoleFilter('all'); setVerificationFilter('all'); }}
          className={`col-span-2 md:col-span-1 text-left p-4 rounded-2xl bg-slate-900/80 border transition-all duration-200 hover:bg-slate-900 hover:border-slate-700 ${
            statusFilter === 'suspended'
              ? 'border-rose-500/60 ring-1 ring-rose-500/40 bg-slate-900'
              : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Suspended</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <UserX className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-black text-rose-400 tracking-tight">
            {stats ? stats.suspendedAccounts : users.filter(u => u.status === 'suspended').length}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">Access restricted by moderation</p>
        </button>
      </div>

      {/* 3. PROFESSIONAL ACCOUNT SEARCH AND FILTERS */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email, account ID, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Role Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-semibold">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950/80 text-slate-200 text-xs font-medium rounded-xl border border-slate-800 px-3 py-2 focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Roles</option>
                <option value="candidate">Candidates</option>
                <option value="recruiter">Recruiters</option>
                <option value="admin">Administrators</option>
              </select>
            </div>

            {/* Account Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950/80 text-slate-200 text-xs font-medium rounded-xl border border-slate-800 px-3 py-2 focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>

            {/* Verification Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-semibold">Verification:</span>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="bg-slate-950/80 text-slate-200 text-xs font-medium rounded-xl border border-slate-800 px-3 py-2 focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Verification</option>
                <option value="verified">Verified Recruiters</option>
                <option value="pending">Pending Review</option>
                <option value="rejected">Rejected Verification</option>
                <option value="na">Not Applicable (Candidates)</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-rose-300 hover:text-rose-200 text-xs font-semibold border border-rose-500/20 transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Count info bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Showing <strong className="text-white font-bold">{filteredUsers.length}</strong> of{' '}
            <strong className="text-white font-bold">{users.length}</strong> persisted accounts
          </span>
          {lastRefreshedAt && (
            <span>Last synchronized: {lastRefreshedAt.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => loadAllData(true)}>
            Retry
          </Button>
        </div>
      )}

      {/* 4. REDESIGNED USER DIRECTORY (TABLE) */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4">Account</th>
                <th className="p-4">Role</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Registered</th>
                <th className="p-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-normal">
              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-3.5 bg-slate-800 rounded" />
                          <div className="w-44 h-3 bg-slate-800/60 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><div className="w-20 h-4 bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-16 h-4 bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-14 h-4 bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-20 h-3 bg-slate-800 rounded" /></td>
                    <td className="p-4 text-right"><div className="w-32 h-6 bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 mx-auto">
                        <UserX className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">No accounts match your criteria</h4>
                      <p className="text-xs text-slate-400">
                        {hasActiveFilters
                          ? 'Try adjusting your search terms or clearing role/status filters.'
                          : 'No genuine user accounts found in the PostgreSQL database.'}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="px-3.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all inline-block mt-2"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.role === 'admin' || u.email.toLowerCase() === 'admin@ai-ats.internal';
                  const isSuspended = u.status === 'suspended';
                  const shortId = u.id ? `${u.id.slice(0, 8)}...` : '';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      {/* 1. Account Column */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar / Initials */}
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-700/80 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center text-violet-300 font-extrabold text-xs shrink-0 select-none shadow-sm">
                              {getInitials(u.name)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white hover:text-violet-300 transition-colors truncate">
                                {u.name}
                              </span>
                              {isAdmin && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20 shrink-0">
                                  <ShieldCheck className="w-3 h-3 text-violet-400" />
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono truncate">{u.email}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono text-slate-500 tracking-tight">ID: {shortId}</span>
                              <button
                                onClick={(e) => handleCopyId(u.id, e)}
                                className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                                title="Copy full account UUID"
                              >
                                {copiedId === u.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Role Column */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                              u.role === 'candidate'
                                ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                                : u.role === 'recruiter'
                                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                                : 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                            }`}
                          >
                            {u.role}
                          </span>
                          {u.role === 'recruiter' && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate max-w-[140px]" title={u.companyName || 'Not specified'}>
                                {u.companyName || 'Not specified'}
                              </span>
                            </div>
                          )}
                          {u.role === 'candidate' && u.title && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[140px]" title={u.title}>
                              {u.title}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 3. Verification Column */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        {u.role === 'recruiter' ? (
                          u.verificationStatus === 'verified' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Verified
                            </span>
                          ) : u.verificationStatus === 'rejected' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                              <X className="w-3 h-3 text-rose-400" />
                              Rejected
                            </span>
                          ) : u.verificationStatus === 'suspended' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              <Ban className="w-3 h-3 text-amber-400" />
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              <Clock className="w-3 h-3 text-amber-400" />
                              Pending
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium select-none">Not Applicable</span>
                        )}
                      </td>

                      {/* 4. Account Status Column */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* 5. Registered Date Column */}
                      <td className="p-4 text-slate-400 text-xs font-medium" onClick={(e) => e.stopPropagation()}>
                        {u.createdAt ? formatFullDate(u.createdAt) : 'N/A'}
                      </td>

                      {/* 6. Administrative Actions Column */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-slate-800/80 text-slate-400 border border-slate-700 select-none">
                            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                            Protected Identity
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {/* View Details */}
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              title="Open comprehensive identity governance details"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>Details</span>
                            </button>

                            {/* Suspend or Reactivate (Mutually Exclusive) */}
                            {isSuspended ? (
                              <button
                                onClick={() => setReactivateTarget(u)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 hover:border-emerald-600 text-[11px] font-semibold transition-colors flex items-center gap-1"
                                title="Reactivate suspended account"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Reactivate</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSuspendTarget(u);
                                  setSuspensionReason('Suspected fraudulent account');
                                  setCustomSuspensionNote('');
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-amber-600/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 text-[11px] font-semibold transition-colors flex items-center gap-1"
                                title="Suspend account access"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Suspend</span>
                              </button>
                            )}

                            {/* Delete Permanently */}
                            <button
                              onClick={() => {
                                setDeleteTarget(u);
                                setDeleteConfirmInput('');
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/25 hover:border-rose-600 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              title="Permanently remove account and cascade records"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ACCOUNT DETAILS DRAWER */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
          <div
            className="w-full max-w-xl bg-slate-950 border-l border-slate-800 h-full overflow-y-auto flex flex-col shadow-2xl animate-slide-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800/90 flex items-start justify-between bg-slate-900/60 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-900 border border-violet-500/30 flex items-center justify-center text-white font-extrabold text-sm select-none shadow-md">
                    {getInitials(selectedUser.name)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    {selectedUser.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="capitalize font-bold text-[10px] px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {selectedUser.role}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        selectedUser.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      }`}
                    >
                      {selectedUser.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body: Clear Sections */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* SECTION A: ACCOUNT IDENTITY */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  <span>Section A: Account Identity & Persistence</span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Account Identifier</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-slate-300 truncate" title={selectedUser.id}>
                        {selectedUser.id}
                      </span>
                      <button
                        onClick={(e) => handleCopyId(selectedUser.id, e)}
                        className="text-slate-400 hover:text-white"
                        title="Copy UUID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Registered Date</span>
                    <p className="font-medium text-slate-200 mt-0.5">
                      {selectedUser.createdAt ? formatFullDate(selectedUser.createdAt) : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Contact Phone</span>
                    <p className="font-medium text-slate-200 mt-0.5">{selectedUser.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Access Authorization</span>
                    <p className="font-medium text-emerald-300 mt-0.5">
                      {selectedUser.status === 'active' ? 'Authorized for Platform Operations' : 'Access Suspended'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION B: ROLE-SPECIFIC PROFILE */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span>Section B: Role Profile Information</span>
                </div>

                {selectedUser.role === 'recruiter' ? (
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Registered Employer</span>
                        <p className="font-bold text-white text-sm mt-0.5">{selectedUser.companyName || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Verification Status</span>
                        <div className="mt-0.5">
                          {selectedUser.verificationStatus === 'verified' ? (
                            <Badge variant="success" size="sm">Verified Employer</Badge>
                          ) : selectedUser.verificationStatus === 'rejected' ? (
                            <Badge variant="danger" size="sm">Verification Declined</Badge>
                          ) : (
                            <Badge variant="warning" size="sm">Awaiting Review</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedUser.verifiedBy && (
                      <div className="border-t border-slate-800/60 pt-2 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500">Reviewed By:</span>{' '}
                          <span className="text-slate-300 font-semibold">{selectedUser.verifiedBy}</span>
                        </div>
                        {selectedUser.verifiedAt && (
                          <div>
                            <span className="text-slate-500">Decision Date:</span>{' '}
                            <span className="text-slate-300">{formatFullDate(selectedUser.verifiedAt)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedUser.rejectionReason && (
                      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                        <span className="font-bold">Declined Reason: </span>
                        {selectedUser.rejectionReason}
                      </div>
                    )}
                  </div>
                ) : selectedUser.role === 'candidate' ? (
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    {isLoadingProfile ? (
                      <div className="py-4 text-center text-slate-500">Loading candidate profile...</div>
                    ) : selectedProfile ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">Professional Headline</span>
                            <p className="font-bold text-white mt-0.5">{selectedProfile.title || selectedUser.title || 'Candidate'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">Location</span>
                            <p className="font-medium text-slate-300 mt-0.5">{selectedProfile.location || 'Not provided'}</p>
                          </div>
                        </div>

                        {selectedProfile.bio && (
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">Bio</span>
                            <p className="text-slate-300 mt-0.5 leading-relaxed">{selectedProfile.bio}</p>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-slate-400 font-medium">Profile Completeness</span>
                            <span className="font-bold text-emerald-400">{selectedProfile.profileCompletion}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${selectedProfile.profileCompletion}%` }}
                            />
                          </div>
                        </div>

                        {/* Skills breakdown */}
                        {selectedProfile.skills && (
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">Key Technical Skills</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {(selectedProfile.skills.technical || []).slice(0, 8).map((sk, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                                  {sk}
                                </span>
                              ))}
                              {(!selectedProfile.skills.technical || selectedProfile.skills.technical.length === 0) && (
                                <span className="text-slate-500 italic text-[11px]">No technical skills logged</span>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-400 italic">No detailed candidate profile stored in PostgreSQL yet.</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                    <p className="text-slate-300">
                      Primary platform administrator with full governance authorities.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION C: RECRUITMENT ACTIVITY */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  <span>Section C: Recruitment Activity Summary</span>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  {selectedUser.role === 'recruiter' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-semibold">Job Publishing Status</span>
                        <p className="text-xs font-bold mt-0.5">
                          {selectedUser.verificationStatus === 'verified' ? (
                            <span className="text-emerald-300">Authorized to Publish Active Jobs</span>
                          ) : (
                            <span className="text-amber-400">Locked (Requires Verification)</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-semibold">Moderation Record</span>
                        <p className="text-xs font-bold text-slate-300 mt-0.5">
                          {selectedUser.status === 'active' ? 'Account in Good Standing' : 'Restricted (Suspended)'}
                        </p>
                      </div>
                    </div>
                  ) : selectedUser.role === 'candidate' ? (
                    <div className="space-y-2">
                      <p className="text-slate-300">
                        Candidate account registered in applicant tracking database. Can browse requisitions, upload verified resumes, and apply to authorized employer postings.
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-300">Administrator activities tracked in system activity log.</p>
                  )}
                </div>
              </div>

              {/* SECTION D: ACCOUNT HISTORY & AUDIT LOGS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                  <Activity className="w-4 h-4 text-violet-400" />
                  <span>Section D: Account Audit & Activity History</span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-2.5 max-h-56 overflow-y-auto">
                  {userAuditLogs.length === 0 ? (
                    <div className="py-4 text-center text-slate-500 italic">
                      No specific administrative moderation events logged for this account yet.
                    </div>
                  ) : (
                    userAuditLogs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-violet-300">{log.action}</span>
                          <span className="text-[10px] text-slate-500">{log.timestamp ? formatFullDate(log.timestamp) : ''}</span>
                        </div>
                        <p className="text-slate-300">{log.target}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                          <span>Actor: {log.actorName} ({log.actorRole})</span>
                          {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-800/90 bg-slate-900/80 flex items-center justify-between gap-3 sticky bottom-0">
              <Button variant="secondary" size="sm" onClick={() => setSelectedUser(null)}>
                Close Drawer
              </Button>

              {selectedUser.role !== 'admin' && selectedUser.email.toLowerCase() !== 'admin@ai-ats.internal' && (
                <div className="flex items-center gap-2">
                  {selectedUser.status === 'active' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSuspendTarget(selectedUser);
                        setSuspensionReason('Administrative security review');
                        setCustomSuspensionNote('');
                      }}
                      className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                    >
                      <UserX className="w-3.5 h-3.5 mr-1" />
                      Suspend Account
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setReactivateTarget(selectedUser)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      Reactivate Account
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setDeleteTarget(selectedUser);
                      setDeleteConfirmInput('');
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete Permanently
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: ACCOUNT SUSPENSION CONFIRMATION */}
      <Modal
        isOpen={!!suspendTarget}
        onClose={() => !isSuspending && setSuspendTarget(null)}
        title="SUSPEND USER ACCOUNT"
        maxWidth="md"
      >
        {suspendTarget && (
          <div className="space-y-4 text-xs text-left">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Restricted Access Governance Action</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Suspending this account will immediately revoke authentication sessions and block restricted operations (such as publishing jobs or submitting job applications). Existing historical data will be preserved.
              </p>
            </div>

            {/* Target Account Summary */}
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Target Account:</span>
                <span className="text-white font-bold">{suspendTarget.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Registered Email:</span>
                <span className="text-indigo-300 font-mono">{suspendTarget.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Role:</span>
                <span className="text-purple-300 uppercase font-bold">{suspendTarget.role}</span>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-300">
                Reason for Account Suspension:
              </label>
              <select
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-violet-500"
              >
                <option value="Suspected fraudulent account">Suspected fraudulent account</option>
                <option value="Terms of Service or platform violation">Terms of Service or platform violation</option>
                <option value="Unverified or suspicious employer credentials">Unverified or suspicious employer credentials</option>
                <option value="Candidate impersonation or duplicate profile">Candidate impersonation or duplicate profile</option>
                <option value="Administrative security review">Administrative security review</option>
                <option value="Other specified reason">Other specified reason</option>
              </select>

              {suspensionReason === 'Other specified reason' && (
                <input
                  type="text"
                  placeholder="Enter specific suspension notes..."
                  value={customSuspensionNote}
                  onChange={(e) => setCustomSuspensionNote(e.target.value)}
                  className="w-full mt-2 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-violet-500"
                />
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSuspendTarget(null)}
                disabled={isSuspending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmSuspension}
                isLoading={isSuspending}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <UserX className="w-4 h-4 mr-1.5" />
                Confirm Suspension
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 7. MODAL: ACCOUNT REACTIVATION CONFIRMATION */}
      <Modal
        isOpen={!!reactivateTarget}
        onClose={() => !isReactivating && setReactivateTarget(null)}
        title="REACTIVATE USER ACCOUNT"
        maxWidth="md"
      >
        {reactivateTarget && (
          <div className="space-y-4 text-xs text-left">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Restore Platform Access</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Reactivating this account will restore access privileges, allowing the user to sign in and resume ordinary operations in accordance with their verification status.
              </p>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Account Name:</span>
                <span className="text-white font-bold">{reactivateTarget.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Registered Email:</span>
                <span className="text-indigo-300 font-mono">{reactivateTarget.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Role:</span>
                <span className="text-purple-300 uppercase font-bold">{reactivateTarget.role}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReactivateTarget(null)}
                disabled={isReactivating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmReactivation}
                isLoading={isReactivating}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <UserCheck className="w-4 h-4 mr-1.5" />
                Confirm Reactivation
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 8. MODAL: PERMANENT ACCOUNT DELETION */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteConfirmInput('');
          }
        }}
        maxWidth="xl"
      >
        {deleteTarget && (
          <div
            className="space-y-5 text-xs text-left"
            role="dialog"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-desc"
          >
            {/* A. REFINED MODAL HEADER */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800/90">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0 mt-0.5 shadow-inner">
                  <AlertOctagon className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400/90 font-mono block mb-1">
                    ACCOUNT GOVERNANCE
                  </span>
                  <h2 id="delete-modal-title" className="text-xl font-bold text-white tracking-tight">
                    Permanently Delete Account
                  </h2>
                  <p id="delete-modal-desc" className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Review the account details and consequences before confirming this irreversible administrative action.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setDeleteTarget(null);
                    setDeleteConfirmInput('');
                  }
                }}
                disabled={isDeleting}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer disabled:opacity-40"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* B. DESTRUCTIVE ACTION WARNING */}
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  IRREVERSIBLE ACTION
                </span>
                <span className="text-xs font-semibold text-rose-200">
                  Platform Deletion Policy
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                This action permanently removes the selected account according to the platform's deletion policy.
              </p>
              <div className="pt-0.5 flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>This operation cannot be undone.</span>
              </div>
            </div>

            {/* C. ACCOUNT IDENTITY CARD */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 block">
                ACCOUNT TO BE DELETED
              </span>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Account Name */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Account Name</span>
                    <span className="text-sm font-bold text-white block truncate" title={deleteTarget.name}>
                      {deleteTarget.name}
                    </span>
                  </div>

                  {/* Email Address */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Email Address</span>
                    <span className="text-xs font-mono text-cyan-300 block truncate" title={deleteTarget.email}>
                      {deleteTarget.email}
                    </span>
                  </div>

                  {/* Account ID / UUID */}
                  <div className="sm:col-span-2">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Account ID / UUID</span>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <span className="font-mono text-[11px] text-slate-300 truncate" title={deleteTarget.id}>
                        {deleteTarget.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(deleteTarget.id);
                          setCopiedId('modal-delete-id');
                          setTimeout(() => setCopiedId(null), 2500);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors shrink-0"
                        title="Copy Account UUID"
                      >
                        {copiedId === 'modal-delete-id' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Account Role */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Account Role</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {deleteTarget.role}
                    </span>
                  </div>

                  {/* Current Status */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Current Account Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize ${
                      deleteTarget.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : deleteTarget.status === 'suspended'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {deleteTarget.status}
                    </span>
                  </div>

                  {/* Registration Date */}
                  {deleteTarget.createdAt && (
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Registration Date</span>
                      <span className="text-xs text-slate-300 font-mono">
                        {formatFullDate(deleteTarget.createdAt)}
                      </span>
                    </div>
                  )}

                  {/* Verification Status if applicable */}
                  {deleteTarget.verificationStatus && (
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Verification Status</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize bg-slate-800 text-slate-300 border border-slate-700">
                        {deleteTarget.verificationStatus}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* D. DELETION CONSEQUENCES */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 block">
                WHAT HAPPENS NEXT?
              </span>
              <ul className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>Account access and active authentication sessions are immediately revoked.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>
                    {deleteTarget.role === 'recruiter'
                      ? 'Posted job requisitions, candidate applications to those jobs, and company records are deleted.'
                      : 'Candidate profile, resumes, ATS analyses, and submitted job applications are permanently purged.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>A permanent audit event (<code className="font-mono text-cyan-300">PERMANENT_ACCOUNT_DELETION</code>) is preserved in the audit trail.</span>
                </li>
              </ul>
            </div>

            {/* E. CONFIRMATION INPUT */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                  CONFIRM PERMANENT DELETION
                </span>
                {deleteConfirmInput === 'DELETE' && (
                  <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirmation matched
                  </span>
                )}
              </div>

              <label htmlFor="confirm-delete-input" className="block text-xs text-slate-300 leading-relaxed">
                To confirm, type{' '}
                <span className="font-mono bg-rose-500/15 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 font-bold tracking-wider select-all">
                  DELETE
                </span>{' '}
                exactly as shown:
              </label>

              <input
                id="confirm-delete-input"
                type="text"
                placeholder="Type DELETE to enable confirmation"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                disabled={isDeleting}
                autoFocus
                className={`w-full font-mono text-xs px-3.5 py-2.5 rounded-xl bg-slate-950/80 border transition-all ${
                  deleteConfirmInput === 'DELETE'
                    ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 text-emerald-200'
                    : deleteConfirmInput.length > 0
                    ? 'border-amber-500/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 text-white'
                    : 'border-slate-800 focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 text-white'
                }`}
              />

              <p className="text-[11px] text-slate-400">
                Permanently deleting <strong className="text-white">{deleteTarget.name}</strong> ({deleteTarget.email}).
              </p>
            </div>

            {/* F. FOOTER ACTIONS */}
            <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (!isDeleting) {
                    setDeleteTarget(null);
                    setDeleteConfirmInput('');
                  }
                }}
                disabled={isDeleting}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs font-semibold px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
                isLoading={isDeleting}
                disabled={deleteConfirmInput !== 'DELETE' || isDeleting}
                className="bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs px-4 py-2 flex items-center gap-1.5 transition-all shadow-md shadow-rose-950/40"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>{isDeleting ? 'Deleting account securely...' : 'Permanently Delete Account'}</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 9. MODAL: SYSTEM AUDIT LOG */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="SYSTEM ACTIVITY & AUDIT LOG"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs text-left">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Persisted audit events from PostgreSQL.
            </p>
            <div className="w-64">
              <input
                type="text"
                placeholder="Search audit events..."
                value={auditSearchTerm}
                onChange={(e) => setAuditSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/80 border border-slate-800 rounded-xl bg-slate-950">
            {filteredAuditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No activity records matched your audit search.
              </div>
            ) : (
              filteredAuditLogs.map((log) => (
                <div key={log.id} className="p-3 hover:bg-slate-900/50 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-violet-300">{log.action}</span>
                    <span className="text-[10px] text-slate-500">{log.timestamp ? formatFullDate(log.timestamp) : ''}</span>
                  </div>
                  <p className="text-slate-300 text-xs">{log.target}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>
                      Actor: <strong className="text-slate-400">{log.actorName}</strong> ({log.actorRole})
                    </span>
                    {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-slate-800">
            <Button variant="secondary" size="sm" onClick={() => setIsAuditModalOpen(false)}>
              Close Audit Log
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
