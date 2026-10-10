import React, { useState, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Camera, 
  Upload, 
  Crosshair, 
  Check, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon,
  Compass,
  Building,
  Trash2
} from 'lucide-react';
import { IssueCategory, IssuePriority, LocationData, UserProfile } from '../types';
import { HYDERABAD_ZONES } from '../data/hyderabadData';
import { detectCurrentGPS, DetectedGPS } from '../utils/geolocation';
import { compressImage } from '../utils/imageCompressor';

interface ReportIssueModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issueData: {
    title: string;
    description: string;
    category: IssueCategory;
    priority: IssuePriority;
    location: LocationData;
    imageUrl?: string;
  }) => Promise<void>;
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

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Pothole & Road Damage');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  
  // Location state
  const [address, setAddress] = useState('');
  const [circle, setCircle] = useState(HYDERABAD_ZONES[0].circles[0]);
  const [zone, setZone] = useState(HYDERABAD_ZONES[0].name);
  const [locality, setLocality] = useState('Banjara Hills');
  const [coordinates, setCoordinates] = useState({ lat: 17.4156, lng: 78.4350 });
  const [accuracy, setAccuracy] = useState<number | undefined>(undefined);
  
  // GPS detection state
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  // Photo state
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle GPS detection
  const handleDetectGPS = async () => {
    setIsDetectingGPS(true);
    setGpsError(null);
    setGpsSuccess(false);

    try {
      const result: DetectedGPS = await detectCurrentGPS();
      setCoordinates({ lat: result.lat, lng: result.lng });
      setAccuracy(result.accuracy);
      if (result.detectedAddress) {
        setAddress(result.detectedAddress);
      }
      if (result.nearestLocality) {
        setLocality(result.nearestLocality);
      }
      if (result.suggestedCircle) {
        setCircle(result.suggestedCircle);
      }
      if (result.suggestedZone) {
        setZone(result.suggestedZone);
      }
      setGpsSuccess(true);
    } catch (err: any) {
      setGpsError(err.message || 'GPS location unavailable. Please pick your Hyderabad Circle manually.');
    } finally {
      setIsDetectingGPS(false);
    }
  };

  // Handle Photo selection & compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP).');
      return;
    }

    try {
      setIsCompressingPhoto(true);
      const compressed = await compressImage(file);
      setPhotoDataUrl(compressed);
    } catch (err) {
      console.error('Photo compression error:', err);
      alert('Failed to process image. Please try another photo.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // Handle circle change to auto-update zone
  const handleCircleChange = (selected: string) => {
    setCircle(selected);
    for (const z of HYDERABAD_ZONES) {
      if (z.circles.includes(selected)) {
        setZone(z.name);
        const namePart = selected.split('(')[0].trim();
        setLocality(namePart);
        break;
      }
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please enter a brief issue title.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please provide a description of the civic problem.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        location: {
          address: address.trim() || `${locality}, ${circle}`,
          locality,
          circle,
          zone,
          coordinates,
          accuracy
        },
        imageUrl: photoDataUrl || undefined
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Report a Civic Issue
            </h2>
            <p className="text-xs text-slate-500">
              Submit to Greater Hyderabad Municipal Corporation (GHMC) Rapid Resolution
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Title *
            </label>
            <input
              id="report-issue-title"
              type="text"
              required
              placeholder="e.g. Deep pothole on approach road, Overflowing garbage bin"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                id="report-issue-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgency / Severity
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'critical'] as IssuePriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-1 text-xs font-medium rounded-lg border capitalize text-center transition-all ${
                      priority === p
                        ? p === 'critical'
                          ? 'bg-red-600 border-red-600 text-white font-bold'
                          : p === 'high'
                          ? 'bg-orange-500 border-orange-500 text-white font-bold'
                          : 'bg-teal-600 border-teal-600 text-white font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Specific Landmarks *
            </label>
            <textarea
              id="report-issue-description"
              required
              rows={3}
              placeholder="Describe the condition, exact spot (e.g. opposite Niloufer Cafe, near pillar 24), how long it has been unresolved..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Requirement 3: GPS Location Detection */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-900">GPS Location Tagging</span>
              </div>
              
              {/* Detect My GPS Button */}
              <button
                id="report-detect-gps-btn"
                type="button"
                onClick={handleDetectGPS}
                disabled={isDetectingGPS}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {isDetectingGPS ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Detect Live GPS</span>
                  </>
                )}
              </button>
            </div>

            {/* GPS Feedback notification */}
            {gpsSuccess && (
              <div className="flex items-center space-x-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Location detected: {coordinates.lat}° N, {coordinates.lng}° E
                  {accuracy ? ` (accurate within ±${accuracy}m)` : ''}
                </span>
              </div>
            )}

            {gpsError && (
              <div className="flex items-center space-x-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* Ward / Circle Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  GHMC Circle / Ward
                </label>
                <select
                  id="report-issue-circle"
                  value={circle}
                  onChange={(e) => handleCircleChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {HYDERABAD_ZONES.map(z => (
                    <optgroup key={z.name} label={z.name}>
                      {z.circles.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Locality / Street Name
                </label>
                <input
                  id="report-issue-locality"
                  type="text"
                  placeholder="e.g. Banjara Hills Road No. 12"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Detailed Street Address */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Precise Street / Building Address
              </label>
              <input
                id="report-issue-address"
                type="text"
                placeholder="e.g. Near Metro Pillar 124, Opposite City Center Mall"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Requirement 4: Photo Upload Functionality */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-teal-600" />
                <span>Upload Site Photo (Inspection Proof)</span>
              </span>
              <span className="text-[11px] text-slate-500">Auto-compressed for Firestore</span>
            </div>

            {photoDataUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black/5 max-h-56">
                <img 
                  src={photoDataUrl} 
                  alt="Issue preview" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-xs flex items-center space-x-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoDataUrl(null)}
                    className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white text-xs backdrop-blur-xs flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-6 text-center bg-white transition-colors"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
                  {isCompressingPhoto ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  {isCompressingPhoto ? 'Processing photo...' : 'Click to take photo or upload image'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supports Camera capture, JPEG, PNG, WebP
                </p>
              </div>
            )}

            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Reporting Citizen Info */}
          <div className="flex items-center space-x-2 text-xs text-slate-500 px-1">
            <span>Reporting as:</span>
            <span className="font-semibold text-slate-700">{currentUser.name}</span>
            <span className="text-slate-400">({currentUser.email})</span>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              id="report-submit-btn"
              type="submit"
              disabled={isSubmitting || isCompressingPhoto}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging with Firestore...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit to GHMC FixiFy</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
