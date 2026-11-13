import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Medal,
  GitCompare,
  ArrowRight,
  Eye,
  CheckCircle,
  Filter,
  Sparkles
} from 'lucide-react';
import ScoreMeter from '../components/ScoreMeter';
import { getRankings, getProfileLetters } from '../api';

export default function CandidateRankingsPage({ onSelectCandidate, onOpenCompare }) {
  const [role, setRole] = useState('lca');
  const [rankings, setRankings] = useState([]);
  const [roleTitle, setRoleTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    loadRankings();
  }, [role]);

  const loadRankings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRankings(role);
      setRankings(res.rankings || []);
      setRoleTitle(res.role_title || (role === 'lca' ? 'LCA Consultant' : 'UI/UX Designer'));
    } catch (err) {
      console.error('Failed loading rankings', err);
      setError(err.message || 'Failed to load rankings');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (candId) => {
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
    const selectedObjects = rankings.filter((c) => selectedIds.includes(c.id));
    onOpenCompare(selectedObjects);
  };

  const top3 = rankings.slice(0, 3);
  const podiumStyles = [
    { rank: 1, label: '1st Place', badgeBg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Trophy, ring: 'ring-amber-400' },
    { rank: 2, label: '2nd Place', badgeBg: 'bg-slate-100 text-slate-800 border-slate-300', icon: Medal, ring: 'ring-slate-300' },
    { rank: 3, label: '3rd Place', badgeBg: 'bg-amber-50 text-amber-900 border-amber-200', icon: Award, ring: 'ring-amber-600/40' },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Role Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Independent Candidate Rankings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Objective candidate score rankings evaluated separately for each role based on scraped job description requirements.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 border border-slate-200/80">
          <button
            onClick={() => {
              setRole('lca');
              setSelectedIds([]);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              role === 'lca'
                ? 'bg-[#154E38] text-white shadow-sm shadow-[#154E38]/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>LCA Consultant</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
              role === 'lca' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {rankings.length && role === 'lca' ? rankings.length : '16'}
            </span>
          </button>

          <button
            onClick={() => {
              setRole('uiux');
              setSelectedIds([]);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              role === 'uiux'
                ? 'bg-[#154E38] text-white shadow-sm shadow-[#154E38]/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>UI/UX Designer</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
              role === 'uiux' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {rankings.length && role === 'uiux' ? rankings.length : '24'}
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#154E38] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Ranking candidate pool...</p>
        </div>
      ) : error ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
          <p className="text-rose-600 font-semibold text-xs">{error}</p>
          <p className="text-slate-400 text-[11px]">Failed to connect to rankings service.</p>
          <button
            onClick={loadRankings}
            className="px-3 py-1.5 bg-[#154E38] text-white rounded-lg text-xs font-semibold hover:bg-[#0E3626]"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {top3.map((cand, idx) => {
              const pStyle = podiumStyles[idx];
              const Icon = pStyle.icon;
              return (
                <div
                  key={cand.id}
                  onClick={() => onSelectCandidate(cand.id)}
                  className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1.5 border ${pStyle.badgeBg}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{pStyle.label}</span>
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-semibold">{cand.id}</span>
                  </div>

                  <div className="mt-4 flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#154E38] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm shrink-0 overflow-hidden">
                      {getProfileLetters(cand.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{cand.name}</h3>
                      <p className="text-xs text-slate-500 truncate max-w-[170px]">{cand.title}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-slate-600">Match Score:</span>
                      <span className="text-xl font-black text-[#154E38]">
                        {cand.score} <span className="text-xs text-slate-400 font-normal">/100</span>
                      </span>
                    </div>
                    <ScoreMeter score={cand.score} showLabel={false} size="md" />

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
                      <span>Experience: ~{cand.experience_years} yrs</span>
                      <span className="font-semibold text-slate-700">{cand.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Ranked Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {roleTitle} Leaderboard ({rankings.length} Candidates)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordered by weighted algorithm score
                </p>
              </div>

              {selectedIds.length > 0 && (
                <button
                  onClick={handleCompareTrigger}
                  className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Compare Selected ({selectedIds.length})</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 w-8">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4 w-40">Match Score</th>
                    <th className="py-3 px-4">Experience</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankings.map((cand) => {
                    const isSelected = selectedIds.includes(cand.id);
                    return (
                      <tr
                        key={cand.id}
                        onClick={() => onSelectCandidate(cand.id)}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(cand.id)}
                            className="rounded border-slate-300 text-[#154E38] focus:ring-[#154E38] cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-4 text-center font-extrabold text-slate-700 text-xs">
                          {cand.rank <= 3 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-extrabold inline-flex items-center justify-center">
                              #{cand.rank}
                            </span>
                          ) : (
                            <span>#{cand.rank}</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#154E38] text-white flex items-center justify-center font-bold text-[10px] tracking-tight shrink-0 overflow-hidden">
                              {getProfileLetters(cand.name)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{cand.name}</p>
                              <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{cand.title}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{cand.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <ScoreMeter score={cand.score} showLabel={false} size="sm" />
                          <span className="text-xs font-extrabold text-[#154E38] mt-1 inline-block">
                            {cand.score} <span className="text-[10px] text-slate-400 font-normal">/100</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-700 font-medium">
                          ~{cand.experience_years} yrs
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cand.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-800' :
                            cand.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {cand.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectCandidate(cand.id)}
                            className="text-xs font-semibold text-[#154E38] hover:underline"
                          >
                            Profile →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
