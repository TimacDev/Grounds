// Grounds builds in two ways:
//  - normal (npm run dev / npm run build / npm start): the full app, with the
//    API routes, MySQL and the Gemini chatbot. This config changes nothing there.
//  - static (STATIC_EXPORT=true, set by .github/workflows/deploy.yml): plain
//    HTML/CSS/JS in out/ for GitHub Pages, which can't run a server. The
//    workflow deletes app/api first, because route handlers can't be exported.
const isStatic = process.env.STATIC_EXPORT === 'true';

// GitHub Pages serves a project site under https://<user>.github.io/<repo>/.
const basePath = isStatic ? '/Grounds' : '';

const nextConfig = {
  output: isStatic ? 'export' : undefined,
  basePath,
  // Inlined into the browser code at build time — read by lib/staticSite.js.
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: String(isStatic),
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
