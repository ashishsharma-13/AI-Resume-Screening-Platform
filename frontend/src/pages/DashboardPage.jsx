import React, { useState, useEffect } from 'react';
import {
  Users,
  Trophy,
  Sparkles,
  ArrowRight,
  UploadCloud,
  FileCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ScoreMeter from '../components/ScoreMeter';
import { getDashboardStats, getProfileLetters } from '../api';

export default function DashboardPage({ onNavigate, onSelectCandidate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#154E38] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading candidate pipeline...</p>
        </div>
      </div>
    );
  }

  const total = stats.total_candidates || 1;
  const lcaPct = Math.round((stats.lca_count / total) * 100);
  const uiuxPct = Math.round((stats.uiux_count / total) * 100);
  const uncertainPct = Math.round((stats.uncertain_count / total) * 100);
  const bothPct = Math.round((stats.both_count / total) * 100);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Resumes"
          value={stats.total_candidates}
          subtitle="Processed & Evaluated"
          icon={Users}
          badge="100% Ingested"
          color="brand"
        />
        <StatCard
          title="LCA Consultants"
          value={stats.lca_count}
          subtitle={`Avg score: ${stats.avg_lca_score}/100`}
          icon={TrendingUp}
          badge={`${lcaPct}% Pool`}
          color="emerald"
        />
        <StatCard
          title="UI/UX Designers"
          value={stats.uiux_count}
          subtitle={`Avg score: ${stats.avg_uiux_score}/100`}
          icon={Sparkles}
          badge={`${uiuxPct}% Pool`}
          color="blue"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted_count}
          subtitle={`${stats.under_review_count || 0} Under Review`}
          icon={CheckCircle}
          badge="Top Picks"
          color="brand"
        />
      </div>

      {/* Pipeline Distribution Bar Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Candidate Pipeline Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Classification breakdown across all evaluated applicants</p>
          </div>
          <button
            onClick={() => onNavigate('candidates')}
            className="text-xs font-semibold text-[#154E38] hover:underline flex items-center space-x-1"
          >
            <span>View All Candidates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Multi-segment distribution progress bar */}
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${lcaPct}%` }}
            className="bg-[#154E38] h-full transition-all duration-500"
            title={`LCA Consultants: ${stats.lca_count} (${lcaPct}%)`}
          />
          <div
            style={{ width: `${uiuxPct}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`UI/UX Designers: ${stats.uiux_count} (${uiuxPct}%)`}
          />
          {bothPct > 0 && (
            <div
              style={{ width: `${bothPct}%` }}
              className="bg-blue-500 h-full transition-all duration-500"
              title={`Both Roles: ${stats.both_count} (${bothPct}%)`}
            />
          )}
          <div
            style={{ width: `${uncertainPct}%` }}
            className="bg-slate-300 h-full transition-all duration-500"
            title={`Neither / Uncertain: ${stats.uncertain_count} (${uncertainPct}%)`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#154E38]" />
            <span className="text-slate-600 font-medium">LCA Consultant:</span>
            <span className="font-bold text-slate-900">{stats.lca_count} ({lcaPct}%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">UI/UX Designer:</span>
            <span className="font-bold text-slate-900">{stats.uiux_count} ({uiuxPct}%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-600 font-medium">Both Roles:</span>
            <span className="font-bold text-slate-900">{stats.both_count} ({bothPct}%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-slate-300" />
            <span className="text-slate-600 font-medium">Neither / Uncertain:</span>
            <span className="font-bold text-slate-900">{stats.uncertain_count} ({uncertainPct}%)</span>
          </div>
        </div>
      </div>

      {/* Top Performers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top LCA Candidates */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF5F0] text-[#154E38] flex items-center justify-center font-bold text-xs">
                  LCA
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Top LCA Consultant Candidates</h3>
                  <p className="text-[11px] text-slate-500">Highest match scores against ISO & GaBi/SimaPro</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('rankings')}
                className="text-xs font-semibold text-[#154E38] hover:underline"
              >
                Leaderboard →
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {stats.top_lca?.map((cand, idx) => (
                <div
                  key={cand.id}
                  onClick={() => onSelectCandidate(cand.id)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-5 text-center font-bold text-xs text-slate-400">#{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-[#154E38] text-white flex items-center justify-center font-bold text-[10px] tracking-tight shrink-0 overflow-hidden">
                      {getProfileLetters(cand.name)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{cand.name}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{cand.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-[#154E38]">{cand.lca_score}</span>
                    <span className="text-[10px] text-slate-400 font-normal">/100</span>
                    <div className="w-16 mt-1">
                      <ScoreMeter score={cand.lca_score} showLabel={false} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top UI/UX Candidates */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-xs">
                  UX
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Top UI/UX Design Candidates</h3>
                  <p className="text-[11px] text-slate-500">Highest scores against Figma & User Research</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('rankings')}
                className="text-xs font-semibold text-[#154E38] hover:underline"
              >
                Leaderboard →
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {stats.top_uiux?.map((cand, idx) => (
                <div
                  key={cand.id}
                  onClick={() => onSelectCandidate(cand.id)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-5 text-center font-bold text-xs text-slate-400">#{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] tracking-tight shrink-0 overflow-hidden">
                      {getProfileLetters(cand.name)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{cand.name}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{cand.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-700">{cand.uiux_score}</span>
                    <span className="text-[10px] text-slate-400 font-normal">/100</span>
                    <div className="w-16 mt-1">
                      <ScoreMeter score={cand.uiux_score} showLabel={false} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recently Ingested Candidates Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recently Processed Candidates</h3>
            <p className="text-xs text-slate-500 mt-0.5">Quick access to the latest candidate records</p>
          </div>
          <button
            onClick={() => onNavigate('candidates')}
            className="text-xs font-semibold text-[#154E38] hover:underline flex items-center space-x-1"
          >
            <span>View Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Primary Classification</th>
                <th className="py-3 px-4">LCA Match</th>
                <th className="py-3 px-4">UI/UX Match</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recent_candidates?.map((cand) => (
                <tr
                  key={cand.id}
                  onClick={() => onSelectCandidate(cand.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] tracking-tight shrink-0 overflow-hidden">
                        {getProfileLetters(cand.name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{cand.name}</p>
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
                    <span className="font-bold text-[#154E38]">{cand.lca_score}</span>
                    <span className="text-slate-400 text-[10px]">/100</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-700">{cand.uiux_score}</span>
                    <span className="text-slate-400 text-[10px]">/100</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
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
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCandidate(cand.id);
                      }}
                      className="text-[#154E38] hover:underline font-semibold text-[11px]"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
