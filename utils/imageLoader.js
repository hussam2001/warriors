// Custom image loader for Electron
export default function imageLoader({ src, width, quality }) {
  // For Electron, we'll use the src as-is since images are unoptimized
  return src;
}




