export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return 'Not specified';
  }

  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return 'Not specified';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatCurrency(amount: number | string | null | undefined, currency: string = 'INR'): string {
  if (amount === null || amount === undefined || amount === '') {
    return 'Not specified';
  }

  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return 'Not specified';
  }

  const curr = (currency || 'INR').toUpperCase();
  const locale = curr === 'INR' ? 'en-IN' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
    maximumFractionDigits: 0
  }).format(value);
}

export function getSalaryPeriodLabel(period?: string | null): string {
  if (!period) return 'per year';
  const p = period.toLowerCase().trim();
  if (p === 'monthly' || p === 'month' || p === 'per month') return 'per month';
  if (p === 'hourly' || p === 'hour' || p === 'per hour') return 'per hour';
  return 'per year';
}

export function formatSalaryRange(
  min?: number | string | null,
  max?: number | string | null,
  currency: string = 'INR',
  period: string = 'yearly',
  fallback: string = 'Not disclosed'
): string {
  const minNum = min !== null && min !== undefined && min !== '' ? Number(min) : NaN;
  const maxNum = max !== null && max !== undefined && max !== '' ? Number(max) : NaN;

  const hasMin = Number.isFinite(minNum) && minNum > 0;
  const hasMax = Number.isFinite(maxNum) && maxNum > 0;

  if (!hasMin && !hasMax) {
    return fallback;
  }

  const periodSuffix = ` ${getSalaryPeriodLabel(period)}`;

  if (hasMin && hasMax) {
    if (minNum === maxNum) {
      return `${formatCurrency(minNum, currency)}${periodSuffix}`;
    }
    return `${formatCurrency(minNum, currency)} – ${formatCurrency(maxNum, currency)}${periodSuffix}`;
  }

  if (hasMin) {
    return `From ${formatCurrency(minNum, currency)}${periodSuffix}`;
  }

  return `Up to ${formatCurrency(maxNum, currency)}${periodSuffix}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'Present';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatFullDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getScoreColor(score: number): {
  badgeClass: string;
  textClass: string;
  bgClass: string;
  ringColor: string;
} {
  if (score >= 90) {
    return {
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      textClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500',
      ringColor: '#10b981'
    };
  }
  if (score >= 75) {
    return {
      badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      textClass: 'text-indigo-400',
      bgClass: 'bg-indigo-500',
      ringColor: '#6366f1'
    };
  }
  if (score >= 60) {
    return {
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      textClass: 'text-amber-400',
      bgClass: 'bg-amber-500',
      ringColor: '#f59e0b'
    };
  }
  return {
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    textClass: 'text-rose-400',
    bgClass: 'bg-rose-500',
    ringColor: '#f43f5e'
  };
}

export function getStatusBadgeStyle(status: string): {
  badgeClass: string;
  dotClass: string;
} {
  switch (status) {
    case 'Selected':
    case 'Offered':
    case 'OFFERED':
    case 'SELECTED':
    case 'active':
    case 'ready':
    case 'parsed':
      return {
        badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-xs',
        dotClass: 'bg-emerald-400'
      };
    case 'Shortlisted':
    case 'SHORTLISTED':
    case 'Interview':
    case 'INTERVIEW':
    case 'Ready for Interview':
      return {
        badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/35 shadow-xs',
        dotClass: 'bg-indigo-400'
      };
    case 'Under Review':
    case 'UNDER_REVIEW':
    case 'processing':
    case 'pending':
    case 'pending_approval':
      return {
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/35 shadow-xs',
        dotClass: 'bg-amber-400'
      };
    case 'Applied':
    case 'APPLIED':
      return {
        badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/35 shadow-xs',
        dotClass: 'bg-cyan-400'
      };
    case 'closed':
    case 'draft':
    case 'Withdrawn':
    case 'WITHDRAWN':
      return {
        badgeClass: 'bg-slate-800/90 text-slate-300 border-slate-700 shadow-xs',
        dotClass: 'bg-slate-400'
      };
    case 'Rejected':
    case 'REJECTED':
    case 'rejected':
    case 'suspended':
      return {
        badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/35 shadow-xs',
        dotClass: 'bg-rose-400'
      };
    default:
      return {
        badgeClass: 'bg-slate-800/80 text-slate-300 border-white/[0.10] shadow-xs',
        dotClass: 'bg-slate-400'
      };
  }
}

export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric'
    }).format(date);
  } catch {
    return dateString || '';
  }
}

export function isDeadlinePassed(deadline?: string | null): boolean {
  if (!deadline || !deadline.trim()) return false;
  try {
    const d = new Date(deadline.trim());
    if (isNaN(d.getTime())) return false;
    if (!deadline.includes(':')) {
      d.setHours(23, 59, 59, 999);
    }
    return new Date().getTime() > d.getTime();
  } catch {
    return false;
  }
}

export function isDeadlineApproaching(deadline?: string | null, daysThreshold: number = 7): boolean {
  if (!deadline || !deadline.trim()) return false;
  try {
    const d = new Date(deadline.trim());
    if (isNaN(d.getTime())) return false;
    if (!deadline.includes(':')) {
      d.setHours(23, 59, 59, 999);
    }
    const now = new Date().getTime();
    const diffMs = d.getTime() - now;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= daysThreshold;
  } catch {
    return false;
  }
}

export function formatDeadlineLabel(deadline?: string | null): string {
  if (!deadline || !deadline.trim()) return 'No deadline set';
  if (isDeadlinePassed(deadline)) return 'Expired';
  try {
    const d = new Date(deadline.trim());
    if (isNaN(d.getTime())) return `Closes: ${deadline}`;
    return `Closes: ${new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d)}`;
  } catch {
    return `Closes: ${deadline}`;
  }
}

