import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { uploadResume } from '../api';

export default function ResumeUploadPage({ onSelectCandidate, onNavigate }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['docx', 'pdf'].includes(ext)) {
        setErrorMsg(`Unsupported file: ${file.name}. Only .docx and .pdf resumes are accepted.`);
        continue;
      }

      try {
        const res = await uploadResume(file);
        setUploadQueue((prev) => [
          {
            id: res.candidate_id,
            fileName: file.name,
            fileType: ext,
            role: res.primary_role,
            lcaScore: res.lca_score,
            uiuxScore: res.uiux_score,
            status: 'Success',
            duration: res.duration_ms,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
      } catch (err) {
        console.error('Upload failed for', file.name, err);
        setUploadQueue((prev) => [
          {
            id: 'Error',
            fileName: file.name,
            fileType: ext,
            role: 'Failed',
            lcaScore: 0,
            uiuxScore: 0,
            status: 'Failed',
            duration: 0,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
      }
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Resume Ingestion & Parsing</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload new candidate resumes in DOCX or PDF format. Extracted details and dual rankings update automatically.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="font-bold text-rose-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Zone & Instructions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Drag & Drop Area (8 cols) */}
        <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full py-16 px-8 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 ${
              isDragging
                ? 'border-[#154E38] bg-[#EBF5F0]/60 scale-[1.01]'
                : 'border-slate-300 hover:border-[#154E38] bg-slate-50/60 hover:bg-[#EBF5F0]/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              accept=".docx,.pdf"
              multiple
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-[#EBF5F0] text-[#154E38] flex items-center justify-center shadow-sm">
              {uploading ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div>
              <p className="font-bold text-slate-800 text-sm">
                {uploading ? 'Processing resume through scoring engine...' : 'Click or drag resumes here to upload'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports DOCX and PDF documents (both paragraphs and tables are extracted).
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-mono">.DOCX</span>
              <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-mono">.PDF</span>
              <span>Max 10MB per file</span>
            </div>
          </div>
        </div>

        {/* Ingestion Pipeline Info (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#154E38]" />
              <span>Automated Processing Pipeline</span>
            </h3>
            
            <div className="mt-4 space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-[#EBF5F0] text-[#154E38] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-semibold text-slate-800">Multi-Stream Extraction</p>
                  <p className="text-[11px] text-slate-500">Extracts paragraphs, table cells, date ranges, and skills.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-[#EBF5F0] text-[#154E38] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-semibold text-slate-800">Dual-Role Matching</p>
                  <p className="text-[11px] text-slate-500">Scores against LCA Consultant and UI/UX Design Intern criteria.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-[#EBF5F0] text-[#154E38] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-semibold text-slate-800">Job Description Alignment</p>
                  <p className="text-[11px] text-slate-500">Evaluates experience and skills directly against live job specs.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-[#EBF5F0] text-[#154E38] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <p className="font-semibold text-slate-800">Auto-Update Leaderboards</p>
                  <p className="text-[11px] text-slate-500">Instantly inserts candidate into ranked pile.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('rankings')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
            >
              <span>View Updated Rankings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Queue / Live Ingestion Results */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Session Upload Activity</h3>
          <span className="text-xs text-slate-400">{uploadQueue.length} processed this session</span>
        </div>

        {uploadQueue.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No files uploaded during this session yet. Upload a resume above to test live scoring.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Candidate ID</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">LCA Match</th>
                  <th className="py-3 px-4">UI/UX Match</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Speed</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {uploadQueue.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-700 truncate max-w-xs">{item.fileName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EBF5F0] text-[#154E38]">
                        {item.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#154E38]">{item.lcaScore}/100</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{item.uiuxScore}/100</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#154E38]">
                        Parsed
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{item.duration}ms</td>
                    <td className="py-3 px-4 text-right">
                      {item.id !== 'Error' && (
                        <button
                          onClick={() => onSelectCandidate(item.id)}
                          className="text-xs font-semibold text-[#154E38] hover:underline"
                        >
                          View Profile →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

