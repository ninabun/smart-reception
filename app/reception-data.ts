export type RequestKind = "general" | "patient" | "urgent";
export type ReceptionLocation = "E2" | "A11";

export type ReceptionRequest = {
  id: number;
  kind: RequestKind;
  label: string;
  team: string;
  color: string;
  tone: string;
  priority: "Standard" | "High";
  createdAt: string;
  createdDate: string;
  status: "Waiting" | "Acknowledged" | "Cancelled";
  acknowledgedAt?: string;
  cancelledAt?: string;
  location?: ReceptionLocation;
  visitorCount?: 1 | 2;
};

export const storageKey = "smart-reception-requests";

export const requestOptions: Array<
  Omit<ReceptionRequest, "id" | "createdAt" | "createdDate" | "status"> & {
    helper: string;
    confirmation: string;
  }
> = [
  {
    kind: "general",
    label: "General Enquiry",
    helper: "Delivery / Documentations / CSD",
    confirmation: "A clerk has been notified. Please wait nearby.",
    team: "Clerk",
    color: "Blue",
    tone: "Clerk alert",
    priority: "Standard"
  },
  {
    kind: "patient",
    label: "Accompany Patient",
    helper: "Request Permission / Find the Right Room / Where to Wait",
    confirmation: "A clerk will help with patient accompaniment guidance.",
    team: "Clerk",
    color: "Green",
    tone: "Accompaniment alert",
    priority: "Standard"
  },
  {
    kind: "urgent",
    label: "Urgent Assistant",
    helper: "Labour Symptoms / Discomfort / Need Urgent Help from Clinical Staff",
    confirmation: "Urgent alert sent. Clinical staff have been notified immediately.",
    team: "Healthcare Provider",
    color: "Red",
    tone: "High-priority alert",
    priority: "High"
  }
];

export const languageOptions = [
  { id: "english", label: "English" },
  { id: "chinese", label: "中文" },
  { id: "hindi", label: "हिन्दी" },
  { id: "urdu", label: "اردو" }
] as const;

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function filterTodayRequests(requests: ReceptionRequest[]) {
  const todayKey = getTodayKey();

  return requests.filter((request) => request.createdDate === todayKey);
}

export function readRequests() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as ReceptionRequest[]) : [];
  } catch {
    return [];
  }
}

export function saveRequests(requests: ReceptionRequest[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(requests));
  window.dispatchEvent(new Event("smart-reception-update"));
}
