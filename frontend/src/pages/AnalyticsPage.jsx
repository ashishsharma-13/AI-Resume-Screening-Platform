import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  Clock,
  Layers
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { getAnalytics } from '../api';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed loading analytics', err);
      setError(err.message || 'Failed loading analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#154E38] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Compiling recruitment analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-16 text-center space-y-3 max-w-md mx-auto">
        <p className="text-rose-600 font-semibold text-xs">{error || 'Failed to load recruitment analytics'}</p>
        <button
          onClick={loadAnalytics}
          className="px-3 py-1.5 bg-[#154E38] text-white rounded-lg text-xs font-semibold hover:bg-[#0E3626]"
        >
          Retry
        </button>
      </div>
    );
  }

  const total = analytics.total_resumes || 1;
  const lcaBins = analytics.lca_score_distribution || {};
  const uiuxBins = analytics.uiux_score_distribution || {};
  const maxBinVal = Math.max(
    ...Object.values(lcaBins),
    ...Object.values(uiuxBins),
    1
  );

  const roles = analytics.role_distribution || {};
  const expBins = analytics.experience_distribution || {};
  const maxExpVal = Math.max(...Object.values(expBins), 1);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recruitment Pipeline Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Data insights on candidate score distributions, domain concentrations, and qualification metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Candidate Pool"
          value={analytics.total_resumes}
          subtitle="Processed Profiles"
          icon={Users}
          color="brand"
        />
        <StatCard
          title="LCA Conversion"
          value={`${Math.round(((roles['LCA Consultant'] || 0) / total) * 100)}%`}
          subtitle={`${roles['LCA Consultant'] || 0} Strong Matches`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="UI/UX Conversion"
          value={`${Math.round(((roles['UI/UX Designer'] || 0) / total) * 100)}%`}
          subtitle={`${roles['UI/UX Designer'] || 0} Strong Matches`}
          icon={Award}
          color="blue"
        />
        <StatCard
          title="Evaluation Yield"
          value={`${Math.round((((roles['LCA Consultant'] || 0) + (roles['UI/UX Designer'] || 0)) / total) * 100)}%`}
          subtitle="Direct Role Matches"
          icon={CheckCircle}
          badge="High Match"
          color="brand"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Score Range Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Comparative score buckets for both target roles</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#154E38]" />
                <span className="text-slate-600 font-medium">LCA</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">UI/UX</span>
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {Object.keys(lcaBins).map((bucket) => {
              const lcaCount = lcaBins[bucket] || 0;
              const uiuxCount = uiuxBins[bucket] || 0;
              const lcaPct = (lcaCount / maxBinVal) * 100;
              const uiuxPct = (uiuxCount / maxBinVal) * 100;

              return (
                <div key={bucket} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>Score {bucket}</span>
                    <span className="text-[11px] text-slate-400">
                      LCA: {lcaCount} | UI/UX: {uiuxCount}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 h-4">
                    <div className="bg-slate-100 rounded overflow-hidden flex justify-end">
                      <div
                        className="bg-[#154E38] h-full rounded transition-all duration-500"
                        style={{ width: `${lcaPct}%` }}
                      />
                    </div>
                    <div className="bg-slate-100 rounded overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded transition-all duration-500"
                        style={{ width: `${uiuxPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Experience Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Experience Tenure Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">Years of verified professional experience</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4 pt-2">
            {Object.entries(expBins).map(([label, count]) => {
              const pct = (count / maxExpVal) * 100;
              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{label}</span>
                    <span className="font-bold text-slate-900">{count} candidates</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#154E38] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Tenure Insight:</p>
            <p className="text-[11px] leading-relaxed">
              UI/UX design interns cluster naturally in the 0-1 and 1-3 yr brackets, while senior LCA engineers possess 2-4+ years of industrial modeling.
            </p>
          </div>
        </div>
      </div>

      {/* Top Extracted Skills Frequency */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Top Skills & Tooling Frequency</h3>
            <p className="text-xs text-slate-500 mt-0.5">Most common software and technical competencies found across the resumes</p>
          </div>
          <Layers className="w-4 h-4 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {analytics.top_skills?.map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-800 truncate">{item.skill}</span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-lg font-extrabold text-[#154E38]">{item.count}</span>
                <span className="text-[10px] text-slate-400 font-medium">resumes</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
