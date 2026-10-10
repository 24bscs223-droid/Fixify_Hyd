import React, { useState } from 'react';
import { 
  X, 
  User, 
  Shield, 
  UserCheck, 
  Mail, 
  Lock, 
  Building, 
  Phone, 
  AlertCircle, 
  Check, 
  Loader2, 
  KeyRound,
  Sparkles
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS, auth, persistUserProfileToFirestore } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { CIVIC_DEPARTMENTS, HYDERABAD_ZONES } from '../data/hyderabadData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'demo' | 'signin' | 'signup'>('demo');
  
  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign Up state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('citizen');
  const [regDepartment, setRegDepartment] = useState(CIVIC_DEPARTMENTS[0]);
  const [regWard, setRegWard] = useState(HYDERABAD_ZONES[0].circles[0]);

  // Loading & error
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick Switch
  const handleQuickSwitch = (role: UserRole) => {
    const profile = DEMO_USERS[role];
    onUserChange(profile);
    persistUserProfileToFirestore(profile);
    onClose();
  };

  // Firebase Email/Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;
      
      // Determine role from local or default
      const profile: UserProfile = {
        uid: user.uid,
        name: user.displayName || email.split('@')[0],
        email: user.email || email,
        role: email.includes('admin') ? 'admin' : email.includes('ghmc') || email.includes('officer') ? 'officer' : 'citizen',
        ward: 'Circle 18 - Banjara Hills'
      };

      onUserChange(profile);
      await persistUserProfileToFirestore(profile);
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => onClose(), 600);
    } catch (err: any) {
      console.warn('Firebase Auth Sign In error:', err);
      // Helpful error translation
      let msg = err.message || 'Failed to sign in.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. You can also use the 1-Click Multi-Role testing tabs above or create a new account!';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please provide a valid email format.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Firebase Sign Up with Multi-Role Assignment
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, regEmail.trim(), regPassword);
      const user = cred.user;

      await updateProfile(user, { displayName: regName.trim() });

      const profile: UserProfile = {
        uid: user.uid,
        name: regName.trim(),
        email: regEmail.trim(),
        role: regRole,
        phone: regPhone.trim() || undefined,
        ward: regWard,
        department: regRole === 'officer' ? regDepartment : undefined
      };

      onUserChange(profile);
      await persistUserProfileToFirestore(profile);
      setSuccessMsg(`Account created with ${regRole.toUpperCase()} privileges!`);
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      console.warn('Firebase Auth Sign Up error:', err);
      let msg = err.message || 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Anonymous Sign In
  const handleAnonymousSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const cred = await signInAnonymously(auth);
      const profile: UserProfile = {
        uid: cred.user.uid,
        name: `Citizen (${cred.user.uid.slice(0, 5)})`,
        email: 'anonymous@fixify.hyd',
        role: 'citizen',
        ward: 'Hyderabad Resident'
      };
      onUserChange(profile);
      await persistUserProfileToFirestore(profile);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Anonymous sign-in restricted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Firebase Civic Authentication
            </h3>
            <p className="text-xs text-slate-500">
              Multi-Role Access Control (Citizen, Officer, Admin)
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 p-1 bg-slate-100/60">
          <button
            type="button"
            onClick={() => { setActiveTab('demo'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'demo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Quick Roles
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register Role
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: QUICK ROLE SWITCHER */}
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 mb-2">
                Instantly switch roles to test specific platform capabilities:
              </p>

              {/* Citizen Card */}
              <div 
                onClick={() => handleQuickSwitch('citizen')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  currentUser.role === 'citizen'
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Citizen: Amina Khan</h4>
                      <p className="text-[11px] text-slate-500">Circle 18 - Banjara Hills</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Citizen
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  • Report civic issues with GPS & photos<br />
                  • Upvote neighborhood issues & leave comments<br />
                  • Verify resolution when fixed
                </p>
              </div>

              {/* GHMC Officer Card */}
              <div 
                onClick={() => handleQuickSwitch('officer')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  currentUser.role === 'officer'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-100'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">GHMC Officer: Rajesh Varma</h4>
                      <p className="text-[11px] text-emerald-700 font-medium">GHMC Engineering & Roads</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Officer
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  • Mark issues as "In Progress" & "Resolved"<br />
                  • Upload after-repair photographic proof<br />
                  • Add official department notes
                </p>
              </div>

              {/* Ward Admin Card */}
              <div 
                onClick={() => handleQuickSwitch('admin')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  currentUser.role === 'admin'
                    ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-100'
                    : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Ward Admin: Dr. C. Madhusudhan</h4>
                      <p className="text-[11px] text-slate-500">Central GHMC Municipal Authority</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  • Route issues to GHMC/HMWSSB departments<br />
                  • Reassign field officers & adjust priorities<br />
                  • Close verified tickets
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAnonymousSignIn}
                  disabled={loading}
                  className="w-full py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors flex items-center justify-center space-x-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Continue as Anonymous Guest</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SIGN IN (EMAIL/PASSWORD) */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signin-email"
                    type="email"
                    required
                    placeholder="you@hyderabad.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signin-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button
                id="signin-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center space-x-1 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In via Firebase</span>}
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER NEW ROLE */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              
              {/* Select Role to Register */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Role Privilege *
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { role: 'citizen' as UserRole, label: 'Citizen', icon: User },
                    { role: 'officer' as UserRole, label: 'Officer', icon: UserCheck },
                    { role: 'admin' as UserRole, label: 'Admin', icon: Shield }
                  ].map(r => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setRegRole(r.role)}
                      className={`py-2 px-1 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        regRole === r.role
                          ? 'bg-teal-50 border-teal-500 text-teal-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <r.icon className="w-3.5 h-3.5" />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  placeholder="e.g. S. Ramesh"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  placeholder="s.ramesh@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {regRole === 'officer' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Wing *
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {CIVIC_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                id="signup-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center space-x-1 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create {regRole.toUpperCase()} Account</span>}
              </button>
            </form>
          )}

        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 text-center">
          Connected to Firebase Project: <span className="font-mono text-teal-700">fixify-hyderabad</span>
        </div>

      </div>
    </div>
  );
};
