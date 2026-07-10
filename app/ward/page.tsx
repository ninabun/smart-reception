"use client";

import { useEffect, useMemo, useState } from "react";
import { filterTodayRequests, readRequests, saveRequests, type ReceptionRequest } from "../reception-data";
import GlassKeyButton from "../components/GlassKeyButton";

type WardLanguage = "english" | "chinese";
type QueueFilter = "today" | "waiting" | "high";

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
    instruction?: Record<ReceptionRequest["kind"], string>;
    cancelledNote?: string;
    requestTimeLabel?: string;
    acknowledgeTimeLabel?: string;
    mother?: string;
    motherBaby?: string;
    close?: string;
    status: Record<ReceptionRequest["status"], string>;
    team: Record<string, string>;
    request: Record<Exclude<ReceptionRequest["kind"], "location">, string>;
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
    instruction: {
      general: "Notify Clerk.",
      patient: "Notify Midwife.",
      urgent: "Notify Healthcare Providers IMMEDIATELY.",
      location: "Notify Clerk."
    },
    cancelledNote: "Request cancelled from outside panel.",
    requestTimeLabel: "Request Time",
    acknowledgeTimeLabel: "Acknowledge Time",
    mother: "mother",
    motherBaby: "mother & baby",
    close: "Close",
    status: {
      Waiting: "Not yet acknowledged",
      Acknowledged: "Acknowledged",
      Cancelled: "Cancelled"
    },
    team: {
      Clerk: "Clerk",
      "Healthcare Provider": "Healthcare Provider"
    },
    request: {
      general: "General Enquiry",
      patient: "Accompany",
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
      Acknowledged: "已確認",
      Cancelled: "已取消"
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

const chineseWardCopy: (typeof wardCopy)["english"] = {
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
  noActiveBody: "外面顯示屏送出的查詢會在這裡顯示。",
  notify: "通知",
  trigger: "啟動",
  indicator: "指示燈",
  play: "並播放",
  acknowledge: "確認要求",
  queue: "即時隊列",
  noEvents: "暫時沒有記錄。",
  instruction: {
    general: "通知文員。",
    patient: "通知助產士。",
    urgent: "立即通知醫護人員。",
    location: "通知文員。"
  },
  cancelledNote: "此要求已由外面顯示屏取消。",
  requestTimeLabel: "要求時間",
  acknowledgeTimeLabel: "確認時間",
  mother: "媽媽",
  motherBaby: "媽媽及嬰兒",
  close: "關閉",
  status: {
    Waiting: "尚未確認",
    Acknowledged: "已確認",
    Cancelled: "已取消"
  },
  team: {
    Clerk: "文員",
    "Healthcare Provider": "醫護人員"
  },
  request: {
    general: "一般查詢",
    patient: "陪同",
    urgent: "緊急協助"
  },
  metrics: {
    requestsToday: "今日要求",
    requestsTodayHint: "每日 0:00am 至 11:59pm",
    waiting: "等待中",
    waitingHint: "尚未確認",
    highPriority: "高優先",
    highPriorityHint: "外面顯示屏按下緊急協助"
  }
};

export default function WardDisplay() {
  const [requests, setRequests] = useState<ReceptionRequest[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<WardLanguage>("english");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("today");
  const [showOutsidePreview, setShowOutsidePreview] = useState(false);

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

  useEffect(() => {
    if (!showOutsidePreview) {
      return;
    }

    const refreshTimer = window.setInterval(() => {
      setRequests(readRequests());
    }, 700);

    return () => window.clearInterval(refreshTimer);
  }, [showOutsidePreview]);

  const todayRequests = useMemo(() => filterTodayRequests(requests), [requests]);
  const waitingRequests = useMemo(
    () => todayRequests.filter((request) => request.status === "Waiting"),
    [todayRequests]
  );
  const highPriorityRequests = useMemo(
    () => todayRequests.filter((request) => request.kind === "urgent"),
    [todayRequests]
  );
  const copy = selectedLanguage === "chinese" ? chineseWardCopy : wardCopy.english;
  const hasWaitingRequests = waitingRequests.length > 0;
  const queueRequests = useMemo(() => {
    if (queueFilter === "waiting") {
      return waitingRequests;
    }

    if (queueFilter === "high") {
      return highPriorityRequests;
    }

    return todayRequests;
  }, [highPriorityRequests, queueFilter, todayRequests, waitingRequests]);
  const selectedRequest = selectedRequestId
    ? todayRequests.find((request) => request.id === selectedRequestId)
    : null;
  const activeRequest = selectedRequest ?? queueRequests[0] ?? waitingRequests[0] ?? todayRequests[0];

  const metrics = useMemo(
    () => [
      {
        id: "today" as const,
        label: copy.metrics.requestsToday,
        hint: copy.metrics.requestsTodayHint,
        value: String(todayRequests.length).padStart(2, "0")
      },
      {
        id: "waiting" as const,
        label: copy.metrics.waiting,
        hint: copy.metrics.waitingHint,
        value: String(waitingRequests.length).padStart(2, "0")
      },
      {
        id: "high" as const,
        label: copy.metrics.highPriority,
        hint: copy.metrics.highPriorityHint,
        value: String(highPriorityRequests.length).padStart(2, "0")
      }
    ],
    [copy, todayRequests.length, waitingRequests.length, highPriorityRequests.length]
  );

  function updateRequest(id: number, status: ReceptionRequest["status"]) {
    const acknowledgedAt =
      status === "Acknowledged"
        ? new Intl.DateTimeFormat("en", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }).format(new Date())
        : undefined;
    const nextRequests = requests.map((request) =>
      request.id === id ? { ...request, status, acknowledgedAt } : request
    );

    setRequests(nextRequests);
    saveRequests(nextRequests);
  }

  function clearDemo() {
    setRequests([]);
    setSelectedRequestId(null);
    setQueueFilter("today");
    saveRequests([]);
  }

  function requestMeta(request: ReceptionRequest) {
    if (request.kind === "location") {
      return "";
    }

    if (!request.location || !request.visitorCount) {
      return "";
    }

    return `${request.location} (${request.visitorCount === 1 ? copy.mother : copy.motherBaby})`;
  }

  function requestTitle(request: ReceptionRequest) {
    if (request.kind === "location" && request.location && request.visitorCount) {
      return `${request.location} (${request.visitorCount === 1 ? copy.mother : copy.motherBaby})`;
    }

    return request.kind === "location" ? request.label : copy.request[request.kind];
  }

  function requestTone(request: ReceptionRequest) {
    if (request.kind === "urgent") {
      return "red";
    }

    if (request.kind === "patient") {
      return "green";
    }

    return "blue";
  }

  return (
    <main className="display-shell ward-display">
      <header className="display-topbar">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
        </div>
        <div className="topbar-actions">
          <div className="ward-language-row" aria-label="Ward language selection">
            {(Object.keys(wardCopy) as WardLanguage[]).map((language) => (
              <GlassKeyButton
                className={selectedLanguage === language ? "language active" : "language"}
                key={language}
                onClick={() => setSelectedLanguage(language)}
                tone="neutral"
              >
                {language === "chinese" ? chineseWardCopy.languageLabel : wardCopy[language].languageLabel}
              </GlassKeyButton>
            ))}
          </div>
          <button
            className="screen-link outside-display-link"
            onClick={() => setShowOutsidePreview(true)}
            type="button"
          >
            {copy.outsideDisplay}
          </button>
        </div>
      </header>

      <section className="ward-layout">
        <div
          className={
            activeRequest
              ? `ward-alert ${activeRequest.kind} ${activeRequest.status.toLowerCase()}`
              : "ward-alert empty"
          }
        >
          <span
            aria-label={hasWaitingRequests ? "Unacknowledged request light on" : "Request light off"}
            className={hasWaitingRequests ? `beacon ${activeRequest?.kind ?? ""} on` : "beacon off"}
          />
          {activeRequest ? (
            <>
              <p className={activeRequest.priority === "High" ? "eyebrow priority-high" : "eyebrow"}>
                {copy.priority[activeRequest.priority]}
              </p>
              <h2>{requestTitle(activeRequest)}</h2>
              <p>{copy.instruction?.[activeRequest.kind]}</p>
              <div className="alert-meta">
                <span>{activeRequest.createdAt}</span>
                <span className={`status-pill status-${activeRequest.status.toLowerCase()}`}>
                  {copy.status[activeRequest.status]}
                </span>
              </div>
              {activeRequest.status === "Waiting" ? (
                <GlassKeyButton
                  className="primary-action"
                  onClick={() => updateRequest(activeRequest.id, "Acknowledged")}
                  tone={requestTone(activeRequest)}
                >
                  {copy.acknowledge}
                </GlassKeyButton>
              ) : null}
              {activeRequest.status === "Cancelled" ? (
                <p className="cancelled-alert-note">{copy.cancelledNote}</p>
              ) : null}
            </>
          ) : (
            <>
              <p className="eyebrow">{copy.ready}</p>
              <h2>{copy.noActive}</h2>
            </>
          )}
        </div>

        <aside className="ward-sidebar">
          <div className="metric-grid">
            {metrics.map((metric) => (
              <button
                className={`metric metric-${metric.id}${
                  metric.id === "high" ? " high-priority-metric" : ""
                }${queueFilter === metric.id ? " active" : ""}`}
                key={metric.id}
                onClick={() => {
                  setQueueFilter(metric.id);
                  setSelectedRequestId(null);
                }}
                type="button"
              >
                <span>{metric.value}</span>
                <p>{metric.label}</p>
                <em>{metric.hint}</em>
              </button>
            ))}
          </div>

          <div className="queue">
            <h3>{copy.queue}</h3>
            {queueRequests.length === 0 ? (
              <p className="muted">{copy.noEvents}</p>
            ) : (
              queueRequests.map((request) => (
                <button
                  className={`queue-row ${request.kind} ${request.status.toLowerCase()}${
                    activeRequest?.id === request.id ? " selected" : ""
                  }`}
                  key={request.id}
                  onClick={() => setSelectedRequestId(request.id)}
                  type="button"
                >
                  <span className="queue-time">
                    {request.createdAt} ({copy.requestTimeLabel})
                  </span>
                  <strong className="queue-title">
                    {requestTitle(request)}
                    {request.status === "Acknowledged" && request.acknowledgedAt ? (
                      <span className="queue-ack-time">
                        {request.acknowledgedAt} ({copy.acknowledgeTimeLabel})
                      </span>
                    ) : null}
                  </strong>
                  {requestMeta(request) ? <small className="queue-meta">{requestMeta(request)}</small> : null}
                  <em className="queue-status">
                    {copy.team[request.team] ?? request.team} - {copy.status[request.status]}
                    {request.status === "Cancelled" && request.cancelledAt
                      ? ` (${request.cancelledAt})`
                      : ""}
                  </em>
                </button>
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
      {showOutsidePreview ? (
        <div className="outside-preview-overlay" role="dialog" aria-label={copy.outsideDisplay}>
          <div className="outside-preview-panel">
            <button
              aria-label="Close outside display preview"
              className="outside-preview-close"
              onClick={() => setShowOutsidePreview(false)}
              type="button"
            >
              {copy.close}
            </button>
            <iframe src="/outside" title={copy.outsideDisplay} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
