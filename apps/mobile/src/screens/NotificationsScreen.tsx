import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { getNotifications, markNotificationRead } from "../api/client";
import { NotificationsStackParamList } from "../navigation/types";
import { useUser } from "../state/UserContext";
import { AppNotification } from "../types";

type Props = NativeStackScreenProps<NotificationsStackParamList, "Notifications">;

export function NotificationsScreen({ navigation }: Props) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const data = await getNotifications(user.id);
    setNotifications(data);
  }, [user]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handlePress(notification: AppNotification) {
    if (!notification.read) {
      markNotificationRead(notification.id).catch(() => undefined);
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    }
    navigation.navigate("ListingDetail", { listingId: notification.listingId });
  }

  if (!loading && notifications.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>
          No matches yet. Set your preferences in Profile so we can notify you about new listings.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      renderItem={({ item }) => (
        <Pressable style={[styles.row, !item.read && styles.rowUnread]} onPress={() => handlePress(item)}>
          {!item.read && <View style={styles.dot} />}
          <View style={styles.rowContent}>
            <Text style={styles.reason}>{item.reason}</Text>
            <Text style={styles.listingLine}>
              {item.listing.title} · {item.listing.price.toLocaleString()}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  listContent: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 10,
  },
  rowUnread: {
    backgroundColor: "#F0FDFA",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0F766E",
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  reason: {
    fontSize: 14,
    color: "#111827",
  },
  listingLine: {
    fontSize: 12,
    color: "#6B7280",
  },
});
