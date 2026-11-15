"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { IS_STATIC_SITE, asset, README_URL } from "../lib/staticSite";

// Typewriter pacing: the model streams much faster than a comfortable reading
// speed, so replies are revealed a few characters per tick (~75 chars/sec).
const TYPE_TICK_MS = 40;
const TYPE_CHARS_PER_TICK = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Teaser speech bubbles shown once above the chat button: each pops in at
// `showAt` and fades out at `hideAt` (ms after the widget becomes visible).
// The second waits 1s after the first hides so the text swaps while hidden
// (the fade transition is 0.25s).
const TEASERS = [
  { text: "Hi, I'm Mr. Beanie!", showAt: 2500, hideAt: 8500 },
  { text: "Ask me anything about coffee!", showAt: 9500, hideAt: 15500 },
];

// The static GitHub Pages build has no /api/chat (or Gemini key) behind it, so
// there Mr. Beanie opens with an explanation and the input stays disabled.
const GREETING = IS_STATIC_SITE
  ? `Hi! Mr. Beanie here — but I can't chat in this public version of Grounds, because I need its server to answer. To talk to me, run the full app locally (see the [README](${README_URL})).`
  : "Hi! Mr. Beanie here to help you on your coffee journey! Ask me anything from bean to cup!";

export default function ChatBot({ visible = true, onPrefill, onSubmitForm }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserText, setTeaserText] = useState(TEASERS[0].text);
  const scrollRef = useRef(null);

  // Auto-scroll to the latest message whenever the list grows or the panel opens.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, open]);

  // Teaser speech bubbles: once the widget becomes visible (user past the landing),
  // play the TEASERS sequence — each message pops in at showAt and auto-hides at
  // hideAt. Runs only once. We toggle a class (rather than unmount) so CSS can
  // animate each bubble in and out.
  const teasedRef = useRef(false);
  const teaserTimersRef = useRef([]);
  useEffect(() => {
    if (!visible || teasedRef.current) return;
    teasedRef.current = true;
    teaserTimersRef.current = TEASERS.flatMap(({ text, showAt, hideAt }) => [
      setTimeout(() => {
        setTeaserText(text);
        setShowTeaser(true);
      }, showAt),
      setTimeout(() => setShowTeaser(false), hideAt),
    ]);
    return () => teaserTimersRef.current.forEach(clearTimeout);
  }, [visible]);

  // Once the user opens the chat the teasers have done their job — cancel any
  // pending ones so a still-running show window can't flash a bubble on close.
  useEffect(() => {
    if (!open) return;
    teaserTimersRef.current.forEach(clearTimeout);
    setShowTeaser(false);
  }, [open]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);

    // The reply arrives as an NDJSON stream — { text } chunks go into `pending`,
    // which the typer loop below reveals into one growing bot message at reading
    // speed; { prefill } / { action } events still fire as soon as they arrive.
    let gotReply = false;
    let pending = "";
    let readerDone = false;

    function reveal(text) {
      if (gotReply) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { ...prev[prev.length - 1], text: prev[prev.length - 1].text + text },
        ]);
      } else {
        gotReply = true;
        setStreaming(true);
        setMessages((prev) => [...prev, { role: "bot", text }]);
      }
    }

    const typer = (async () => {
      while (!readerDone || pending) {
        if (pending) {
          reveal(pending.slice(0, TYPE_CHARS_PER_TICK));
          pending = pending.slice(TYPE_CHARS_PER_TICK);
        }
        await sleep(TYPE_TICK_MS);
      }
    })();

    function handleEvent(event) {
      if (event.text) pending += event.text;
      if (event.prefill) onPrefill?.(event.prefill);
      if (event.action === "submit") onSubmitForm?.();
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });
      if (!res.ok || !res.body) throw new Error("chat request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep any partial trailing line for the next read
        for (const line of lines) {
          if (line.trim()) handleEvent(JSON.parse(line));
        }
      }
      if (buffer.trim()) handleEvent(JSON.parse(buffer));
      readerDone = true;
      await typer;
      if (!gotReply) throw new Error("empty reply");
    } catch {
      // Let the typer finish revealing whatever text already arrived, then
      // apologize only if the reply never started.
      readerDone = true;
      await typer;
      if (!gotReply) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "Sorry, I couldn't reach Mr. Beanie right now. Please try again." },
        ]);
      }
    } finally {
      setSending(false);
      setStreaming(false);
    }
  }

  // When `visible` is false, we keep the component mounted (state preserved)
  // but make it invisible AND non-interactive:
  //  - `chatbot-hidden` class → opacity:0 + pointer-events:none (so mouse can't click it)
  //  - tabIndex={-1}          → keyboard tabbing skips it
  //  - aria-hidden={true}     → screen readers ignore it
  const hiddenClass = visible ? "" : " chatbot-hidden";
  const tabIndex = visible ? 0 : -1;

  if (!open) {
    return (
      <>
        <div
          // Distinct key so React never recycles the panel's DOM node into the
          // teaser on close — a morphed node would CSS-transition to opacity 0,
          // flashing the teaser text for a moment.
          key="teaser"
          className={`chatbot-teaser${showTeaser ? "" : " chatbot-teaser-off"}${hiddenClass}`}
          onClick={() => setOpen(true)}
          aria-hidden="true"
        >
          {teaserText}
        </div>
        <button
          className={`chatbot-bubble${hiddenClass}`}
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          aria-hidden={!visible}
          tabIndex={tabIndex}
        >
          <img
            src={asset("/MrBeanie.svg")}
            alt=""
            width={28}
            height={28}
            aria-hidden="true"
          />
        </button>
      </>
    );
  }

  return (
    <div
      key="panel"
      className={`chatbot-panel${hiddenClass}`}
      role="dialog"
      aria-label="Coffee assistant chat"
      aria-hidden={!visible}
    >
      <header className="chatbot-header">
        <div className="chatbot-title">Ask Mr. Beanie</div>
        <button
          className="chatbot-close"
          onClick={() => setOpen(false)}
          aria-label="Close chat"
        >
          ✕
        </button>
      </header>

      <div className="chatbot-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chatbot-msg chatbot-msg-${m.role}`}>
            {m.role === "bot" ? <ReactMarkdown>{m.text}</ReactMarkdown> : m.text}
          </div>
        ))}
        {sending && !streaming && (
          <div
            className="chatbot-msg chatbot-msg-bot chatbot-msg-typing"
            aria-label="Assistant is typing"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>

      <form className="chatbot-input-row" onSubmit={send}>
        <input
          className="chatbot-input"
          type="text"
          placeholder={IS_STATIC_SITE ? "Chat is offline in this version" : "Ask about coffee…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending || IS_STATIC_SITE}
          autoFocus
        />
        <button
          className="chatbot-send"
          type="submit"
          disabled={!input.trim() || sending}
          aria-label="Send"
        >
          →
        </button>
      </form>
    </div>
  );
}
