export type LabelKind = 'continent' | 'country' | 'city';

export interface GlobeLabel {
  name: string;
  lat: number;
  lon: number;
  kind: LabelKind;
}

/** Curated markers — cartoon map, not GIS precision. */
export const GLOBE_LABELS: GlobeLabel[] = [
  // Continents
  { name: 'North America', lat: 45, lon: -100, kind: 'continent' },
  { name: 'South America', lat: -15, lon: -60, kind: 'continent' },
  { name: 'Europe', lat: 54, lon: 15, kind: 'continent' },
  { name: 'Africa', lat: 2, lon: 20, kind: 'continent' },
  { name: 'Asia', lat: 35, lon: 95, kind: 'continent' },
  { name: 'Oceania', lat: -22, lon: 135, kind: 'continent' },
  { name: 'Antarctica', lat: -82, lon: 0, kind: 'continent' },
  // Countries
  { name: 'USA', lat: 39, lon: -98, kind: 'country' },
  { name: 'Canada', lat: 56, lon: -106, kind: 'country' },
  { name: 'Mexico', lat: 23, lon: -102, kind: 'country' },
  { name: 'Brazil', lat: -10, lon: -55, kind: 'country' },
  { name: 'Argentina', lat: -34, lon: -64, kind: 'country' },
  { name: 'UK', lat: 54, lon: -2, kind: 'country' },
  { name: 'France', lat: 46, lon: 2, kind: 'country' },
  { name: 'Germany', lat: 51, lon: 10, kind: 'country' },
  { name: 'Italy', lat: 42, lon: 12, kind: 'country' },
  { name: 'Spain', lat: 40, lon: -3, kind: 'country' },
  { name: 'Russia', lat: 60, lon: 100, kind: 'country' },
  { name: 'China', lat: 35, lon: 104, kind: 'country' },
  { name: 'India', lat: 22, lon: 79, kind: 'country' },
  { name: 'Japan', lat: 36, lon: 138, kind: 'country' },
  { name: 'Australia', lat: -25, lon: 134, kind: 'country' },
  { name: 'Egypt', lat: 26, lon: 30, kind: 'country' },
  { name: 'Nigeria', lat: 9, lon: 8, kind: 'country' },
  { name: 'South Africa', lat: -29, lon: 24, kind: 'country' },
  { name: 'Saudi Arabia', lat: 24, lon: 45, kind: 'country' },
  { name: 'Indonesia', lat: -2, lon: 118, kind: 'country' },
  // Cities
  { name: 'New York', lat: 40.7, lon: -74, kind: 'city' },
  { name: 'Los Angeles', lat: 34, lon: -118.2, kind: 'city' },
  { name: 'Mexico City', lat: 19.4, lon: -99.1, kind: 'city' },
  { name: 'São Paulo', lat: -23.5, lon: -46.6, kind: 'city' },
  { name: 'London', lat: 51.5, lon: -0.1, kind: 'city' },
  { name: 'Paris', lat: 48.9, lon: 2.3, kind: 'city' },
  { name: 'Berlin', lat: 52.5, lon: 13.4, kind: 'city' },
  { name: 'Moscow', lat: 55.8, lon: 37.6, kind: 'city' },
  { name: 'Cairo', lat: 30, lon: 31.2, kind: 'city' },
  { name: 'Lagos', lat: 6.5, lon: 3.4, kind: 'city' },
  { name: 'Mumbai', lat: 19.1, lon: 72.9, kind: 'city' },
  { name: 'Delhi', lat: 28.6, lon: 77.2, kind: 'city' },
  { name: 'Beijing', lat: 39.9, lon: 116.4, kind: 'city' },
  { name: 'Tokyo', lat: 35.7, lon: 139.7, kind: 'city' },
  { name: 'Seoul', lat: 37.6, lon: 127, kind: 'city' },
  { name: 'Singapore', lat: 1.35, lon: 103.8, kind: 'city' },
  { name: 'Sydney', lat: -33.9, lon: 151.2, kind: 'city' },
  { name: 'Johannesburg', lat: -26.2, lon: 28.0, kind: 'city' },
];
