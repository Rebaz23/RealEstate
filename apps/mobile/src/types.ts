// Mirrors packages/shared/src/types.ts. Duplicated by hand rather than imported
// from the workspace package — Metro's monorepo package resolution is fragile
// enough that it's not worth the risk for a handful of type definitions.

export type ListingType = "SALE" | "RENT";
export type ListingStatus = "ACTIVE" | "PENDING" | "SOLD" | "RENTED" | "SUSPENDED";

export interface OfficeSummary {
  id: string;
  name: string;
  subscriptionTier: "BASIC" | "PRO";
}

export interface ListingWithTrust {
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
  office: OfficeSummary;
  trustScore: number;
  trustSignalCount: number;
}

export interface EndUser {
  id: string;
  name: string;
  phone: string;
  preferredType?: ListingType | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  preferredNeighborhood?: string | null;
  preferredBedrooms?: number | null;
  createdAt: string;
}

export interface ChatMatch extends ListingWithTrust {}

export interface ChatResponse {
  conversationId: string;
  reply: string;
  matches: ChatMatch[];
}

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  matches?: ChatMatch[];
}

export interface NotificationListingPreview {
  title: string;
  neighborhood: string;
  price: number;
  type: ListingType;
}

export interface AppNotification {
  id: string;
  userId: string;
  listingId: string;
  reason: string;
  read: boolean;
  createdAt: string;
  listing: NotificationListingPreview;
}
