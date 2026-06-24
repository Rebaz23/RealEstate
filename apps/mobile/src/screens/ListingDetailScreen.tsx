import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getListing, getOffice, OfficeDetail, qualifyLead } from "../api/client";
import { TrustBadge } from "../components/TrustBadge";
import { SearchStackParamList } from "../navigation/types";
import { useChatSession } from "../state/ChatSessionContext";
import { ListingWithTrust } from "../types";

type Props = NativeStackScreenProps<SearchStackParamList, "ListingDetail">;

export function ListingDetailScreen({ route, navigation }: Props) {
  const { listingId } = route.params;
  const { conversationId } = useChatSession();
  const [listing, setListing] = useState<ListingWithTrust | null>(null);
  const [office, setOffice] = useState<OfficeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactRequested, setContactRequested] = useState(false);
  const [qualifyNote, setQualifyNote] = useState<string | null>(null);

  useEffect(() => {
    getListing(listingId)
      .then(setListing)
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [listingId]);

  async function handleContactOffice() {
    if (!listing) return;
    setContactRequested(true);

    if (!office) {
      try {
        setOffice(await getOffice(listing.officeId));
      } catch {
        // Office lookup failing shouldn't block the user from seeing whatever we already have.
      }
    }

    if (conversationId) {
      qualifyLead(conversationId, listing.id)
        .then(() => setQualifyNote("We've shared your interest with the office, including what you told the AI agent."))
        .catch(() => setQualifyNote(null));
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't load this listing.</Text>
      </View>
    );
  }

  const priceLabel =
    listing.type === "RENT"
      ? `${listing.currency} ${listing.price.toLocaleString()}/mo`
      : `${listing.currency} ${listing.price.toLocaleString()}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{listing.title}</Text>
      <Text style={styles.price}>{priceLabel}</Text>

      <TrustBadge score={listing.trustScore} signalCount={listing.trustSignalCount} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Details</Text>
        <Text style={styles.detailLine}>
          {listing.neighborhood}, {listing.city} · {listing.bedrooms} bed · {listing.bathrooms} bath · {listing.areaSqm} m²
        </Text>
        <Text style={styles.detailLine}>Office-stated condition: {listing.officeStatedCondition}</Text>
        <Text style={styles.detailLine}>Listed by {listing.office.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.description}>{listing.description}</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleContactOffice}>
        <Text style={styles.primaryButtonText}>Contact office</Text>
      </TouchableOpacity>

      {contactRequested && office && (
        <View style={styles.contactCard}>
          <Text style={styles.detailLine}>{office.name}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${office.phone}`)}>
            <Text style={styles.link}>{office.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${office.email}`)}>
            <Text style={styles.link}>{office.email}</Text>
          </TouchableOpacity>
          {qualifyNote && <Text style={styles.qualifyNote}>{qualifyNote}</Text>}
        </View>
      )}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("Feedback", { listingId: listing.id })}
      >
        <Text style={styles.secondaryButtonText}>I viewed this in person — leave feedback</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 16,
    gap: 14,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#DC2626",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F766E",
    marginTop: -8,
  },
  section: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  detailLine: {
    fontSize: 14,
    color: "#374151",
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#0F766E",
    fontWeight: "600",
    fontSize: 15,
  },
  contactCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  link: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "600",
  },
  qualifyNote: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
});
