import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  setDoc,
  getDoc,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { CivicIssue, IssueStatus, IssueComment, StatusUpdate, UserProfile, UserRole } from '../types';
import { SAMPLE_HYDERABAD_ISSUES } from '../data/hyderabadData';

export const firebaseConfig = {
  apiKey: "AIzaSyA3HbMYtH-H8yuxjRGEBExs6MRA5ra36T0",
  authDomain: "fixify-hyderabad.firebaseapp.com",
  projectId: "fixify-hyderabad",
  storageBucket: "fixify-hyderabad.firebasestorage.app",
  messagingSenderId: "956477078450",
  appId: "1:956477078450:web:f676d60e5fa6e1e1aa02ab",
  measurementId: "G-8M1K3PWYRY"
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Local storage backup key
const STORAGE_KEY = 'fixify_hyderabad_issues_v1';
const USER_PROFILE_KEY = 'fixify_hyderabad_profile_v1';

// Default Demo User Profiles for Instant Multi-Role Testing
export const DEMO_USERS: Record<UserRole, UserProfile> = {
  citizen: {
    uid: 'demo-citizen-1',
    name: 'Amina Khan',
    email: 'amina.khan@hyderabad.org',
    role: 'citizen',
    phone: '+91 98492 45678',
    ward: 'Circle 18 - Banjara Hills'
  },
  officer: {
    uid: 'demo-officer-1',
    name: 'Rajesh Varma',
    email: 'r.varma@ghmc.gov.in',
    role: 'officer',
    department: 'GHMC Engineering & Roads',
    ward: 'Serilingampally & Khairatabad Zones'
  },
  admin: {
    uid: 'demo-admin-1',
    name: 'Dr. C. Madhusudhan (IAS)',
    email: 'commissioner@ghmc.gov.in',
    role: 'admin',
    department: 'GHMC Central Municipal Governance',
    ward: 'All 30 GHMC Circles'
  }
};

// Local storage helpers
function getLocalIssues(): CivicIssue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read from localStorage', e);
  }
  return SAMPLE_HYDERABAD_ISSUES;
}

function saveLocalIssues(issues: CivicIssue[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  } catch (e) {
    console.warn('Could not write to localStorage', e);
  }
}

// In-memory subscribers for immediate reactivity
type IssueSubscriber = (issues: CivicIssue[]) => void;
const subscribers: Set<IssueSubscriber> = new Set();
let cachedIssues: CivicIssue[] = getLocalIssues();

function notifySubscribers(issues: CivicIssue[]) {
  cachedIssues = issues;
  saveLocalIssues(issues);
  subscribers.forEach(sub => {
    try {
      sub(issues);
    } catch (err) {
      console.error('Subscriber error:', err);
    }
  });
}

// Subscribe to real-time issues with Firestore onSnapshot + resilient fallback
export function subscribeToIssues(callback: IssueSubscriber): () => void {
  subscribers.add(callback);
  // Send cached immediately
  callback(cachedIssues);

  let unsubscribeFirestore: (() => void) | null = null;

  try {
    const issuesRef = collection(db, 'issues');
    const q = query(issuesRef, orderBy('createdAt', 'desc'));

    unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteIssues: CivicIssue[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              ...data,
              id: d.id,
              ticketId: data.ticketId || `GHMC-HYD-${d.id.slice(0, 5).toUpperCase()}`,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
            } as CivicIssue;
          });
          notifySubscribers(remoteIssues);
        } else {
          // If remote collection is completely empty, seed sample issues to Firestore
          seedInitialFirestoreIssues();
        }
      },
      (error) => {
        console.warn('Firestore onSnapshot warning/fallback (using local state):', error.message);
        // Still notify with local cached issues
        notifySubscribers(cachedIssues);
      }
    );
  } catch (err) {
    console.warn('Firestore initialization fallback:', err);
  }

  return () => {
    subscribers.delete(callback);
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}

// Seed initial issues to Firestore if empty
async function seedInitialFirestoreIssues() {
  try {
    const issuesRef = collection(db, 'issues');
    for (const sample of SAMPLE_HYDERABAD_ISSUES) {
      await setDoc(doc(issuesRef, sample.id), {
        ...sample,
        createdAt: new Date(sample.createdAt),
        updatedAt: new Date(sample.updatedAt)
      });
    }
  } catch (err) {
    console.info('Seeding to Firestore skipped or restricted by security rules; local sample used.');
  }
}

// Create new civic issue
export async function createCivicIssue(newIssueData: Omit<CivicIssue, 'id' | 'ticketId' | 'createdAt' | 'updatedAt' | 'upvotes' | 'statusHistory' | 'comments'>): Promise<CivicIssue> {
  const randomTicketNum = Math.floor(10000 + Math.random() * 90000);
  const ticketId = `GHMC-HYD-${randomTicketNum}`;
  const now = new Date().toISOString();

  const fullIssue: CivicIssue = {
    ...newIssueData,
    id: `hyd-${Date.now()}`,
    ticketId,
    upvotes: [newIssueData.reportedBy.uid],
    statusHistory: [
      {
        status: 'reported',
        timestamp: now,
        updatedBy: `${newIssueData.reportedBy.name} (${newIssueData.reportedBy.role})`,
        userRole: newIssueData.reportedBy.role,
        note: 'Issue reported with GPS location tag & photo.'
      }
    ],
    comments: [],
    createdAt: now,
    updatedAt: now
  };

  // Immediate local update
  const updatedList = [fullIssue, ...cachedIssues];
  notifySubscribers(updatedList);

  // Sync to Firestore
  try {
    const docRef = await addDoc(collection(db, 'issues'), {
      ...fullIssue,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    // If doc created with new Firestore ID, update issue id
    fullIssue.id = docRef.id;
    notifySubscribers([fullIssue, ...cachedIssues.filter(i => i.ticketId !== fullIssue.ticketId)]);
  } catch (err) {
    console.warn('Saved issue locally. Firestore sync error:', err);
  }

  return fullIssue;
}

// Update issue status (Officer / Admin workflow)
export async function updateIssueStatus(
  issueId: string,
  newStatus: IssueStatus,
  updateInfo: {
    note?: string;
    photoUrl?: string;
    updatedBy: string;
    userRole: UserRole;
  }
): Promise<void> {
  const now = new Date().toISOString();
  const statusEntry: StatusUpdate = {
    status: newStatus,
    timestamp: now,
    updatedBy: updateInfo.updatedBy,
    userRole: updateInfo.userRole,
    note: updateInfo.note,
    photoUrl: updateInfo.photoUrl
  };

  const updatedList = cachedIssues.map(issue => {
    if (issue.id === issueId) {
      const updatedHistory = [...(issue.statusHistory || []), statusEntry];
      return {
        ...issue,
        status: newStatus,
        resolutionImageUrl: updateInfo.photoUrl || issue.resolutionImageUrl,
        statusHistory: updatedHistory,
        updatedAt: now
      };
    }
    return issue;
  });

  notifySubscribers(updatedList);

  // Push to Firestore
  try {
    const docRef = doc(db, 'issues', issueId);
    const target = updatedList.find(i => i.id === issueId);
    if (target) {
      await updateDoc(docRef, {
        status: newStatus,
        resolutionImageUrl: target.resolutionImageUrl || null,
        statusHistory: target.statusHistory,
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn('Status updated locally. Firestore sync note:', err);
  }
}

// Toggle upvote on an issue
export async function toggleIssueUpvote(issueId: string, uid: string): Promise<void> {
  const now = new Date().toISOString();
  const updatedList = cachedIssues.map(issue => {
    if (issue.id === issueId) {
      const exists = issue.upvotes.includes(uid);
      const newUpvotes = exists
        ? issue.upvotes.filter(id => id !== uid)
        : [...issue.upvotes, uid];
      return {
        ...issue,
        upvotes: newUpvotes,
        updatedAt: now
      };
    }
    return issue;
  });

  notifySubscribers(updatedList);

  try {
    const docRef = doc(db, 'issues', issueId);
    const target = updatedList.find(i => i.id === issueId);
    if (target) {
      await updateDoc(docRef, {
        upvotes: target.upvotes,
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn('Upvote stored locally. Firestore sync note:', err);
  }
}

// Add a community or official comment
export async function addIssueComment(
  issueId: string,
  commentData: {
    author: string;
    authorId: string;
    role: UserRole;
    text: string;
  }
): Promise<void> {
  const newComment: IssueComment = {
    id: `com-${Date.now()}`,
    ...commentData,
    timestamp: new Date().toISOString()
  };

  const updatedList = cachedIssues.map(issue => {
    if (issue.id === issueId) {
      return {
        ...issue,
        comments: [...(issue.comments || []), newComment],
        updatedAt: new Date().toISOString()
      };
    }
    return issue;
  });

  notifySubscribers(updatedList);

  try {
    const docRef = doc(db, 'issues', issueId);
    const target = updatedList.find(i => i.id === issueId);
    if (target) {
      await updateDoc(docRef, {
        comments: target.comments,
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn('Comment saved locally. Firestore sync note:', err);
  }
}

// Assign issue to department/officer (Admin action)
export async function assignIssueDepartment(
  issueId: string,
  assignment: {
    department: string;
    officerName?: string;
    officerId?: string;
    adminName: string;
  }
): Promise<void> {
  const now = new Date().toISOString();
  const statusEntry: StatusUpdate = {
    status: 'assigned',
    timestamp: now,
    updatedBy: assignment.adminName,
    userRole: 'admin',
    note: `Assigned to ${assignment.department}${assignment.officerName ? ` (${assignment.officerName})` : ''}`
  };

  const updatedList = cachedIssues.map(issue => {
    if (issue.id === issueId) {
      return {
        ...issue,
        status: 'assigned' as IssueStatus,
        assignedTo: {
          department: assignment.department,
          officerName: assignment.officerName,
          officerId: assignment.officerId,
          assignedAt: now
        },
        statusHistory: [...(issue.statusHistory || []), statusEntry],
        updatedAt: now
      };
    }
    return issue;
  });

  notifySubscribers(updatedList);

  try {
    const docRef = doc(db, 'issues', issueId);
    const target = updatedList.find(i => i.id === issueId);
    if (target) {
      await updateDoc(docRef, {
        status: 'assigned',
        assignedTo: target.assignedTo,
        statusHistory: target.statusHistory,
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn('Assignment saved locally. Firestore sync note:', err);
  }
}

// User Profile Management & Multi-Role Auth
export function getSavedUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read user profile', e);
  }
  return DEMO_USERS.citizen;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Could not save user profile', e);
  }
}

// Save user profile to Firestore (users collection)
export async function persistUserProfileToFirestore(profile: UserProfile): Promise<void> {
  saveUserProfile(profile);
  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, {
      ...profile,
      lastLoginAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.info('User profile saved locally. Firestore user sync note:', err);
  }
}
