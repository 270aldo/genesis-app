import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Image utility helpers for progress photos, food scans, and avatars.
 */

/** Get the optimal image width for full-bleed cards (screen width minus padding × 2) */
export function getCardImageWidth(paddingHorizontal = 20): number {
  return SCREEN_WIDTH - paddingHorizontal * 2;
}

/** Calculate a proportional height for a given width and aspect ratio */
export function getProportionalHeight(width: number, aspectRatio: number): number {
  return Math.round(width / aspectRatio);
}

/** Build a Supabase Storage public URL for a given bucket and path */
export function getStorageUrl(supabaseUrl: string, bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/** Returns pixel-density-aware size for icons/thumbnails */
export function getPixelSize(dp: number): number {
  return PixelRatio.getPixelSizeForLayoutSize(dp);
}

/** Placeholder for local image asset URIs (development only) */
export function getPlaceholderUri(width: number, height: number): string {
  if (Platform.OS === 'web') {
    return `https://placehold.co/${width}x${height}/1A0A30/b39aff?text=GENESIS`;
  }
  return '';
}
