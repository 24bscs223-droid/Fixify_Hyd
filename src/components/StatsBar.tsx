import React from 'react';
import { CivicIssue } from '../types';
import { AlertCircle, Clock, CheckCircle2, TrendingUp, ThumbsUp } from 'lucide-react';

interface StatsBarProps {
  issues: CivicIssue[];
  selectedCategory?: string;
  onFilterStatus?: (status: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ issues, onFilterStatus }) => {
  const total = issues.length;
  const reported = issues.filter(i => i.status === 'reported').length;
  const inProgress = issues.filter(i => i.status === 'in_progress' || i.status === 'assigned').length;
  const resolved = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const totalUpvotes = issues.reduce((acc, curr) => acc + (curr.upvotes?.length || 0), 0);
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6">
      
      {/* Total Reported */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('all')}
        className="cursor-pointer bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
      >
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
          <span>Total Logged</span>
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <AlertCircle className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{total}</span>
          <span className="text-xs text-slate-500">tickets</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span>{reported} unassigned</span>
        </div>
      </div>

      {/* Active Work In Progress */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('in_progress')}
        className="cursor-pointer bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
      >
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
          <span>Active In-Progress</span>
          <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{inProgress}</span>
          <span className="text-xs text-amber-600 font-medium">field work</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Crews active on site</span>
        </div>
      </div>

      {/* Resolved Tickets */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('resolved')}
        className="cursor-pointer bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
      >
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
          <span>Resolved & Fixed</span>
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-emerald-700 tracking-tight">{resolved}</span>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            {resolutionRate}% rate
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Verified by citizens</span>
        </div>
      </div>

      {/* Community Engagement */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
          <span>Citizen Backing</span>
          <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
            <ThumbsUp className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalUpvotes}</span>
          <span className="text-xs text-slate-500">community upvotes</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-teal-600" />
          <span>Priority voting active</span>
        </div>
      </div>

    </div>
  );
};
