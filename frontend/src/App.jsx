import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CompareModal from './components/CompareModal';

// 10 Screens
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CandidateManagementPage from './pages/CandidateManagementPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import JobDescriptionsPage from './pages/JobDescriptionsPage';
import CandidateRankingsPage from './pages/CandidateRankingsPage';
import AiEvaluationPage from './pages/AiEvaluationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProcessingHistoryPage from './pages/ProcessingHistoryPage';

import { getDashboardStats, updateCandidateStatus } from './api';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gfi_hr_user');
    return saved ? JSON.parse(saved) : { email: 'hr@growthforimpact.co', role: 'HR Reviewer' };
  });

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [compareCandidates, setCompareCandidates] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');

  const handleLogin = (credentials) => {
    const hrUser = { email: credentials.email || 'hr@growthforimpact.co', role: 'HR Reviewer' };
    setUser(hrUser);
    localStorage.setItem('gfi_hr_user', JSON.stringify(hrUser));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gfi_hr_user');
    setCurrentPage('login');
  };

  const navigateTo = (pageId) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCandidate = (candId) => {
    setSelectedCandidateId(candId);
    setCurrentPage('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCompare = (candidatesList) => {
    setCompareCandidates(candidatesList);
  };

  const handleCloseCompare = () => {
    setCompareCandidates([]);
  };

  // If user not authenticated, render Login Screen (Screen 1)
  if (!user || currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Titles & Subtitles for top header
  const pageMeta = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of candidate pipeline & screening status',
      showUpload: true,
    },
    candidates: {
      title: 'Candidate Management',
      subtitle: 'Manage, filter and review all processed candidates',
      showUpload: true,
    },
    profile: {
      title: 'Candidate Profile',
      subtitle: 'Detailed qualifications, work history, and dual fit scorecards',
      showUpload: false,
    },
    upload: {
      title: 'Resume Upload',
      subtitle: 'Upload new resumes in DOCX or PDF format',
      showUpload: false,
    },
    jobs: {
      title: 'Job Descriptions & Requirements',
      subtitle: 'Requirements, criteria weights, and live job posting links',
      showUpload: true,
    },
    rankings: {
      title: 'Candidate Rankings',
      subtitle: 'Independent role rankings and leaderboards',
      showUpload: true,
    },
    evaluation: {
      title: 'AI Evaluation & Explainability',
      subtitle: 'Transparent scoring rationale and extracted text evidence',
      showUpload: false,
    },
    analytics: {
      title: 'Pipeline Analytics',
      subtitle: 'Data insights across candidate pool and score distributions',
      showUpload: false,
    },
    history: {
      title: 'Processing History',
      subtitle: 'Audit log of resume extractions, timestamps, and parser diagnostics',
      showUpload: true,
    },
  };

  const meta = pageMeta[currentPage] || {
    title: 'Growth For Impact',
    subtitle: 'AI Resume Screening System',
    showUpload: true,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onUploadClick={() => navigateTo('upload')}
          showUploadButton={meta.showUpload}
          searchValue={globalSearch}
          onSearchChange={
            currentPage === 'candidates' ? (val) => setGlobalSearch(val) : undefined
          }
        />

        <main className="flex-1 pb-16">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={navigateTo}
              onSelectCandidate={handleSelectCandidate}
            />
          )}

          {currentPage === 'candidates' && (
            <CandidateManagementPage
              onSelectCandidate={handleSelectCandidate}
              onOpenCompare={handleOpenCompare}
              searchQuery={globalSearch}
              setSearchQuery={setGlobalSearch}
            />
          )}

          {currentPage === 'profile' && (
            <CandidateProfilePage
              candidateId={selectedCandidateId}
              onBack={() => navigateTo('candidates')}
            />
          )}

          {currentPage === 'upload' && (
            <ResumeUploadPage
              onSelectCandidate={handleSelectCandidate}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'jobs' && <JobDescriptionsPage />}

          {currentPage === 'rankings' && (
            <CandidateRankingsPage
              onSelectCandidate={handleSelectCandidate}
              onOpenCompare={handleOpenCompare}
            />
          )}

          {currentPage === 'evaluation' && (
            <AiEvaluationPage
              onSelectCandidate={handleSelectCandidate}
              initialCandidateId={selectedCandidateId}
            />
          )}

          {currentPage === 'analytics' && <AnalyticsPage />}

          {currentPage === 'history' && (
            <ProcessingHistoryPage
              onSelectCandidate={handleSelectCandidate}
            />
          )}
        </main>
      </div>

      {/* Compare Modal */}
      {compareCandidates.length > 0 && (
        <CompareModal
          candidates={compareCandidates}
          onClose={handleCloseCompare}
          onSelectCandidate={handleSelectCandidate}
          onStatusChange={async (candId, newStatus) => {
            await updateCandidateStatus(candId, newStatus);
            setCompareCandidates((prev) =>
              prev.map((c) => (c.id === candId ? { ...c, status: newStatus } : c))
            );
          }}
        />
      )}
    </div>
  );
}

