export type RequestKind = "general" | "patient" | "clinical" | "urgent";

export type ReceptionRequest = {
  id: number;
  kind: RequestKind;
  label: string;
  team: string;
  color: string;
  tone: string;
  priority: "Standard" | "High";
  createdAt: string;
  status: "Waiting" | "Acknowledged";
};

export const storageKey = "smart-reception-requests";

export const requestOptions: Array<
  Omit<ReceptionRequest, "id" | "createdAt" | "status"> & { helper: string; confirmation: string }
> = [
  {
    kind: "general",
    label: "General Enquiry",
    helper: "Registration, documents, waiting guidance, or visiting information.",
    confirmation: "A clerk has been notified. Please wait nearby.",
    team: "Clerk",
    color: "Blue",
    tone: "Clerk alert",
    priority: "Standard"
  },
  {
    kind: "patient",
    label: "Accompany Patient",
    helper: "Request permission, find the right room, or ask where to wait.",
    confirmation: "A clerk will help with patient accompaniment guidance.",
    team: "Clerk",
    color: "Blue",
    tone: "Accompaniment alert",
    priority: "Standard"
  },
  {
    kind: "clinical",
    label: "Need Healthcare Assistance",
    helper: "Symptoms, discomfort, or help needed from clinical staff.",
    confirmation: "A nurse has been notified. Please remain available.",
    team: "Nurse",
    color: "Green",
    tone: "Nurse alert",
    priority: "Standard"
  },
  {
    kind: "urgent",
    label: "Urgent Assistance",
    helper: "Immediate concern that should be escalated to healthcare providers.",
    confirmation: "Urgent alert sent. Clinical staff have been notified immediately.",
    team: "Healthcare Provider",
    color: "Red",
    tone: "High-priority alert",
    priority: "High"
  }
];

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
