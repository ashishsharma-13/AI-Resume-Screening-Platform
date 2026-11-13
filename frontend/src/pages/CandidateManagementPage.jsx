import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  GitCompare,
  ChevronDown
} from 'lucide-react';
import ScoreMeter from '../components/ScoreMeter';
import { getCandidates, updateCandidateStatus, getProfileLetters } from '../api';

export default function CandidateManagementPage({
  onSelectCandidate,
  onOpenCompare,
  searchQuery = '',
  setSearchQuery
}) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadCandidates();
  }, [searchQuery, roleFilter, statusFilter, sortBy, sortOrder]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCandidates({
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setCandidates(res.candidates || []);
    } catch (err) {
      console.error('Failed to load candidates', err);
      setError(err.message || 'Failed to connect to backend API');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (candId, newStatus) => {
    try {
      setUpdatingId(candId);
      await updateCandidateStatus(candId, newStatus);
      setCandidates((prev) =>
        prev.map((c) => (c.id === candId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleSelectCandidate = (candId) => {
    if (selectedIds.includes(candId)) {
      setSelectedIds(selectedIds.filter((id) => id !== candId));
    } else {
      if (selectedIds.length >= 3) {
        alert('You can compare at most 3 candidates simultaneously.');
        return;
      }
      setSelectedIds([...selectedIds, candId]);
    }
  };

  const handleCompareTrigger = () => {
    if (selectedIds.length < 2) {
      alert('Please select at least 2 candidates to compare.');
      return;
    }
    const selectedObjects = candidates.filter((c) => selectedIds.includes(c.id));
    onOpenCompare(selectedObjects);
  };

  const handleExportCSV = () => {
    if (!candidates.length) return;
    const headers = ['ID', 'Name', 'Title', 'Primary Role', 'LCA Score', 'UI/UX Score', 'Experience Years', 'Status', 'Email'];
    const rows = candidates.map((c) => [
      c.id,
      `"${c.name}"`,
      `"${c.title}"`,
      `"${c.primary_role}"`,
      c.lca_score,
      c.uiux_score,
      c.experience_years,
      c.status,
      c.email
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GFI_Candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder="Search name, skill, title..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154E38]/20 focus:border-[#154E38]"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#154E38]/20 text-slate-700 font-medium"
            >
              <option value="All">All Roles</option>
              <option value="LCA Consultant">LCA Consultant</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="Both">Both Roles</option>
              <option value="Neither / Uncertain">Neither / Uncertain</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#154E38]/20 text-slate-700 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#154E38]/20 text-slate-700 font-medium"
            >
              <option value="id">Sort by ID</option>
              <option value="lca_score">Sort by LCA Score</option>
              <option value="uiux_score">Sort by UI/UX Score</option>
              <option value="experience_years">Sort by Experience</option>
              <option value="name">Sort by Name</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 text-xs flex items-center space-x-1"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="uppercase text-[10px] font-bold">{sortOrder}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {selectedIds.length > 0 && (
              <button
                onClick={handleCompareTrigger}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all animate-in fade-in"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare ({selectedIds.length})</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{candidates.length}</strong> candidate{candidates.length !== 1 ? 's' : ''}
          </span>
          {selectedIds.length > 0 && (
            <span className="text-blue-600 font-medium">
              {selectedIds.length} candidate{selectedIds.length !== 1 ? 's' : ''} selected for comparison
            </span>
          )}
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#154E38] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading candidate records...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-xs space-y-2">
            <p className="text-rose-600 font-semibold">{error}</p>
            <p className="text-slate-400 text-[11px]">If the backend is starting up, please wait a moment.</p>
            <button
              onClick={loadCandidates}
              className="px-3 py-1.5 bg-[#154E38] text-white rounded-lg text-xs font-semibold hover:bg-[#0E3626]"
            >
              Retry
            </button>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No candidates matched the current search or filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-8">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Primary Role</th>
                  <th className="py-3 px-4 w-36">LCA Score</th>
                  <th className="py-3 px-4 w-36">UI/UX Score</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((cand) => {
                  const isSelected = selectedIds.includes(cand.id);
                  return (
                    <tr
                      key={cand.id}
                      onClick={() => onSelectCandidate(cand.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectCandidate(cand.id)}
                          className="rounded border-slate-300 text-[#154E38] focus:ring-[#154E38] cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#154E38] text-white flex items-center justify-center font-bold text-[10px] tracking-tight shrink-0 overflow-hidden">
                            {getProfileLetters(cand.name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{cand.name}</p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{cand.title}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{cand.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          cand.primary_role === 'LCA Consultant' ? 'bg-[#EBF5F0] text-[#154E38]' :
                          cand.primary_role === 'UI/UX Designer' ? 'bg-blue-50 text-blue-800' :
                          cand.primary_role === 'Both' ? 'bg-purple-50 text-purple-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {cand.primary_role}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <ScoreMeter score={cand.lca_score} label="" showLabel={false} size="sm" />
                        <span className="text-[11px] font-bold text-[#154E38] mt-1 inline-block">
                          {cand.lca_score} <span className="text-[9px] text-slate-400 font-normal">/100</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <ScoreMeter score={cand.uiux_score} label="" showLabel={false} size="sm" />
                        <span className="text-[11px] font-bold text-emerald-700 mt-1 inline-block">
                          {cand.uiux_score} <span className="text-[9px] text-slate-400 font-normal">/100</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        ~{cand.experience_years} yrs
                      </td>

                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={cand.status}
                          disabled={updatingId === cand.id}
                          onChange={(e) => handleStatusChange(cand.id, e.target.value)}
                          className={`text-[11px] font-bold rounded-lg px-2 py-1 border transition-all cursor-pointer ${
                            cand.status === 'Shortlisted'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : cand.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onSelectCandidate(cand.id)}
                            className="p-1 text-slate-500 hover:text-[#154E38] hover:bg-slate-100 rounded"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
