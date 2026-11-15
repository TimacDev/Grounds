// Switches for the static GitHub Pages build (see next.config.mjs). Both env
// values are inlined at build time, so in the normal server build
// IS_STATIC_SITE is false and asset() returns the path unchanged.

// True when built with STATIC_EXPORT=true: there are no API routes, database
// or Gemini key behind the site, so the server-backed features (Log in,
// My Coffee Journal, Mr. Beanie) show a notice instead.
export const IS_STATIC_SITE = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

// GitHub Pages serves the site under /Projeto-Final/. Next.js adds that
// basePath to its own files (_next/…), but not to plain strings such as
// <img src="/icons/water.svg"> or new Audio('/…') — wrap those in asset().
export function asset(path) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH}${path}`;
}

// Where the notices point visitors for the full app's setup steps.
export const README_URL = 'https://github.com/TimacDev/Projeto-Final#readme';
