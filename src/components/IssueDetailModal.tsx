import React, { useState, useRef } from 'react';
import { 
  X, 
  MapPin, 
  ThumbsUp, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  User, 
  Shield, 
  UserCheck, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Building,
  Wrench,
  Loader2
} from 'lucide-react';
import { CivicIssue, IssueStatus, UserProfile, UserRole } from '../types';
import { CIVIC_DEPARTMENTS } from '../data/hyderabadData';
import { compressImage } from '../utils/imageCompressor';

interface IssueDetailModalProps {
  issue: CivicIssue | null;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpvote: (issueId: string) => void;
  onUpdateStatus: (
    issueId: string, 
    newStatus: IssueStatus, 
    updateInfo: { note?: string; photoUrl?: string; updatedBy: string; userRole: UserRole }
  ) => Promise<void>;
  onAddComment: (
    issueId: string, 
    comment: { author: string; authorId: string; role: UserRole; text: string }
  ) => Promise<void>;
  onAssignDepartment: (
    issueId: string, 
    assignment: { department: string; officerName?: string; officerId?: string; adminName: string }
  ) => Promise<void>;
}

const STATUS_STEPS: { key: IssueStatus; label: string; desc: string }[] = [
  { key: 'reported', label: 'Reported', desc: 'Logged by citizen' },
  { key: 'assigned', label: 'Assigned', desc: 'Routed to ward wing' },
  { key: 'in_progress', label: 'In Progress', desc: 'Field crew on site' },
  { key: 'resolved', label: 'Resolved', desc: 'Work completed' },
  { key: 'closed', label: 'Closed', desc: 'Verified by citizen' }
];

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  currentUser,
  isOpen,
  onClose,
  onUpvote,
  onUpdateStatus,
  onAddComment,
  onAssignDepartment
}) => {
  if (!isOpen || !issue) return null;

  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Officer / Admin Action states
  const [officerNote, setOfficerNote] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const resolutionPhotoRef = useRef<HTMLInputElement>(null);

  // Admin assignment state
  const [selectedDept, setSelectedDept] = useState(issue.assignedTo?.department || CIVIC_DEPARTMENTS[0]);
  const [officerNameInput, setOfficerNameInput] = useState(issue.assignedTo?.officerName || '');
  const [isAssigning, setIsAssigning] = useState(false);

  const hasUpvoted = issue.upvotes?.includes(currentUser.uid);

  // Progress stepper calculations
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === issue.status);

  // Handle Resolution Photo upload
  const handleResolutionPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingPhoto(true);
      const compressed = await compressImage(file);
      setResolutionPhoto(compressed);
    } catch (err) {
      console.error(err);
      alert('Could not process resolution photo');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // Submit comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      await onAddComment(issue.id, {
        author: currentUser.name,
        authorId: currentUser.uid,
        role: currentUser.role,
        text: newComment.trim()
      });
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Officer updates status
  const handleStatusChangeAction = async (targetStatus: IssueStatus) => {
    try {
      setIsUpdatingStatus(true);
      await onUpdateStatus(issue.id, targetStatus, {
        note: officerNote.trim() || undefined,
        photoUrl: resolutionPhoto || undefined,
        updatedBy: `${currentUser.name} (${currentUser.role})`,
        userRole: currentUser.role
      });
      setOfficerNote('');
      setResolutionPhoto(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Admin assigns department
  const handleAssignAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAssigning(true);
      await onAssignDepartment(issue.id, {
        department: selectedDept,
        officerName: officerNameInput.trim() || undefined,
        adminName: currentUser.name
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAssigning(false);
    }
  };

  const mapsUrl = `https://www.google.com/maps?q=${issue.location.coordinates.lat},${issue.location.coordinates.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs sm:text-sm font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
              {issue.ticketId}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              {issue.category}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onUpvote(issue.id)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
                hasUpvoted
                  ? 'bg-teal-50 border-teal-300 text-teal-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-teal-600' : ''}`} />
              <span>{issue.upvotes?.length || 0} Upvotes</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Issue Title & Description */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              {issue.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {issue.description}
            </p>
          </div>

          {/* Requirement 5: Visual Status Stepper Tracking */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              GHMC Status Resolution Lifecycle
            </h4>
            <div className="grid grid-cols-5 gap-1 relative">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.key} className="text-center relative">
                    <div className="flex items-center justify-center mb-1.5">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent 
                          ? 'bg-teal-600 text-white ring-4 ring-teal-100 shadow-xs'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                    </div>
                    <p className={`text-[11px] sm:text-xs font-bold truncate ${
                      isCurrent ? 'text-teal-700' : isPassed ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-500 hidden sm:block truncate">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photos: Reported Site Photo vs Resolution Proof Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Original Reported Photo */}
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <span>Original Site Photo</span>
              </p>
              {issue.imageUrl ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-52">
                  <img 
                    src={issue.imageUrl} 
                    alt="Reported problem"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="h-52 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                  No site photo attached
                </div>
              )}
            </div>

            {/* Resolution After-Repair Photo */}
            <div>
              <p className="text-xs font-semibold text-emerald-800 mb-1.5 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Official Resolution Proof (After Repair)</span>
              </p>
              {issue.resolutionImageUrl ? (
                <div className="rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50 h-52 relative group">
                  <img 
                    src={issue.resolutionImageUrl} 
                    alt="Official resolution proof"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    Fixed & Verified
                  </div>
                </div>
              ) : (
                <div className="h-52 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-xs text-slate-400 p-4 text-center">
                  <Wrench className="w-6 h-6 text-slate-300 mb-1" />
                  <span>Work in progress / Resolution photo will be posted upon fix completion</span>
                </div>
              )}
            </div>
          </div>

          {/* Location & GPS Info Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 mb-1">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>{issue.location.address}</span>
              </div>
              <p className="text-xs text-slate-500">
                {issue.location.locality} • {issue.location.circle} • {issue.location.zone}
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                GPS: {issue.location.coordinates.lat}° N, {issue.location.coordinates.lng}° E
                {issue.location.accuracy ? ` (±${issue.location.accuracy}m)` : ''}
              </p>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 shrink-0 transition-colors"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          {/* Officer & Department Assignment Banner */}
          {issue.assignedTo && (
            <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-teal-900">{issue.assignedTo.department}</p>
                  <p className="text-teal-700">
                    Lead Officer: {issue.assignedTo.officerName || 'Assigned to Division Field Unit'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MULTI-ROLE ACTION CONTROLS */}
          
          {/* 1. GHMC Field Officer Action Panel */}
          {currentUser.role === 'officer' && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Field Officer Actions (Inspector Mode)</span>
              </div>
              <p className="text-xs text-emerald-700">
                You are logged in as GHMC Field Officer ({currentUser.name}). Update field progress or submit completion proof.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inspection Remark / Work Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Asphalting completed, dumper truck cleared area, line repaired..."
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Upload After-Repair Proof */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Resolution Photo (Field Proof)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => resolutionPhotoRef.current?.click()}
                    disabled={isProcessingPhoto}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{resolutionPhoto ? 'Replace Photo' : 'Attach After-Fix Photo'}</span>
                  </button>
                  {resolutionPhoto && (
                    <span className="text-xs text-emerald-700 font-medium">✓ Photo attached</span>
                  )}
                </div>
                <input 
                  ref={resolutionPhotoRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleResolutionPhotoSelect}
                  className="hidden"
                />
              </div>

              {/* Status transition buttons */}
              <div className="flex items-center space-x-2 pt-1">
                {issue.status !== 'in_progress' && (
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChangeAction('in_progress')}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors"
                  >
                    Mark "In Progress"
                  </button>
                )}

                {issue.status !== 'resolved' && (
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChangeAction('resolved')}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Mark "Work Resolved"
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. Ward Admin Action Panel */}
          {currentUser.role === 'admin' && (
            <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Ward Administrator Directives</span>
              </div>

              <form onSubmit={handleAssignAction} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-purple-950 mb-1">
                      Assign Department
                    </label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {CIVIC_DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-purple-950 mb-1">
                      Assign Lead Officer (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. S. Swaroopa (Sanitary Inspector)"
                      value={officerNameInput}
                      onChange={(e) => setOfficerNameInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="submit"
                    disabled={isAssigning}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors"
                  >
                    Assign Department
                  </button>

                  {issue.status !== 'closed' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChangeAction('closed')}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* 3. Citizen Action: Confirm Resolved */}
          {currentUser.role === 'citizen' && issue.status === 'resolved' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-900">Are you satisfied with this resolution?</p>
                <p className="text-[11px] text-emerald-700">As a citizen of Hyderabad, verify that the civic issue is fixed.</p>
              </div>
              <button
                type="button"
                onClick={() => handleStatusChangeAction('closed')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs shrink-0"
              >
                Confirm & Close
              </button>
            </div>
          )}

          {/* Status Timeline History */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Status Audit History Log
            </h4>
            <div className="space-y-2 border-l-2 border-slate-200 ml-2 pl-3">
              {issue.statusHistory?.map((h, i) => (
                <div key={i} className="relative text-xs">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-teal-600 ring-4 ring-white"></div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 capitalize">{h.status.replace('_', ' ')}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-medium">{h.updatedBy}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-400">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {h.note && (
                    <p className="text-slate-600 text-[11px] mt-0.5 italic">"{h.note}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Community Feedback & Comments Section */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Community Comments ({issue.comments?.length || 0})
            </h4>

            {/* Comment List */}
            <div className="space-y-2.5 mb-3 max-h-48 overflow-y-auto">
              {issue.comments && issue.comments.length > 0 ? (
                issue.comments.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                        <span>{c.author}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-normal uppercase">
                          {c.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-normal">{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No community comments yet. Leave the first remark.</p>
              )}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                id="issue-comment-input"
                type="text"
                placeholder={`Leave a comment as ${currentUser.name}...`}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                id="issue-comment-submit-btn"
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Reported by {issue.reportedBy.name} ({issue.reportedBy.role})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
