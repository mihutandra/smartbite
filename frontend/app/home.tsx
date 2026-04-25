import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.card}>
        <View style={styles.badge}>
          <Feather name="check" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Te-ai conectat cu succes</Text>
        <Text style={styles.subtitle}>
          Acesta este ecranul de home provizoriu pana conectam restul fluxului din aplicatie.
        </Text>

        <Link href="/login" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Inapoi la login</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F5EE",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 28,
    alignItems: "center",
    shadowColor: "#4A413B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5D9B68",
    marginBottom: 18,
  },
  title: {
    color: "#423B35",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    color: "#72665C",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    marginTop: 24,
    minHeight: 48,
    minWidth: 180,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F68B2F",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
