import { PrismaClient } from "@prisma/client";
import { ListingType, TrustSignalSource, TrustSignalType } from "@realestate/shared";

const db = new PrismaClient();

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log("Clearing existing data...");
  await db.notification.deleteMany();
  await db.trustSignal.deleteMany();
  await db.lead.deleteMany();
  await db.message.deleteMany();
  await db.conversation.deleteMany();
  await db.listing.deleteMany();
  await db.agent.deleteMany();
  await db.office.deleteMany();
  await db.endUser.deleteMany();

  console.log("Creating offices...");
  const mansourProperties = await db.office.create({
    data: {
      name: "Mansour Properties",
      phone: "+964770100001",
      email: "contact@mansourproperties.iq",
      subscriptionTier: "PRO",
      leadCredits: 25,
    },
  });
  const karradaGroup = await db.office.create({
    data: {
      name: "Karrada Real Estate Group",
      phone: "+964770200002",
      email: "info@karradareg.iq",
      subscriptionTier: "BASIC",
      leadCredits: 8,
    },
  });
  const baghdadGate = await db.office.create({
    data: {
      name: "Baghdad Gate Realty",
      phone: "+964770300003",
      email: "sales@baghdadgate.iq",
      subscriptionTier: "PRO",
      leadCredits: 15,
    },
  });

  await db.agent.createMany({
    data: [
      { officeId: mansourProperties.id, name: "Omar Saleh", email: "omar@mansourproperties.iq" },
      { officeId: karradaGroup.id, name: "Noor Abdullah", email: "noor@karradareg.iq" },
      { officeId: baghdadGate.id, name: "Mustafa Jawad", email: "mustafa@baghdadgate.iq" },
    ],
  });

  console.log("Creating listings...");
  const listingDefs: {
    officeId: string;
    type: ListingType;
    title: string;
    description: string;
    price: number;
    neighborhood: string;
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
    officeStatedCondition: string;
  }[] = [
    // Mansour Properties — well-run office, will get strong trust signals
    { officeId: mansourProperties.id, type: "RENT", title: "Modern 2BR Apartment in Mansour", description: "Bright, recently renovated apartment near Mansour Mall, secure compound with parking.", price: 650, neighborhood: "Mansour", bedrooms: 2, bathrooms: 2, areaSqm: 120, officeStatedCondition: "Excellent — renovated 2023" },
    { officeId: mansourProperties.id, type: "RENT", title: "Cozy 1BR Apartment, Mansour", description: "Quiet street, good for a single professional or couple.", price: 400, neighborhood: "Mansour", bedrooms: 1, bathrooms: 1, areaSqm: 75, officeStatedCondition: "Good" },
    { officeId: mansourProperties.id, type: "SALE", title: "Family House in Mansour", description: "Spacious 3-bedroom house with private garden and garage.", price: 165000, neighborhood: "Mansour", bedrooms: 3, bathrooms: 3, areaSqm: 280, officeStatedCondition: "Very good — minor cosmetic work needed" },
    { officeId: mansourProperties.id, type: "SALE", title: "Luxury Villa, Mansour", description: "High-end villa with pool, 4 bedrooms, modern kitchen.", price: 320000, neighborhood: "Mansour", bedrooms: 4, bathrooms: 4, areaSqm: 450, officeStatedCondition: "Excellent" },
    { officeId: mansourProperties.id, type: "RENT", title: "3BR Apartment near Mansour Mall", description: "Family-friendly building with elevator and generator backup.", price: 750, neighborhood: "Mansour", bedrooms: 3, bathrooms: 2, areaSqm: 160, officeStatedCondition: "Good" },
    { officeId: mansourProperties.id, type: "RENT", title: "Studio Apartment, Mansour", description: "Compact studio, great for students.", price: 300, neighborhood: "Mansour", bedrooms: 1, bathrooms: 1, areaSqm: 50, officeStatedCondition: "Good" },

    // Karrada Real Estate Group — mixed track record
    { officeId: karradaGroup.id, type: "RENT", title: "2BR Apartment in Karrada Dakhil", description: "Central location, walking distance to restaurants and shops.", price: 550, neighborhood: "Karrada", bedrooms: 2, bathrooms: 1, areaSqm: 110, officeStatedCondition: "Good" },
    { officeId: karradaGroup.id, type: "RENT", title: "1BR Apartment, Karrada", description: "Affordable option close to Karrada main street.", price: 380, neighborhood: "Karrada", bedrooms: 1, bathrooms: 1, areaSqm: 70, officeStatedCondition: "Fair" },
    { officeId: karradaGroup.id, type: "SALE", title: "3BR Apartment, Karrada", description: "Top floor unit with balcony and river-side view.", price: 145000, neighborhood: "Karrada", bedrooms: 3, bathrooms: 2, areaSqm: 200, officeStatedCondition: "Good" },
    { officeId: karradaGroup.id, type: "RENT", title: "2BR Apartment, Karrada Kharij", description: "New building, modern finishes.", price: 600, neighborhood: "Karrada", bedrooms: 2, bathrooms: 2, areaSqm: 125, officeStatedCondition: "Excellent — new building" },
    { officeId: karradaGroup.id, type: "SALE", title: "Commercial-residential Building, Karrada", description: "Mixed-use building, shop on ground floor plus 2 apartments above.", price: 410000, neighborhood: "Karrada", bedrooms: 6, bathrooms: 4, areaSqm: 380, officeStatedCondition: "Good" },
    { officeId: karradaGroup.id, type: "RENT", title: "3BR Family Apartment, Karrada", description: "Close to schools, quiet residential street.", price: 700, neighborhood: "Karrada", bedrooms: 3, bathrooms: 2, areaSqm: 150, officeStatedCondition: "Good" },

    // Baghdad Gate Realty — will get negative trust signals (reality mismatches)
    { officeId: baghdadGate.id, type: "RENT", title: "2BR Apartment in Jadriya", description: "Near Jadriya bridge, university area.", price: 500, neighborhood: "Jadriya", bedrooms: 2, bathrooms: 1, areaSqm: 100, officeStatedCondition: "Excellent — fully renovated" },
    { officeId: baghdadGate.id, type: "RENT", title: "1BR Apartment, Zayouna", description: "Budget-friendly, close to main road.", price: 350, neighborhood: "Zayouna", bedrooms: 1, bathrooms: 1, areaSqm: 65, officeStatedCondition: "Good" },
    { officeId: baghdadGate.id, type: "SALE", title: "House in Adhamiya", description: "Traditional house with courtyard, needs some updating.", price: 175000, neighborhood: "Adhamiya", bedrooms: 3, bathrooms: 2, areaSqm: 240, officeStatedCondition: "Very good" },
    { officeId: baghdadGate.id, type: "RENT", title: "2BR Apartment, Dora", description: "Affordable family apartment.", price: 420, neighborhood: "Dora", bedrooms: 2, bathrooms: 1, areaSqm: 95, officeStatedCondition: "Good" },
    { officeId: baghdadGate.id, type: "SALE", title: "Apartment in Kadhimiya", description: "Near the shrine area, good rental investment potential.", price: 98000, neighborhood: "Kadhimiya", bedrooms: 2, bathrooms: 1, areaSqm: 90, officeStatedCondition: "Good" },
    { officeId: baghdadGate.id, type: "RENT", title: "3BR Apartment, Yarmouk", description: "Spacious unit in a well-known compound.", price: 680, neighborhood: "Yarmouk", bedrooms: 3, bathrooms: 2, areaSqm: 145, officeStatedCondition: "Excellent" },
  ];

  const listings = [];
  for (const def of listingDefs) {
    listings.push(await db.listing.create({ data: def }));
  }
  const byTitle = (title: string) => listings.find((l) => l.title === title)!;

  console.log("Creating end users...");
  const ahmed = await db.endUser.create({
    data: {
      name: "Ahmed Al-Rashid",
      phone: "+9647701234567",
      preferredType: "RENT",
      budgetMin: 400,
      budgetMax: 700,
      preferredNeighborhood: "Karrada",
      preferredBedrooms: 2,
    },
  });
  const layla = await db.endUser.create({
    data: {
      name: "Layla Hassan",
      phone: "+9647709876543",
      preferredType: "SALE",
      budgetMin: 120000,
      budgetMax: 200000,
      preferredNeighborhood: "Mansour",
      preferredBedrooms: 3,
    },
  });
  await db.endUser.create({
    data: { name: "Sara Kareem", phone: "+9647712223344" }, // fresh signup, no preferences yet
  });

  console.log("Creating trust signals...");
  const signals: { listingId: string; source: TrustSignalSource; type: TrustSignalType; comment?: string; rating?: number; createdAt: Date }[] = [];

  // Mansour Properties: consistently good track record.
  for (const title of ["Modern 2BR Apartment in Mansour", "Family House in Mansour", "Luxury Villa, Mansour"]) {
    const l = byTitle(title);
    signals.push(
      { listingId: l.id, source: "USER_FEEDBACK", type: "PRICE_MATCH", createdAt: daysAgo(5) },
      { listingId: l.id, source: "USER_FEEDBACK", type: "CONDITION_MATCH", createdAt: daysAgo(6) },
      { listingId: l.id, source: "USER_FEEDBACK", type: "STILL_AVAILABLE", createdAt: daysAgo(3) },
      { listingId: l.id, source: "RATING", type: "RATING", rating: 5, createdAt: daysAgo(4) },
      { listingId: l.id, source: "COMMENT", type: "COMMENT", comment: "Exactly as described, office was responsive.", createdAt: daysAgo(4) }
    );
  }

  // Karrada Real Estate Group: mixed signals.
  const karradaApt = byTitle("2BR Apartment in Karrada Dakhil");
  signals.push(
    { listingId: karradaApt.id, source: "USER_FEEDBACK", type: "PRICE_MATCH", createdAt: daysAgo(10) },
    { listingId: karradaApt.id, source: "USER_FEEDBACK", type: "CONDITION_MISMATCH", comment: "Bathroom needed repairs not mentioned in listing", createdAt: daysAgo(9) },
    { listingId: karradaApt.id, source: "RATING", type: "RATING", rating: 3, createdAt: daysAgo(9) }
  );
  const karradaTopFloor = byTitle("3BR Apartment, Karrada");
  signals.push(
    { listingId: karradaTopFloor.id, source: "USER_FEEDBACK", type: "STILL_AVAILABLE", createdAt: daysAgo(15) },
    { listingId: karradaTopFloor.id, source: "RATING", type: "RATING", rating: 4, createdAt: daysAgo(14) }
  );

  // Baghdad Gate Realty: pattern of reality mismatches — this is the office
  // the trust score / "reality check" feature should visibly flag.
  const jadriyaApt = byTitle("2BR Apartment in Jadriya");
  signals.push(
    { listingId: jadriyaApt.id, source: "USER_FEEDBACK", type: "PRICE_MISMATCH", comment: "Office asked for $600 in person, not the $500 listed", createdAt: daysAgo(2) },
    { listingId: jadriyaApt.id, source: "USER_FEEDBACK", type: "CONDITION_MISMATCH", comment: "Not renovated at all, old fixtures", createdAt: daysAgo(2) },
    { listingId: jadriyaApt.id, source: "RATING", type: "RATING", rating: 1, createdAt: daysAgo(2) },
    { listingId: jadriyaApt.id, source: "COMMENT", type: "COMMENT", comment: "Felt misleading, would not recommend.", createdAt: daysAgo(2) }
  );
  const doraApt = byTitle("2BR Apartment, Dora");
  signals.push(
    { listingId: doraApt.id, source: "USER_FEEDBACK", type: "UNAVAILABLE", comment: "Already rented out when I called", createdAt: daysAgo(1) },
    { listingId: doraApt.id, source: "OFFICE_PASSIVE", type: "PRICE_MISMATCH", comment: "Listing price changed twice in one week", createdAt: daysAgo(7) }
  );
  const kadhimiyaApt = byTitle("Apartment in Kadhimiya");
  signals.push(
    { listingId: kadhimiyaApt.id, source: "USER_FEEDBACK", type: "PRICE_MISMATCH", createdAt: daysAgo(20) },
    { listingId: kadhimiyaApt.id, source: "RATING", type: "RATING", rating: 2, createdAt: daysAgo(20) }
  );

  await db.trustSignal.createMany({ data: signals });

  console.log(`Seeded ${listings.length} listings, 3 offices, 3 end users, ${signals.length} trust signals.`);
  console.log("Demo user IDs:");
  console.log(`  Ahmed Al-Rashid (renter, has preferences): ${ahmed.id}`);
  console.log(`  Layla Hassan (buyer, has preferences): ${layla.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
