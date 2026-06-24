import type {
  Lead,
  LeadStatus,
  ListingStatus,
  ListingType,
  ListingWithTrust,
  SubscriptionTier,
} from "@realestate/shared";

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

export function getOffice(id: string): Promise<OfficeSummary> {
  return request<OfficeSummary>(`/offices/${id}`);
}

const ALL_STATUSES: ListingStatus[] = ["ACTIVE", "PENDING", "SOLD", "RENTED", "SUSPENDED"];

// The public GET /listings endpoint defaults to status=ACTIVE when no status
// filter is given (correct for buyer-facing search), so an office's full
// listings table is assembled by querying each status and merging.
export async function listOfficeListings(officeId: string): Promise<ListingWithTrust[]> {
  const batches = await Promise.all(
    ALL_STATUSES.map((status) => request<ListingWithTrust[]>(`/listings?officeId=${officeId}&status=${status}`))
  );
  return batches.flat().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export interface CreateListingInput {
  officeId: string;
  type: ListingType;
  title: string;
  description: string;
  price: number;
  currency: string;
  neighborhood: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  officeStatedCondition: string;
}

export function createListing(input: CreateListingInput): Promise<ListingWithTrust> {
  return request<ListingWithTrust>("/listings", { method: "POST", body: JSON.stringify(input) });
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  price?: number;
  status?: ListingStatus;
  officeStatedCondition?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
}

export function updateListing(id: string, input: UpdateListingInput): Promise<ListingWithTrust> {
  return request<ListingWithTrust>(`/listings/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export interface LeadWithRelations extends Lead {
  listing?: { title: string; neighborhood: string; price: number };
  user?: { name: string; phone: string };
}

export function listLeads(officeId: string): Promise<LeadWithRelations[]> {
  return request<LeadWithRelations[]>(`/leads?officeId=${officeId}`);
}

export function updateLeadStatus(id: string, status: LeadStatus): Promise<LeadWithRelations> {
  return request<LeadWithRelations>(`/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}
