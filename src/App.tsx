import React, { useState, useEffect, useMemo } from 'react';
import { 
  CivicIssue, 
  IssueCategory, 
  IssuePriority, 
  IssueStatus, 
  LocationData, 
  UserProfile, 
  UserRole 
} from './types';
import { 
  subscribeToIssues, 
  createCivicIssue, 
  updateIssueStatus, 
  toggleIssueUpvote, 
  addIssueComment, 
  assignIssueDepartment,
  getSavedUserProfile, 
  saveUserProfile, 
  DEMO_USERS 
} from './lib/firebase';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { IssueCard } from './components/IssueCard';
import { ReportIssueModal } from './components/ReportIssueModal';
import { IssueDetailModal } from './components/IssueDetailModal';
import { AuthModal } from './components/AuthModal';
import { MapView } from './components/MapView';
import { 
  Building2, 
  Plus, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Radio, 
  ShieldCheck, 
  Sparkles, 
  Inbox,
  Bell
} from 'lucide-react';

export default function App() {
  // Current user state (multi-role)
  const [currentUser, setCurrentUser] = useState<UserProfile>(getSavedUserProfile);
  
  // Issues state (synced with Firestore onSnapshot)
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // View mode
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'upvotes' | 'priority'>('recent');
  const [showOnlyMyReports, setShowOnlyMyReports] = useState(false);

  // Real-time alert toast
  const [liveToast, setLiveToast] = useState<{ message: string; type: 'info' | 'success' } | null>(null);

  // Subscribe to real-time Firestore updates on mount
  useEffect(() => {
    let initialLoad = true;
    const unsubscribe = subscribeToIssues((updatedIssues) => {
      setIssues(updatedIssues);
      setIsOnline(true);

      if (!initialLoad && updatedIssues.length > 0) {
        // Notification on real-time update
        setLiveToast({
          message: 'Live update received from Firestore.',
          type: 'info'
        });
        setTimeout(() => setLiveToast(null), 3000);
      }
      initialLoad = false;
    });

    return () => unsubscribe();
  }, []);

  // Selected issue object
  const selectedIssue = useMemo(() => {
    return issues.find(i => i.id === selectedIssueId) || null;
  }, [issues, selectedIssueId]);

  // Handle Role Switching
  const handleSelectRole = (role: UserRole) => {
    const profile = DEMO_USERS[role];
    setCurrentUser(profile);
    saveUserProfile(profile);
    setLiveToast({
      message: `Switched active role to ${role.toUpperCase()}: ${profile.name}`,
      type: 'success'
    });
    setTimeout(() => setLiveToast(null), 3000);
  };

  // Handle Custom User Change
  const handleUserChange = (user: UserProfile) => {
    setCurrentUser(user);
    saveUserProfile(user);
  };

  // Handle Issue Submission
  const handleCreateIssue = async (data: {
    title: string;
    description: string;
    category: IssueCategory;
    priority: IssuePriority;
    location: LocationData;
    imageUrl?: string;
  }) => {
    const created = await createCivicIssue({
      ...data,
      status: 'reported',
      reportedBy: {
        uid: currentUser.uid,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        phone: currentUser.phone
      }
    });

    setLiveToast({
      message: `Ticket ${created.ticketId} logged successfully to Firestore!`,
      type: 'success'
    });
    setTimeout(() => setLiveToast(null), 4000);
  };

  // Handle Status Update (Officer or Admin)
  const handleUpdateStatus = async (
    issueId: string,
    newStatus: IssueStatus,
    updateInfo: { note?: string; photoUrl?: string; updatedBy: string; userRole: UserRole }
  ) => {
    await updateIssueStatus(issueId, newStatus, updateInfo);
    setLiveToast({
      message: `Status updated to ${newStatus.toUpperCase()} and synced with Firestore.`,
      type: 'success'
    });
    setTimeout(() => setLiveToast(null), 3500);
  };

  // Handle Department Assignment (Admin)
  const handleAssignDepartment = async (
    issueId: string,
    assignment: { department: string; officerName?: string; officerId?: string; adminName: string }
  ) => {
    await assignIssueDepartment(issueId, assignment);
    setLiveToast({
      message: `Assigned to ${assignment.department}.`,
      type: 'success'
    });
    setTimeout(() => setLiveToast(null), 3500);
  };

  // Handle Upvote
  const handleToggleUpvote = async (issueId: string) => {
    await toggleIssueUpvote(issueId, currentUser.uid);
  };

  // Handle Comment
  const handleAddComment = async (
    issueId: string,
    comment: { author: string; authorId: string; role: UserRole; text: string }
  ) => {
    await addIssueComment(issueId, comment);
  };

  // Filtered & Sorted issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(query);
        const matchesDesc = issue.description.toLowerCase().includes(query);
        const matchesTicket = issue.ticketId.toLowerCase().includes(query);
        const matchesLoc = issue.location.address.toLowerCase().includes(query) || issue.location.locality.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesTicket && !matchesLoc) {
          return false;
        }
      }

      // Status
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'in_progress') {
          if (issue.status !== 'in_progress' && issue.status !== 'assigned') return false;
        } else if (selectedStatus === 'resolved') {
          if (issue.status !== 'resolved' && issue.status !== 'closed') return false;
        } else if (issue.status !== selectedStatus) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && issue.category !== selectedCategory) {
        return false;
      }

      // Zone/Circle
      if (selectedZone !== 'all') {
        if (issue.location.circle !== selectedZone && issue.location.zone !== selectedZone) {
          return false;
        }
      }

      // My Reports
      if (showOnlyMyReports && issue.reportedBy.uid !== currentUser.uid) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'upvotes') {
        return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
      }
      if (sortBy === 'priority') {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      // default: recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [issues, searchTerm, selectedStatus, selectedCategory, selectedZone, sortBy, showOnlyMyReports, currentUser.uid]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      
      {/* Platform Header */}
      <Header
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        isOnline={isOnline}
        activeView={activeView}
        onToggleView={setActiveView}
        onLogout={() => handleSelectRole('citizen')}
      />

      {/* Real-time Notification Banner */}
      {liveToast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top duration-200">
          <div className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-700">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-medium">{liveToast.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Civic Top Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden mb-6">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-teal-500/10 blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-xs mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GHMC Smart City Citizen Action Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Fixi<span className="text-teal-300">Fy</span> Hyderabad
            </h1>

            <p className="text-sm text-teal-100/90 leading-relaxed mb-5">
              Empowering Hyderabad citizens, GHMC field inspectors, and ward authorities to report, locate with live GPS, track, and resolve civic infrastructure issues in real-time.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-colors shadow-md flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Report New Issue</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/20 text-white font-semibold backdrop-blur-xs transition-colors flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-teal-300" />
                <span>Switch Role ({currentUser.role.toUpperCase()})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Civic Pulse Stats Bar */}
        <StatsBar 
          issues={issues} 
          onFilterStatus={(status) => setSelectedStatus(status)}
        />

        {/* Search, Status & Category Filters */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedZone={selectedZone}
          onZoneChange={setSelectedZone}
          sortBy={sortBy}
          onSortChange={setSortBy}
          showOnlyMyReports={showOnlyMyReports}
          onToggleMyReports={setShowOnlyMyReports}
          currentUserName={currentUser.name}
        />

        {/* View Mode: Map View vs Feed List View */}
        {activeView === 'map' ? (
          <MapView
            issues={filteredIssues}
            onSelectIssue={(issue) => setSelectedIssueId(issue.id)}
          />
        ) : (
          <div>
            {/* Issue Cards Grid */}
            {filteredIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    currentUser={currentUser}
                    onSelect={(i) => setSelectedIssueId(i.id)}
                    onUpvote={handleToggleUpvote}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No civic complaints found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  No issues matched your selected filters. Try clearing filters or submit a new report.
                </p>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Report First Issue in this Area
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-700">FixiFy Hyderabad</span>
            <span>• Integrated Municipal Resolution System</span>
          </div>
          <div>
            Connected to Firestore Project: <span className="font-mono text-teal-700 font-semibold">fixify-hyderabad</span>
          </div>
        </div>
      </footer>

      {/* Modal: Report New Issue */}
      <ReportIssueModal
        currentUser={currentUser}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleCreateIssue}
      />

      {/* Modal: Issue Details & Multi-Role Status Progression */}
      <IssueDetailModal
        issue={selectedIssue}
        currentUser={currentUser}
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssueId(null)}
        onUpvote={handleToggleUpvote}
        onUpdateStatus={handleUpdateStatus}
        onAddComment={handleAddComment}
        onAssignDepartment={handleAssignDepartment}
      />

      {/* Modal: Multi-Role Firebase Authentication */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
      />

    </div>
  );
}
