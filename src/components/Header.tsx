import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Shield, 
  UserCheck, 
  User, 
  ChevronDown, 
  LogOut, 
  LogIn, 
  Radio, 
  Map as MapIcon, 
  ListFilter
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../lib/firebase';

interface HeaderProps {
  currentUser: UserProfile;
  onSelectRole: (role: UserRole) => void;
  onOpenAuth: () => void;
  onOpenReportModal: () => void;
  isOnline: boolean;
  activeView: 'list' | 'map';
  onToggleView: (view: 'list' | 'map') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectRole,
  onOpenAuth,
  onOpenReportModal,
  isOnline,
  activeView,
  onToggleView,
  onLogout
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Ward Admin',
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Shield
        };
      case 'officer':
        return {
          label: 'GHMC Officer',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: UserCheck
        };
      default:
        return {
          label: 'Citizen',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: User
        };
    }
  };

  const badge = getRoleBadge(currentUser.role);
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & City Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Fixi<span className="text-teal-600">Fy</span>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Hyderabad
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Greater Hyderabad Municipal Civic Resolution Network
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Live Firestore indicator */}
            <div 
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600"
              title="Real-time live Firestore synchronization active"
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="font-medium">{isOnline ? 'Firestore Live' : 'Offline Cache'}</span>
            </div>

            {/* View Switcher (List vs Map) */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                id="header-list-view-btn"
                type="button"
                onClick={() => onToggleView('list')}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md font-medium transition-all ${
                  activeView === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Feed</span>
              </button>
              <button
                id="header-map-view-btn"
                type="button"
                onClick={() => onToggleView('map')}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md font-medium transition-all ${
                  activeView === 'map'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Live Map</span>
              </button>
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                id="header-role-dropdown-btn"
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-700 shadow-xs transition-all"
              >
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold border ${badge.bg}`}>
                  <BadgeIcon className="w-3 h-3 mr-1" />
                  {badge.label}
                </span>
                <span className="hidden md:inline text-slate-600 truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active User Profile</p>
                    <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    {currentUser.department && (
                      <p className="text-[11px] text-teal-700 font-medium mt-0.5">{currentUser.department}</p>
                    )}
                  </div>

                  <div className="p-1">
                    <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase">Switch Role (Testing)</p>
                    <button
                      type="button"
                      onClick={() => onSelectRole('citizen')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentUser.role === 'citizen' ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Citizen (Report & Track)</span>
                      </div>
                      {currentUser.role === 'citizen' && <span className="text-blue-600 text-xs">✓</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectRole('officer')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentUser.role === 'officer' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>GHMC Officer (Inspect & Fix)</span>
                      </div>
                      {currentUser.role === 'officer' && <span className="text-emerald-600 text-xs">✓</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectRole('admin')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentUser.role === 'admin' ? 'bg-purple-50 text-purple-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                        <span>Ward Admin (Assign & Direct)</span>
                      </div>
                      {currentUser.role === 'admin' && <span className="text-purple-600 text-xs">✓</span>}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 p-1">
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center space-x-2 text-slate-600 hover:bg-slate-50"
                    >
                      <LogIn className="w-3.5 h-3.5 text-slate-400" />
                      <span>Firebase Auth / Account Sign In</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Report New Issue Action */}
            <button
              id="header-report-issue-btn"
              type="button"
              onClick={onOpenReportModal}
              className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Report Issue</span>
              <span className="sm:hidden">Report</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
