import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { ChatSessionProvider } from "./src/state/ChatSessionContext";
import { UserProvider, useUser } from "./src/state/UserContext";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";

function Root() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.flex}>
        <OnboardingScreen />
      </SafeAreaView>
    );
  }

  return (
    <ChatSessionProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ChatSessionProvider>
  );
}

export default function App() {
  return (
    <UserProvider>
      <StatusBar style="auto" />
      <Root />
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
