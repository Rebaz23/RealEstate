// Shared domain types used by api, mobile, admin, and b2b-portal.
// Kept as plain TS (no Prisma import) so client apps don't pull in server-only deps.

export type ListingType = "SALE" | "RENT";

export type ListingStatus = "ACTIVE" | "PENDING" | "SOLD" | "RENTED" | "SUSPENDED";

export type SubscriptionTier = "BASIC" | "PRO";

export type LeadStatus = "NEW" | "QUALIFIED" | "CONTACTED" | "CLOSED_WON" | "CLOSED_LOST";

// Where a trust signal originated.
export type TrustSignalSource = "USER_FEEDBACK" | "OFFICE_PASSIVE" | "RATING" | "COMMENT" | "BEHAVIOR";

// What the signal actually says about the listing.
export type TrustSignalType =
  | "PRICE_MATCH"
  | "PRICE_MISMATCH"
  | "CONDITION_MATCH"
  | "CONDITION_MISMATCH"
  | "STILL_AVAILABLE"
  | "UNAVAILABLE"
  | "RATING"
  | "COMMENT"
  | "VIEW"
  | "CONTACT_CLICK";

export type MessageRole = "USER" | "ASSISTANT";

export interface Office {
  id: string;
  name: string;
  phone: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  leadCredits: number;
  createdAt: string;
}

export interface Agent {
  id: string;
  officeId: string;
  name: string;
  email: string;
}

export interface Listing {
  id: string;
  officeId: string;
  type: ListingType;
  status: ListingStatus;
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
  createdAt: string;
  updatedAt: string;
}

export interface ListingWithTrust extends Listing {
  office: Pick<Office, "id" | "name" | "subscriptionTier">;
  trustScore: number;
  trustSignalCount: number;
}

export interface EndUser {
  id: string;
  name: string;
  phone: string;
  preferredType?: ListingType;
  budgetMin?: number;
  budgetMax?: number;
  preferredNeighborhood?: string;
  preferredBedrooms?: number;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  listingId?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  listingId: string;
  userId: string;
  officeId: string;
  status: LeadStatus;
  qualificationNotes: string;
  budgetConfirmed: boolean;
  intentScore: number;
  createdAt: string;
}

export interface TrustSignal {
  id: string;
  listingId: string;
  source: TrustSignalSource;
  type: TrustSignalType;
  comment?: string;
  rating?: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  listingId: string;
  reason: string;
  createdAt: string;
  read: boolean;
}

// ---- API request/response payloads ----

export interface ChatRequest {
  userId: string;
  conversationId?: string;
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  reply: string;
  matches: ListingWithTrust[];
}

export interface FeedbackRequest {
  userId: string;
  listingId: string;
  priceMatches: boolean | null;
  conditionMatches: boolean | null;
  stillAvailable: boolean | null;
  rating?: number;
  comment?: string;
}

export interface QualifyRequest {
  conversationId: string;
  listingId: string;
}

export interface QualifyResponse {
  lead: Lead;
}
