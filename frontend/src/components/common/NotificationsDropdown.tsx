import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppNotification } from '../../types';
import { notificationApi } from '../../services';
import { formatFullDate } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [list, count] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Failed to load notifications from server', err);
      setError('Could not load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      notificationApi.getUnreadCount()
        .then((c) => setUnreadCount(c))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const markOneAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2.5 rounded-xl transition-all cursor-pointer border",
          isOpen
            ? "bg-slate-900 border-cyan-400/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            : "bg-slate-900/70 border-white/10 text-slate-400 hover:text-white hover:border-cyan-400/30 hover:bg-slate-900/90 shadow-sm"
        )}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-black text-white rounded-full flex items-center justify-center ring-2 ring-slate-950 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Notifications</h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={fetchNotifications}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : error ? (
              <div className="p-6 text-center text-xs text-rose-400">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">No notifications yet</p>
                <p className="text-[11px] text-slate-500">Platform updates and verification notices will appear here.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && markOneAsRead(notif.id)}
                  className={cn(
                    'p-4 flex items-start gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer',
                    !notif.read ? 'bg-purple-950/20' : 'opacity-85'
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {notif.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                    {notif.type === 'info' && <Info className="w-4 h-4 text-purple-400" />}
                    {notif.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white">{notif.title}</p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed whitespace-pre-line">
                      {notif.message}
                    </p>
                    {notif.createdAt && (
                      <p className="text-[10px] text-slate-500 mt-1.5 font-mono">
                        {formatFullDate(notif.createdAt)}
                      </p>
                    )}
                    {notif.link && (
                      <Link
                        to={notif.link}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!notif.read) markOneAsRead(notif.id);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/20 mt-2 font-medium transition-colors"
                      >
                        <span>{notif.link.includes('verification') ? 'Review Feedback' : 'View Details'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
