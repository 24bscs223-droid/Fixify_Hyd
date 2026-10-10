export type UserRole = 'citizen' | 'officer' | 'admin';

export type IssueStatus = 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export type IssueCategory =
  | 'Pothole & Road Damage'
  | 'Garbage & Sanitation'
  | 'Water Supply & Leakage'
  | 'Streetlight Malfunction'
  | 'Sewage & Drainage Overflow'
  | 'Footpath & Encroachment'
  | 'Stray Animal Hazard'
  | 'Open Manhole'
  | 'Traffic Signal Issue'
  | 'Other Civic Concern';

export interface LocationData {
  address: string;
  locality: string;
  circle: string;
  zone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  accuracy?: number; // in meters
}

export interface StatusUpdate {
  status: IssueStatus;
  timestamp: string;
  updatedBy: string;
  userRole: UserRole;
  note?: string;
  photoUrl?: string;
}

export interface IssueComment {
  id: string;
  author: string;
  authorId: string;
  role: UserRole;
  text: string;
  timestamp: string;
}

export interface CivicIssue {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location: LocationData;
  imageUrl?: string;
  resolutionImageUrl?: string;
  reportedBy: {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
  };
  assignedTo?: {
    department: string;
    officerName?: string;
    officerId?: string;
    assignedAt?: string;
  };
  upvotes: string[]; // uids of users who upvoted
  statusHistory: StatusUpdate[];
  comments: IssueComment[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  ward?: string;
  department?: string;
  avatarUrl?: string;
}
