// Lazily inject Leaflet's CSS + JS the first time a view needs the map.
// This keeps the main bundle (and every non-map page) free of an ~140 KB
// dependency that was previously loaded on every route.

const LEAFLET_CSS =
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_CSS_INTEGRITY =
  "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
const LEAFLET_JS =
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_JS_INTEGRITY =
  "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";

let leafletPromise = null;

function injectStylesheet(href, integrity) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.integrity = integrity;
  link.crossOrigin = "";
  document.head.appendChild(link);
}

function injectScript(src, integrity) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (window.L) {
        resolve(window.L);
        return;
      }
      existing.addEventListener("load", () => resolve(window.L));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.integrity = integrity;
    script.crossOrigin = "";
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () =>
      reject(new Error(`Failed to load Leaflet from ${src}`));
    document.head.appendChild(script);
  });
}

export function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  injectStylesheet(LEAFLET_CSS, LEAFLET_CSS_INTEGRITY);
  leafletPromise = injectScript(LEAFLET_JS, LEAFLET_JS_INTEGRITY).catch(
    (err) => {
      // Allow a future call to retry instead of caching the rejection.
      leafletPromise = null;
      throw err;
    },
  );
  return leafletPromise;
}
