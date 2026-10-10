import React, { useState } from 'react';
import { CivicIssue, IssueStatus } from '../types';
import { MapPin, Navigation, Eye, CheckCircle2, Clock, AlertTriangle, ExternalLink } from 'lucide-react';

interface MapViewProps {
  issues: CivicIssue[];
  onSelectIssue: (issue: CivicIssue) => void;
}

// Coordinate boundaries of Greater Hyderabad for SVG plotting
// Lat: ~17.30 to 17.55 (South to North)
// Lng: ~78.30 to 78.60 (West to East)
const MIN_LAT = 17.30;
const MAX_LAT = 17.55;
const MIN_LNG = 78.30;
const MAX_LNG = 78.60;

function latLngToPercent(lat: number, lng: number) {
  // Clamp within bounds
  const clampedLat = Math.max(MIN_LAT, Math.min(MAX_LAT, lat));
  const clampedLng = Math.max(MIN_LNG, Math.min(MAX_LNG, lng));

  // In SVG / CSS, Y increases downwards, so higher latitude (north) is lower Y %
  const x = ((clampedLng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
  const y = (1 - (clampedLat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100;

  return { x: Math.max(4, Math.min(96, x)), y: Math.max(4, Math.min(96, y)) };
}

export const MapView: React.FC<MapViewProps> = ({ issues, onSelectIssue }) => {
  const [selectedPin, setSelectedPin] = useState<CivicIssue | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredIssues = issues.filter(i => {
    if (statusFilter === 'all') return true;
    return i.status === statusFilter;
  });

  const getPinColor = (status: IssueStatus) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-emerald-500 border-emerald-200 text-emerald-900';
      case 'in_progress':
        return 'bg-orange-500 border-orange-200 text-orange-900';
      case 'assigned':
        return 'bg-amber-500 border-amber-200 text-amber-900';
      default:
        return 'bg-red-500 border-red-200 text-red-900';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs mb-8">
      
      {/* Map Control Header */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-teal-600" />
            <span>Greater Hyderabad Civic GIS Live Map</span>
          </h3>
          <p className="text-xs text-slate-500">
            Plotting real-time GPS locations of reported community issues
          </p>
        </div>

        {/* Status toggles on map */}
        <div className="flex items-center space-x-1.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({issues.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('reported')}
            className={`px-2.5 py-1 rounded-md flex items-center space-x-1 transition-all ${
              statusFilter === 'reported' ? 'bg-white text-red-700 shadow-xs font-bold' : 'text-slate-600 hover:text-red-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Unassigned</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_progress')}
            className={`px-2.5 py-1 rounded-md flex items-center space-x-1 transition-all ${
              statusFilter === 'in_progress' ? 'bg-white text-orange-700 shadow-xs font-bold' : 'text-slate-600 hover:text-orange-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>In Progress</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('resolved')}
            className={`px-2.5 py-1 rounded-md flex items-center space-x-1 transition-all ${
              statusFilter === 'resolved' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Resolved</span>
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[450px] sm:h-[500px] bg-slate-900 overflow-hidden select-none">
        
        {/* Stylized Vector Grid & City Zones */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
        
        {/* Subtle Waterbody Landmarks (Hussain Sagar & Osman Sagar) */}
        {/* Hussain Sagar center-ish ~ 17.42N, 78.47E */}
        <div 
          className="absolute w-16 h-12 rounded-full bg-teal-950/80 border border-teal-700/40 blur-xs"
          style={{ left: '55%', top: '48%', transform: 'translate(-50%, -50%)' }}
        ></div>
        <div 
          className="absolute text-[10px] font-mono text-teal-500/70 font-bold tracking-widest pointer-events-none"
          style={{ left: '55%', top: '48%', transform: 'translate(-50%, -50%)' }}
        >
          HUSSAIN SAGAR
        </div>

        {/* Hyderabad Region Labels */}
        <div className="absolute top-4 left-6 text-slate-500 text-[10px] font-mono tracking-wider pointer-events-none uppercase">
          GHMC WEST (HITEC CITY / GACHIBOWLI)
        </div>
        <div className="absolute top-4 right-6 text-slate-500 text-[10px] font-mono tracking-wider pointer-events-none uppercase">
          SECUNDERABAD CANTONMENT
        </div>
        <div className="absolute bottom-4 left-6 text-slate-500 text-[10px] font-mono tracking-wider pointer-events-none uppercase">
          MEHDIPATNAM / RAJENDRANAGAR
        </div>
        <div className="absolute bottom-4 right-6 text-slate-500 text-[10px] font-mono tracking-wider pointer-events-none uppercase">
          CHARMINAR & OLD CITY ZONE
        </div>

        {/* Outer Ring Road (ORR) stylized orbital ring */}
        <div className="absolute inset-8 rounded-full border border-dashed border-slate-700/40 pointer-events-none"></div>

        {/* Plotted Issue Pins */}
        {filteredIssues.map((issue) => {
          const { x, y } = latLngToPercent(issue.location.coordinates.lat, issue.location.coordinates.lng);
          const isSelected = selectedPin?.id === issue.id;

          return (
            <div
              key={issue.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform hover:scale-125"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => setSelectedPin(issue)}
            >
              {/* Radar pulse for active issues */}
              {issue.status === 'reported' && (
                <span className="absolute -inset-1 rounded-full bg-red-500/40 animate-ping"></span>
              )}
              {issue.status === 'in_progress' && (
                <span className="absolute -inset-1 rounded-full bg-orange-500/40 animate-ping"></span>
              )}

              <div className={`relative px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg border text-[10px] font-bold text-white transition-all ${
                isSelected ? 'ring-2 ring-white scale-110' : ''
              } ${
                issue.status === 'resolved' || issue.status === 'closed'
                  ? 'bg-emerald-600 border-emerald-400'
                  : issue.status === 'in_progress'
                  ? 'bg-orange-600 border-orange-400'
                  : issue.status === 'assigned'
                  ? 'bg-amber-600 border-amber-400'
                  : 'bg-red-600 border-red-400'
              }`}>
                <MapPin className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline font-mono">{issue.ticketId.slice(-5)}</span>
              </div>
            </div>
          );
        })}

        {/* Selected Pin Popup Card */}
        {selectedPin && (
          <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-20 animate-in fade-in slide-in-from-bottom-2 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {selectedPin.ticketId}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                  {selectedPin.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-500 mb-3">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{selectedPin.location.address}</span>
            </div>

            {selectedPin.imageUrl && (
              <img 
                src={selectedPin.imageUrl} 
                alt="preview"
                className="w-full h-24 object-cover rounded-lg mb-3"
              />
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                selectedPin.status === 'resolved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : selectedPin.status === 'in_progress'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedPin.status.replace('_', ' ')}
              </span>

              <button
                type="button"
                onClick={() => onSelectIssue(selectedPin)}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
              >
                <span>Inspect Full Ticket</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
