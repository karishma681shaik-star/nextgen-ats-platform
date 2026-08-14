import React, { useState, useEffect } from 'react';
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
  Calendar
} from 'lucide-react';
import { adminService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { User, Role, UserStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { getStatusBadgeStyle, formatFullDate } from '../../utils/formatters';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<Role | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Status toggle confirmation
  const [statusConfirm, setStatusConfirm] = useState<{
    user: User;
    targetStatus: UserStatus;
  } | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, [roleFilter, searchTerm]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getUsers(roleFilter, searchTerm);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load user directory', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!statusConfirm) return;
    const { user, targetStatus } = statusConfirm;

    try {
      const updated = await adminService.toggleUserStatus(user.id, targetStatus);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      setStatusConfirm(null);
      showToast({
        type: 'info',
        title: `User Account ${targetStatus === 'active' ? 'Activated' : 'Suspended'}`,
        message: `${user.name} is now ${targetStatus}.`
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update account status.' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">User Account Governance</h1>
        <p className="text-xs text-slate-400">
          Search, audit, and manage candidate and recruiter accounts across the platform.
        </p>
      </div>

      {/* Filter Bar */}
      <Card glass className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-semibold">Filter Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700/80 p-2"
            >
              <option value="All">All Roles</option>
              <option value="candidate">Candidates Only</option>
              <option value="recruiter">Recruiters Only</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Directory Table */}
      <Card glass className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Loading accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const badge = getStatusBadgeStyle(u.status);
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize font-bold text-indigo-400">{u.role}</span>
                        {u.companyName && <span className="block text-[10px] text-slate-400">{u.companyName}</span>}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold border ${badge.badgeClass}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{formatFullDate(u.createdAt)}</td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <Button
                            variant={u.status === 'active' ? 'danger' : 'secondary'}
                            size="sm"
                            onClick={() =>
                              setStatusConfirm({
                                user: u,
                                targetStatus: u.status === 'active' ? 'suspended' : 'active'
                              })
                            }
                          >
                            {u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CONFIRM STATUS MODAL */}
      <ConfirmDialog
        isOpen={!!statusConfirm}
        onClose={() => setStatusConfirm(null)}
        onConfirm={handleConfirmStatusChange}
        title={statusConfirm?.targetStatus === 'suspended' ? 'Suspend User Account' : 'Activate User Account'}
        message={`Are you sure you want to ${statusConfirm?.targetStatus === 'suspended' ? 'suspend' : 'activate'} the account for ${statusConfirm?.user.name}?`}
        confirmText={statusConfirm?.targetStatus === 'suspended' ? 'Suspend' : 'Activate'}
        variant={statusConfirm?.targetStatus === 'suspended' ? 'danger' : 'primary'}
      />
    </div>
  );
};
