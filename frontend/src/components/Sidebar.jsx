import React from 'react';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Sparkles,
  UploadCloud,
  Briefcase,
  BarChart3,
  History,
  LogOut,
  Leaf
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'rankings', label: 'Rankings', icon: Trophy },
    { id: 'evaluation', label: 'AI Evaluation', icon: Sparkles },
    { id: 'upload', label: 'Resume Upload', icon: UploadCloud },
    { id: 'jobs', label: 'Job Descriptions', icon: Briefcase },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'Processing History', icon: History },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#154E38] flex items-center justify-center text-white shadow-sm shadow-[#154E38]/20">
            <Leaf className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-sm leading-tight">Growth For Impact</h1>
            <p className="text-[11px] font-medium text-emerald-800 bg-[#EBF5F0] px-1.5 py-0.5 rounded mt-0.5 inline-block">
              AI Resume Screening
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#154E38] text-white shadow-sm shadow-[#154E38]/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* HR Profile Footer */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#154E38] text-white flex items-center justify-center font-bold text-xs shrink-0">
              HR
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate">HR Reviewer</p>
              <p className="text-[10px] text-slate-500 truncate">hr@growthforimpact.co</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
