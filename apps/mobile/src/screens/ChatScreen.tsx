import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ApiError, sendChatMessage } from "../api/client";
import { ChatBubble } from "../components/ChatBubble";
import { SearchStackParamList } from "../navigation/types";
import { useChatSession } from "../state/ChatSessionContext";
import { useUser } from "../state/UserContext";
import { ChatMessage, ListingWithTrust } from "../types";

type Props = NativeStackScreenProps<SearchStackParamList, "Chat">;

let nextLocalId = 0;
function localId(): string {
  nextLocalId += 1;
  return `local-${nextLocalId}`;
}

export function ChatScreen({ navigation }: Props) {
  const { user } = useUser();
  const { conversationId, setConversationId } = useChatSession();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: localId(),
      role: "ASSISTANT",
      content: "Hi! Tell me what you're looking for — buy or rent, budget, and a neighborhood — and I'll find real matches for you.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const handleListingPress = useCallback(
    (listing: ListingWithTrust) => {
      navigation.navigate("ListingDetail", { listingId: listing.id });
    },
    [navigation]
  );

  async function handleSend() {
    const text = draft.trim();
    if (!text || !user || sending) return;

    setMessages((prev) => [...prev, { id: localId(), role: "USER", content: text }]);
    setDraft("");
    setSending(true);

    try {
      const result = await sendChatMessage(user.id, text, conversationId ?? undefined);
      setConversationId(result.conversationId);
      setMessages((prev) => [
        ...prev,
        { id: localId(), role: "ASSISTANT", content: result.reply, matches: result.matches },
      ]);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the AI agent. Check your connection and try again.";
      setMessages((prev) => [...prev, { id: localId(), role: "ASSISTANT", content: message }]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} onListingPress={handleListingPress} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2 bedroom rental in Karrada under $600"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, (sending || !draft.trim()) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={sending || !draft.trim()}
        >
          {sending ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.sendButtonText}>Send</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listContent: {
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: "#0F766E",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 64,
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
