import { README_URL } from '../lib/staticSite';

// What each server-backed tab says on the static GitHub Pages build.
const FEATURES = {
  login: {
    title: 'Log in',
    reason: "Accounts live on the Grounds server, which isn't part of this public version.",
  },
  journal: {
    title: 'My Coffee Journal',
    reason: "Your journal is saved in the Grounds database, which isn't part of this public version.",
  },
};

// Stand-in for the Log in and My Coffee Journal tabs on the static GitHub
// Pages build (see lib/staticSite.js), styled like the login card it replaces.
export default function StaticNotice({ feature }) {
  const { title, reason } = FEATURES[feature];
  return (
    <div className="auth-wrap">
      <div className="sk-box auth-card">
        <div className="auth-title">{title}</div>
        <p className="page-sub auth-sub">{reason}</p>
        <p className="static-notice-text">
          To try it, run the full app locally: the setup steps are in the{' '}
          <a href={README_URL} target="_blank" rel="noopener noreferrer">README</a>.
        </p>
      </div>
    </div>
  );
}
