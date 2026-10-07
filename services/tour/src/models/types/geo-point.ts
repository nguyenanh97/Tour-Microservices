export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
  address?: string;
  description?: string;
}
export interface TourLocation extends GeoPoint {
  day: number;
}
