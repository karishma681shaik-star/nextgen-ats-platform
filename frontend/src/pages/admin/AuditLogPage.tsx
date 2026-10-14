import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Download,
  RefreshCw,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Database,
  Calendar,
  CalendarDays,
  User,
  Eye,
  Lock,
  AlertOctagon,
  X,
  CheckCircle,
  Info,
  Globe,
  ArrowUpDown,
  Trash2,
  HardDrive,
  History,
  FileWarning
} from 'lucide-react';
import { adminService } from '../../services';
import {
  SystemActivityLog,
  AuditSummary,
  AuditPageResult,
  AuditSeverity,
  AuditResult,
  Role,
  AuditCleanupPreview,
  AuditCleanupReceipt
} from '../../types';

// Configured application timezone (Standard for AI ATS platform)
const APP_TIMEZONE = 'Asia/Kolkata';

interface DateGroup {
  dateKey: string; // "YYYY-MM-DD"
  label: string; // e.g. "TODAY — 14 October 2026"
  isToday: boolean;
  isYesterday: boolean;
  totalCount: number;
  logs: SystemActivityLog[];
}

export const AuditLogPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Core Data States
  const [pageResult, setPageResult] = useState<AuditPageResult<SystemActivityLog>>({
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');

  // Filter States - Default to TODAY per requirements
  const [dateRange, setDateRange] = useState<string>('TODAY');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'ALL');
  const [severity, setSeverity] = useState<string>(searchParams.get('severity') || 'ALL');
  const [result, setResult] = useState<string>(searchParams.get('result') || 'ALL');
  const [actorRole, setActorRole] = useState<string>(searchParams.get('role') || 'ALL');
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Accordion collapsed state per date group
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  // Selected Card Filter tracker
  const [activeCardFilter, setActiveCardFilter] = useState<string | null>(null);

  // Drawer / Detail States
  const [selectedEvent, setSelectedEvent] = useState<SystemActivityLog | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<SystemActivityLog[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // CLEANUP MODAL STATES
  const [showCleanupModal, setShowCleanupModal] = useState<boolean>(false);
  const [cleanupTab, setCleanupTab] = useState<'DATE' | 'RANGE' | 'ALL' | 'HISTORY'>('DATE');
  const [cleanupTargetDate, setCleanupTargetDate] = useState<string>('2026-10-13');
  const [cleanupRangeStart, setCleanupRangeStart] = useState<string>('');
  const [cleanupRangeEnd, setCleanupRangeEnd] = useState<string>('');
  const [cleanupPreserveHigh, setCleanupPreserveHigh] = useState<boolean>(true);
  const [cleanupPreserveToday, setCleanupPreserveToday] = useState<boolean>(true);
  const [cleanupConfirmationInput, setCleanupConfirmationInput] = useState<string>('');
  const [cleanupPreview, setCleanupPreview] = useState<AuditCleanupPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [isExecutingCleanup, setIsExecutingCleanup] = useState<boolean>(false);
  const [cleanupReceipt, setCleanupReceipt] = useState<AuditCleanupReceipt | null>(null);
  const [cleanupHistory, setCleanupHistory] = useState<AuditCleanupReceipt[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [cleanupConfirmationStep, setCleanupConfirmationStep] = useState<boolean>(false);
  const [cleanupError, setCleanupError] = useState<string | null>(null);

  // Helper to format date in YYYY-MM-DD within application timezone
  const toZonedYMD = useCallback((d: Date, tz = APP_TIMEZONE) => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  }, []);

  // Helper to get time zone offset string for a local YYYY-MM-DD
  const getTzOffsetString = useCallback((ymd: string, tz = APP_TIMEZONE) => {
    try {
      const d = new Date(`${ymd}T12:00:00Z`);
      const offset = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'longOffset',
      }).format(d).split('GMT')[1];
      return offset || '+05:30';
    } catch {
      return '+05:30';
    }
  }, []);

  // Calculate Date Boundaries using Application Timezone
  const dateParams = useMemo(() => {
    const now = new Date();
    const todayYmd = toZonedYMD(now);

    if (dateRange === 'TODAY') {
      const offset = getTzOffsetString(todayYmd);
      return {
        startDate: new Date(`${todayYmd}T00:00:00${offset}`).toISOString(),
        endDate: new Date(`${todayYmd}T23:59:59.999${offset}`).toISOString(),
        label: `Today (${new Intl.DateTimeFormat('en-US', { timeZone: APP_TIMEZONE, month: 'short', day: 'numeric', year: 'numeric' }).format(now)})`,
      };
    }

    if (dateRange === 'YESTERDAY') {
      const yesterday = new Date(now.getTime() - 86400000);
      const yestYmd = toZonedYMD(yesterday);
      const offset = getTzOffsetString(yestYmd);
      return {
        startDate: new Date(`${yestYmd}T00:00:00${offset}`).toISOString(),
        endDate: new Date(`${yestYmd}T23:59:59.999${offset}`).toISOString(),
        label: `Yesterday (${new Intl.DateTimeFormat('en-US', { timeZone: APP_TIMEZONE, month: 'short', day: 'numeric', year: 'numeric' }).format(yesterday)})`,
      };
    }

    if (dateRange === '7DAYS') {
      const past7 = new Date(now.getTime() - 7 * 86400000);
      const pastYmd = toZonedYMD(past7);
      const startOffset = getTzOffsetString(pastYmd);
      const endOffset = getTzOffsetString(todayYmd);
      return {
        startDate: new Date(`${pastYmd}T00:00:00${startOffset}`).toISOString(),
        endDate: new Date(`${todayYmd}T23:59:59.999${endOffset}`).toISOString(),
        label: 'Last 7 Days',
      };
    }

    if (dateRange === '30DAYS') {
      const past30 = new Date(now.getTime() - 30 * 86400000);
      const pastYmd = toZonedYMD(past30);
      const startOffset = getTzOffsetString(pastYmd);
      const endOffset = getTzOffsetString(todayYmd);
      return {
        startDate: new Date(`${pastYmd}T00:00:00${startOffset}`).toISOString(),
        endDate: new Date(`${todayYmd}T23:59:59.999${endOffset}`).toISOString(),
        label: 'Last 30 Days',
      };
    }

    if (dateRange === 'CUSTOM' && customStartDate && customEndDate) {
      if (customStartDate > customEndDate) {
        setDateValidationError('Start date cannot be after end date.');
        return { label: 'Invalid Custom Range' };
      }
      setDateValidationError(null);
      const startOffset = getTzOffsetString(customStartDate);
      const endOffset = getTzOffsetString(customEndDate);
      return {
        startDate: new Date(`${customStartDate}T00:00:00${startOffset}`).toISOString(),
        endDate: new Date(`${customEndDate}T23:59:59.999${endOffset}`).toISOString(),
        label: `Custom: ${customStartDate} to ${customEndDate}`,
      };
    }

    // ALL Time
    return {
      startDate: undefined,
      endDate: undefined,
      label: 'All Time (All Dates)',
    };
  }, [dateRange, customStartDate, customEndDate, toZonedYMD, getTzOffsetString]);

  // Fetch summary metrics (with active filters & timezone for exact daily counts)
  const fetchSummary = useCallback(async () => {
    try {
      const res = await adminService.getAuditSummary({
        search: search.trim() || undefined,
        category: category !== 'ALL' ? category : undefined,
        severity: severity !== 'ALL' ? severity : undefined,
        result: result !== 'ALL' ? result : undefined,
        actorRole: actorRole !== 'ALL' ? actorRole : undefined,
        startDate: dateParams.startDate,
        endDate: dateParams.endDate,
        timezone: APP_TIMEZONE,
      });
      setSummary(res);
      setLastRefreshTime(
        new Intl.DateTimeFormat('en-US', {
          timeZone: APP_TIMEZONE,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(new Date())
      );
    } catch (err: any) {
      console.error('Failed to load audit summary:', err);
    }
  }, [search, category, severity, result, actorRole, dateParams]);

  // Fetch paginated events
  const fetchEvents = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const res = await adminService.getAuditEvents({
          search: search.trim() || undefined,
          category: category !== 'ALL' ? category : undefined,
          severity: severity !== 'ALL' ? severity : undefined,
          result: result !== 'ALL' ? result : undefined,
          actorRole: actorRole !== 'ALL' ? actorRole : undefined,
          startDate: dateParams.startDate,
          endDate: dateParams.endDate,
          page,
          size: pageSize,
          sortBy: 'timestamp',
          sortDir,
        });
        setPageResult(res);
        setLastRefreshTime(
          new Intl.DateTimeFormat('en-US', {
            timeZone: APP_TIMEZONE,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }).format(new Date())
        );
      } catch (err: any) {
        console.error('Failed to fetch audit events:', err);
        setError('Audit events could not be loaded from PostgreSQL. Please retry.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [search, category, severity, result, actorRole, dateParams, page, pageSize, sortDir]
  );

  // Initial load & when filters change
  useEffect(() => {
    fetchEvents();
    fetchSummary();
  }, [fetchEvents, fetchSummary]);

  // Load related events when detail drawer opens
  useEffect(() => {
    if (!selectedEvent) {
      setRelatedEvents([]);
      return;
    }
    setIsLoadingRelated(true);
    adminService
      .getRelatedAuditEvents(selectedEvent.id)
      .then((rel) => setRelatedEvents(rel))
      .catch(() => setRelatedEvents([]))
      .finally(() => setIsLoadingRelated(false));
  }, [selectedEvent]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedEvent(null);
        if (!cleanupConfirmationStep) {
          setShowCleanupModal(false);
        }
      }
    };
    if (selectedEvent || showCleanupModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEvent, showCleanupModal, cleanupConfirmationStep]);

  // Cleanup Preview Loader
  const loadCleanupPreview = useCallback(
    async (tabOverride?: 'DATE' | 'RANGE' | 'ALL' | 'HISTORY') => {
      const activeTab = tabOverride || cleanupTab;
      if (activeTab === 'HISTORY') return;

      setIsLoadingPreview(true);
      setCleanupError(null);
      try {
        let req: any;
        if (activeTab === 'DATE') {
          req = {
            operationType: 'SPECIFIC_DATE',
            date: cleanupTargetDate || '2026-10-13',
            timezone: APP_TIMEZONE,
            preserveHighSeverity: cleanupPreserveHigh,
          };
        } else if (activeTab === 'RANGE') {
          if (!cleanupRangeStart || !cleanupRangeEnd) {
            setIsLoadingPreview(false);
            return;
          }
          req = {
            operationType: 'DATE_RANGE',
            startDate: cleanupRangeStart,
            endDate: cleanupRangeEnd,
            timezone: APP_TIMEZONE,
            preserveHighSeverity: cleanupPreserveHigh,
          };
        } else if (activeTab === 'ALL') {
          req = {
            operationType: 'DELETE_ALL',
            timezone: APP_TIMEZONE,
            preserveHighSeverity: cleanupPreserveHigh,
            preserveActiveToday: cleanupPreserveToday,
          };
        }
        const preview = await adminService.previewAuditCleanup(req);
        setCleanupPreview(preview);
      } catch (err: any) {
        console.error('Failed to preview audit cleanup:', err);
        setCleanupError(err.message || 'Unable to preview cleanup.');
      } finally {
        setIsLoadingPreview(false);
      }
    },
    [
      cleanupTab,
      cleanupTargetDate,
      cleanupRangeStart,
      cleanupRangeEnd,
      cleanupPreserveHigh,
      cleanupPreserveToday,
    ]
  );

  // Cleanup History Loader
  const loadCleanupHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const history = await adminService.getAuditCleanupHistory();
      setCleanupHistory(history);
    } catch (err: any) {
      console.error('Failed to load cleanup history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Update preview when cleanup params change
  useEffect(() => {
    if (showCleanupModal && cleanupTab !== 'HISTORY') {
      loadCleanupPreview();
    } else if (showCleanupModal && cleanupTab === 'HISTORY') {
      loadCleanupHistory();
    }
  }, [showCleanupModal, cleanupTab, loadCleanupPreview, loadCleanupHistory]);

  // Execute Cleanup Operation
  const handleExecuteCleanup = async () => {
    setIsExecutingCleanup(true);
    setCleanupError(null);
    try {
      let req: any;
      if (cleanupTab === 'DATE') {
        req = {
          operationType: 'SPECIFIC_DATE',
          date: cleanupTargetDate,
          timezone: APP_TIMEZONE,
          preserveHighSeverity: cleanupPreserveHigh,
        };
      } else if (cleanupTab === 'RANGE') {
        req = {
          operationType: 'DATE_RANGE',
          startDate: cleanupRangeStart,
          endDate: cleanupRangeEnd,
          timezone: APP_TIMEZONE,
          preserveHighSeverity: cleanupPreserveHigh,
        };
      } else if (cleanupTab === 'ALL') {
        req = {
          operationType: 'DELETE_ALL',
          timezone: APP_TIMEZONE,
          confirmationCode: cleanupConfirmationInput.trim(),
          preserveHighSeverity: cleanupPreserveHigh,
          preserveActiveToday: cleanupPreserveToday,
        };
      }

      const receipt = await adminService.executeAuditCleanup(req);
      setCleanupReceipt(receipt);
      setCleanupConfirmationStep(false);
      setCleanupConfirmationInput('');
      // Refresh audit logs and counts in main page
      fetchEvents(true);
      fetchSummary();
      loadCleanupHistory();
    } catch (err: any) {
      console.error('Audit cleanup execution failed:', err);
      setCleanupError(err.message || 'Audit cleanup execution failed.');
    } finally {
      setIsExecutingCleanup(false);
    }
  };

  // Group paginated records by calendar date
  const groupedEvents = useMemo<DateGroup[]>(() => {
    if (!pageResult.content || pageResult.content.length === 0) return [];

    const now = new Date();
    const todayKey = toZonedYMD(now);
    const yesterdayKey = toZonedYMD(new Date(now.getTime() - 86400000));

    const groupsMap = new Map<string, SystemActivityLog[]>();

    for (const log of pageResult.content) {
      let key = 'Unknown Date';
      if (log.timestamp) {
        try {
          key = toZonedYMD(new Date(log.timestamp));
        } catch {
          key = 'Unknown Date';
        }
      }
      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
      }
      groupsMap.get(key)!.push(log);
    }

    const groups: DateGroup[] = [];
    for (const [dateKey, logs] of groupsMap.entries()) {
      const isToday = dateKey === todayKey;
      const isYesterday = dateKey === yesterdayKey;

      let label = dateKey;
      if (dateKey !== 'Unknown Date') {
        try {
          const [yearStr, monthStr, dayStr] = dateKey.split('-');
          const d = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
          const formattedDate = new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(d);
          const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(d).toUpperCase();

          if (isToday) {
            label = `TODAY — ${formattedDate}`;
          } else if (isYesterday) {
            label = `YESTERDAY — ${formattedDate}`;
          } else {
            label = `${dayOfWeek} — ${formattedDate}`;
          }
        } catch {
          label = dateKey;
        }
      }

      // Authoritative count from database summary daily counts
      const totalCount = summary?.dailyCounts?.[dateKey] ?? logs.length;

      groups.push({
        dateKey,
        label,
        isToday,
        isYesterday,
        totalCount,
        logs,
      });
    }

    // Sort groups strictly according to sortDir
    groups.sort((a, b) => {
      if (a.dateKey === 'Unknown Date') return 1;
      if (b.dateKey === 'Unknown Date') return -1;
      return sortDir === 'asc'
        ? a.dateKey.localeCompare(b.dateKey)
        : b.dateKey.localeCompare(a.dateKey);
    });

    return groups;
  }, [pageResult.content, summary, sortDir, toZonedYMD]);

  // Toggle individual date group accordion
  const toggleCollapseDate = (dateKey: string) => {
    setCollapsedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  // Collapse or expand all date groups
  const toggleAllDateGroups = (collapse: boolean) => {
    const newState: Record<string, boolean> = {};
    for (const g of groupedEvents) {
      newState[g.dateKey] = collapse;
    }
    setCollapsedDates(newState);
  };

  // Handle Export CSV
  const handleExport = async () => {
    setIsExporting(true);
    setExportNotice(null);
    try {
      const blob = await adminService.exportAuditReport({
        search: search.trim() || undefined,
        category: category !== 'ALL' ? category : undefined,
        severity: severity !== 'ALL' ? severity : undefined,
        result: result !== 'ALL' ? result : undefined,
        actorRole: actorRole !== 'ALL' ? actorRole : undefined,
        startDate: dateParams.startDate,
        endDate: dateParams.endDate,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-events-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportNotice('Audit report exported successfully to CSV (Protected against formula injection).');
      setTimeout(() => setExportNotice(null), 5000);
      fetchSummary();
    } catch (err: any) {
      console.error('Export failed:', err);
      setExportNotice('Export failed. Please check network connectivity and permissions.');
      setTimeout(() => setExportNotice(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  // Card filter triggers
  const handleCardClick = (cardType: string) => {
    setPage(0);
    if (activeCardFilter === cardType) {
      setActiveCardFilter(null);
      setCategory('ALL');
      setSeverity('ALL');
      setResult('ALL');
      setActorRole('ALL');
      return;
    }

    setActiveCardFilter(cardType);
    if (cardType === 'TOTAL') {
      setCategory('ALL');
      setSeverity('ALL');
      setResult('ALL');
      setActorRole('ALL');
    } else if (cardType === 'ADMIN') {
      setActorRole('ADMIN');
      setCategory('ALL');
      setSeverity('ALL');
      setResult('ALL');
    } else if (cardType === 'SECURITY') {
      setCategory('AUTHENTICATION_SECURITY');
      setActorRole('ALL');
      setSeverity('ALL');
      setResult('ALL');
    } else if (cardType === 'FAILED') {
      setResult('FAILURE');
      setCategory('ALL');
      setSeverity('ALL');
      setActorRole('ALL');
    } else if (cardType === 'GOVERNANCE') {
      setCategory('ACCOUNT_GOVERNANCE');
      setActorRole('ALL');
      setSeverity('ALL');
      setResult('ALL');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('ALL');
    setSeverity('ALL');
    setResult('ALL');
    setActorRole('ALL');
    setDateRange('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setDateValidationError(null);
    setPage(0);
    setActiveCardFilter(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (category !== 'ALL') count++;
    if (severity !== 'ALL') count++;
    if (result !== 'ALL') count++;
    if (actorRole !== 'ALL') count++;
    if (dateRange !== 'TODAY') count++;
    return count;
  }, [search, category, severity, result, actorRole, dateRange]);

  // Clean time formatting for table rows
  const formatEventTime = (ts?: string) => {
    if (!ts) return '--:--:--';
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: APP_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date(ts));
    } catch {
      return ts;
    }
  };

  // Full detailed timestamp for drawer
  const formatFullTimestamp = (ts?: string) => {
    if (!ts) return 'Not recorded';
    try {
      const d = new Date(ts);
      return new Intl.DateTimeFormat('en-US', {
        timeZone: APP_TIMEZONE,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      }).format(d);
    } catch {
      return ts;
    }
  };

  const renderSeverityBadge = (sev?: AuditSeverity | string) => {
    switch (sev) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertOctagon className="w-3 h-3 text-rose-400 shrink-0" />
            HIGH
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            WARNING
          </span>
        );
      case 'NOTICE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <Info className="w-3 h-3 text-sky-400 shrink-0" />
            NOTICE
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/15 text-slate-300 border border-slate-500/30">
            <CheckCircle className="w-3 h-3 text-slate-400 shrink-0" />
            INFO
          </span>
        );
    }
  };

  const renderResultBadge = (res?: AuditResult | string) => {
    switch (res) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            SUCCESS
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Lock className="w-3 h-3 text-purple-400 shrink-0" />
            BLOCKED
          </span>
        );
      case 'FAILURE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
            FAILED
          </span>
        );
    }
  };

  const renderRoleBadge = (role?: Role | string) => {
    const r = role ? String(role).toUpperCase() : 'SYSTEM';
    switch (r) {
      case 'ADMIN':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
            ADMIN
          </span>
        );
      case 'RECRUITER':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold tracking-wider uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            RECRUITER
          </span>
        );
      case 'CANDIDATE':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold tracking-wider uppercase bg-violet-500/15 text-violet-300 border border-violet-500/30">
            CANDIDATE
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold tracking-wider uppercase bg-slate-500/15 text-slate-300 border border-slate-500/30">
            {r}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. PAGE HEADER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="hover:text-slate-200 transition-colors">Admin Console</span>
              <span>/</span>
              <span className="hover:text-slate-200 transition-colors">Security & Governance</span>
              <span>/</span>
              <span className="text-cyan-400 font-medium">Audit Logs</span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                  Audit & Security
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    Live Telemetry
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review account activity, administrative operations, and security events date-wise.
                </p>
              </div>
            </div>

            {/* Health & Sync Indicators */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${summary?.databaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}
                />
                <span className="text-slate-300 font-medium">
                  {summary?.databaseConnected ? 'PostgreSQL Connected' : 'Disconnected'}
                </span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Last Refreshed:</span>
                <span className="text-slate-200">{lastRefreshTime || 'Just now'}</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Timezone:</span>
                <span className="text-cyan-400">{summary?.timezone || APP_TIMEZONE} (UTC+05:30)</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">Active Scope:</span>
                <span className="text-emerald-400 font-semibold">{dateParams.label}</span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            <button
              onClick={() => fetchEvents(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all shadow-sm active:scale-95"
              title="Refresh audit event stream from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 transition-all shadow-sm active:scale-95"
              title="Export filtered records to safe CSV"
            >
              <Download className={`w-3.5 h-3.5 text-cyan-400 ${isExporting ? 'animate-bounce' : ''}`} />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>

            {/* MANAGE AUDIT LOGS / CLEANUP BUTTON */}
            <button
              onClick={() => {
                setShowCleanupModal(true);
                setCleanupTab('DATE');
                setCleanupConfirmationStep(false);
                setCleanupReceipt(null);
                setCleanupConfirmationInput('');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 transition-all shadow-sm active:scale-95"
              title="Manage audit log retention and execute controlled bulk cleanup"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              Manage & Cleanup Logs
            </button>
          </div>
        </div>

        {/* Export notification alert */}
        {exportNotice && (
          <div className="mt-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{exportNotice}</span>
            </div>
            <button onClick={() => setExportNotice(null)} className="text-cyan-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. RESTRAINED SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* CARD 1: Total Events */}
        <button
          onClick={() => handleCardClick('TOTAL')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeCardFilter === 'TOTAL' || (!activeCardFilter && category === 'ALL' && actorRole === 'ALL' && result === 'ALL')
              ? 'bg-slate-800/90 border-cyan-500/50 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-500/30'
              : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Total in Period</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {summary ? summary.totalEvents : '—'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {dateRange === 'TODAY' ? "Today's events" : dateRange === 'YESTERDAY' ? "Yesterday's events" : 'Filtered scope events'}
          </p>
        </button>

        {/* CARD 2: Administrative Actions */}
        <button
          onClick={() => handleCardClick('ADMIN')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeCardFilter === 'ADMIN' || actorRole === 'ADMIN'
              ? 'bg-slate-800/90 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
              : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Admin Actions</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight font-mono">
            {summary ? summary.administrativeActions : '—'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Suspensions, verifications, deletions
          </p>
        </button>

        {/* CARD 3: Security Events */}
        <button
          onClick={() => handleCardClick('SECURITY')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeCardFilter === 'SECURITY' || category === 'AUTHENTICATION_SECURITY'
              ? 'bg-slate-800/90 border-rose-500/50 shadow-lg shadow-rose-500/5 ring-1 ring-rose-500/30'
              : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Security Events</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-300 tracking-tight font-mono">
            {summary ? summary.securityEvents : '—'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Logins, auth locks & high severity
          </p>
        </button>

        {/* CARD 4: Failed Operations */}
        <button
          onClick={() => handleCardClick('FAILED')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeCardFilter === 'FAILED' || result === 'FAILURE'
              ? 'bg-slate-800/90 border-purple-500/50 shadow-lg shadow-purple-500/5 ring-1 ring-purple-500/30'
              : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Failed Ops</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {summary ? summary.failedOperations : '—'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Rejected or blocked operations
          </p>
        </button>

        {/* CARD 5: Account Governance */}
        <button
          onClick={() => handleCardClick('GOVERNANCE')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeCardFilter === 'GOVERNANCE' || category === 'ACCOUNT_GOVERNANCE'
              ? 'bg-slate-800/90 border-emerald-500/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30'
              : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Account Gov</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-300 tracking-tight font-mono">
            {summary ? summary.accountGovernance : '—'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Registrations, statuses & deletions
          </p>
        </button>
      </div>

      {/* 3. DATE NAVIGATION TOOLBAR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 backdrop-blur-xl shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Quick Date Segmented Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Date Scope:
            </span>

            {/* TODAY */}
            <button
              onClick={() => {
                setDateRange('TODAY');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                dateRange === 'TODAY'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>Today</span>
              {summary?.todayEvents !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    dateRange === 'TODAY' ? 'bg-slate-950/30 text-slate-950' : 'bg-cyan-500/20 text-cyan-300'
                  }`}
                >
                  {summary.todayEvents}
                </span>
              )}
            </button>

            {/* YESTERDAY */}
            <button
              onClick={() => {
                setDateRange('YESTERDAY');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                dateRange === 'YESTERDAY'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>Yesterday</span>
              {summary?.yesterdayEvents !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    dateRange === 'YESTERDAY' ? 'bg-slate-950/30 text-slate-950' : 'bg-indigo-500/20 text-indigo-300'
                  }`}
                >
                  {summary.yesterdayEvents}
                </span>
              )}
            </button>

            {/* LAST 7 DAYS */}
            <button
              onClick={() => {
                setDateRange('7DAYS');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateRange === '7DAYS'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Last 7 Days
            </button>

            {/* LAST 30 DAYS */}
            <button
              onClick={() => {
                setDateRange('30DAYS');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateRange === '30DAYS'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Last 30 Days
            </button>

            {/* CUSTOM RANGE */}
            <button
              onClick={() => {
                setDateRange('CUSTOM');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateRange === 'CUSTOM'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Custom Range
            </button>

            {/* ALL TIME */}
            <button
              onClick={() => {
                setDateRange('ALL');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                dateRange === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>All Time</span>
              {summary?.totalEvents !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    dateRange === 'ALL' ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {summary.totalEvents}
                </span>
              )}
            </button>
          </div>

          {/* Quick Accordion Expand/Collapse Controls */}
          {groupedEvents.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => toggleAllDateGroups(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Expand all calendar date sections"
              >
                Expand All
              </button>
              <button
                onClick={() => toggleAllDateGroups(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Collapse all calendar date sections"
              >
                Collapse All
              </button>
            </div>
          )}
        </div>

        {/* Custom Date Range Selector Inputs (visible when CUSTOM selected) */}
        {dateRange === 'CUSTOM' && (
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center gap-3 animate-in fade-in">
            <span className="text-xs text-slate-400 font-medium">Select Calendar Range:</span>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-500 font-mono">FROM:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setPage(0);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-500 font-mono">TO:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setPage(0);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            {dateValidationError && (
              <span className="text-xs text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {dateValidationError}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. FILTER & SEARCH TOOLBAR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search by event ID, actor name, action, target, IP address..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
                setActiveCardFilter(null);
              }}
              className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">All Categories</option>
              <option value="ACCOUNT_GOVERNANCE">Account Governance</option>
              <option value="AUTHENTICATION_SECURITY">Security & Authentication</option>
              <option value="RECRUITER_VERIFICATION">Recruiter Verification</option>
              <option value="JOB_MODERATION">Job Moderation</option>
              <option value="CANDIDATE_APPLICATIONS">Applications & Interviews</option>
              <option value="SYSTEM_OPERATIONS">System Operations</option>
            </select>

            {/* Severity Dropdown */}
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(0);
              }}
              className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="NOTICE">NOTICE</option>
              <option value="WARNING">WARNING</option>
              <option value="HIGH">HIGH</option>
            </select>

            {/* Result Dropdown */}
            <select
              value={result}
              onChange={(e) => {
                setResult(e.target.value);
                setPage(0);
              }}
              className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">All Results</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILURE">FAILURE</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>

            {/* Role Filter */}
            <select
              value={actorRole}
              onChange={(e) => {
                setActorRole(e.target.value);
                setPage(0);
              }}
              className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Administrator</option>
              <option value="RECRUITER">Recruiter</option>
              <option value="CANDIDATE">Candidate</option>
              <option value="SYSTEM">System</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center gap-1.5 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 transition-colors"
              title="Toggle Sort Direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>{sortDir === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-500 text-[11px] font-medium">Active Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px]">
                Search: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {category !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[11px]">
                Category: {category.replace(/_/g, ' ')}
                <button onClick={() => setCategory('ALL')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {severity !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px]">
                Severity: {severity}
                <button onClick={() => setSeverity('ALL')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {result !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[11px]">
                Result: {result}
                <button onClick={() => setResult('ALL')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {actorRole !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px]">
                Role: {actorRole}
                <button onClick={() => setActorRole('ALL')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {dateRange !== 'TODAY' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px]">
                Scope: {dateParams.label}
                <button onClick={() => setDateRange('TODAY')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-slate-400 hover:text-white text-[11px] underline ml-auto"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* 5. MAIN DATE-WISE AUDIT EVENTS CONTAINER */}
      <div className="space-y-4">
        {/* Table Controls Bar: Record counter & Page Size */}
        <div className="px-1 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Matching Events: <span className="font-mono text-cyan-300 font-bold">{pageResult.totalElements}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              Page <span className="text-white font-mono">{page + 1}</span> of{' '}
              <span className="text-white font-mono">{Math.max(1, pageResult.totalPages)}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Content Section: Loading / Error / Empty / Date-Grouped Tables */}
        {isLoading ? (
          /* Skeleton Loading */
          <div className="p-8 space-y-4 bg-slate-900/60 border border-slate-800 rounded-3xl">
            <div className="h-10 bg-slate-800/60 animate-pulse rounded-2xl w-1/3" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-800/40 animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="p-12 text-center space-y-3 bg-slate-900/60 border border-slate-800 rounded-3xl">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">{error}</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Unable to query audit log table. Ensure the PostgreSQL connection is active and your admin token is valid.
            </p>
            <button
              onClick={() => fetchEvents()}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
            >
              Retry Request
            </button>
          </div>
        ) : pageResult.content.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center space-y-4 bg-slate-900/60 border border-slate-800 rounded-3xl">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {dateRange === 'TODAY'
                  ? 'No audit events recorded for Today'
                  : 'No audit events match your current criteria'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                {dateRange === 'TODAY'
                  ? 'Events from previous dates are stored in the historical ledger. You can easily view yesterday or all dates.'
                  : 'Try widening your date scope, clearing search keywords, or resetting category filters.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {dateRange === 'TODAY' && (
                <>
                  <button
                    onClick={() => {
                      setDateRange('YESTERDAY');
                      setPage(0);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
                  >
                    View Yesterday ({summary?.yesterdayEvents ?? 0} events)
                  </button>
                  <button
                    onClick={() => {
                      setDateRange('ALL');
                      setPage(0);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    View All Time ({summary?.totalEvents ?? 0} events)
                  </button>
                </>
              )}
              {activeFilterCount > 0 && dateRange !== 'TODAY' && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          /* DATE-WISE GROUPED TABLES */
          <div className="space-y-5">
            {groupedEvents.map((group) => {
              const isCollapsed = !!collapsedDates[group.dateKey];

              return (
                <div
                  key={group.dateKey}
                  className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm shadow-xl transition-all"
                >
                  {/* Calendar Date Section Header Banner */}
                  <div
                    onClick={() => toggleCollapseDate(group.dateKey)}
                    className={`px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors border-b ${
                      group.isToday
                        ? 'bg-gradient-to-r from-cyan-950/50 via-slate-900/80 to-slate-950/60 border-cyan-500/30 hover:border-cyan-500/50'
                        : group.isYesterday
                        ? 'bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-950/60 border-indigo-500/30 hover:border-indigo-500/50'
                        : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Accordion Chevron */}
                      <button
                        type="button"
                        className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title={isCollapsed ? 'Expand section' : 'Collapse section'}
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-cyan-400" />
                        )}
                      </button>

                      {/* Date Heading */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className={`font-bold tracking-tight text-sm ${group.isToday ? 'text-white' : 'text-slate-200'}`}>
                          {group.label}
                        </h3>

                        {group.isToday && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                            Today
                          </span>
                        )}
                        {group.isYesterday && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Yesterday
                          </span>
                        )}

                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {group.totalCount} {group.totalCount === 1 ? 'audit event' : 'audit events'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {group.logs.length} displayed on page
                      </span>

                      {/* QUICK CLEANUP ACTION FOR THIS PARTICULAR DATE */}
                      <button
                        onClick={() => {
                          setCleanupTargetDate(group.dateKey);
                          setCleanupTab('DATE');
                          setShowCleanupModal(true);
                          setCleanupConfirmationStep(false);
                          setCleanupReceipt(null);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition-colors flex items-center gap-1"
                        title={`Manage or purge audit logs for ${group.label}`}
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        Clean Date
                      </button>

                      {dateRange !== 'TODAY' && dateRange !== 'YESTERDAY' && (
                        <button
                          onClick={() => {
                            setCustomStartDate(group.dateKey);
                            setCustomEndDate(group.dateKey);
                            setDateRange('CUSTOM');
                            setPage(0);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                          title="Filter only to this date"
                        >
                          Isolate This Date
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Calendar Date Event Rows Table */}
                  {!isCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                            <th className="py-2.5 px-4 w-[110px]">Time</th>
                            <th className="py-2.5 px-3 w-[110px]">Severity</th>
                            <th className="py-2.5 px-4 w-[200px]">Actor</th>
                            <th className="py-2.5 px-4 min-w-[220px]">Action / Event</th>
                            <th className="py-2.5 px-4 min-w-[200px]">Target</th>
                            <th className="py-2.5 px-3 w-[100px]">Result</th>
                            <th className="py-2.5 px-3 w-[120px]">Source IP</th>
                            <th className="py-2.5 px-4 w-[110px] text-right">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {group.logs.map((log) => (
                            <tr
                              key={log.id}
                              onClick={() => setSelectedEvent(log)}
                              className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                            >
                              {/* Time */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="text-slate-300 font-mono text-xs font-medium">
                                  {formatEventTime(log.timestamp)}
                                </div>
                              </td>

                              {/* Severity */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                {renderSeverityBadge(log.severity)}
                              </td>

                              {/* Actor */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-slate-200 truncate max-w-[130px]" title={log.actorName}>
                                    {log.actorName || 'System'}
                                  </span>
                                  {renderRoleBadge(log.actorRole)}
                                </div>
                                {log.actorId && (
                                  <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px] mt-0.5" title={log.actorId}>
                                    ID: {log.actorId.slice(0, 8)}...
                                  </div>
                                )}
                              </td>

                              {/* Action / Event */}
                              <td className="py-3 px-4">
                                <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                                  {log.action}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-800/30">
                                    {log.eventType || 'SYSTEM_EVENT'}
                                  </span>
                                  {log.eventCategory && (
                                    <span className="text-[10px] text-slate-500">
                                      • {log.eventCategory.replace(/_/g, ' ')}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Target */}
                              <td className="py-3 px-4 max-w-[220px]">
                                <div className="text-slate-300 truncate font-medium" title={log.target}>
                                  {log.target || 'Platform Core'}
                                </div>
                                {log.targetType && (
                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                    Type: <span className="text-slate-400 font-mono">{log.targetType}</span>
                                  </div>
                                )}
                              </td>

                              {/* Result */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                {renderResultBadge(log.result)}
                              </td>

                              {/* Source IP */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className="text-[11px] font-mono text-slate-400">
                                  {log.ipAddress || 'Not recorded'}
                                </span>
                              </td>

                              {/* Details Action */}
                              <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => setSelectedEvent(log)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 font-medium text-[11px] transition-all flex items-center gap-1"
                                    title="View Full Event Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Details</span>
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(log.id, log.id)}
                                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                    title="Copy Event UUID"
                                  >
                                    {copiedId === log.id ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        {pageResult.totalPages > 1 && (
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 backdrop-blur-xl">
            <div>
              Showing events {page * pageSize + 1} – {Math.min((page + 1) * pageSize, pageResult.totalElements)} of{' '}
              <span className="font-mono text-white font-semibold">{pageResult.totalElements}</span> total matching in scope
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={pageResult.first}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <span className="font-mono text-slate-300 px-2">
                Page {page + 1} of {pageResult.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pageResult.totalPages - 1, p + 1))}
                disabled={pageResult.last}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 flex items-center gap-1 transition-all"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. PROFESSIONAL EVENT DETAILS SLIDE-OUT DRAWER */}
      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
          className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 space-y-6 shadow-2xl relative flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      Audit Record Details
                    </span>
                    {renderSeverityBadge(selectedEvent.severity)}
                    {renderResultBadge(selectedEvent.result)}
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1.5">
                    {selectedEvent.action}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                    <span>Event UUID: {selectedEvent.id}</span>
                    <button
                      onClick={() => copyToClipboard(selectedEvent.id, 'drawer-id')}
                      className="text-cyan-400 hover:text-white"
                      title="Copy Event ID"
                    >
                      {copiedId === 'drawer-id' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Event Information Grid */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Event Telemetry & Time
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Machine Action Code</span>
                    <span className="font-mono text-cyan-300 font-semibold mt-0.5 block">
                      {selectedEvent.eventType || 'SYSTEM_ACTIVITY'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Event Category</span>
                    <span className="font-medium text-slate-200 mt-0.5 block">
                      {selectedEvent.eventCategory ? selectedEvent.eventCategory.replace(/_/g, ' ') : 'System Operations'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-2">
                    <span className="text-slate-500 block text-[11px]">Exact Zoned Timestamp</span>
                    <span className="font-mono text-slate-200 mt-0.5 block font-semibold">
                      {formatFullTimestamp(selectedEvent.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actor Information */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actor Information
                </h3>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Actor Name:</span>
                    <span className="text-white font-semibold flex items-center gap-2">
                      {selectedEvent.actorName || 'System Process'}
                      {renderRoleBadge(selectedEvent.actorRole)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Actor Account UUID:</span>
                    <div className="flex items-center gap-1.5 font-mono text-slate-300">
                      <span>{selectedEvent.actorId || 'Not recorded'}</span>
                      {selectedEvent.actorId && (
                        <button
                          onClick={() => copyToClipboard(selectedEvent.actorId!, 'actor-id')}
                          className="text-cyan-400 hover:text-white"
                          title="Copy Actor UUID"
                        >
                          {copiedId === 'actor-id' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Source IP Address:</span>
                    <span className="font-mono text-cyan-400">
                      {selectedEvent.ipAddress || 'Not recorded'}
                    </span>
                  </div>
                  {selectedEvent.correlationId && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Correlation / Request ID:</span>
                      <div className="flex items-center gap-1.5 font-mono text-slate-300">
                        <span>{selectedEvent.correlationId}</span>
                        <button
                          onClick={() => copyToClipboard(selectedEvent.correlationId!, 'corr-id')}
                          className="text-cyan-400 hover:text-white"
                          title="Copy Correlation ID"
                        >
                          {copiedId === 'corr-id' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Target Information */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Target Information
                </h3>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Entity:</span>
                    <span className="text-slate-200 font-medium">
                      {selectedEvent.target || 'Platform Core'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Entity Type:</span>
                    <span className="font-mono text-slate-300 px-1.5 py-0.2 rounded bg-slate-800">
                      {selectedEvent.targetType || 'SYSTEM'}
                    </span>
                  </div>
                  {selectedEvent.targetId && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Target UUID:</span>
                      <div className="flex items-center gap-1.5 font-mono text-slate-300">
                        <span>{selectedEvent.targetId}</span>
                        <button
                          onClick={() => copyToClipboard(selectedEvent.targetId!, 'target-id')}
                          className="text-cyan-400 hover:text-white"
                          title="Copy Target UUID"
                        >
                          {copiedId === 'target-id' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Operation Context & Decision Reason */}
              {(selectedEvent.previousState || selectedEvent.newState || selectedEvent.reason) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Change Context & Rationale
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5 text-xs">
                    {(selectedEvent.previousState || selectedEvent.newState) && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">State Transition:</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-400">{selectedEvent.previousState || 'NONE'}</span>
                          <span>→</span>
                          <span className="text-emerald-400 font-semibold">{selectedEvent.newState || 'UPDATED'}</span>
                        </div>
                      </div>
                    )}
                    {selectedEvent.reason && (
                      <div>
                        <span className="text-slate-400 block mb-1">Administrative / System Reason:</span>
                        <p className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 italic leading-relaxed">
                          "{selectedEvent.reason}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Related Platform Activity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Related Activity Trail
                  </h3>
                  {isLoadingRelated && (
                    <span className="text-[10px] text-cyan-400 animate-pulse">Loading related...</span>
                  )}
                </div>

                {relatedEvents.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/50 text-center text-xs text-slate-500">
                    No correlating records found for this actor or target entity.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {relatedEvents.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => setSelectedEvent(rel)}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{rel.action}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {formatFullTimestamp(rel.timestamp)} • by {rel.actorName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderSeverityBadge(rel.severity)}
                          {renderResultBadge(rel.result)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  const safeEvent = { ...selectedEvent };
                  const json = JSON.stringify(safeEvent, null, 2);
                  navigator.clipboard.writeText(json);
                  setCopiedId('drawer-json');
                  setTimeout(() => setCopiedId(null), 2500);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5"
              >
                {copiedId === 'drawer-json' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy Raw Event JSON
              </button>

              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. DEDICATED AUDIT LOG CLEANUP & RETENTION MODAL */}
      {showCleanupModal && (
        <div
          onClick={() => {
            if (!isExecutingCleanup) {
              setShowCleanupModal(false);
              setCleanupConfirmationStep(false);
            }
          }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5 my-8"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    Audit Log Retention & Cleanup
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      PostgreSQL Engine
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Execute verified date-wise purges or bulk cleanup while maintaining immutable receipts in a protected ledger.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isExecutingCleanup) {
                    setShowCleanupModal(false);
                    setCleanupConfirmationStep(false);
                  }
                }}
                disabled={isExecutingCleanup}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-40"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {cleanupError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{cleanupError}</span>
              </div>
            )}

            {/* Success Receipt Banner */}
            {cleanupReceipt && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Cleanup Operation Completed Successfully
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-700/50">
                    ID: {cleanupReceipt.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
                    <span className="text-emerald-400/80 block text-[10px]">RECORDS PURGED</span>
                    <span className="text-white font-bold text-sm">{cleanupReceipt.recordsDeleted}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
                    <span className="text-emerald-400/80 block text-[10px]">PROTECTED HELD</span>
                    <span className="text-white font-bold text-sm">{cleanupReceipt.recordsProtected}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
                    <span className="text-emerald-400/80 block text-[10px]">TIMEZONE</span>
                    <span className="text-white font-medium">{cleanupReceipt.timezone}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
                    <span className="text-emerald-400/80 block text-[10px]">RECEIPT STORED</span>
                    <span className="text-white font-medium">Protected Ledger</span>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-300/80 italic pt-1">
                  Receipt registered in immutable `audit_cleanup_receipts` table. Main table and summary counters refreshed.
                </p>
              </div>
            )}

            {/* Cleanup Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => {
                  setCleanupTab('DATE');
                  setCleanupConfirmationStep(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  cleanupTab === 'DATE'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Specific Calendar Date
              </button>

              <button
                onClick={() => {
                  setCleanupTab('RANGE');
                  setCleanupConfirmationStep(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  cleanupTab === 'RANGE'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
                Custom Date Range
              </button>

              <button
                onClick={() => {
                  setCleanupTab('ALL');
                  setCleanupConfirmationStep(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  cleanupTab === 'ALL'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/60'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                Purge All Eligible
              </button>

              <button
                onClick={() => {
                  setCleanupTab('HISTORY');
                  setCleanupConfirmationStep(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ml-auto ${
                  cleanupTab === 'HISTORY'
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                Cleanup History & Storage
              </button>
            </div>

            {/* TAB CONTENT */}
            {cleanupTab === 'HISTORY' ? (
              /* TAB 4: CLEANUP HISTORY & STORAGE INSIGHTS */
              <div className="space-y-4">
                {/* Storage Architecture Overview */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    PostgreSQL Storage & Reusable Page Management
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    When audit events are deleted, PostgreSQL marks the table rows as dead tuples. Space is immediately freed for internal reuse by subsequent audit events, preventing table disk bloat. Operating-system disk file shrinking occurs automatically during scheduled autovacuum cycles without blocking live platform queries.
                  </p>
                </div>

                {/* History Ledger */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Immutable Cleanup Receipts ({cleanupHistory.length})
                  </h3>

                  {isLoadingHistory ? (
                    <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                      Loading protected cleanup receipts...
                    </div>
                  ) : cleanupHistory.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                      No prior cleanup operations recorded in the protected receipts ledger.
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {cleanupHistory.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{rec.operationType}</span>
                              <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/30">
                                {rec.recordsDeleted} deleted
                              </span>
                              {rec.recordsProtected > 0 && (
                                <span className="font-mono text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/30">
                                  {rec.recordsProtected} protected
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              By {rec.adminName} ({rec.adminEmail}) • IP: {rec.clientIp || '127.0.0.1'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {rec.notes || 'Routine audit cleanup'}
                            </div>
                          </div>

                          <div className="text-right text-[11px] text-slate-400 font-mono">
                            <div>{formatFullTimestamp(rec.completedAt)}</div>
                            <span className="text-[10px] text-emerald-400 font-semibold">{rec.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* TABS 1, 2, 3: CLEANUP CONFIGURATION & PREVIEW */
              <div className="space-y-4">
                {/* Mode-Specific Input Controls */}
                {cleanupTab === 'DATE' && (
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Select Specific Calendar Date to Clean:
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="date"
                        value={cleanupTargetDate}
                        onChange={(e) => {
                          setCleanupTargetDate(e.target.value);
                          setCleanupConfirmationStep(false);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                      {/* Quick Date Shortcuts from Active Scope */}
                      {groupedEvents.map((g) => (
                        <button
                          key={g.dateKey}
                          type="button"
                          onClick={() => {
                            setCleanupTargetDate(g.dateKey);
                            setCleanupConfirmationStep(false);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-colors border ${
                            cleanupTargetDate === g.dateKey
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {g.dateKey} ({g.totalCount})
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Calculates strictly within the configured application timezone <span className="text-cyan-400 font-mono">Asia/Kolkata (UTC+05:30)</span>. Records before or after midnight are strictly isolated.
                    </p>
                  </div>
                )}

                {cleanupTab === 'RANGE' && (
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Select Inclusive Date Range to Clean:
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-mono">FROM:</span>
                        <input
                          type="date"
                          value={cleanupRangeStart}
                          onChange={(e) => {
                            setCleanupRangeStart(e.target.value);
                            setCleanupConfirmationStep(false);
                          }}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-mono">TO:</span>
                        <input
                          type="date"
                          value={cleanupRangeEnd}
                          onChange={(e) => {
                            setCleanupRangeEnd(e.target.value);
                            setCleanupConfirmationStep(false);
                          }}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {cleanupTab === 'ALL' && (
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2.5">
                    <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                      <FileWarning className="w-4 h-4 text-rose-400" />
                      Bulk Deletion of Historical Audit Logs
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      This operation will permanently purge matching historical audit logs across all prior dates. A permanent cryptographic cleanup receipt will be saved in the protected audit ledger, ensuring full administrative accountability.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="preserveToday"
                        checked={cleanupPreserveToday}
                        onChange={(e) => setCleanupPreserveToday(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <label htmlFor="preserveToday" className="text-xs text-slate-300 select-none">
                        Preserve Today's Active Telemetry (Recommended for continuous live monitoring)
                      </label>
                    </div>
                  </div>
                )}

                {/* Common Retention Policy Safeguard Checkbox */}
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        Compliance Retention Hold
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Exclude High-Severity security events, authentication blocks, and critical incidents from deletion.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cleanupPreserveHigh}
                    onChange={(e) => setCleanupPreserveHigh(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 ml-3"
                  />
                </div>

                {/* DYNAMIC RECORD PREVIEW CARD */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      PostgreSQL Pre-Execution Audit Preview
                    </span>
                    {isLoadingPreview && (
                      <span className="text-xs text-cyan-400 animate-pulse font-mono">
                        Querying database engine...
                      </span>
                    )}
                  </div>

                  {cleanupPreview ? (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">MATCHING IN SCOPE</span>
                          <span className="text-white text-base font-bold">{cleanupPreview.totalMatching}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30">
                          <span className="text-rose-400 text-[10px] block">ELIGIBLE FOR PURGE</span>
                          <span className="text-rose-300 text-base font-bold">{cleanupPreview.eligibleForDeletion}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                          <span className="text-emerald-400 text-[10px] block">PROTECTED HELD</span>
                          <span className="text-emerald-300 text-base font-bold">{cleanupPreview.protectedRecords}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">EST. FREED SLOTS</span>
                          <span className="text-cyan-300 text-base font-bold">{cleanupPreview.estimatedReclaimedBytes}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div>
                          <span className="text-slate-500 font-mono">Scope Target:</span>{' '}
                          <span className="text-slate-200">{cleanupPreview.targetScopeLabel}</span>
                        </div>
                        {cleanupPreview.earliestTimestamp && (
                          <div>
                            <span className="text-slate-500 font-mono">Earliest Event:</span>{' '}
                            <span className="text-slate-300 font-mono">{formatFullTimestamp(cleanupPreview.earliestTimestamp)}</span>
                          </div>
                        )}
                        {cleanupPreview.latestTimestamp && (
                          <div>
                            <span className="text-slate-500 font-mono">Latest Event:</span>{' '}
                            <span className="text-slate-300 font-mono">{formatFullTimestamp(cleanupPreview.latestTimestamp)}</span>
                          </div>
                        )}
                        <div className="text-slate-500 italic pt-1">
                          {cleanupPreview.protectionReason}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Select date or range above to calculate matching database records.
                    </div>
                  )}
                </div>

                {/* CONFIRMATION STEP */}
                {cleanupConfirmationStep && (
                  <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Final Confirmation: Permanent Deletion
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      You are about to permanently purge{' '}
                      <span className="font-bold text-rose-300 font-mono">
                        {cleanupPreview?.eligibleForDeletion ?? 0}
                      </span>{' '}
                      audit log records from PostgreSQL. This operation cannot be undone. An immutable receipt will be registered to your administrative credentials.
                    </p>

                    {cleanupTab === 'ALL' && (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-xs text-slate-300 block">
                          Type <span className="font-mono font-bold text-rose-400">DELETE ALL</span> to confirm:
                        </label>
                        <input
                          type="text"
                          value={cleanupConfirmationInput}
                          onChange={(e) => setCleanupConfirmationInput(e.target.value)}
                          placeholder="DELETE ALL"
                          className="w-full bg-slate-900 border border-rose-500/50 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          setCleanupConfirmationStep(false);
                          setCleanupConfirmationInput('');
                        }}
                        disabled={isExecutingCleanup}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleExecuteCleanup}
                        disabled={
                          isExecutingCleanup ||
                          (cleanupTab === 'ALL' && cleanupConfirmationInput.trim() !== 'DELETE ALL') ||
                          !cleanupPreview ||
                          cleanupPreview.eligibleForDeletion === 0
                        }
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
                      >
                        {isExecutingCleanup ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Purging Database Records...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            Confirm & Execute Cleanup
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* MODAL BOTTOM ACTION CONTROLS */}
                {!cleanupConfirmationStep && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-slate-500">
                      Targeted SQL deletion executed directly on PostgreSQL engine.
                    </span>

                    <button
                      onClick={() => setCleanupConfirmationStep(true)}
                      disabled={
                        isLoadingPreview ||
                        !cleanupPreview ||
                        cleanupPreview.eligibleForDeletion === 0
                      }
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600/90 hover:bg-rose-500 disabled:opacity-40 text-white transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {cleanupTab === 'DATE'
                        ? 'Delete Logs for This Date'
                        : cleanupTab === 'RANGE'
                        ? 'Delete Logs for Selected Range'
                        : 'Purge All Eligible Audit Logs'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
