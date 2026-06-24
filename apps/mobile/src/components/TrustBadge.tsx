import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  score: number;
  signalCount: number;
  compact?: boolean;
}

function tierFor(score: number, signalCount: number): { label: string; color: string } {
  if (signalCount === 0) return { label: "No data yet", color: "#9CA3AF" };
  if (score >= 75) return { label: "Well verified", color: "#16A34A" };
  if (score >= 40) return { label: "Mixed signals", color: "#D97706" };
  return { label: "Reports of issues", color: "#DC2626" };
}

export function TrustBadge({ score, signalCount, compact }: Props) {
  const tier = tierFor(score, signalCount);

  return (
    <View style={[styles.container, compact && styles.compact, { borderColor: tier.color }]}>
      <View style={[styles.dot, { backgroundColor: tier.color }]} />
      <Text style={[styles.score, { color: tier.color }]}>{score}</Text>
      {!compact && (
        <Text style={styles.label}>
          {tier.label}
          {signalCount > 0 ? ` · ${signalCount} signal${signalCount === 1 ? "" : "s"}` : ""}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
    gap: 6,
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  score: {
    fontWeight: "700",
    fontSize: 13,
  },
  label: {
    fontSize: 12,
    color: "#4B5563",
  },
});
