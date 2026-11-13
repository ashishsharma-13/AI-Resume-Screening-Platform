import React from 'react';
import { UploadCloud, Search, AlertCircle, Sparkles } from 'lucide-react';

export default function Header({
  title,
  subtitle,
  onUploadClick,
  onSearchChange,
  searchValue = '',
  showUploadButton = true,
  actionButton = null,
}) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        {onSearchChange !== undefined && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search candidate, role, skills..."
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#154E38]/20 focus:border-[#154E38] transition-all"
            />
          </div>
        )}

        {actionButton}

        {showUploadButton && onUploadClick && (
          <button
            onClick={onUploadClick}
            className="flex items-center space-x-1.5 bg-[#154E38] hover:bg-[#0E3626] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all shadow-[#154E38]/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Resume</span>
          </button>
        )}
      </div>
    </header>
  );
}

