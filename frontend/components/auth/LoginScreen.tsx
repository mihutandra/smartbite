import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.hero, { paddingTop: insets.top + 18 }]}> 
        <View style={styles.heroCircleLarge} />
        <View style={styles.heroCircleSmall} />
        <Text style={styles.heroTitle}>Bine ai venit!</Text>
        <Text style={styles.heroSubtitle}>
          Conecteaza-te la contul tau SmartBite
        </Text>
      </View>

      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.keyboardArea}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>EMAIL</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="mail" size={18} color="#D9BCB0" />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    placeholder="email@exemplu.com"
                    placeholderTextColor="#D9BCB0"
                    style={styles.input}
                    value={email}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>PAROLA</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={18} color="#D9BCB0" />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={setPassword}
                    placeholder="Parola ta"
                    placeholderTextColor="#D9BCB0"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    value={password}
                  />
                  <Pressable
                    accessibilityLabel={
                      showPassword ? "Ascunde parola" : "Afiseaza parola"
                    }
                    hitSlop={10}
                    onPress={() => setShowPassword((current) => !current)}
                  >
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={18}
                      color="#D9BCB0"
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Conecteaza-te</Text>
              </Pressable>

              <View style={styles.footerTextRow}>
                <Text style={styles.footerText}>Nu ai cont? </Text>
                <Link href="/register" asChild>
                  <Pressable>
                    <Text style={styles.footerLink}>Inregistreaza-te</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },
  keyboardArea: {
    flex: 1,
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: "center",
    backgroundColor: "#F28B31",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#B86E2B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  heroCircleLarge: {
    position: "absolute",
    top: -32,
    right: -16,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(230, 186, 113, 0.45)",
  },
  heroCircleSmall: {
    position: "absolute",
    bottom: -28,
    left: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 214, 153, 0.28)",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  heroSubtitle: {
    marginTop: 8,
    color: "#FFE5C4",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  content: {
    flexGrow: 1,
    paddingTop: 22,
    paddingHorizontal: 16,
    paddingBottom: 34,
  },
  form: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 10,
    color: "#423B35",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  inputWrapper: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#F1C98F",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: "#53463A",
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    marginTop: 6,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#5D9B68",
    shadowColor: "#3E6A46",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  footerTextRow: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    color: "#72665C",
    fontSize: 14,
    fontWeight: "500",
  },
  footerLink: {
    color: "#3F7D4D",
    fontSize: 14,
    fontWeight: "800",
  },
});
