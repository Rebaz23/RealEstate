import { AppNotification, ChatResponse, EndUser, ListingWithTrust } from "../types";

// Same-container default for web/dev. Override by editing this constant when
// running on a physical device or simulator — those need the host machine's
// LAN IP instead of localhost. See README for details.
export const API_BASE_URL = "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error?.toString?.() ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export function createOrLoginUser(name: string, phone: string): Promise<EndUser> {
  return request<EndUser>("/users", { method: "POST", body: JSON.stringify({ name, phone }) });
}

export function getUser(userId: string): Promise<EndUser> {
  return request<EndUser>(`/users/${userId}`);
}

export function updateUserPreferences(
  userId: string,
  prefs: Partial<Pick<EndUser, "preferredType" | "budgetMin" | "budgetMax" | "preferredNeighborhood" | "preferredBedrooms">>
): Promise<EndUser> {
  return request<EndUser>(`/users/${userId}`, { method: "PATCH", body: JSON.stringify(prefs) });
}

export function sendChatMessage(userId: string, message: string, conversationId?: string): Promise<ChatResponse> {
  return request<ChatResponse>("/agent/chat", {
    method: "POST",
    body: JSON.stringify({ userId, message, conversationId }),
  });
}

export function getListing(listingId: string): Promise<ListingWithTrust> {
  return request<ListingWithTrust>(`/listings/${listingId}`);
}

export interface OfficeDetail {
  id: string;
  name: string;
  phone: string;
  email: string;
  subscriptionTier: "BASIC" | "PRO";
  leadCredits: number;
  trustScore: number;
}

export function getOffice(officeId: string): Promise<OfficeDetail> {
  return request<OfficeDetail>(`/offices/${officeId}`);
}

export interface QualifyResult {
  lead: {
    id: string;
    status: string;
    qualificationNotes: string;
    budgetConfirmed: boolean;
    intentScore: number;
  };
}

export function qualifyLead(conversationId: string, listingId: string): Promise<QualifyResult> {
  return request<QualifyResult>("/agent/qualify", {
    method: "POST",
    body: JSON.stringify({ conversationId, listingId }),
  });
}

export interface FeedbackInput {
  userId: string;
  listingId: string;
  priceMatches: boolean | null;
  conditionMatches: boolean | null;
  stillAvailable: boolean | null;
  rating?: number;
  comment?: string;
}

export function submitFeedback(input: FeedbackInput): Promise<{ signalsRecorded: number }> {
  return request("/agent/feedback", { method: "POST", body: JSON.stringify(input) });
}

export function getNotifications(userId: string): Promise<AppNotification[]> {
  return request<AppNotification[]>(`/notifications?userId=${encodeURIComponent(userId)}`);
}

export function markNotificationRead(id: string): Promise<{ id: string; read: boolean }> {
  return request(`/notifications/${id}/read`, { method: "PATCH" });
}
