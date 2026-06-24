import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { updateUserPreferences } from "../api/client";
import { useUser } from "../state/UserContext";
import { ListingType } from "../types";

export function ProfileScreen() {
  const { user, setUser } = useUser();
  const [preferredType, setPreferredType] = useState<ListingType | undefined>(user?.preferredType ?? undefined);
  const [budgetMin, setBudgetMin] = useState(user?.budgetMin?.toString() ?? "");
  const [budgetMax, setBudgetMax] = useState(user?.budgetMax?.toString() ?? "");
  const [preferredNeighborhood, setPreferredNeighborhood] = useState(user?.preferredNeighborhood ?? "");
  const [preferredBedrooms, setPreferredBedrooms] = useState(user?.preferredBedrooms?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  if (!user) return null;
  const userId = user.id;

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateUserPreferences(userId, {
        preferredType,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        preferredNeighborhood: preferredNeighborhood || undefined,
        preferredBedrooms: preferredBedrooms ? Number(preferredBedrooms) : undefined,
      });
      setUser(updated);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <Text style={styles.readOnlyLine}>{user.name}</Text>
        <Text style={styles.readOnlyLine}>{user.phone}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Match preferences</Text>
        <Text style={styles.hint}>
          We use these to notify you when a new listing fits — the more you fill in, the better the matches.
        </Text>

        <Text style={styles.fieldLabel}>Looking to</Text>
        <View style={styles.choiceRow}>
          {(["RENT", "SALE"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.choice, preferredType === t && styles.choiceSelected]}
              onPress={() => setPreferredType(t)}
            >
              <Text style={[styles.choiceText, preferredType === t && styles.choiceTextSelected]}>
                {t === "RENT" ? "Rent" : "Buy"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Budget (min / max)</Text>
        <View style={styles.choiceRow}>
          <TextInput
            style={styles.budgetInput}
            placeholder="Min"
            value={budgetMin}
            onChangeText={setBudgetMin}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.budgetInput}
            placeholder="Max"
            value={budgetMax}
            onChangeText={setBudgetMax}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.fieldLabel}>Preferred neighborhood</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Karrada"
          value={preferredNeighborhood}
          onChangeText={setPreferredNeighborhood}
        />

        <Text style={styles.fieldLabel}>Bedrooms</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2"
          value={preferredBedrooms}
          onChangeText={setPreferredBedrooms}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Save preferences</Text>}
      </TouchableOpacity>
      {savedAt && <Text style={styles.savedText}>Saved.</Text>}
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
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  readOnlyLine: {
    fontSize: 15,
    color: "#111827",
  },
  hint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
  },
  choiceRow: {
    flexDirection: "row",
    gap: 8,
  },
  choice: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  choiceSelected: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },
  choiceText: {
    fontSize: 14,
    color: "#374151",
  },
  choiceTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  budgetInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  savedText: {
    textAlign: "center",
    color: "#16A34A",
    fontSize: 13,
  },
});
