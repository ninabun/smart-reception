"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { filterTodayRequests, readRequests, saveRequests, type ReceptionRequest } from "../reception-data";

export default function WardDisplay() {
  const [requests, setRequests] = useState<ReceptionRequest[]>([]);

  useEffect(() => {
    function refreshRequests() {
      setRequests(readRequests());
    }

    refreshRequests();
    window.addEventListener("storage", refreshRequests);
    window.addEventListener("smart-reception-update", refreshRequests);

    return () => {
      window.removeEventListener("storage", refreshRequests);
      window.removeEventListener("smart-reception-update", refreshRequests);
    };
  }, []);

  const todayRequests = useMemo(() => filterTodayRequests(requests), [requests]);
  const activeRequest =
    todayRequests.find((request) => request.status === "Waiting") ?? todayRequests[0];

  const metrics = useMemo(
    () => [
      { label: "Requests today", value: String(todayRequests.length).padStart(2, "0") },
      {
        label: "Waiting",
        value: String(todayRequests.filter((request) => request.status === "Waiting").length).padStart(2, "0")
      },
      {
        label: "High priority",
        value: String(todayRequests.filter((request) => request.priority === "High").length).padStart(2, "0")
      }
    ],
    [todayRequests]
  );

  function updateRequest(id: number, status: ReceptionRequest["status"]) {
    const nextRequests = requests.map((request) =>
      request.id === id ? { ...request, status } : request
    );

    setRequests(nextRequests);
    saveRequests(nextRequests);
  }

  function clearDemo() {
    setRequests([]);
    saveRequests([]);
  }

  return (
    <main className="display-shell ward-display">
      <header className="display-topbar">
        <div>
          <p className="eyebrow">Inside ward display</p>
          <h1>Labour room alert station</h1>
        </div>
        <div className="topbar-actions">
          <Link className="screen-link" href="/outside">
            Open Outside Display
          </Link>
          <button className="secondary-action" onClick={clearDemo} type="button">
            Reset Demo
          </button>
        </div>
      </header>

      <section className="ward-layout">
        <div className={activeRequest ? `ward-alert ${activeRequest.kind}` : "ward-alert empty"}>
          <span className={activeRequest ? `beacon ${activeRequest.kind}` : "beacon"} />
          {activeRequest ? (
            <>
              <p className="eyebrow">{activeRequest.priority} priority</p>
              <h2>{activeRequest.label}</h2>
              <p>
                Notify {activeRequest.team}. Trigger {activeRequest.color.toLowerCase()} indicator
                and play {activeRequest.tone.toLowerCase()}.
              </p>
              <div className="alert-meta">
                <span>{activeRequest.createdAt}</span>
                <span>{activeRequest.status}</span>
              </div>
              {activeRequest.status === "Waiting" ? (
                <button
                  className="primary-action"
                  onClick={() => updateRequest(activeRequest.id, "Acknowledged")}
                  type="button"
                >
                  Acknowledge Request
                </button>
              ) : null}
            </>
          ) : (
            <>
              <p className="eyebrow">Ready</p>
              <h2>No active request</h2>
              <p>Visitor enquiries from the outside display will appear here.</p>
            </>
          )}
        </div>

        <aside className="ward-sidebar">
          <div className="metric-grid">
            {metrics.map((metric) => (
              <div className="metric" key={metric.label}>
                <span>{metric.value}</span>
                <p>{metric.label}</p>
              </div>
            ))}
          </div>

          <div className="queue">
            <h3>Live queue</h3>
            {todayRequests.length === 0 ? (
              <p className="muted">No workflow events yet.</p>
            ) : (
              todayRequests.map((request) => (
                <div className={`queue-row ${request.kind}`} key={request.id}>
                  <span>{request.createdAt}</span>
                  <strong>{request.label}</strong>
                  <em>
                    {request.team} - {request.status}
                  </em>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
