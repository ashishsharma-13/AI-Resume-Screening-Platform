import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, badge, color = 'emerald' }) {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800'
    },
    brand: {
      bg: 'bg-[#EBF5F0]',
      text: 'text-[#154E38]',
      badge: 'bg-[#EBF5F0] text-[#154E38]'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800'
    },
    slate: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      badge: 'bg-slate-100 text-slate-800'
    }
  };

  const style = colorStyles[color] || colorStyles.brand;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg ${style.bg} ${style.text} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

