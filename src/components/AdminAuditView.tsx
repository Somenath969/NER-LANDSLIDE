import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { UserAccount, AuditLogItem, LanguageCode } from '../types';
import { initialUsers } from '../data/nerData';
import { translations } from '../locales/translations';

interface AdminAuditViewProps {
  auditLogs: AuditLogItem[];
  currentLang: LanguageCode;
}

export const AdminAuditView: React.FC<AdminAuditViewProps> = ({ auditLogs, currentLang }) => {
  const t = translations[currentLang] || translations.en;
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [searchLog, setSearchLog] = useState('');

  // Load dynamically registered users from backend API
  useEffect(() => {
    fetch('/api/auth/users')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setUsers(res.data);
        }
      })
      .catch((err) => console.warn('Failed to load live users:', err));
  }, []);

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.actorName.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.targetEntity.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.details.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-100 font-['Outfit']">
              Administration, RBAC & Security Audit Logs
            </h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
              NDMA Governance Core
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Role-based user permissions and immutable system audit trail.
          </p>
        </div>
      </div>

      {/* User Directory & Roles */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Authorized Emergency Operations Officers
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{users.length} Active Accounts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((usr) => (
            <div key={usr.id} className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100">{usr.name}</span>
                <span className="bg-slate-800 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700 font-semibold">
                  {usr.role}
                </span>
              </div>
              <p className="text-slate-400">{usr.agency}</p>
              <p className="text-[11px] text-slate-500 font-mono">{usr.email} • {usr.phone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100">
              System & Operational Action Audit Trail ({filteredLogs.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              placeholder="Search audit actions..."
              className="bg-slate-800 text-slate-100 text-xs rounded-xl pl-8 pr-3 py-1.5 border border-slate-700 w-48 sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-800/80 text-slate-400 font-bold">
              <tr>
                <th className="px-4 py-2.5 rounded-l-lg">Timestamp</th>
                <th className="px-4 py-2.5">Actor & Role</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Target Entity</th>
                <th className="px-4 py-2.5">Details</th>
                <th className="px-4 py-2.5 rounded-r-lg">IP / Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log, index) => (
                <tr key={`${log.id || 'log'}-${index}`} className="hover:bg-slate-850 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()} {new Date(log.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <strong className="text-slate-100">{log.actorName}</strong>
                    <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{log.targetEntity}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
