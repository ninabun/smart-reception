"use client";

import { useMemo, useState } from "react";

type RequestKind = "general" | "patient" | "clinical" | "urgent";

type ReceptionRequest = {
  id: number;
  kind: RequestKind;
  label: string;
  team: string;
  color: string;
  tone: string;
  priority: "Standard" | "High";
  createdAt: string;
};

const requestOptions: Array<Omit<ReceptionRequest, "id" | "createdAt"> & { helper: string }> = [
  {
    kind: "general",
    label: "General Enquiry",
    helper: "Registration, documents, waiting guidance, or visiting information.",
    team: "Clerk",
    color: "Blue",
    tone: "Clerk alert",
    priority: "Standard"
  },
  {
    kind: "patient",
    label: "Accompany Patient",
    helper: "Request permission, find the right room, or ask where to wait.",
    team: "Clerk",
    color: "Blue",
    tone: "Accompaniment alert",
    priority: "Standard"
  },
  {
    kind: "clinical",
    label: "Need Healthcare Assistance",
    helper: "Symptoms, discomfort, or help needed from clinical staff.",
    team: "Nurse",
    color: "Green",
    tone: "Nurse alert",
    priority: "Standard"
  },
  {
    kind: "urgent",
    label: "Urgent Assistance",
    helper: "Immediate concern that should be escalated to healthcare providers.",
    team: "Healthcare Provider",
    color: "Red",
    tone: "High-priority alert",
    priority: "High"
  }
];

const examples = [
  { phrase: "I need to ask about the birth certificate.", route: "Clerk" },
  { phrase: "My wife feels dizzy.", route: "Nurse" },
  { phrase: "I cannot find Labour Room 3.", route: "Wayfinding" }
];

export default function Home() {
  const [requests, setRequests] = useState<ReceptionRequest[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const activeRequest = requests[0];

  const metrics = useMemo(
    () => [
      { label: "Requests today", value: String(requests.length).padStart(2, "0") },
      {
        label: "Clinical alerts",
        value: String(requests.filter((request) => request.team !== "Clerk").length).padStart(2, "0")
      },
      {
        label: "High priority",
        value: String(requests.filter((request) => request.priority === "High").length).padStart(2, "0")
      }
    ],
    [requests]
  );

  function submitRequest(option: (typeof requestOptions)[number]) {
    const nextRequest: ReceptionRequest = {
      id: Date.now(),
      kind: option.kind,
      label: option.label,
      team: option.team,
      color: option.color,
      tone: option.tone,
      priority: option.priority,
      createdAt: new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date())
    };

    setRequests((current) => [nextRequest, ...current].slice(0, 6));
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="kiosk-panel" aria-label="Visitor reception kiosk">
          <div className="kiosk-topbar">
            <span>Smart Labour Room Reception</span>
            <span className="status-dot">Online</span>
          </div>

          <div className="prompt">
            <p className="eyebrow">Visitor kiosk</p>
            <h1>Hi, what can I help with?</h1>
            <p>
              Choose the closest option. Your request will be routed to the right labour room team
              with a clear visual and audio alert.
            </p>
          </div>

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

          <div className="request-grid">
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
        </div>

        <aside className="station-panel" aria-label="Labour room station">
          <div className="station-header">
            <div>
              <p className="eyebrow">Labour room station</p>
              <h2>Live request routing</h2>
            </div>
            <span className={activeRequest ? `beacon ${activeRequest.kind}` : "beacon"} />
          </div>

          <div className={activeRequest ? `active-alert ${activeRequest.kind}` : "active-alert empty"}>
            {activeRequest ? (
              <>
                <span>{activeRequest.priority} priority</span>
                <strong>{activeRequest.label}</strong>
                <p>
                  Notify {activeRequest.team}. Trigger {activeRequest.color.toLowerCase()} indicator
                  and play {activeRequest.tone.toLowerCase()}.
                </p>
              </>
            ) : (
              <>
                <span>Ready</span>
                <strong>No active request</strong>
                <p>Incoming visitor requests will appear here for the frontline team.</p>
              </>
            )}
          </div>

          <div className="metric-grid">
            {metrics.map((metric) => (
              <div className="metric" key={metric.label}>
                <span>{metric.value}</span>
                <p>{metric.label}</p>
              </div>
            ))}
          </div>

          <div className="queue">
            <h3>Activity log</h3>
            {requests.length === 0 ? (
              <p className="muted">No workflow events yet.</p>
            ) : (
              requests.map((request) => (
                <div className="queue-row" key={request.id}>
                  <span>{request.createdAt}</span>
                  <strong>{request.label}</strong>
                  <em>{request.team}</em>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>

      <section className="workflow-band">
        <div>
          <p className="eyebrow">Workflow automation</p>
          <h2>From visitor request to the right team</h2>
        </div>
        <div className="flow">
          {["Visitor", "Web App", "Webhook", "n8n", "Classify", "Alert Station"].map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
      </section>

      <section className="future-grid">
        <div className="future-copy">
          <p className="eyebrow">AI evolution</p>
          <h2>Ready for voice, multilingual support, and intelligent prioritisation</h2>
          <p>
            Version 1 uses predefined routing rules. The same interface can evolve into natural
            language understanding, speech-to-text, intent classification, and workflow analytics.
          </p>
        </div>
        <div className="example-stack">
          {examples.map((example) => (
            <div className="example" key={example.phrase}>
              <p>&quot;{example.phrase}&quot;</p>
              <span>AI route: {example.route}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
