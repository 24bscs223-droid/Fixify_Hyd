import React from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { IssueCategory, IssueStatus } from '../types';
import { HYDERABAD_ZONES } from '../data/hyderabadData';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedZone: string;
  onZoneChange: (zone: string) => void;
  sortBy: 'recent' | 'upvotes' | 'priority';
  onSortChange: (sort: 'recent' | 'upvotes' | 'priority') => void;
  showOnlyMyReports: boolean;
  onToggleMyReports: (val: boolean) => void;
  currentUserName: string;
}

const CATEGORIES: IssueCategory[] = [
  'Pothole & Road Damage',
  'Garbage & Sanitation',
  'Water Supply & Leakage',
  'Streetlight Malfunction',
  'Sewage & Drainage Overflow',
  'Footpath & Encroachment',
  'Stray Animal Hazard',
  'Open Manhole',
  'Traffic Signal Issue',
  'Other Civic Concern'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  selectedZone,
  onZoneChange,
  sortBy,
  onSortChange,
  showOnlyMyReports,
  onToggleMyReports,
  currentUserName
}) => {
  const hasActiveFilters = selectedStatus !== 'all' || selectedCategory !== 'all' || selectedZone !== 'all' || showOnlyMyReports || searchTerm !== '';

  const clearAllFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onCategoryChange('all');
    onZoneChange('all');
    onToggleMyReports(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs mb-6 space-y-3">
      
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="filter-search-input"
            type="text"
            placeholder="Search by ticket # (e.g. 84291), area, or keyword..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center overflow-x-auto pb-1 sm:pb-0 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
          {[
            { id: 'all', label: 'All' },
            { id: 'reported', label: 'Reported' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
                selectedStatus === tab.id
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Second Row: Dropdowns & Toggles */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        
        {/* Zone/Circle Filter */}
        <div className="flex items-center space-x-1">
          <select
            id="filter-zone-select"
            value={selectedZone}
            onChange={(e) => onZoneChange(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Hyderabad Zones & Circles</option>
            {HYDERABAD_ZONES.map(z => (
              <optgroup key={z.name} label={z.name}>
                {z.circles.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-1">
          <select
            id="filter-category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 max-w-[200px] truncate"
          >
            <option value="all">All Civic Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-1 ml-auto">
          <span className="text-slate-400 hidden sm:inline">Sort:</span>
          <select
            id="filter-sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="recent">Latest Reports</option>
            <option value="upvotes">Most Upvoted</option>
            <option value="priority">Highest Severity</option>
          </select>
        </div>

        {/* "My Reports" toggle button */}
        <button
          type="button"
          onClick={() => onToggleMyReports(!showOnlyMyReports)}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            showOnlyMyReports
              ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          My Submissions
        </button>

        {/* Clear Filters Reset */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}

      </div>

    </div>
  );
};
