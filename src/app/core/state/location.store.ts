import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { GeoLocation, SavedLocation } from '../models/location.model';
import { StorageService } from '../services/storage.service';

const STORAGE_KEY_SAVED = 'nimbus-saved-locations';
const STORAGE_KEY_RECENT = 'nimbus-recent-searches';
const MAX_RECENT = 5;

@Injectable({ providedIn: 'root' })
export class LocationStore {
  private readonly storage = inject(StorageService);

  // === PRIMARY STATE ===
  readonly savedLocations = signal<SavedLocation[]>([]);
  readonly recentSearches = signal<GeoLocation[]>([]);

  // === DERIVED STATE ===
  readonly hasSavedLocations = computed(() => this.savedLocations().length > 0);
  readonly savedCount = computed(() => this.savedLocations().length);

  constructor() {
    this.hydrate();

    // Persist saved locations
    effect(() => {
      this.storage.set(STORAGE_KEY_SAVED, this.savedLocations());
    });

    // Persist recent searches
    effect(() => {
      this.storage.set(STORAGE_KEY_RECENT, this.recentSearches());
    });
  }

  // === ACTIONS ===

  saveLocation(location: GeoLocation): void {
    const existing = this.savedLocations();
    if (existing.some(l => l.id === location.id)) return;

    const saved: SavedLocation = {
      ...location,
      addedAt: Date.now(),
      order: existing.length,
    };
    this.savedLocations.update(locations => [...locations, saved]);
  }

  removeLocation(locationId: number): void {
    this.savedLocations.update(locations =>
      locations
        .filter(l => l.id !== locationId)
        .map((l, i) => ({ ...l, order: i }))
    );
  }

  reorderLocations(previousIndex: number, currentIndex: number): void {
    this.savedLocations.update(locations => {
      const copy = [...locations];
      const [movedItem] = copy.splice(previousIndex, 1);
      copy.splice(currentIndex, 0, movedItem);
      return copy.map((l, i) => ({ ...l, order: i }));
    });
  }

  isLocationSaved(locationId: number): boolean {
    return this.savedLocations().some(l => l.id === locationId);
  }

  addRecentSearch(location: GeoLocation): void {
    this.recentSearches.update(recent => {
      const filtered = recent.filter(l => l.id !== location.id);
      return [location, ...filtered].slice(0, MAX_RECENT);
    });
  }

  clearRecentSearches(): void {
    this.recentSearches.set([]);
  }

  removeRecentSearch(locationId: number): void {
    this.recentSearches.update(recent => recent.filter(l => l.id !== locationId));
  }

  // === PRIVATE ===

  private hydrate(): void {
    const saved = this.storage.get<SavedLocation[]>(STORAGE_KEY_SAVED);
    if (saved?.length) {
      this.savedLocations.set(saved);
    }
    const recent = this.storage.get<GeoLocation[]>(STORAGE_KEY_RECENT);
    if (recent?.length) {
      this.recentSearches.set(recent);
    }
  }
}
