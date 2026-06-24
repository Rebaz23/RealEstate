import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ListingWithTrust } from "../types";
import { TrustBadge } from "./TrustBadge";

interface Props {
  listing: ListingWithTrust;
  onPress: (listing: ListingWithTrust) => void;
}

function formatPrice(listing: ListingWithTrust): string {
  const amount = listing.price.toLocaleString();
  return listing.type === "RENT" ? `${listing.currency} ${amount}/mo` : `${listing.currency} ${amount}`;
}

export function ListingCard({ listing, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => onPress(listing)}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>
        <TrustBadge score={listing.trustScore} signalCount={listing.trustSignalCount} compact />
      </View>
      <Text style={styles.subtitle}>
        {listing.neighborhood} · {listing.bedrooms} bed · {listing.bathrooms} bath · {listing.areaSqm} m²
      </Text>
      <View style={styles.footerRow}>
        <Text style={styles.price}>{formatPrice(listing)}</Text>
        <Text style={styles.office} numberOfLines={1}>
          {listing.office.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F766E",
  },
  office: {
    fontSize: 12,
    color: "#9CA3AF",
    flexShrink: 1,
    marginLeft: 8,
  },
});
