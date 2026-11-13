import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  Layers,
  Search,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  FileText
} from 'lucide-react';
import ScoreMeter from '../components/ScoreMeter';
import { getCandidates, getCandidateById, getProfileLetters } from '../api';

export default function AiEvaluationPage({ onSelectCandidate, initialCandidateId = null }) {
  const [candidates, setCandidates] = useState([]);
  const [selectedId, setSelectedId] = useState(initialCandidateId);
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadCandidatesList();
  }, []);

  const loadCandidatesList = async () => {
    try {
      setLoading(true);
      const res = await getCandidates({ sort_by: 'lca_score', sort_order: 'desc' });
      const list = res.candidates || [];
      setCandidates(list);
      if (!selectedId && list.length > 0) {
        setSelectedId(list[0].id);
      }
    } catch (err) {
      console.error('Failed loading candidate list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId) {
      loadSelectedCandidate(selectedId);
    }
  }, [selectedId]);

  const loadSelectedCandidate = async (id) => {
    try {
      setDetailLoading(true);
      const data = await getCandidateById(id);
      setCandidateData(data);
    } catch (err) {
      console.error('Failed loading candidate details', err);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#154E38] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading AI evaluation suite...</p>
      </div>
    );
  }

  const scoreDetails = candidateData?.scoring_details || {};
  const lcaDetails = scoreDetails.lca_details || {};
  const uiuxDetails = scoreDetails.uiux_details || {};

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Candidate Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#154E38]" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI Evaluation & Explainability</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full audit trail of algorithm scoring, extracted quotes, and rationale.
          </p>
        </div>

        {/* Candidate Selector Dropdown */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-500">Select Candidate:</label>
          <select
            value={selectedId || ''}
            onChange={(e) => setSelectedId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#154E38]/20"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} – {c.name} ({c.primary_role} | LCA: {c.lca_score}, UI/UX: {c.uiux_score})
              </option>
            ))}
          </select>
        </div>
      </div>

      {detailLoading || !candidateData ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading evaluation...</div>
      ) : (
        <div className="space-y-6">
          {/* Candidate Overview Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-[#154E38] text-white flex items-center justify-center font-bold text-lg tracking-tight shadow-sm shrink-0 overflow-hidden">
                {getProfileLetters(candidateData.name)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-slate-900 text-lg">{candidateData.name}</h3>
                  <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-semibold border border-slate-200">
                    {candidateData.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{candidateData.title}</p>
                <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-400">
                  <span>Exp: ~{candidateData.experience_years} years</span>
                  <span>•</span>
                  <span>{candidateData.location || 'India'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Primary Fit</p>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block mt-0.5 ${
                  candidateData.primary_role === 'LCA Consultant' ? 'bg-[#EBF5F0] text-[#154E38]' :
                  candidateData.primary_role === 'UI/UX Designer' ? 'bg-blue-50 text-blue-800' :
                  candidateData.primary_role === 'Both' ? 'bg-purple-50 text-purple-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {candidateData.primary_role}
                </span>
              </div>

              <div className="text-right pl-4 border-l border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Confidence</p>
                <span className="text-xs font-bold text-emerald-700">{scoreDetails.confidence || 'High'}</span>
              </div>
            </div>
          </div>

          {/* AI Decision Rationale Banner */}
          <div className="bg-[#EBF5F0] border border-emerald-200/80 p-5 rounded-2xl space-y-2">
            <h4 className="font-bold text-[#154E38] text-xs uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Transparent Decision Rationale</span>
            </h4>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {scoreDetails.reasoning}
            </p>
          </div>

          {/* Side-by-Side Role Criteria Audit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LCA Criteria Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">LCA Consultant Criteria Breakdown</h4>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-[#154E38]">{candidateData.lca_score}</span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
              </div>

              <div className="space-y-4">
                {lcaDetails.criteria?.map((crit, idx) => (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{crit.name}</span>
                      <span className="font-extrabold text-[#154E38]">
                        {crit.score} / {crit.weight} pts
                      </span>
                    </div>
                    <ScoreMeter score={(crit.score / crit.weight) * 100} showLabel={false} size="sm" />

                    {crit.evidence && crit.evidence.length > 0 ? (
                      <div className="mt-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200/60 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          Extracted Evidence:
                        </span>
                        {crit.evidence.map((ev, eIdx) => (
                          <p key={eIdx} className="text-slate-600 italic">"{ev}"</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No supporting evidence identified in resume text.</p>
                    )}

                    {crit.missing && (
                      <p className="text-[10px] text-rose-600 font-semibold">⚠️ {crit.missing}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* UI/UX Criteria Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">UI/UX Design Criteria Breakdown</h4>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-emerald-700">{candidateData.uiux_score}</span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
              </div>

              <div className="space-y-4">
                {uiuxDetails.criteria?.map((crit, idx) => (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{crit.name}</span>
                      <span className="font-extrabold text-emerald-700">
                        {crit.score} / {crit.weight} pts
                      </span>
                    </div>
                    <ScoreMeter score={(crit.score / crit.weight) * 100} showLabel={false} size="sm" />

                    {crit.evidence && crit.evidence.length > 0 ? (
                      <div className="mt-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200/60 space-y-1">
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                          Extracted Evidence:
                        </span>
                        {crit.evidence.map((ev, eIdx) => (
                          <p key={eIdx} className="text-slate-600 italic">"{ev}"</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No supporting evidence identified in resume text.</p>
                    )}

                    {crit.missing && (
                      <p className="text-[10px] text-rose-600 font-semibold">⚠️ {crit.missing}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

