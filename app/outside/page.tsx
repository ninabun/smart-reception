"use client";

import { useEffect, useState } from "react";
import {
  getTodayKey,
  languageOptions,
  readRequests,
  receptionChannelName,
  requestOptions,
  saveRequests,
  type ReceptionLocation,
  type ReceptionRequest
} from "../reception-data";
import GlassKeyButton from "../components/GlassKeyButton";

type LanguageId = (typeof languageOptions)[number]["id"];
type VisitorCount = NonNullable<ReceptionRequest["visitorCount"]>;
type EnquiryKind = Exclude<ReceptionRequest["kind"], "location">;
type OutsideDraft = {
  selectedLanguage: LanguageId;
  selectedKind: EnquiryKind | null;
  selectedLocation: ReceptionLocation | null;
  visitorCount: VisitorCount | null;
};

const outsideDraftKey = "smart-reception-outside-draft";

const outsideCopy: Record<
  LanguageId,
  {
    eyebrow: string;
    heading: string;
    ready: string;
    readyTitle: string;
    readyBody: string;
    alertSent: string;
    stayClose: string;
    options: Record<
      EnquiryKind,
      {
        label: string;
        helper: string;
        confirmation: string;
      }
    >;
  }
> = {
  english: {
    eyebrow: "Outside ward display",
    heading: "Hello, this is Labour Room (Ward B4).",
    ready: "Ready",
    readyTitle: "Select an enquiry type to begin.",
    readyBody: "This is the screen visitors see outside the ward.",
    alertSent: "Alert sent",
    stayClose: "Please stay close to the reception area.",
    options: {
      general: {
        label: "General Enquiry",
        helper: "Delivery / Documentations / CSD",
        confirmation: "A clerk has been notified. Please wait nearby."
      },
      patient: {
        label: "Accompany Patient",
        helper: "Request Permission / Find the Right Room / Where to Wait",
        confirmation: "A clerk will help with patient accompaniment guidance."
      },
      urgent: {
        label: "Urgent Assistant",
        helper: "Labour Symptoms / Discomfort / Need Urgent Help from Clinical Staff",
        confirmation: "Urgent alert sent. Clinical staff have been notified immediately."
      }
    }
  },
  chinese: {
    eyebrow: "產房外顯示屏",
    heading: "你好，這裡是產房。請問有甚麼可以幫忙？",
    ready: "準備就緒",
    readyTitle: "請選擇查詢類別。",
    readyBody: "這是訪客在產房外使用的顯示屏。",
    alertSent: "通知已發出",
    stayClose: "請留在接待處附近等候。",
    options: {
      general: {
        label: "一般查詢",
        helper: "分娩 / 文件 / CSD",
        confirmation: "已通知文員，請在附近等候。"
      },
      patient: {
        label: "陪同病人",
        helper: "申請許可 / 尋找房間 / 等候位置",
        confirmation: "文員會協助處理陪同病人安排。"
      },
      urgent: {
        label: "緊急協助",
        helper: "分娩徵狀、不適、需要醫護人員協助",
        confirmation: "緊急通知已發出，醫護人員已即時收到通知。"
      }
    }
  },
  hindi: {
    eyebrow: "वार्ड के बाहर डिस्प्ले",
    heading: "नमस्ते, यह लेबर रूम है। मैं आपकी क्या मदद कर सकता हूँ?",
    ready: "तैयार",
    readyTitle: "कृपया पूछताछ का प्रकार चुनें।",
    readyBody: "यह स्क्रीन वार्ड के बाहर आने वाले आगंतुकों के लिए है।",
    alertSent: "सूचना भेज दी गई",
    stayClose: "कृपया रिसेप्शन क्षेत्र के पास रहें।",
    options: {
      general: {
        label: "सामान्य पूछताछ",
        helper: "डिलीवरी / दस्तावेज़ / CSD",
        confirmation: "क्लर्क को सूचित कर दिया गया है। कृपया पास में प्रतीक्षा करें।"
      },
      patient: {
        label: "मरीज़ के साथ जाना",
        helper: "अनुमति / सही कमरा / प्रतीक्षा स्थान",
        confirmation: "क्लर्क मरीज़ के साथ जाने की व्यवस्था में मदद करेगा।"
      },
      urgent: {
        label: "तत्काल सहायता",
        helper: "प्रसव लक्षण, असुविधा, क्लिनिकल स्टाफ से सहायता",
        confirmation: "तत्काल सूचना भेज दी गई है। क्लिनिकल स्टाफ को तुरंत सूचित किया गया है।"
      }
    }
  },
  urdu: {
    eyebrow: "وارڈ کے باہر ڈسپلے",
    heading: "السلام علیکم، یہ لیبر روم ہے۔ میں آپ کی کیا مدد کر سکتا ہوں؟",
    ready: "تیار",
    readyTitle: "براہ کرم انکوائری کی قسم منتخب کریں۔",
    readyBody: "یہ اسکرین وارڈ کے باہر آنے والے وزیٹرز کے لیے ہے۔",
    alertSent: "اطلاع بھیج دی گئی",
    stayClose: "براہ کرم ریسیپشن کے قریب رہیں۔",
    options: {
      general: {
        label: "عام انکوائری",
        helper: "ڈیلیوری / دستاویزات / CSD",
        confirmation: "کلرک کو اطلاع دے دی گئی ہے۔ براہ کرم قریب انتظار کریں۔"
      },
      patient: {
        label: "مریض کے ساتھ جانا",
        helper: "اجازت / درست کمرہ / انتظار کی جگہ",
        confirmation: "کلرک مریض کے ساتھ جانے کی رہنمائی میں مدد کرے گا۔"
      },
      urgent: {
        label: "فوری مدد",
        helper: "لیبر کی علامات، تکلیف، کلینیکل اسٹاف سے مدد",
        confirmation: "فوری اطلاع بھیج دی گئی ہے۔ کلینیکل اسٹاف کو فوراً آگاہ کر دیا گیا ہے۔"
      }
    }
  }
};

const actionCopy: Record<
  LanguageId,
  {
    confirmInstruction: string;
    confirmButton: string;
    cancelButton: string;
    cancelSentButton: string;
    sendBadge: string;
    sentMessage: Record<ReceptionRequest["kind"], string>;
    visitorLabel: Record<VisitorCount, string>;
  }
> = {
  english: {
    confirmInstruction: "Select one request button, then press Confirm.",
    confirmButton: "Confirm",
    cancelButton: "Cancel",
    cancelSentButton: "Cancel Sent",
    sendBadge: "SENT",
    sentMessage: {
      general: "Enquiry Sent. Please wait.",
      patient: "Enquiry Sent. Please wait.",
      urgent: "Urgent Alert Sent. Please wait.",
      location: "Enquiry Sent. Please wait."
    },
    visitorLabel: {
      1: "mother",
      2: "mother & baby"
    }
  },
  chinese: {
    confirmInstruction: "請選擇一個查詢，然後按確認。",
    confirmButton: "確認",
    cancelButton: "取消",
    cancelSentButton: "取消送出",
    sendBadge: "已送出",
    sentMessage: {
      general: "查詢已送出，請等候。",
      patient: "查詢已送出，請等候。",
      urgent: "緊急通知已送出，請等候。",
      location: "查詢已送出，請等候。"
    },
    visitorLabel: {
      1: "媽媽",
      2: "媽媽及嬰兒"
    }
  },
  hindi: {
    confirmInstruction: "एक अनुरोध चुनें, फिर पुष्टि दबाएँ।",
    confirmButton: "पुष्टि",
    cancelButton: "रद्द",
    cancelSentButton: "भेजा गया रद्द करें",
    sendBadge: "भेजा गया",
    sentMessage: {
      general: "पूछताछ भेज दी गई है। कृपया प्रतीक्षा करें।",
      patient: "पूछताछ भेज दी गई है। कृपया प्रतीक्षा करें।",
      urgent: "तत्काल सूचना भेज दी गई है। कृपया प्रतीक्षा करें।",
      location: "पूछताछ भेज दी गई है। कृपया प्रतीक्षा करें।"
    },
    visitorLabel: {
      1: "माँ",
      2: "माँ और बच्चा"
    }
  },
  urdu: {
    confirmInstruction: "ایک درخواست منتخب کریں، پھر تصدیق دبائیں۔",
    confirmButton: "تصدیق",
    cancelButton: "منسوخ",
    cancelSentButton: "بھیجا گیا منسوخ کریں",
    sendBadge: "بھیج دیا",
    sentMessage: {
      general: "انکوائری بھیج دی گئی ہے۔ براہ کرم انتظار کریں۔",
      patient: "انکوائری بھیج دی گئی ہے۔ براہ کرم انتظار کریں۔",
      urgent: "فوری اطلاع بھیج دی گئی ہے۔ براہ کرم انتظار کریں۔",
      location: "انکوائری بھیج دی گئی ہے۔ براہ کرم انتظار کریں۔"
    },
    visitorLabel: {
      1: "ماں",
      2: "ماں اور بچہ"
    }
  }
};

function readOutsideDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved = window.localStorage.getItem(outsideDraftKey);
    return saved ? (JSON.parse(saved) as OutsideDraft) : null;
  } catch {
    return null;
  }
}

function saveOutsideDraft(draft: OutsideDraft) {
  window.localStorage.setItem(outsideDraftKey, JSON.stringify(draft));
  window.dispatchEvent(new CustomEvent("smart-reception-outside-draft", { detail: draft }));

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(receptionChannelName);
    channel.postMessage({ type: "smart-reception-outside-draft", draft });
    channel.close();
  }
}

export default function OutsideDisplay() {
  const [requests, setRequests] = useState<ReceptionRequest[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageId>("english");
  const [lastRequest, setLastRequest] = useState<ReceptionRequest | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ReceptionLocation | null>(null);
  const [visitorCount, setVisitorCount] = useState<VisitorCount | null>(null);
  const [selectedKind, setSelectedKind] = useState<EnquiryKind | null>(null);

  useEffect(() => {
    setRequests(readRequests());
    const savedDraft = readOutsideDraft();

    function applyDraft(draft: OutsideDraft | null) {
      if (!draft) {
        return;
      }

      setSelectedLanguage(draft.selectedLanguage);
      setSelectedKind(draft.selectedKind);
      setSelectedLocation(draft.selectedLocation);
      setVisitorCount(draft.visitorCount);
      setLastRequest(null);
    }

    function handleDraftEvent(event: Event) {
      applyDraft((event as CustomEvent<OutsideDraft>).detail);
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === outsideDraftKey) {
        applyDraft(readOutsideDraft());
      }
    }

    const channel = "BroadcastChannel" in window ? new BroadcastChannel(receptionChannelName) : null;

    if (channel) {
      channel.onmessage = (event) => {
        if (event.data?.type === "smart-reception-outside-draft") {
          applyDraft(event.data.draft as OutsideDraft);
        }
      };
    }

    applyDraft(savedDraft);
    window.addEventListener("smart-reception-outside-draft", handleDraftEvent);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("smart-reception-outside-draft", handleDraftEvent);
      window.removeEventListener("storage", handleStorage);
      channel?.close();
    };
  }, []);

  function publishDraft(nextDraft: Partial<OutsideDraft>) {
    saveOutsideDraft({
      selectedLanguage,
      selectedKind,
      selectedLocation,
      visitorCount,
      ...nextDraft
    });
  }

  function submitRequest() {
    const option = requestOptions.find((requestOption) => requestOption.kind === selectedKind);

    if (!option && (!selectedLocation || !visitorCount)) {
      return;
    }

    const locationLabel =
      selectedLocation && visitorCount
        ? `${selectedLocation} (${visitorCount === 1 ? "mother" : "mother & baby"})`
        : null;

    const nextRequest: ReceptionRequest = {
      id: Date.now(),
      kind: option?.kind ?? "location",
      label: option?.label ?? locationLabel ?? "Location request",
      team: option?.team ?? "Clerk",
      color: option?.color ?? "Yellow",
      tone: option?.tone ?? "Location alert",
      priority: option?.priority ?? "Standard",
      status: "Waiting",
      location: selectedLocation ?? undefined,
      visitorCount: visitorCount ?? undefined,
      createdDate: getTodayKey(),
      createdAt: new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date())
    };
    const nextRequests = [nextRequest, ...requests].slice(0, 12);

    setRequests(nextRequests);
    setLastRequest(nextRequest);
    setSelectedKind(null);
    setSelectedLocation(null);
    setVisitorCount(null);
    saveRequests(nextRequests);
  }

  function cancelLastRequest() {
    if (!lastRequest || lastRequest.status !== "Waiting") {
      return;
    }

    const cancelledAt = new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date());
    const nextRequest: ReceptionRequest = {
      ...lastRequest,
      status: "Cancelled",
      cancelledAt
    };
    const nextRequests = requests.map((request) =>
      request.id === lastRequest.id ? nextRequest : request
    );

    setRequests(nextRequests);
    setLastRequest(nextRequest);
    saveRequests(nextRequests);
  }

  function resetOutsideSelection() {
    if (lastRequest?.status === "Waiting") {
      cancelLastRequest();
    }

    setLastRequest(null);
    setSelectedKind(null);
    setSelectedLocation(null);
    setVisitorCount(null);
    publishDraft({
      selectedKind: null,
      selectedLocation: null,
      visitorCount: null
    });
  }

  function chooseLocation(location: ReceptionLocation) {
    setSelectedLocation(location);
    setVisitorCount(null);
    setSelectedKind(null);
    setLastRequest(null);
    publishDraft({
      selectedKind: null,
      selectedLocation: location,
      visitorCount: null
    });
  }

  const copy = outsideCopy[selectedLanguage];
  const actions = actionCopy[selectedLanguage];
  const sentMessage = lastRequest?.status === "Waiting" ? actions.sentMessage[lastRequest.kind] : null;
  const selectedOption = requestOptions.find((option) => option.kind === selectedKind);
  const readyToConfirm = Boolean(selectedOption || (selectedLocation && visitorCount));
  const selectedLocationLabel =
    selectedLocation && visitorCount ? `${selectedLocation} (${actions.visitorLabel[visitorCount]})` : null;
  const selectedSummary =
    selectedOption?.kind === "patient"
      ? selectedLanguage === "english"
        ? "Accompany"
        : copy.options.patient.label
      : selectedOption
        ? copy.options[selectedOption.kind].label
        : selectedLocationLabel;

  return (
    <main className="display-shell outside-display">
      <header className="display-topbar">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.heading}</h1>
        </div>
      </header>

      <section className="visitor-layout">
        <div className="visitor-copy">
          <div className="language-row" aria-label="Language selection">
            {languageOptions.map((language) => (
              <GlassKeyButton
                className={selectedLanguage === language.id ? "language active" : "language"}
                key={language.id}
                onClick={() => {
                  setSelectedLanguage(language.id);
                  publishDraft({ selectedLanguage: language.id });
                }}
                showScene={false}
                tone="neutral"
              >
                {language.label}
              </GlassKeyButton>
            ))}
          </div>
        </div>

        <div className="request-grid outside-grid">
          {requestOptions.map((option) => (
            <GlassKeyButton
              className={`request-card ${option.kind}${selectedKind === option.kind ? " selected" : ""}`}
              key={option.kind}
              onClick={() => {
                setSelectedKind((currentKind) => {
                  const nextKind = currentKind === option.kind ? null : option.kind;

                  publishDraft({
                    selectedKind: nextKind,
                    selectedLocation: null,
                    visitorCount: null
                  });

                  return nextKind;
                });
                setSelectedLocation(null);
                setVisitorCount(null);
                setLastRequest(null);
              }}
              showScene={false}
              tone={option.kind === "urgent" ? "red" : option.kind === "patient" ? "green" : "blue"}
            >
              <span className="request-title">
                {selectedLanguage === "english" && option.kind === "patient"
                  ? "Accompany"
                  : copy.options[option.kind].label}
              </span>
              <span className="request-helper">{copy.options[option.kind].helper}</span>
            </GlassKeyButton>
          ))}
        </div>

        <div className="outside-choice-panel" aria-label="Location and visitor count">
          {(["E2", "A11"] as ReceptionLocation[]).map((location) => (
            <div
              className={
                selectedLocation === location && visitorCount ? "location-card active" : "location-card"
              }
              key={location}
            >
              <button
                className="location-card-title"
                onClick={() => chooseLocation(location)}
                type="button"
              >
                {location}
              </button>
              <div className="people-row" aria-label={`${location} visitor count`}>
                {([1, 2] as VisitorCount[]).map((count) => (
                  <button
                    className={
                      selectedLocation === location && visitorCount === count
                        ? "people-choice active"
                        : "people-choice"
                    }
                    key={count}
                    onClick={() => {
                      setSelectedLocation(location);
                      setVisitorCount(count);
                      setSelectedKind(null);
                      setLastRequest(null);
                      publishDraft({
                        selectedKind: null,
                        selectedLocation: location,
                        visitorCount: count
                      });
                    }}
                    type="button"
                  >
                    <span className={count === 1 ? "human-icon single" : "human-icon double"} aria-hidden="true">
                      <i />
                      {count === 2 ? <i /> : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={sentMessage ? "confirm-panel sent" : "confirm-panel"} aria-live="polite">
          <div className="confirm-main-copy">
            <strong className={sentMessage ? "sent-message-text" : ""}>
              {sentMessage ?? actions.confirmInstruction}
            </strong>
          </div>
          <GlassKeyButton
            className={`confirm-request-action${selectedKind ? ` ${selectedKind}` : ""}${
              selectedLocation && visitorCount ? " location-selected" : ""
            }`}
            disabled={!readyToConfirm}
            onClick={submitRequest}
            showScene={false}
            tone={selectedOption?.kind === "urgent" ? "red" : selectedOption?.kind === "patient" ? "green" : "blue"}
          >
            {actions.confirmButton}
          </GlassKeyButton>
          <div className="sent-followup">
            <button
              className={`outside-cancel-action${sentMessage ? " cancel-sent-action" : ""}${
                !sentMessage && selectedKind ? ` ${selectedKind}` : ""
              }${!sentMessage && selectedLocation && visitorCount ? " location-selected" : ""}`}
              onClick={resetOutsideSelection}
              type="button"
            >
              {sentMessage ? actions.cancelSentButton : actions.cancelButton}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
