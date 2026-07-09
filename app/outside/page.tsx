"use client";

import { useEffect, useState } from "react";
import {
  getTodayKey,
  languageOptions,
  readRequests,
  requestOptions,
  saveRequests,
  type ReceptionRequest
} from "../reception-data";
import GlassKeyButton from "../components/GlassKeyButton";

type LanguageId = (typeof languageOptions)[number]["id"];

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
      ReceptionRequest["kind"],
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

export default function OutsideDisplay() {
  const [requests, setRequests] = useState<ReceptionRequest[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageId>("english");
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
    saveRequests(nextRequests);
  }

  const copy = outsideCopy[selectedLanguage];
  const sentMessage = lastRequest
    ? lastRequest.kind === "urgent"
      ? "Urgent Alert Sent. Please wait."
      : "Enquiry Sent. Please wait."
    : null;

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
                onClick={() => setSelectedLanguage(language.id)}
                tone="neutral"
              >
                {language.label}
              </GlassKeyButton>
            ))}
          </div>
          {lastRequest ? (
            <div className={`visitor-confirmation ${lastRequest.kind}`} role="status">
              <strong>{sentMessage}</strong>
            </div>
          ) : (
            <div className="visitor-confirmation empty">
              <span>{copy.ready}</span>
              <strong>{copy.readyTitle}</strong>
            </div>
          )}
        </div>

        <div className="request-grid outside-grid">
          {requestOptions.map((option) => (
            <GlassKeyButton
              className={`request-card ${option.kind}`}
              key={option.kind}
              onClick={() => submitRequest(option)}
              showScene={false}
              tone={option.kind === "urgent" ? "red" : option.kind === "patient" ? "green" : "blue"}
            >
              <span className="request-title">{copy.options[option.kind].label}</span>
              <span className="request-helper">{copy.options[option.kind].helper}</span>
            </GlassKeyButton>
          ))}
        </div>
      </section>
    </main>
  );
}
