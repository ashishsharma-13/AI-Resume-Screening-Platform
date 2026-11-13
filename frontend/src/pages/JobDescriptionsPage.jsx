import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle,
  Trash2,
  ExternalLink,
  MapPin,
  Clock,
  Sliders,
  Globe
} from 'lucide-react';
import {
  getJobDescriptions,
  deleteJobDescription
} from '../api';

export default function JobDescriptionsPage() {
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadJds();
  }, []);

  const loadJds = async () => {
    try {
      setLoading(true);
      const res = await getJobDescriptions();
      const list = res.job_descriptions || [];
      setJds(list);
      if (list.length > 0 && !selectedRole) {
        setSelectedRole(list[0].id);
      }
    } catch (err) {
      console.error('Failed loading JDs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (jds.length <= 1) {
      alert('Cannot delete the last job description. At least one job description is required.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove the job description "${title}"?`)) {
      return;
    }
    setDeletingId(jobId);
    try {
      await deleteJobDescription(jobId);
      const updated = await getJobDescriptions();
      const list = updated.job_descriptions || [];
      setJds(list);
      if (list.length > 0) {
        setSelectedRole(list[0].id);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete job description.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && jds.length === 0) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#154E38] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading Job Descriptions...</p>
      </div>
    );
  }

  const activeJd = jds.find((j) => j.id === selectedRole) || jds[0];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Job Descriptions & Requirements</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role specifications, criteria weights, and live job posting URLs used by the screening engine.
          </p>
        </div>
      </div>

      {/* Role Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {jds.map((jd) => (
          <button
            key={jd.id}
            onClick={() => setSelectedRole(jd.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeJd?.id === jd.id
                ? 'bg-[#154E38] text-white shadow-sm shadow-[#154E38]/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{jd.title}</span>
          </button>
        ))}
      </div>

      {/* Active Job Card Content */}
      {activeJd && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Overview, Source Link, Responsibilities, Qualifications */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-[#154E38] bg-[#EBF5F0] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {activeJd.role_type}
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                    {activeJd.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500">
                    <span className="flex items-center space-x-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeJd.location}</span>
                    </span>
                    <span className="flex items-center space-x-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Experience Required: <strong className="text-slate-800">{activeJd.experience_required}</strong></span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  {activeJd.source_url && (
                    <a
                      href={activeJd.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#154E38] hover:bg-slate-50 transition-colors"
                      title="Open original job posting"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>View Job Link</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}

                  {jds.length > 1 && (
                    <button
                      onClick={() => handleDeleteJob(activeJd.id, activeJd.title)}
                      disabled={deletingId === activeJd.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove this job description"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scraped Job Source Banner */}
              {activeJd.source_url && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Scraped Source:</span>
                    <span className="font-mono text-slate-700 truncate">{activeJd.source_url}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                    Synchronized
                  </span>
                </div>
              )}

              {/* Key Responsibilities */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Key Responsibilities
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {activeJd.responsibilities?.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#EBF5F0] text-[#154E38] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Expected Qualifications */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Expected Qualifications & Skills
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {activeJd.qualifications?.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5">
                      <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        •
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Criteria & Scoring Weights */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#154E38]" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Scoring Weight Distribution
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Transparent 100-point rubric used by the scoring engine for this role.
              </p>

              <div className="space-y-3 pt-2">
                {activeJd.criteria_weights?.map((cw, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{cw.criterion}</span>
                      <span className="font-bold text-[#154E38] bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {cw.weight}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">{cw.desc}</p>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#154E38] rounded-full"
                        style={{ width: `${cw.weight * 4}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Total Weight:</span>
                  <span>100 Points</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Minimum match threshold: Score &ge; 40 points confirms active role match.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
