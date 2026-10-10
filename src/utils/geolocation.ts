import { HYDERABAD_ZONES } from '../data/hyderabadData';

export interface DetectedGPS {
  lat: number;
  lng: number;
  accuracy: number;
  detectedAddress?: string;
  nearestLocality?: string;
  suggestedCircle?: string;
  suggestedZone?: string;
}

// Prominent Hyderabad reference landmarks to match nearest circle if GPS is within Greater Hyderabad
const HYDERABAD_LANDMARKS = [
  { name: 'Banjara Hills', circle: 'Banjara Hills (Circle 18)', zone: 'Khairatabad Zone', lat: 17.4156, lng: 78.4350 },
  { name: 'Jubilee Hills', circle: 'Jubilee Hills (Circle 19)', zone: 'Khairatabad Zone', lat: 17.4319, lng: 78.4073 },
  { name: 'Madhapur', circle: 'Madhapur / IT Corridor (Circle 20)', zone: 'Serilingampally Zone', lat: 17.4483, lng: 78.3915 },
  { name: 'Gachibowli', circle: 'Gachibowli (Circle 21)', zone: 'Serilingampally Zone', lat: 17.4401, lng: 78.3489 },
  { name: 'Kondapur', circle: 'Kondapur (Circle 22)', zone: 'Serilingampally Zone', lat: 17.4619, lng: 78.3540 },
  { name: 'Secunderabad', circle: 'Secunderabad Cantonment (Circle 29)', zone: 'Secunderabad Zone', lat: 17.4399, lng: 78.4983 },
  { name: 'Begumpet', circle: 'Begumpet (Circle 30)', zone: 'Secunderabad Zone', lat: 17.4448, lng: 78.4682 },
  { name: 'Charminar', circle: 'Old City / Charminar (Circle 9)', zone: 'Charminar Zone', lat: 17.3616, lng: 78.4747 },
  { name: 'Kukatpally', circle: 'Kukatpally (Circle 24)', zone: 'Kukatpally Zone', lat: 17.4875, lng: 78.4093 },
  { name: 'LB Nagar', circle: 'LB Nagar (Circle 3)', zone: 'LB Nagar Zone', lat: 17.3512, lng: 78.5526 },
  { name: 'Khairatabad', circle: 'Khairatabad (Circle 17)', zone: 'Khairatabad Zone', lat: 17.4116, lng: 78.4623 },
  { name: 'Ameerpet', circle: 'Ameerpet (Circle 16)', zone: 'Khairatabad Zone', lat: 17.4375, lng: 78.4482 }
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestHyderabadCircle(lat: number, lng: number) {
  let minDistance = Infinity;
  let nearest = HYDERABAD_LANDMARKS[0];

  for (const lm of HYDERABAD_LANDMARKS) {
    const dist = calculateDistanceKm(lat, lng, lm.lat, lm.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = lm;
    }
  }

  return {
    locality: nearest.name,
    circle: nearest.circle,
    zone: nearest.zone,
    distanceKm: Math.round(minDistance * 10) / 10
  };
}

export async function detectCurrentGPS(): Promise<DetectedGPS> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const nearest = findNearestHyderabadCircle(latitude, longitude);

        let detectedAddress = '';

        // Try reverse geocoding via OpenStreetMap Nominatim with timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { signal: controller.signal, headers: { 'Accept-Language': 'en' } }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
              const parts = data.display_name.split(',').map((s: string) => s.trim());
              // Shorten to readable street/landmark + area
              detectedAddress = parts.slice(0, 4).join(', ');
            }
          }
        } catch {
          // fallback to coordinate address
        }

        if (!detectedAddress) {
          detectedAddress = `${nearest.locality}, Hyderabad (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`;
        }

        resolve({
          lat: Number(latitude.toFixed(5)),
          lng: Number(longitude.toFixed(5)),
          accuracy: Math.round(accuracy),
          detectedAddress,
          nearestLocality: nearest.locality,
          suggestedCircle: nearest.circle,
          suggestedZone: nearest.zone
        });
      },
      (error) => {
        let msg = 'Failed to get current location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow access or select your Hyderabad circle manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location position is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  });
}
