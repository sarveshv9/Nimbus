/**
 * Location data models for geocoding and user locations.
 */

export interface GeoLocation {
  readonly id: number;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly country: string;
  readonly countryCode: string;
  readonly admin1?: string;     // State/province
  readonly admin2?: string;     // County/district
  readonly timezone?: string;
  readonly population?: number;
  readonly elevation?: number;
}

export interface SavedLocation extends GeoLocation {
  readonly addedAt: number;  // timestamp
  readonly order: number;
}

export interface GeocodingSearchResult {
  readonly results: GeoLocation[];
  readonly generationTimeMs: number;
}

/**
 * Represents the user's current geolocation from the browser API.
 */
export interface UserGeolocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly accuracy: number;
}

/**
 * Formats a location into a display string.
 */
export function formatLocationName(location: GeoLocation): string {
  const parts = [location.name];
  if (location.admin1 && location.admin1 !== location.name) {
    parts.push(location.admin1);
  }
  parts.push(location.country);
  return parts.join(', ');
}

/**
 * Formats a short location name for compact display.
 */
export function formatLocationShort(location: GeoLocation): string {
  return location.admin1
    ? `${location.name}, ${location.admin1}`
    : `${location.name}, ${location.country}`;
}
