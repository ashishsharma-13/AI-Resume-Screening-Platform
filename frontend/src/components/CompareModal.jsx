import React from 'react';
import { X, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import ScoreMeter from './ScoreMeter';

export default function CompareModal({ candidates, onClose, onSelectCandidate, onStatusChange }) {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Candidate Comparison Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side evaluation of {candidates.length} selected candidate{candidates.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-y-auto divide-y divide-slate-100">
          {/* Top row: Candidate identity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
            {candidates.map((cand) => (
              <div key={cand.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {cand.id}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {cand.primary_role}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mt-2">{cand.name}</h4>
                  <p className="text-xs text-slate-600 font-medium truncate">{cand.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Exp: ~{cand.experience_years} years</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    cand.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-800' :
                    cand.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {cand.status}
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectCandidate(cand.id);
                    }}
                    className="text-xs font-semibold text-[#154E38] hover:underline flex items-center space-x-1"
                  >
                    <span>Full Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Scores Comparison */}
          <div className="py-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scores & Role Fit</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {candidates.map((cand) => (
                <div key={cand.id} className="space-y-3 bg-white p-3 rounded-lg border border-slate-100">
                  <div className="space-y-1">
                    <ScoreMeter score={cand.lca_score} label="LCA Consultant Fit" size="md" />
                  </div>
                  <div className="space-y-1">
                    <ScoreMeter score={cand.uiux_score} label="UI/UX Design Fit" size="md" />
                  </div>
                  <div className="pt-2 flex justify-between text-xs border-t border-slate-100">
                    <span className="text-slate-500">Primary Role:</span>
                    <span className="font-bold text-slate-800">{cand.primary_role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Gaps */}
          <div className="py-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Strengths & Qualifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {candidates.map((cand) => (
                <div key={cand.id} className="space-y-3">
                  <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-100">
                    <p className="text-[11px] font-bold text-emerald-800 flex items-center space-x-1 mb-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Strengths</span>
                    </p>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {cand.strengths && cand.strengths.length > 0 ? (
                        cand.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400 text-[11px]">No highlighted strengths recorded</li>
                      )}
                    </ul>
                  </div>

                  <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                    <p className="text-[11px] font-bold text-rose-800 flex items-center space-x-1 mb-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Missing / Gaps</span>
                    </p>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {cand.missing_qualifications && cand.missing_qualifications.length > 0 ? (
                        cand.missing_qualifications.map((gap, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{gap}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400 text-[11px]">No critical disqualifications noted</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
