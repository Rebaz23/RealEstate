import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Text } from "react-native";
import { ChatScreen } from "../screens/ChatScreen";
import { FeedbackScreen } from "../screens/FeedbackScreen";
import { ListingDetailScreen } from "../screens/ListingDetailScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { NotificationsStackParamList, SearchStackParamList, TabParamList } from "./types";

const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const NotificationsStack = createNativeStackNavigator<NotificationsStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator initialRouteName="Chat">
      <SearchStack.Screen name="Chat" component={ChatScreen} options={{ title: "AI Agent" }} />
      <SearchStack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: "Listing" }} />
      <SearchStack.Screen name="Feedback" component={FeedbackScreen} options={{ title: "Leave Feedback" }} />
    </SearchStack.Navigator>
  );
}

function NotificationsStackNavigator() {
  return (
    <NotificationsStack.Navigator initialRouteName="Notifications">
      <NotificationsStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notifications" }} />
      <NotificationsStack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: "Listing" }} />
      <NotificationsStack.Screen name="Feedback" component={FeedbackScreen} options={{ title: "Leave Feedback" }} />
    </NotificationsStack.Navigator>
  );
}

function tabIcon(symbol: string) {
  return () => <Text style={{ fontSize: 18 }}>{symbol}</Text>;
}

export function RootNavigator() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="SearchTab"
        component={SearchStackNavigator}
        options={{ title: "Search", tabBarIcon: tabIcon("💬") }}
      />
      <Tabs.Screen
        name="NotificationsTab"
        component={NotificationsStackNavigator}
        options={{ title: "Alerts", tabBarIcon: tabIcon("🔔") }}
      />
      <Tabs.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: "Profile", tabBarIcon: tabIcon("👤"), headerShown: true }}
      />
    </Tabs.Navigator>
  );
}
