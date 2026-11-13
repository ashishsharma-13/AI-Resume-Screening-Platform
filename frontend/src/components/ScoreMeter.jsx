import React from 'react';

export default function ScoreMeter({ score, label, showLabel = true, size = 'md' }) {
  const getColors = (val) => {
    if (val >= 80) return { bar: 'bg-[#154E38]', text: 'text-[#154E38]', bg: 'bg-emerald-100/60' };
    if (val >= 60) return { bar: 'bg-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-50' };
    if (val >= 40) return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
    return { bar: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100' };
  };

  const colors = getColors(score);
  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="font-medium text-slate-600">{label}</span>
          <span className={`font-bold ${colors.text}`}>{score}<span className="text-slate-400 font-normal">/100</span></span>
        </div>
      )}
      <div className={`w-full ${heightClass} ${colors.bg} rounded-full overflow-hidden`}>
        <div
          className={`${heightClass} ${colors.bar} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

