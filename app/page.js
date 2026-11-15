'use client';

import { useState, useEffect, useRef } from 'react';
import Auth from '../components/Auth';
import History from '../components/History';
import Origins from '../components/Origins';
import Processing from '../components/Processing';
import Brew from '../components/Brew';
import Water from '../components/Water';
import Hardware from '../components/Hardware';
import Roast from '../components/Roast';
import TasteQuiz from '../components/TasteQuiz';
import ChatBot from '../components/ChatBot';
import MyCoffeeJournal from '../components/MyCoffeeJournal/MyCoffeeJournal';
import StaticNotice from '../components/StaticNotice';
import { IS_STATIC_SITE, asset } from '../lib/staticSite';

// Top nav structure — three themed groups + the personal tools group on the right.
const GUIDE_GROUPS = [
  { theme:'Understanding', tabs: [{ id:'history', label:'History' }] },
  { theme:'Exploring',     tabs: [{ id:'origins', label:'Origins' }, { id:'processing', label:'Processing' }] },
  { theme:'Brewing',       tabs: [{ id:'brew', label:'Methods' }, { id:'water', label:'Water' }, { id:'hardware', label:'Hardware' }, { id:'roast', label:'Roast' }] },
];
// Icons come from public/icons/<id>.svg via the nav-icon-<id> CSS mask classes.
const PERSONAL_TABS = [
  { id:'quiz', label:'Taste Quiz' },
  { id:'journal',  label:'My Coffee Journal' },
];

export default function App() {
  const [landingUp, setLandingUp] = useState(false);
  const [tab, setTab] = useState('history');
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [coffeePrefill, setCoffeePrefill] = useState(null);
  const [brewPrefill, setBrewPrefill] = useState(null);
  // Bumped (not toggled) each time the bot is asked to submit the open form,
  // so repeated "submit it" requests re-trigger the journal's submit effect
  // even if nothing else about the app state changed.
  const [submitSignal, setSubmitSignal] = useState(0);
  // Collapsed-nav dropdown (burger menu). Only visible below the bp-nav
  // breakpoint — CSS hides both the burger and the panel on wide screens.
  const [menuOpen, setMenuOpen] = useState(false);
  const shellRef = useRef(null);

  // New tab = new page: start at the top (the shell keeps its scroll otherwise).
  useEffect(() => { shellRef.current?.scrollTo(0, 0); }, [tab]);

  // Used by the collapsed dropdown: switch tab and close the menu in one go.
  function selectTab(id) {
    setTab(id);
    setMenuOpen(false);
  }

  // On load, ask the server who we are (via the session cookie) so a refresh
  // keeps you logged in. authChecked avoids flashing the login form first.
  // The static GitHub Pages build has no API to ask, so it skips the check.
  useEffect(() => {
    if (IS_STATIC_SITE) return;
    fetch('/api/auth/user')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  // The chat bot can't save a coffee or brew itself — it only hands back the
  // parsed fields, which we drop into the matching journal form for review.
  function handlePrefill(prefill) {
    if (prefill.type === 'coffee') setCoffeePrefill(prefill.data);
    else if (prefill.type === 'brew') setBrewPrefill(prefill.data);
    setTab('journal');
  }

  // Only meaningful if the journal (with an open form) is actually mounted —
  // unlike handlePrefill, this doesn't switch tabs, since "submit the form
  // I have open" implies it's already visible.
  function handleSubmitForm() {
    setSubmitSignal((n) => n + 1);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setTab('history');
  }

  // Login from the standalone Log in tab: land on the journal, the gated feature.
  function handleAuthed(u) {
    setUser(u);
    setTab('journal');
  }

  // Map tab id → the component to render. Keeps the JSX below readable.
  function renderActive() {
    // Static GitHub Pages build: the server-backed tabs stay in the nav but
    // explain why they're unavailable instead of rendering a form that can't work.
    if (IS_STATIC_SITE && (tab === 'login' || tab === 'journal')) return <StaticNotice feature={tab}/>;
    switch (tab) {
      case 'history':    return <History goTab={setTab}/>;
      case 'origins':    return <Origins/>;
      case 'processing': return <Processing/>;
      case 'brew':       return <Brew/>;
      case 'water':      return <Water/>;
      case 'hardware':   return <Hardware/>;
      case 'roast':      return <Roast/>;
      case 'quiz':       return <TasteQuiz/>;
      // Standalone login page — only reachable while logged out (the header
      // button is hidden once a user is set).
      case 'login':      return <Auth onAuthed={handleAuthed}/>;
      // The journal is the only gated tab: show it when logged in, otherwise the
      // login/signup form. `null` while we're still checking avoids a flash.
      case 'journal':    return !authChecked ? null : user ? <MyCoffeeJournal coffeePrefill={coffeePrefill} brewPrefill={brewPrefill} submitSignal={submitSignal} user={user}/> : <Auth onAuthed={setUser}/>;
      default:           return null;
    }
  }

  return (
    <>
    <div className="stage">
      <div className={`stage-track${landingUp ? ' move-up' : ''}`}>
        <div className="panel landing">
          <div className="landing-eyebrow">A field guide for the curious</div>
          <h1 className="landing-title">Grounds.</h1>
          <p className="landing-sub">
            Discover the world of coffee — from origin to cup. Explore brew methods, find your flavor profile, and log every cup along the way.
          </p>
          <button className="landing-btn" onClick={() => { new Audio(asset('/pouring-a-cup-of-coffee.wav')).play(); setLandingUp(true); }}>Enter the guide</button>
          <div className="landing-footer">Est. 2026 — For coffee aficionados in training</div>
        </div>

        <div className="panel app-shell" ref={shellRef}>
          <header className="app-header">
            <button className="app-logo" onClick={() => setLandingUp(false)}>Grounds</button>
            <nav className="app-nav">
              {GUIDE_GROUPS.map((g, gi) =>
                <span key={g.theme} className="nav-group-wrap">
                  {gi > 0 && <span className="nav-group-sep"></span>}
                  <div className="nav-group">
                    <span className="nav-group-label">{g.theme}</span>
                    {g.tabs.map(tt =>
                      <button key={tt.id} className={`nav-tab${tab===tt.id ? ' active' : ''}`} onClick={() => setTab(tt.id)}>{tt.label}</button>
                    )}
                  </div>
                </span>
              )}
              <div className="nav-personal">
                <span className="nav-divider"></span>
                {PERSONAL_TABS.map(tt =>
                  <button key={tt.id} className={`nav-tab personal${tab===tt.id ? ' active' : ''}`} onClick={() => setTab(tt.id)}>
                    <span className={`nav-icon nav-icon-${tt.id}`} aria-hidden="true"></span>{tt.label}
                  </button>
                )}
              </div>
            </nav>
            <button
              className={`nav-burger${menuOpen ? ' open' : ''}`}
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-controls="nav-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="nav-burger-line"></span>
              <span className="nav-burger-line"></span>
              <span className="nav-burger-line"></span>
            </button>
            {user ? (
              <button className="nav-tab logout" onClick={logout}>
                Log out
              </button>
            ) : (
              <button className={`nav-tab login${tab==='login' ? ' active' : ''}`} onClick={() => setTab('login')}>
                Log in
              </button>
            )}
            {menuOpen && (
              <div className="nav-menu" id="nav-menu">
                {GUIDE_GROUPS.map(g =>
                  <div key={g.theme} className="nav-menu-group">
                    <span className="nav-group-label">{g.theme}</span>
                    {g.tabs.map(tt =>
                      <button key={tt.id} className={`nav-tab nav-menu-tab${tab===tt.id ? ' active' : ''}`} onClick={() => selectTab(tt.id)}>{tt.label}</button>
                    )}
                  </div>
                )}
                <div className="nav-menu-group">
                  <span className="nav-group-label">Personal</span>
                  {PERSONAL_TABS.map(tt =>
                    <button key={tt.id} className={`nav-tab personal nav-menu-tab${tab===tt.id ? ' active' : ''}`} onClick={() => selectTab(tt.id)}>
                      <span className={`nav-icon nav-icon-${tt.id}`} aria-hidden="true"></span>{tt.label}
                    </button>
                  )}
                </div>
                {user ? (
                  <button className="nav-tab logout nav-menu-tab" onClick={() => { setMenuOpen(false); logout(); }}>
                    Log out
                  </button>
                ) : (
                  <button className="nav-tab login nav-menu-tab" onClick={() => selectTab('login')}>
                    Log in
                  </button>
                )}
              </div>
            )}
          </header>
          <main className="main">{renderActive()}</main>
        </div>
      </div>
    </div> 
    <ChatBot visible={landingUp} onPrefill={handlePrefill} onSubmitForm={handleSubmitForm} />
    </>
  );
}
