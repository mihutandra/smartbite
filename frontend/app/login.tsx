import { Feather } from "@expo/vector-icons";
import { Link, Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
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
import { useAuth } from "../context/auth-context";
import { authHeroStyles } from "../constants/auth-hero-styles";

export default function LoginScreen() {
  const router = useRouter();
  const { error, isAuthenticated, signIn, status } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();
  const isFormValid = email.trim().length > 0 && password.length > 0;

  if (status === "loading") {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#5D9B68" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  async function handleLogin() {
    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await signIn(email, password);
      router.replace("/home");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "A aparut o eroare neasteptata. Incearca din nou.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleError = errorMessage || error;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.hero, { paddingTop: insets.top + 18 }]}>
        <View style={styles.heroCircleLarge} />
        <View style={styles.heroCircleSmall} />
        <Text style={styles.heroTitle}>Bine ai venit!</Text>
        <Text style={styles.heroSubtitle}>Conecteaza-te la contul tau SmartBite</Text>
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
                    returnKeyType="next"
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
                    onSubmitEditing={handleLogin}
                    placeholder="Parola ta"
                    placeholderTextColor="#D9BCB0"
                    returnKeyType="done"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    value={password}
                  />
                  <Pressable
                    accessibilityLabel={showPassword ? "Ascunde parola" : "Afiseaza parola"}
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

              <Pressable
                disabled={!isFormValid || isSubmitting}
                onPress={handleLogin}
                style={[styles.button, (!isFormValid || isSubmitting) && styles.buttonDisabled]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Conecteaza-te</Text>
                )}
              </Pressable>

              {visibleError ? <Text style={styles.errorText}>{visibleError}</Text> : null}

              <View style={styles.footerTextRow}>
                <Text style={styles.footerText}>Nu ai cont? </Text>
                <Link href={"/register" as never} asChild>
                  <Pressable>
                    <Text style={styles.footerLink}>Inregistreaza-te</Text>
                  </Pressable>
                </Link>
              </View>

              <Link href={"/supermarket-card-preview" as never} asChild>
                <Pressable style={styles.previewButton}>
                  <Text style={styles.previewButtonText}>Vezi card preview</Text>
                </Pressable>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F5EE",
  },
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
    ...authHeroStyles.hero,
  },
  heroCircleLarge: {
    ...authHeroStyles.heroCircleLarge,
  },
  heroCircleSmall: {
    ...authHeroStyles.heroCircleSmall,
  },
  heroTitle: {
    ...authHeroStyles.heroTitle,
  },
  heroSubtitle: {
    ...authHeroStyles.heroSubtitle,
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
  buttonDisabled: {
    backgroundColor: "#98BA9E",
    shadowOpacity: 0.1,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  errorText: {
    marginTop: 12,
    color: "#C4623B",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
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
  previewButton: {
    marginTop: 16,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D8D2C8",
    backgroundColor: "#FFFCF5",
  },
  previewButtonText: {
    color: "#5C534B",
    fontSize: 14,
    fontWeight: "800",
  },
});
