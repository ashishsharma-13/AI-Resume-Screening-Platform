import React, { useState, useEffect } from 'react';
import {
  History,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Search,
  X,
  Code
} from 'lucide-react';
import { getProcessingHistory } from '../api';

export default function ProcessingHistoryPage({ onSelectCandidate }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeLog, setActiveLog] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProcessingHistory();
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Failed loading history', err);
      setError(err.message || 'Failed loading processing history');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.file_name.toLowerCase().includes(search.toLowerCase()) ||
      (l.candidate_id && l.candidate_id.toLowerCase().includes(search.toLowerCase())) ||
      l.message.toLowerCase().includes(search.toLowerCase())
  );

  const successCount = logs.filter((l) => l.status === 'Success').length;
  const warningCount = logs.filter((l) => l.status === 'Warning' || l.status === 'Error').length;
  const avgDuration = logs.length > 0
    ? Math.round(logs.reduce((acc, curr) => acc + (curr.duration_ms || 0), 0) / logs.length)
    : 0;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Processing History & Audit Log</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all resume extractions, classification decisions, and parser performance.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file or candidate..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154E38]/20"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Files Logged</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{logs.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Extraction Success</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 100}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Parser Avg Speed</p>
            <p className="text-2xl font-bold text-[#154E38] mt-1">{avgDuration} ms</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EBF5F0] text-[#154E38] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">System Audit Stream ({filteredLogs.length} events)</h3>
          <span className="text-xs text-slate-400">Recorded directly in SQLite</span>
        </div>

        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#154E38] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading audit history...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center space-y-3">
            <p className="text-rose-600 font-semibold text-xs">{error}</p>
            <button
              onClick={loadLogs}
              className="px-3 py-1.5 bg-[#154E38] text-white rounded-lg text-xs font-semibold hover:bg-[#0E3626]"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-12">Log ID</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4 w-16">Format</th>
                  <th className="py-3 px-4 w-24">Status</th>
                  <th className="py-3 px-4">Extraction Message</th>
                  <th className="py-3 px-4 w-20">Duration</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{log.id}</td>
                    <td className="py-3 px-4">
                      {log.candidate_id ? (
                        <button
                          onClick={() => onSelectCandidate(log.candidate_id)}
                          className="font-mono font-bold text-[#154E38] hover:underline"
                        >
                          {log.candidate_id}
                        </button>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 truncate max-w-[220px]">
                      {log.file_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        .{log.file_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'Success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-sm">
                      {log.message}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {log.duration_ms} ms
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveLog(log)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Inspection Modal */}
      {activeLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setActiveLog(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Processing Event #{activeLog.id}</h3>
                  <p className="text-xs text-slate-400">{activeLog.created_at}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <p className="text-slate-500">File Ingested:</p>
                <p className="font-mono font-bold text-slate-800">{activeLog.file_name}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <p className="text-slate-500">Processing Diagnostic Message:</p>
                <p className="text-slate-700 leading-relaxed">{activeLog.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-slate-500">Candidate ID:</p>
                  <p className="font-bold text-[#154E38] font-mono">{activeLog.candidate_id || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-slate-500">Execution Time:</p>
                  <p className="font-bold text-slate-800 font-mono">{activeLog.duration_ms} ms</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveLog(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

