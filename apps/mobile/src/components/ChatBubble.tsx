import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ChatMessage, ListingWithTrust } from "../types";
import { ListingCard } from "./ListingCard";

interface Props {
  message: ChatMessage;
  onListingPress: (listing: ListingWithTrust) => void;
}

export function ChatBubble({ message, onListingPress }: Props) {
  const isUser = message.role === "USER";
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={isUser ? styles.textUser : styles.textAssistant}>{message.content}</Text>
      </View>
      {!isUser && message.matches && message.matches.length > 0 && (
        <FlatList
          data={message.matches}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.matchList}
          renderItem={({ item }) => (
            <View style={styles.matchCardWrap}>
              <ListingCard listing={item} onPress={onListingPress} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 6,
    paddingHorizontal: 12,
  },
  rowUser: {
    alignItems: "flex-end",
  },
  rowAssistant: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "85%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: "#0F766E",
  },
  bubbleAssistant: {
    backgroundColor: "#F3F4F6",
  },
  textUser: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  textAssistant: {
    color: "#111827",
    fontSize: 15,
  },
  matchList: {
    gap: 10,
    paddingVertical: 8,
    paddingRight: 12,
  },
  matchCardWrap: {
    width: 240,
  },
});
