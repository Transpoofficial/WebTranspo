// Google Maps utility functions for accurate distance and duration calculations

interface GoogleMapsDistanceResponse {
  status: string;
  rows: Array<{
    elements: Array<{
      status: string;
      distance?: {
        text: string;
        value: number; // in meters
      };
      duration?: {
        text: string;
        value: number; // in seconds
      };
    }>;
  }>;
}

// Google Maps Directions API interfaces (matching frontend)
interface GoogleMapsDirectionsResponse {
  status: string;
  routes: Array<{
    legs: Array<{
      distance: {
        text: string;
        value: number; // in meters
      };
      duration: {
        text: string;
        value: number; // in seconds
      };
    }>;
  }>;
}

interface RouteDistanceResult {
  distance: number; // in meters
  duration: number; // in seconds
}

/**
 * Calculate route distance using Google Maps Directions API (same as frontend)
 * This ensures frontend and backend use identical calculation method
 */
export async function calculateRouteDistanceWithDirectionsAPI(
  locations: Array<{ lat: number; lng: number }>
): Promise<RouteDistanceResult> {
  if (locations.length < 2) {
    return { distance: 0, duration: 0 };
  }

  try {
    // Build waypoints for Directions API
    const origin = `${locations[0].lat},${locations[0].lng}`;
    const destination = `${locations[locations.length - 1].lat},${locations[locations.length - 1].lng}`;

    let waypointsParam = "";
    if (locations.length > 2) {
      const waypoints = locations
        .slice(1, -1)
        .map((loc) => `${loc.lat},${loc.lng}`);
      waypointsParam = `&waypoints=${waypoints.join("|")}`;
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${waypointsParam}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Google Maps Directions API error: ${response.status}`);
    }

    const data: GoogleMapsDirectionsResponse = await response.json();

    if (data.status === "OK" && data.routes.length > 0) {
      const route = data.routes[0];
      let totalDistance = 0;
      let totalDuration = 0;

      // Sum up all legs (same logic as frontend)
      route.legs.forEach((leg) => {
        totalDistance += leg.distance?.value || 0;
        totalDuration += leg.duration?.value || 0;
      });

      return { distance: totalDistance, duration: totalDuration };
    } else {
      console.warn("Directions API failed, status:", data.status);
      throw new Error(`Directions API failed with status: ${data.status}`);
    }
  } catch (error) {
    console.error("Error calling Google Maps Directions API:", error);
    // Fallback to Haversine calculation
    return calculateFallbackDistance(locations);
  }
}

/**
 * Fallback distance calculation using Haversine formula
 */
function calculateFallbackDistance(
  locations: Array<{ lat: number; lng: number }>
): RouteDistanceResult {
  let totalDistance = 0;

  for (let i = 0; i < locations.length - 1; i++) {
    const distance = calculateHaversineDistance(
      locations[i].lat,
      locations[i].lng,
      locations[i + 1].lat,
      locations[i + 1].lng
    );
    totalDistance += distance * 1000; // Convert km to meters
  }

  const totalDuration = Math.round((totalDistance / 1000) * 120); // Rough estimate: 50 km/h

  return { distance: totalDistance, duration: totalDuration };
}

/**
 * Calculate route distance and duration using Google Maps Distance Matrix API
 * This provides more accurate results than Haversine formula for real-world routes
 * @deprecated Use calculateRouteDistanceWithDirectionsAPI for consistency with frontend
 */
export async function calculateRouteDistanceWithGoogleMaps(
  locations: Array<{ lat: number; lng: number }>
): Promise<RouteDistanceResult> {
  if (locations.length < 2) {
    return { distance: 0, duration: 0 };
  }

  let totalDistance = 0;
  let totalDuration = 0;

  // Calculate distance between consecutive points
  for (let i = 0; i < locations.length - 1; i++) {
    const origin = `${locations[i].lat},${locations[i].lng}`;
    const destination = `${locations[i + 1].lat},${locations[i + 1].lng}`;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&units=metric&mode=driving&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }

      const data: GoogleMapsDistanceResponse = await response.json();

      if (data.status === "OK" && data.rows[0]?.elements[0]?.status === "OK") {
        const element = data.rows[0].elements[0];
        totalDistance += element.distance?.value || 0;
        totalDuration += element.duration?.value || 0;
      } else {
        // Fallback to Haversine formula if Google Maps fails
        console.warn("Google Maps API failed, using Haversine fallback");
        const fallbackDistance = calculateHaversineDistance(
          locations[i].lat,
          locations[i].lng,
          locations[i + 1].lat,
          locations[i + 1].lng
        );
        totalDistance += fallbackDistance * 1000; // Convert km to meters
        totalDuration += Math.round(fallbackDistance * 120); // Rough estimate: 50 km/h average speed
      }
    } catch (error) {
      console.error("Error calling Google Maps API:", error);
      // Fallback to Haversine formula
      const fallbackDistance = calculateHaversineDistance(
        locations[i].lat,
        locations[i].lng,
        locations[i + 1].lat,
        locations[i + 1].lng
      );
      totalDistance += fallbackDistance * 1000; // Convert km to meters
      totalDuration += Math.round(fallbackDistance * 120); // Rough estimate: 50 km/h average speed
    }

    // Add small delay to avoid hitting rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { distance: totalDistance, duration: totalDuration };
}

/**
 * Haversine formula for distance calculation (fallback)
 * Returns distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

/**
 * Calculate distance for inter-trip charges using Haversine formula
 * This is specifically for calculating distance between end of one trip and start of next trip
 */
export function calculateInterTripDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return calculateHaversineDistance(lat1, lng1, lat2, lng2);
}
