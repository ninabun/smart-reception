"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { filterTodayRequests, readRequests, saveRequests, type ReceptionRequest } from "../reception-data";
import GlassKeyButton from "../components/GlassKeyButton";

type WardLanguage = "english" | "chinese";

const wardCopy: Record<
  WardLanguage,
  {
    languageLabel: string;
    eyebrow: string;
    title: string;
    location: string;
    outsideDisplay: string;
    resetDemo: string;
    priority: Record<ReceptionRequest["priority"], string>;
    ready: string;
    noActive: string;
    noActiveBody: string;
    notify: string;
    trigger: string;
    indicator: string;
    play: string;
    acknowledge: string;
    queue: string;
    noEvents: string;
    status: Record<ReceptionRequest["status"], string>;
    team: Record<string, string>;
    request: Record<ReceptionRequest["kind"], string>;
    metrics: {
      requestsToday: string;
      requestsTodayHint: string;
      waiting: string;
      waitingHint: string;
      highPriority: string;
      highPriorityHint: string;
    };
  }
> = {
  english: {
    languageLabel: "English",
    eyebrow: "Inside ward display",
    title: "Location : Labour Room",
    location: "Location : Labour Room",
    outsideDisplay: "Open Outside Display",
    resetDemo: "Reset Demo",
    priority: {
      Standard: "Standard priority",
      High: "High priority"
    },
    ready: "Ready",
    noActive: "No active request",
    noActiveBody: "Visitor enquiries from the outside display will appear here.",
    notify: "Notify",
    trigger: "Trigger",
    indicator: "indicator",
    play: "and play",
    acknowledge: "Acknowledge Request",
    queue: "Live queue",
    noEvents: "No workflow events yet.",
    status: {
      Waiting: "Not yet acknowledged",
      Acknowledged: "Acknowledged"
    },
    team: {
      Clerk: "Clerk",
      "Healthcare Provider": "Healthcare Provider"
    },
    request: {
      general: "General Enquiry",
      patient: "Accompany Patient",
      urgent: "Urgent Assistant"
    },
    metrics: {
      requestsToday: "Requests today",
      requestsTodayHint: "0:00am to 11:59pm every day",
      waiting: "Waiting",
      waitingHint: "Not yet acknowledged",
      highPriority: "High Priority",
      highPriorityHint: "Urgent Assistant from outside panel"
    }
  },
  chinese: {
    languageLabel: "中文",
    eyebrow: "產房內顯示屏",
    title: "位置：產房",
    location: "位置：產房",
    outsideDisplay: "開啟外面顯示屏",
    resetDemo: "重設示範",
    priority: {
      Standard: "一般優先",
      High: "高優先"
    },
    ready: "準備就緒",
    noActive: "沒有待處理要求",
    noActiveBody: "訪客在外面顯示屏提交的查詢會在這裡顯示。",
    notify: "通知",
    trigger: "啟動",
    indicator: "指示燈",
    play: "並播放",
    acknowledge: "確認已處理",
    queue: "即時隊列",
    noEvents: "暫時沒有流程紀錄。",
    status: {
      Waiting: "尚未確認",
      Acknowledged: "已確認"
    },
    team: {
      Clerk: "文員",
      "Healthcare Provider": "醫護人員"
    },
    request: {
      general: "一般查詢",
      patient: "陪同病人",
      urgent: "緊急協助"
    },
    metrics: {
      requestsToday: "今日要求",
      requestsTodayHint: "每日 0:00am 至 11:59pm",
      waiting: "等候中",
      waitingHint: "尚未確認",
      highPriority: "高優先",
      highPriorityHint: "外面顯示屏按下緊急協助"
    }
  }
};

export default function WardDisplay() {
  const [requests, setRequests] = useState<ReceptionRequest[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<WardLanguage>("english");

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
  const waitingRequests = useMemo(
    () => todayRequests.filter((request) => request.status === "Waiting"),
    [todayRequests]
  );
  const highPriorityRequests = useMemo(
    () => todayRequests.filter((request) => request.kind === "urgent"),
    [todayRequests]
  );
  const copy = wardCopy[selectedLanguage];
  const hasWaitingRequests = waitingRequests.length > 0;
  const activeRequest =
    waitingRequests[0] ?? todayRequests[0];

  const metrics = useMemo(
    () => [
      {
        id: "today",
        label: copy.metrics.requestsToday,
        hint: copy.metrics.requestsTodayHint,
        value: String(todayRequests.length).padStart(2, "0")
      },
      {
        id: "waiting",
        label: copy.metrics.waiting,
        hint: copy.metrics.waitingHint,
        value: String(waitingRequests.length).padStart(2, "0")
      },
      {
        id: "high",
        label: copy.metrics.highPriority,
        hint: copy.metrics.highPriorityHint,
        value: String(highPriorityRequests.length).padStart(2, "0")
      }
    ],
    [copy, todayRequests.length, waitingRequests.length, highPriorityRequests.length]
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
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
        </div>
        <div className="topbar-actions">
          <Link className="screen-link" href="/outside">
            {copy.outsideDisplay}
          </Link>
          <div className="ward-language-row" aria-label="Ward language selection">
            {(Object.keys(wardCopy) as WardLanguage[]).map((language) => (
              <GlassKeyButton
                className={selectedLanguage === language ? "language active" : "language"}
                key={language}
                onClick={() => setSelectedLanguage(language)}
                tone="neutral"
              >
                {wardCopy[language].languageLabel}
              </GlassKeyButton>
            ))}
          </div>
        </div>
      </header>

      <section className="ward-layout">
        <div className={activeRequest ? `ward-alert ${activeRequest.kind}` : "ward-alert empty"}>
          <span
            aria-label={hasWaitingRequests ? "Unacknowledged request light on" : "Request light off"}
            className={hasWaitingRequests ? `beacon ${activeRequest?.kind ?? ""} on` : "beacon off"}
          />
          {activeRequest ? (
            <>
              <p className={activeRequest.priority === "High" ? "eyebrow priority-high" : "eyebrow"}>
                {copy.priority[activeRequest.priority]}
              </p>
              <h2>{copy.request[activeRequest.kind]}</h2>
              {activeRequest.kind === "urgent" ? (
                <p>Notify Healthcare Providers IMMEDIATELY.</p>
              ) : (
                <p>
                  {copy.notify} {copy.team[activeRequest.team] ?? activeRequest.team}. {copy.trigger}{" "}
                  {activeRequest.color.toLowerCase()} {copy.indicator} {copy.play}{" "}
                  {activeRequest.tone.toLowerCase()}.
                </p>
              )}
              <div className="alert-meta">
                <span>{activeRequest.createdAt}</span>
                <span>{copy.status[activeRequest.status]}</span>
              </div>
              {activeRequest.status === "Waiting" ? (
                <GlassKeyButton
                  className="primary-action"
                  onClick={() => updateRequest(activeRequest.id, "Acknowledged")}
                  tone={activeRequest.kind === "urgent" ? "red" : activeRequest.kind === "patient" ? "green" : "blue"}
                >
                  {copy.acknowledge}
                </GlassKeyButton>
              ) : null}
            </>
          ) : (
            <>
              <p className="eyebrow">{copy.ready}</p>
              <h2>{copy.noActive}</h2>
              <p>{copy.noActiveBody}</p>
            </>
          )}
        </div>

        <aside className="ward-sidebar">
          <div className="metric-grid">
            {metrics.map((metric) => (
              <div
                className={`metric metric-${metric.id}${
                  metric.id === "high" ? " high-priority-metric" : ""
                }`}
                key={metric.id}
              >
                <span>{metric.value}</span>
                <p>{metric.label}</p>
                <em>{metric.hint}</em>
              </div>
            ))}
          </div>

          <div className="queue">
            <h3>{copy.queue}</h3>
            {todayRequests.length === 0 ? (
              <p className="muted">{copy.noEvents}</p>
            ) : (
              todayRequests.map((request) => (
                <div className={`queue-row ${request.kind}`} key={request.id}>
                  <span>{request.createdAt}</span>
                  <strong>{copy.request[request.kind]}</strong>
                  <em>
                    {copy.team[request.team] ?? request.team} - {copy.status[request.status]}
                  </em>
                </div>
              ))
            )}
          </div>

          <GlassKeyButton
            className="secondary-action reset-panel-action"
            onClick={clearDemo}
            tone="neutral"
          >
            {copy.resetDemo}
          </GlassKeyButton>
        </aside>
      </section>
    </main>
  );
}
