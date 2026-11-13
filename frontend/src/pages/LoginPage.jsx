import React, { useState } from 'react';
import { Leaf, CheckCircle2, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('hr@growthforimpact.co');
  const [password, setPassword] = useState('admin123');
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin({ email });
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left Branded Panel */}
      <div className="md:w-1/2 bg-[#154E38] text-white p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Leaf className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Growth For Impact</h1>
            <p className="text-xs text-emerald-200/80">Recruitment & Screening Intelligence</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-12 max-w-md">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Find the people who will make a real difference.
          </h2>
          <p className="mt-4 text-emerald-100/80 text-sm leading-relaxed">
            Automated resume parsing, dual-role qualification matching, explainable scoring, and recruiter decision intelligence.
          </p>

          <div className="mt-8 space-y-3.5">
            <div className="flex items-center space-x-3 text-sm text-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>Multi-format parsing for DOCX & PDF resumes</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>Independent dual scoring for LCA & UI/UX roles</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>Transparent explainability and evidence extraction</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>Live job description synchronization</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-emerald-200/60">
          © 2026 Growth For Impact. Confidential & Proprietary.
        </div>
      </div>

      {/* Right Login Card */}
      <div className="md:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <span className="text-xs font-bold text-[#154E38] bg-[#EBF5F0] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Recruiter Portal
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-3">Welcome Back</h3>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to access candidate evaluations and ranking pipelines.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hr@growthforimpact.co"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154E38]/20 focus:border-[#154E38] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154E38]/20 focus:border-[#154E38] transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-300 text-[#154E38] focus:ring-[#154E38]"
                />
                <span>Remember this device</span>
              </label>
              <a href="#forgot" className="font-medium text-[#154E38] hover:underline text-[11px]">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#154E38] hover:bg-[#0E3626] text-white py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Pill */}
          <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-xs flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Demo Recruiter Login</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">hr@growthforimpact.co / admin123</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('hr@growthforimpact.co');
                setPassword('admin123');
              }}
              className="text-[11px] font-bold text-[#154E38] hover:underline"
            >
              Auto-fill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

