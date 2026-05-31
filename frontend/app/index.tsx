import { Redirect } from "expo-router";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { useAuth } from "../context/auth-context";

const smartbiteLogo = require("../assets/images/smartbite-logo-dairy-savings.png");

export default function Index() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <View style={styles.loadingScreen}>
        <Image source={smartbiteLogo} style={styles.logo} resizeMode="contain" />
        <ActivityIndicator size="large" color="#5D9B68" />
      </View>
    );
  }

  return <Redirect href={status === "authenticated" ? "/home" : "/login"} />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    backgroundColor: "#FFF9F0",
  },
  logo: {
    width: 180,
    height: 180,
  },
});
