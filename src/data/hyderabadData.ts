import { CivicIssue } from '../types';

export interface HyderabadZone {
  name: string;
  circles: string[];
}

export const HYDERABAD_ZONES: HyderabadZone[] = [
  {
    name: 'Khairatabad Zone',
    circles: ['Banjara Hills (Circle 18)', 'Jubilee Hills (Circle 19)', 'Khairatabad (Circle 17)', 'Ameerpet (Circle 16)']
  },
  {
    name: 'Serilingampally Zone',
    circles: ['Madhapur / IT Corridor (Circle 20)', 'Gachibowli (Circle 21)', 'Kondapur (Circle 22)', 'Chandanagar (Circle 23)']
  },
  {
    name: 'Secunderabad Zone',
    circles: ['Secunderabad Cantonment (Circle 29)', 'Begumpet (Circle 30)', 'Malkajgiri (Circle 28)', 'Marredpally (Circle 27)']
  },
  {
    name: 'Charminar Zone',
    circles: ['Old City / Charminar (Circle 9)', 'Falaknuma (Circle 10)', 'Chandrayangutta (Circle 11)', 'Santoshnagar (Circle 12)']
  },
  {
    name: 'Kukatpally Zone',
    circles: ['Kukatpally (Circle 24)', 'KPHB Colony (Circle 25)', 'Moosapet (Circle 26)']
  },
  {
    name: 'LB Nagar Zone',
    circles: ['LB Nagar (Circle 3)', 'Dilsukhnagar (Circle 4)', 'Saroornagar (Circle 5)']
  }
];

export const CIVIC_DEPARTMENTS = [
  'GHMC Engineering & Roads',
  'Sanitation & Solid Waste Management',
  'HMWSSB (Water Supply & Sewerage)',
  'TSSPDCL Electrical & Street Lighting',
  'Town Planning & Encroachment Wing',
  'Veterinary & Animal Care Wing',
  'Traffic & Urban Transport Cell'
];

export const SAMPLE_HYDERABAD_ISSUES: CivicIssue[] = [
  {
    id: 'hyd-issue-101',
    ticketId: 'GHMC-HYD-84291',
    title: 'Deep Hazardous Pothole near Inorbit Mall Flyover Entry',
    description: 'A large pothole roughly 2.5 feet wide and 8 inches deep has formed right at the approach ramp. Multiple two-wheelers have skidded during evening rush hours.',
    category: 'Pothole & Road Damage',
    priority: 'critical',
    status: 'in_progress',
    location: {
      address: 'Near Pillar #14, Inorbit Mall Road, Mindspace Circle',
      locality: 'Madhapur',
      circle: 'Madhapur / IT Corridor (Circle 20)',
      zone: 'Serilingampally Zone',
      coordinates: { lat: 17.4375, lng: 78.3842 },
      accuracy: 6
    },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=900&q=80',
    reportedBy: {
      uid: 'user-sample-1',
      name: 'Venkatesh Rao',
      email: 'venkatesh.rao@example.com',
      role: 'citizen',
      phone: '+91 98490 12345'
    },
    assignedTo: {
      department: 'GHMC Engineering & Roads',
      officerName: 'K. Sudhakar (Assistant Executive Engineer)',
      officerId: 'officer-1',
      assignedAt: '2026-09-08T10:30:00Z'
    },
    upvotes: ['user-sample-1', 'user-sample-2', 'user-sample-3', 'user-sample-4'],
    statusHistory: [
      {
        status: 'reported',
        timestamp: '2026-09-07T14:15:00Z',
        updatedBy: 'Venkatesh Rao (Citizen)',
        userRole: 'citizen',
        note: 'Issue logged via FixiFy GPS with live photo'
      },
      {
        status: 'assigned',
        timestamp: '2026-09-08T10:30:00Z',
        updatedBy: 'Circle 20 Ward Control Room',
        userRole: 'admin',
        note: 'Assigned to GHMC Road Maintenance Division - Rapid Response Team'
      },
      {
        status: 'in_progress',
        timestamp: '2026-09-09T08:00:00Z',
        updatedBy: 'K. Sudhakar (AEE)',
        userRole: 'officer',
        note: 'Cold mix bitumen asphalt crew dispatched with road roller. Work underway.'
      }
    ],
    comments: [
      {
        id: 'c1',
        author: 'Pooja Reddy',
        authorId: 'user-sample-2',
        role: 'citizen',
        text: 'Thank you for reporting, almost lost balance here yesterday night!',
        timestamp: '2026-09-07T16:20:00Z'
      },
      {
        id: 'c2',
        author: 'K. Sudhakar (AEE)',
        authorId: 'officer-1',
        role: 'officer',
        text: 'Bitumen supply reached site. Road repair will be completed by 4 PM today.',
        timestamp: '2026-09-09T08:15:00Z'
      }
    ],
    createdAt: '2026-09-07T14:15:00Z',
    updatedAt: '2026-09-09T08:15:00Z'
  },
  {
    id: 'hyd-issue-102',
    ticketId: 'GHMC-HYD-84310',
    title: 'Overflowing Garbage Dumper Bin causing Stench on Main Road',
    description: 'Commercial waste and vegetable market trash overflowing onto pedestrian footpath. Dogs and cattle scattering refuse. Urgent dumper placer truck needed.',
    category: 'Garbage & Sanitation',
    priority: 'high',
    status: 'assigned',
    location: {
      address: 'Opposite Niloufer Cafe, Red Hills, Lakdikapul',
      locality: 'Khairatabad',
      circle: 'Khairatabad (Circle 17)',
      zone: 'Khairatabad Zone',
      coordinates: { lat: 17.4042, lng: 78.4611 },
      accuracy: 9
    },
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=900&q=80',
    reportedBy: {
      uid: 'user-sample-3',
      name: 'Mohammed Rizwan',
      email: 'm.rizwan@example.com',
      role: 'citizen'
    },
    assignedTo: {
      department: 'Sanitation & Solid Waste Management',
      officerName: 'S. Swaroopa (Sanitary Inspector)',
      officerId: 'officer-2',
      assignedAt: '2026-09-09T06:45:00Z'
    },
    upvotes: ['user-sample-3', 'user-sample-5', 'user-sample-6'],
    statusHistory: [
      {
        status: 'reported',
        timestamp: '2026-09-08T18:40:00Z',
        updatedBy: 'Mohammed Rizwan',
        userRole: 'citizen',
        note: 'Garbage accumulation over 3 days'
      },
      {
        status: 'assigned',
        timestamp: '2026-09-09T06:45:00Z',
        updatedBy: 'Central GHMC Helpline Dispatcher',
        userRole: 'admin',
        note: 'Assigned to Sanitary Inspector Circle 17'
      }
    ],
    comments: [],
    createdAt: '2026-09-08T18:40:00Z',
    updatedAt: '2026-09-09T06:45:00Z'
  },
  {
    id: 'hyd-issue-103',
    ticketId: 'GHMC-HYD-83955',
    title: 'Streetlights Out for 600m Stretch on Jubilee Hills Road 36',
    description: 'Entire row of 12 LED streetlights completely dark since three consecutive nights. High pedestrian and vehicle traffic, causing safety and crime risk.',
    category: 'Streetlight Malfunction',
    priority: 'medium',
    status: 'resolved',
    location: {
      address: 'Between Metro Pillar 1622 and Peddamma Temple, Road 36',
      locality: 'Jubilee Hills',
      circle: 'Jubilee Hills (Circle 19)',
      zone: 'Khairatabad Zone',
      coordinates: { lat: 17.4312, lng: 78.4072 },
      accuracy: 5
    },
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=900&q=80',
    resolutionImageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80',
    reportedBy: {
      uid: 'user-sample-7',
      name: 'Ananya Sharma',
      email: 'ananya.s@example.com',
      role: 'citizen'
    },
    assignedTo: {
      department: 'TSSPDCL Electrical & Street Lighting',
      officerName: 'B. Mahesh (Electrical Line Inspector)',
      officerId: 'officer-3',
      assignedAt: '2026-09-06T11:00:00Z'
    },
    upvotes: ['user-sample-7', 'user-sample-8', 'user-sample-9', 'user-sample-10', 'user-sample-11'],
    statusHistory: [
      {
        status: 'reported',
        timestamp: '2026-09-05T20:10:00Z',
        updatedBy: 'Ananya Sharma',
        userRole: 'citizen'
      },
      {
        status: 'assigned',
        timestamp: '2026-09-06T11:00:00Z',
        updatedBy: 'Ward Electrical Cell',
        userRole: 'admin'
      },
      {
        status: 'in_progress',
        timestamp: '2026-09-06T15:30:00Z',
        updatedBy: 'B. Mahesh',
        userRole: 'officer',
        note: 'Replaced burnt MCB junction box and feeder cable'
      },
      {
        status: 'resolved',
        timestamp: '2026-09-06T18:45:00Z',
        updatedBy: 'B. Mahesh',
        userRole: 'officer',
        note: 'All 12 luminaires tested and energized. Lux levels verified.'
      }
    ],
    comments: [
      {
        id: 'c3',
        author: 'Ananya Sharma',
        authorId: 'user-sample-7',
        role: 'citizen',
        text: 'Confirmed! The lights are on and bright tonight. Excellent quick work GHMC!',
        timestamp: '2026-09-06T20:00:00Z'
      }
    ],
    createdAt: '2026-09-05T20:10:00Z',
    updatedAt: '2026-09-06T20:00:00Z'
  },
  {
    id: 'hyd-issue-104',
    ticketId: 'GHMC-HYD-84402',
    title: 'Drinking Water Pipeline Burst Leaking Fresh Water into Drain',
    description: 'Substantial drinking water pipeline burst creating a mini fountain on the footpath. Clean water going to waste for the past 6 hours, dropping water pressure in nearby houses.',
    category: 'Water Supply & Leakage',
    priority: 'high',
    status: 'reported',
    location: {
      address: 'Near Paradise Circle, MG Road, Secunderabad',
      locality: 'Secunderabad',
      circle: 'Secunderabad Cantonment (Circle 29)',
      zone: 'Secunderabad Zone',
      coordinates: { lat: 17.4416, lng: 78.4983 },
      accuracy: 4
    },
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=900&q=80',
    reportedBy: {
      uid: 'user-sample-4',
      name: 'Dr. Srinivas Murthy',
      email: 'srinivas.m@example.com',
      role: 'citizen'
    },
    upvotes: ['user-sample-4', 'user-sample-12'],
    statusHistory: [
      {
        status: 'reported',
        timestamp: '2026-09-09T07:15:00Z',
        updatedBy: 'Dr. Srinivas Murthy',
        userRole: 'citizen',
        note: 'Reported with GPS coordinates'
      }
    ],
    comments: [],
    createdAt: '2026-09-09T07:15:00Z',
    updatedAt: '2026-09-09T07:15:00Z'
  }
];
