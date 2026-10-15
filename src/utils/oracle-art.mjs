import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

/**
 * Build-time check: swapping an image file also updates its provisional label.
 * @param {string} image
 * @param {string} fallback
 * @returns {boolean}
 */
export function isPlaceholderImage(image, fallback) {
  const publicRoot = resolve('public');
  try {
    return readFileSync(resolve(publicRoot, image.replace(/^\//, '')))
      .equals(readFileSync(resolve(publicRoot, fallback.replace(/^\//, ''))));
  } catch {
    return true;
  }
}
