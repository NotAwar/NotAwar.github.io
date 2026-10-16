import { getImage } from "astro:assets";

export interface OptimizedImage {
  src: string;
  srcset?: string;
}

const probes = new Map<string, Promise<boolean>>();

// Astro fails the whole build if a remote image can't be downloaded, so check first
function isReachable(url: string): Promise<boolean> {
  let probe = probes.get(url);
  if (!probe) {
    probe = fetch(url, { method: "HEAD", signal: AbortSignal.timeout(10_000) })
      .then((res) => res.ok && (res.headers.get("content-type") ?? "").startsWith("image/"))
      .catch(() => false);
    probes.set(url, probe);
  }
  return probe;
}

/**
 * Self-hosts a square remote image as WebP at 1x and 2x, so the page doesn't
 * open another origin connection. Falls back to the remote URL if it's unreachable.
 */
export async function optimizeRemoteImage(src: string, size: number): Promise<OptimizedImage> {
  if (!src) return { src };
  if (!(await isReachable(src))) {
    console.warn(`[remote-image] ${src} is unreachable; using the remote URL`);
    return { src };
  }
  const image = await getImage({ src, width: size, height: size, densities: [1, 2], format: "webp" });
  return { src: image.src, srcset: image.srcSet.attribute || undefined };
}
