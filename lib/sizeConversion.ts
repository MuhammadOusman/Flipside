// Size conversion utility for EU (primary), US, UK sizes
// Based on standard sneaker sizing charts

export type SizeSystem = "EU" | "US" | "UK";

export interface Size {
  EU: number;
  US: number;
  UK: number;
}

// Conversion table for men's sneakers (most common for thrift shoes)
// EU sizes range from 38 to 48
const SIZE_CONVERSION_TABLE: Size[] = [
  { EU: 38, US: 5.5, UK: 5 },
  { EU: 38.5, US: 6, UK: 5.5 },
  { EU: 39, US: 6.5, UK: 6 },
  { EU: 40, US: 7, UK: 6.5 },
  { EU: 40.5, US: 7.5, UK: 7 },
  { EU: 41, US: 8, UK: 7.5 },
  { EU: 42, US: 8.5, UK: 8 },
  { EU: 42.5, US: 9, UK: 8.5 },
  { EU: 43, US: 9.5, UK: 9 },
  { EU: 44, US: 10, UK: 9.5 },
  { EU: 44.5, US: 10.5, UK: 10 },
  { EU: 45, US: 11, UK: 10.5 },
  { EU: 45.5, US: 11.5, UK: 11 },
  { EU: 46, US: 12, UK: 11.5 },
  { EU: 47, US: 12.5, UK: 12 },
  { EU: 47.5, US: 13, UK: 12.5 },
  { EU: 48, US: 13.5, UK: 13 },
  { EU: 48.5, US: 14, UK: 13.5 },
  { EU: 49, US: 14.5, UK: 14 },
  { EU: 49.5, US: 15, UK: 14.5 },
  { EU: 50, US: 15.5, UK: 15 },
];

/**
 * Get all size formats for a given EU size
 */
export function getSizeByEU(euSize: number): Size | undefined {
  return SIZE_CONVERSION_TABLE.find((size) => size.EU === euSize);
}

/**
 * Get all size formats for a given US size
 */
export function getSizeByUS(usSize: number): Size | undefined {
  return SIZE_CONVERSION_TABLE.find((size) => size.US === usSize);
}

/**
 * Get all size formats for a given UK size
 */
export function getSizeByUK(ukSize: number): Size | undefined {
  return SIZE_CONVERSION_TABLE.find((size) => size.UK === ukSize);
}

/**
 * Convert from any system to all systems
 */
export function convertSize(size: number, from: SizeSystem): Size | undefined {
  switch (from) {
    case "EU":
      return getSizeByEU(size);
    case "US":
      return getSizeByUS(size);
    case "UK":
      return getSizeByUK(size);
    default:
      return undefined;
  }
}

/**
 * Format size display with system label
 */
export function formatSize(size: Size, system: SizeSystem): string {
  switch (system) {
    case "EU":
      return `EU ${size.EU}`;
    case "US":
      return `US ${size.US}`;
    case "UK":
      return `UK ${size.UK}`;
    default:
      return `${size.EU}`;
  }
}

/**
 * Get all available EU sizes (for dropdowns/selectors)
 */
export function getAllEUSizes(): number[] {
  return SIZE_CONVERSION_TABLE.map((size) => size.EU);
}

/**
 * Get all available US sizes (for dropdowns/selectors)
 */
export function getAllUSSizes(): number[] {
  return SIZE_CONVERSION_TABLE.map((size) => size.US);
}

/**
 * Get all available UK sizes (for dropdowns/selectors)
 */
export function getAllUKSizes(): number[] {
  return SIZE_CONVERSION_TABLE.map((size) => size.UK);
}

/**
 * Format all sizes for display (used in product cards/detail pages)
 */
export function formatAllSizes(size: Size): string {
  return `EU ${size.EU} / US ${size.US} / UK ${size.UK}`;
}

/**
 * Get size object from stored string (for backward compatibility)
 * Assumes input is UK size if it's a plain number
 */
export function parseSizeString(sizeString: string): Size | undefined {
  const numSize = parseFloat(sizeString);
  if (!isNaN(numSize)) {
    // Try UK first (default), then US, then EU
    return getSizeByUK(numSize) || getSizeByUS(numSize) || getSizeByEU(numSize);
  }
  return undefined;
}
