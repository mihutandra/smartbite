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

const PASSWORD_RULES = [
  { key: "length", label: "Cel putin 8 caractere" },
  { key: "uppercase", label: "O litera mare" },
  { key: "lowercase", label: "O litera mica" },
  { key: "number", label: "Un numar" },
  { key: "special", label: "Un caracter special" },
] as const;

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export default function RegisterScreen() {
  const router = useRouter();
  const { error, isAuthenticated, signUp, status } = useAuth();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = getPasswordChecks(password);
  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);
  const isConfirmTouched = confirmPassword.length > 0;
  const doPasswordsMatch = password === confirmPassword;
  const isFormValid =
    fullName.trim().length > 0 &&
    phone.trim().length >= 5 &&
    email.trim().length > 0 &&
    isPasswordStrong &&
    doPasswordsMatch;

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

  async function handleRegister() {
    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await signUp({
        name: fullName,
        email,
        password,
        phone,
      });

      router.replace("/login");
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
        <Text style={styles.heroTitle}>Alatura-te noua!</Text>
        <Text style={styles.heroSubtitle}>Creeaza-ti contul SmartBite</Text>
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
                <Text style={styles.label}>NUME COMPLET</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="user" size={18} color="#D9BCB0" />
                  <TextInput
                    autoCorrect={false}
                    onChangeText={setFullName}
                    placeholder="Numele tau"
                    placeholderTextColor="#D9BCB0"
                    style={styles.input}
                    value={fullName}
                  />
                </View>
              </View>

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
                <Text style={styles.label}>NUMAR DE TELEFON</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="phone" size={18} color="#D9BCB0" />
                  <TextInput
                    autoCorrect={false}
                    keyboardType="phone-pad"
                    onChangeText={setPhone}
                    placeholder="07xxxxxxxx"
                    placeholderTextColor="#D9BCB0"
                    style={styles.input}
                    value={phone}
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

              <View style={styles.helperBlock}>
                {PASSWORD_RULES.map((rule) => {
                  const passed = passwordChecks[rule.key];

                  return (
                    <View key={rule.key} style={styles.helperRow}>
                      <Feather
                        name={passed ? "check-circle" : "circle"}
                        size={14}
                        color={passed ? "#3F7D4D" : "#B79C8E"}
                      />
                      <Text style={[styles.helperText, passed && styles.helperTextSuccess]}>
                        {rule.label}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CONFIRMA PAROLA</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={18} color="#D9BCB0" />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirma parola"
                    placeholderTextColor="#D9BCB0"
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
                    value={confirmPassword}
                  />
                  <Pressable
                    accessibilityLabel={
                      showConfirmPassword
                        ? "Ascunde confirmarea parolei"
                        : "Afiseaza confirmarea parolei"
                    }
                    hitSlop={10}
                    onPress={() => setShowConfirmPassword((current) => !current)}
                  >
                    <Feather
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={18}
                      color="#D9BCB0"
                    />
                  </Pressable>
                </View>
              </View>

              {isConfirmTouched ? (
                <View style={styles.helperRow}>
                  <Feather
                    name={doPasswordsMatch ? "check-circle" : "x-circle"}
                    size={14}
                    color={doPasswordsMatch ? "#3F7D4D" : "#C4623B"}
                  />
                  <Text
                    style={[
                      styles.helperText,
                      doPasswordsMatch ? styles.helperTextSuccess : styles.helperTextError,
                    ]}
                  >
                    {doPasswordsMatch
                      ? "Parolele se potrivesc."
                      : "Parolele nu se potrivesc."}
                  </Text>
                </View>
              ) : null}

              <Pressable
                disabled={!isFormValid || isSubmitting}
                onPress={handleRegister}
                style={[
                  styles.button,
                  (!isFormValid || isSubmitting) && styles.buttonDisabled,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Creeaza cont</Text>
                )}
              </Pressable>

              {visibleError ? <Text style={styles.helperTextErrorBlock}>{visibleError}</Text> : null}

              <View style={styles.footerTextRow}>
                <Text style={styles.footerText}>Ai deja cont? </Text>
                <Link href="/login" asChild>
                  <Pressable>
                    <Text style={styles.footerLink}>Conecteaza-te</Text>
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
  loadingScreen: {
    flex: 1,
    backgroundColor: "#F8F5EE",
    alignItems: "center",
    justifyContent: "center",
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
  helperBlock: {
    marginTop: -6,
    marginBottom: 18,
    gap: 8,
    paddingLeft: 2,
  },
  helperRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  helperText: {
    marginLeft: 8,
    color: "#8B7A70",
    fontSize: 12,
    fontWeight: "500",
  },
  helperTextSuccess: {
    color: "#3F7D4D",
    fontWeight: "700",
  },
  helperTextError: {
    color: "#C4623B",
    fontWeight: "700",
  },
  helperTextErrorBlock: {
    marginTop: 12,
    color: "#C4623B",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
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
