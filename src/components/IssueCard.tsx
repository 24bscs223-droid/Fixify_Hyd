import React from 'react';
import { 
  MapPin, 
  ThumbsUp, 
  Clock, 
  MessageSquare, 
  ArrowRight, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  ShieldCheck,
  User
} from 'lucide-react';
import { CivicIssue, IssuePriority, IssueStatus, UserProfile } from '../types';

interface IssueCardProps {
  issue: CivicIssue;
  currentUser: UserProfile;
  onSelect: (issue: CivicIssue) => void;
  onUpvote: (issueId: string) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  currentUser,
  onSelect,
  onUpvote
}) => {
  const hasUpvoted = issue.upvotes?.includes(currentUser.uid);

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'reported':
        return {
          label: 'Reported',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500'
        };
      case 'assigned':
        return {
          label: 'Assigned',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          dot: 'bg-orange-500 animate-pulse'
        };
      case 'resolved':
        return {
          label: 'Resolved',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'closed':
        return {
          label: 'Verified & Closed',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400'
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400'
        };
    }
  };

  const getPriorityBadge = (priority: IssuePriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const statusBadge = getStatusBadge(issue.status);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-teal-500/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Media & Header */}
      <div>
        {issue.imageUrl && (
          <div 
            onClick={() => onSelect(issue)}
            className="relative h-44 w-full overflow-hidden bg-slate-100 cursor-pointer"
          >
            <img 
              src={issue.imageUrl} 
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
            
            {/* Overlay Ticket ID */}
            <span className="absolute bottom-2 left-3 text-[11px] font-mono font-semibold text-white/90 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
              {issue.ticketId}
            </span>

            {/* Resolved tag if has resolution proof */}
            {issue.resolutionImageUrl && (
              <span className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                <CheckCircle2 className="w-3 h-3" />
                <span>Fix Proof Attached</span>
              </span>
            )}
          </div>
        )}

        <div className="p-4 sm:p-5">
          
          {/* Metadata Row: Category & Status */}
          <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[180px]">
              {issue.category}
            </span>

            <div className="flex items-center space-x-1.5">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getPriorityBadge(issue.priority)} capitalize`}>
                {issue.priority}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${statusBadge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                <span>{statusBadge.label}</span>
              </span>
            </div>
          </div>

          {/* Ticket ID if no image */}
          {!issue.imageUrl && (
            <div className="text-[11px] font-mono font-semibold text-teal-700 mb-1">
              {issue.ticketId}
            </div>
          )}

          {/* Title */}
          <h3 
            onClick={() => onSelect(issue)}
            className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 cursor-pointer mb-2"
          >
            {issue.title}
          </h3>

          {/* Description Excerpt */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {issue.description}
          </p>

          {/* Location details */}
          <div className="flex items-start space-x-1.5 text-xs text-slate-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <div className="truncate">
              <span className="font-medium text-slate-700">{issue.location.locality || 'Hyderabad'}</span>
              <span className="text-slate-400"> • </span>
              <span className="text-slate-500">{issue.location.circle}</span>
            </div>
          </div>

          {/* Assigned Department or Officer Notice */}
          {issue.assignedTo && (
            <div className="flex items-center space-x-1.5 text-[11px] bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 mb-2">
              <Wrench className="w-3 h-3 text-teal-600 shrink-0" />
              <span className="truncate">
                {issue.assignedTo.department}
                {issue.assignedTo.officerName ? ` (${issue.assignedTo.officerName})` : ''}
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Footer Actions: Upvote, Comments, Details */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Upvote Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpvote(issue.id);
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md border font-semibold transition-all ${
              hasUpvoted
                ? 'bg-teal-50 border-teal-300 text-teal-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
            title="Upvote to raise civic priority"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-teal-600' : ''}`} />
            <span>{issue.upvotes?.length || 0}</span>
          </button>

          {/* Comments count */}
          <div className="flex items-center space-x-1 text-slate-500">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{issue.comments?.length || 0}</span>
          </div>
        </div>

        {/* View Details Link */}
        <button
          type="button"
          onClick={() => onSelect(issue)}
          className="flex items-center space-x-1 text-teal-700 font-semibold hover:text-teal-800 transition-colors"
        >
          <span>Track Status</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>

      </div>

    </div>
  );
};
