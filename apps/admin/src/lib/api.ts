import type { Lead, ListingStatus, ListingWithTrust, SubscriptionTier } from "@realestate/shared";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error ? JSON.stringify(body.error) : `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

export interface OfficeSummary {
  id: string;
  name: string;
  phone: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  leadCredits: number;
  createdAt: string;
  listingCount: number;
  leadCount: number;
  trustScore: number;
}

export function listOffices(): Promise<OfficeSummary[]> {
  return request<OfficeSummary[]>("/offices");
}

const ALL_STATUSES: ListingStatus[] = ["ACTIVE", "PENDING", "SOLD", "RENTED", "SUSPENDED"];

// The public GET /listings endpoint defaults to status=ACTIVE when no status
// filter is given, so the platform-wide listings table is assembled by
// querying each status (across all offices) and merging.
export async function listAllListings(): Promise<ListingWithTrust[]> {
  const batches = await Promise.all(
    ALL_STATUSES.map((status) => request<ListingWithTrust[]>(`/listings?status=${status}`))
  );
  return batches.flat().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export interface LeadWithRelations extends Lead {
  listing?: { title: string; neighborhood: string; price: number };
  user?: { name: string; phone: string };
  office?: { name: string };
}

// GET /leads with no officeId param returns leads across all offices.
export function listAllLeads(): Promise<LeadWithRelations[]> {
  return request<LeadWithRelations[]>("/leads");
}
