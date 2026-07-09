"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readRequests, requestOptions, saveRequests, type ReceptionRequest } from "../reception-data";

export default function OutsideDisplay() {
  const [requests, setRequests] = useState<ReceptionRequest[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [lastRequest, setLastRequest] = useState<ReceptionRequest | null>(null);

  useEffect(() => {
    setRequests(readRequests());
  }, []);

  function submitRequest(option: (typeof requestOptions)[number]) {
    const nextRequest: ReceptionRequest = {
      id: Date.now(),
      kind: option.kind,
      label: option.label,
      team: option.team,
      color: option.color,
      tone: option.tone,
      priority: option.priority,
      status: "Waiting",
      createdAt: new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date())
    };
    const nextRequests = [nextRequest, ...requests].slice(0, 12);

    setRequests(nextRequests);
    setLastRequest(nextRequest);
    saveRequests(nextRequests);
  }

  const confirmation = lastRequest
    ? requestOptions.find((option) => option.kind === lastRequest.kind)?.confirmation
    : null;

  return (
    <main className="display-shell outside-display">
      <header className="display-topbar">
        <div>
          <p className="eyebrow">Outside ward display</p>
          <h1>Hi, what can I help with?</h1>
        </div>
        <Link className="screen-link" href="/ward">
          Open Ward Display
        </Link>
      </header>

      <section className="visitor-layout">
        <div className="visitor-copy">
          <p>
            Please choose the closest option. The request will appear on the ward display with the
            correct colour, team, and alert type.
          </p>
          <div className="language-row" aria-label="Language selection">
            {["English", "Cantonese", "Mandarin", "Tagalog", "Hindi", "Urdu"].map((language) => (
              <button
                className={selectedLanguage === language ? "language active" : "language"}
                key={language}
                onClick={() => setSelectedLanguage(language)}
                type="button"
              >
                {language}
              </button>
            ))}
          </div>
          {lastRequest ? (
            <div className={`visitor-confirmation ${lastRequest.kind}`} role="status">
              <span>{lastRequest.color} alert sent</span>
              <strong>{confirmation}</strong>
              <p>Request routed to: {lastRequest.team}</p>
            </div>
          ) : (
            <div className="visitor-confirmation empty">
              <span>Ready</span>
              <strong>Select an enquiry type to begin.</strong>
              <p>This is the screen visitors see outside the ward.</p>
            </div>
          )}
        </div>

        <div className="request-grid outside-grid">
          {requestOptions.map((option) => (
            <button
              className={`request-card ${option.kind}`}
              key={option.kind}
              onClick={() => submitRequest(option)}
              type="button"
            >
              <span className="request-title">{option.label}</span>
              <span className="request-helper">{option.helper}</span>
              <span className="request-route">
                {option.color} indicator to {option.team}
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
