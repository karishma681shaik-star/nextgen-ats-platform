export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const curr = (currency || 'USD').toUpperCase();
  const locale = curr === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
    maximumFractionDigits: 0
  }).format(amount);
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
    case 'active':
    case 'ready':
    case 'parsed':
      return {
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-400'
      };
    case 'Shortlisted':
    case 'Interview':
    case 'Ready for Interview':
      return {
        badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        dotClass: 'bg-indigo-400'
      };
    case 'Under Review':
    case 'processing':
    case 'pending':
      return {
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dotClass: 'bg-amber-400'
      };
    case 'Rejected':
    case 'closed':
    case 'suspended':
      return {
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        dotClass: 'bg-rose-400'
      };
    default:
      return {
        badgeClass: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
        dotClass: 'bg-slate-400'
      };
  }
}
