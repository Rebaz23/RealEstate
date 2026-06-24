import { NativeStackScreenProps } from "@react-navigation/native-stack";
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
import { submitFeedback } from "../api/client";
import { SearchStackParamList } from "../navigation/types";
import { useUser } from "../state/UserContext";

type Props = NativeStackScreenProps<SearchStackParamList, "Feedback">;

function TriStateRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  return (
    <View style={styles.triRow}>
      <Text style={styles.triLabel}>{label}</Text>
      <View style={styles.triOptions}>
        {([
          ["Yes", true],
          ["No", false],
          ["Skip", null],
        ] as const).map(([text, optionValue]) => (
          <TouchableOpacity
            key={text}
            style={[styles.triOption, value === optionValue && styles.triOptionSelected]}
            onPress={() => onChange(optionValue)}
          >
            <Text style={[styles.triOptionText, value === optionValue && styles.triOptionTextSelected]}>
              {text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)}>
          <Text style={[styles.star, n <= value && styles.starFilled]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function FeedbackScreen({ route, navigation }: Props) {
  const { listingId } = route.params;
  const { user } = useUser();
  const [priceMatches, setPriceMatches] = useState<boolean | null>(null);
  const [conditionMatches, setConditionMatches] = useState<boolean | null>(null);
  const [stillAvailable, setStillAvailable] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      await submitFeedback({
        userId: user.id,
        listingId,
        priceMatches,
        conditionMatches,
        stillAvailable,
        rating: rating > 0 ? rating : undefined,
        comment: comment.trim() || undefined,
      });
      setDone(true);
      setTimeout(() => navigation.goBack(), 1200);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <View style={styles.centered}>
        <Text style={styles.doneText}>Thanks — this helps keep listings honest.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>How did this listing match reality?</Text>
      <Text style={styles.subheading}>
        Your answers feed directly into this listing's trust score — be honest, it helps the next person.
      </Text>

      <TriStateRow label="Was the price as listed?" value={priceMatches} onChange={setPriceMatches} />
      <TriStateRow label="Did the condition match the description?" value={conditionMatches} onChange={setConditionMatches} />
      <TriStateRow label="Was it actually still available?" value={stillAvailable} onChange={setStillAvailable} />

      <View style={styles.section}>
        <Text style={styles.triLabel}>Overall rating</Text>
        <StarRating value={rating} onChange={setRating} />
      </View>

      <View style={styles.section}>
        <Text style={styles.triLabel}>Anything else? (optional)</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="e.g. office asked for a different price in person"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Submit feedback</Text>}
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
    gap: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  doneText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16A34A",
    textAlign: "center",
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  subheading: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: -10,
  },
  triRow: {
    gap: 8,
  },
  triLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  triOptions: {
    flexDirection: "row",
    gap: 8,
  },
  triOption: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  triOptionSelected: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },
  triOptionText: {
    fontSize: 13,
    color: "#374151",
  },
  triOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  section: {
    gap: 8,
  },
  stars: {
    flexDirection: "row",
    gap: 4,
  },
  star: {
    fontSize: 28,
    color: "#D1D5DB",
  },
  starFilled: {
    color: "#F59E0B",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});
