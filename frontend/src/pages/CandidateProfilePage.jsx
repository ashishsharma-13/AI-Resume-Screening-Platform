import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  FileText,
  Mail,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import ScoreMeter from '../components/ScoreMeter';
import { getCandidateById, updateCandidateStatus, getProfileLetters } from '../api';

export default function CandidateProfilePage({ candidateId, onBack }) {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Under Review');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (candidateId) {
      loadProfile();
    }
  }, [candidateId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getCandidateById(candidateId);
      setCandidate(data);
      setStatus(data.status);
    } catch (err) {
      console.error('Failed to load candidate profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await updateCandidateStatus(candidateId, newStatus);
      setStatus(newStatus);
      setCandidate((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Failed updating status', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !candidate) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#154E38] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading candidate profile...</p>
      </div>
    );
  }

  const scoreDetails = candidate.scoring_details || {};
  const lcaDetails = scoreDetails.lca_details || {};
  const uiuxDetails = scoreDetails.uiux_details || {};
  const sections = candidate.sections || {};

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Directory</span>
        </button>

        <div className="flex items-center space-x-2">
          <a
            href={`/api/resumes/${candidate.file_name}`}
            download
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Original Resume</span>
          </a>
        </div>
      </div>

      {/* Candidate Banner Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-[#154E38] text-white flex items-center justify-center font-bold text-xl tracking-tight shadow-sm shadow-[#154E38]/20 shrink-0 overflow-hidden">
            {getProfileLetters(candidate.name)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{candidate.name}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                {candidate.id}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">{candidate.title}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>~{candidate.experience_years} years exp</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidate.location || 'India'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidate.email || 'N/A'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Status & Shortlist Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-end md:self-center">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-800' :
              status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
              'bg-slate-100 text-slate-700'
            }`}>
              {status}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStatusUpdate('Shortlisted')}
              disabled={updating || status === 'Shortlisted'}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Shortlist</span>
            </button>
            <button
              onClick={() => handleStatusUpdate('Rejected')}
              disabled={updating || status === 'Rejected'}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50 text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Candidate Data / Right Scoring & Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Resume Extracted Data */}
        <div className="lg:col-span-5 space-y-6">
          {/* Extracted Skills */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#154E38]" />
              <span>Extracted Skills & Competencies</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {scoreDetails.skills && scoreDetails.skills.length > 0 ? (
                scoreDetails.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-[11px] font-medium border border-slate-200/60"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-xs">No specific keywords indexed.</span>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {sections.summary && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#154E38]" />
                <span>Professional Summary</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {sections.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-[#154E38]" />
              <span>Work Experience History</span>
            </h3>
            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-lg border border-slate-100 max-h-80 overflow-y-auto">
              {sections.experience || 'No detailed work experience paragraphs detected.'}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-[#154E38]" />
              <span>Education</span>
            </h3>
            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-lg border border-slate-100">
              {sections.education || 'Education section not explicitly defined.'}
            </div>
          </div>

          {/* Certifications */}
          {sections.certifications && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2">
                <Award className="w-4 h-4 text-[#154E38]" />
                <span>Certifications & Licenses</span>
              </h3>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                {sections.certifications}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Dual Fit Scoring & AI Explainability */}
        <div className="lg:col-span-7 space-y-6">
          {/* LCA Consultant Scorecard */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#EBF5F0] text-[#154E38] flex items-center justify-center font-extrabold text-sm">
                  LCA
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">LCA Consultant Match Score</h3>
                  <p className="text-[11px] text-slate-500">Evaluated against scraped job description requirements</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-[#154E38]">{candidate.lca_score}</span>
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
            </div>

            {/* Criteria breakdown */}
            <div className="space-y-4">
              {lcaDetails.criteria?.map((crit, idx) => (
                <div key={idx} className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{crit.name}</span>
                    <span className="font-bold text-[#154E38]">
                      {crit.score} <span className="text-slate-400 font-normal">/ {crit.weight} pts</span>
                    </span>
                  </div>
                  <ScoreMeter score={(crit.score / crit.weight) * 100} showLabel={false} size="sm" />
                  
                  {crit.evidence && crit.evidence.length > 0 ? (
                    <div className="mt-2 text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/60 space-y-1">
                      <p className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider">Verbatim Evidence:</p>
                      {crit.evidence.map((ev, eIdx) => (
                        <p key={eIdx} className="italic text-slate-600">"{ev}"</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">No direct keyword evidence verified.</p>
                  )}

                  {crit.missing && (
                    <p className="text-[10px] text-rose-600 font-medium">⚠️ {crit.missing}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* UI/UX Designer Scorecard */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-extrabold text-sm">
                  UX
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">UI/UX Design Intern Match Score</h3>
                  <p className="text-[11px] text-slate-500">Evaluated against scraped job description requirements</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-emerald-700">{candidate.uiux_score}</span>
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
            </div>

            {/* Criteria breakdown */}
            <div className="space-y-4">
              {uiuxDetails.criteria?.map((crit, idx) => (
                <div key={idx} className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{crit.name}</span>
                    <span className="font-bold text-emerald-700">
                      {crit.score} <span className="text-slate-400 font-normal">/ {crit.weight} pts</span>
                    </span>
                  </div>
                  <ScoreMeter score={(crit.score / crit.weight) * 100} showLabel={false} size="sm" />
                  
                  {crit.evidence && crit.evidence.length > 0 ? (
                    <div className="mt-2 text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/60 space-y-1">
                      <p className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider">Verbatim Evidence:</p>
                      {crit.evidence.map((ev, eIdx) => (
                        <p key={eIdx} className="italic text-slate-600">"{ev}"</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">No direct design evidence verified.</p>
                  )}

                  {crit.missing && (
                    <p className="text-[10px] text-rose-600 font-medium">⚠️ {crit.missing}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Assessment & Recruiter Note */}
          <div className="bg-[#EBF5F0] p-5 rounded-2xl border border-emerald-200/80 space-y-3">
            <h4 className="font-bold text-[#154E38] text-xs uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Classification Rationale</span>
            </h4>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {scoreDetails.reasoning}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
