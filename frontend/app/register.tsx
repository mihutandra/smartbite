import { Ionicons } from "@expo/vector-icons";
import { Link, Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

type InputFieldProps = {
  label: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  onToggleVisibility?: () => void;
  isPasswordVisible?: boolean;
  keyboardType?: "default" | "phone-pad" | "email-address";
};

function InputField({
  label,
  placeholder,
  icon,
  value,
  onChangeText,
  secureTextEntry,
  showToggle,
  onToggleVisibility,
  isPasswordVisible,
  keyboardType = "default",
}: InputFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={icon} size={22} color="#82321866" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#82321866"
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {showToggle ? (
          <Pressable onPress={onToggleVisibility} hitSlop={10}>
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#82321866"
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordChecks = getPasswordChecks(password);
  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);
  const isConfirmTouched = confirmPassword.length > 0;
  const doPasswordsMatch = password === confirmPassword;
  const isFormValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    isPasswordStrong &&
    doPasswordsMatch;

  function handleSignup() {
    if (!isPasswordStrong) {
      Alert.alert("Parola invalida", "Parola trebuie sa respecte toate regulile afisate.");
      return;
    }

    if (!doPasswordsMatch) {
      Alert.alert("Eroare", "Parolele nu se potrivesc.");
      return;
    }

    Alert.alert("Succes", "Cont creat cu succes!", [
      {
        text: "OK",
        onPress: () => router.push("/login"),
      },
    ]);
  }

  return (
    <View style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#E98D44" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.screen}>
          <View style={styles.card}>
            <View style={[styles.hero, { paddingTop: insets.top + 20 }]}>
              <View style={styles.heroCircle} />
              <Text style={styles.title}>Alatura-te noua!</Text>
              <Text style={styles.subtitle}>Creeaza-ti contul SmartBite</Text>
            </View>

            <View style={styles.form}>
              <InputField
                label="NUME COMPLET"
                placeholder="Numele tau"
                icon="person-outline"
                value={fullName}
                onChangeText={setFullName}
              />

              <InputField
                label="EMAIL"
                placeholder="email@exemplu.com"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <InputField
                label="PAROLA"
                placeholder="Parola ta"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                showToggle
                onToggleVisibility={() => setShowPassword((current) => !current)}
                isPasswordVisible={showPassword}
              />

              <View style={styles.passwordChecklist}>
                {PASSWORD_RULES.map((rule) => {
                  const passed = passwordChecks[rule.key];

                  return (
                    <View key={rule.key} style={styles.ruleRow}>
                      <Ionicons
                        name={passed ? "checkmark-circle" : "ellipse-outline"}
                        size={18}
                        color={passed ? "#2F7E4E" : "#B48773"}
                      />
                      <Text style={[styles.ruleText, passed && styles.ruleTextPassed]}>
                        {rule.label}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <InputField
                label="CONFIRMA PAROLA"
                placeholder="Confirma parola"
                icon="lock-closed-outline"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                showToggle
                onToggleVisibility={() => setShowConfirmPassword((current) => !current)}
                isPasswordVisible={showConfirmPassword}
              />

              {isConfirmTouched ? (
                <View style={styles.matchRow}>
                  <Ionicons
                    name={doPasswordsMatch ? "checkmark-circle" : "close-circle"}
                    size={18}
                    color={doPasswordsMatch ? "#2F7E4E" : "#C1512A"}
                  />
                  <Text
                    style={[
                      styles.matchText,
                      doPasswordsMatch ? styles.matchTextSuccess : styles.matchTextError,
                    ]}
                  >
                    {doPasswordsMatch
                      ? "Parolele se potrivesc."
                      : "Parolele nu se potrivesc."}
                  </Text>
                </View>
              ) : null}

              <Pressable
                style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
                onPress={handleSignup}
                disabled={!isFormValid}
              >
                <Text style={styles.primaryButtonText}>Creeaza cont</Text>
              </Pressable>

              <View style={styles.footerTextRow}>
                <Text style={styles.footerText}>Ai deja cont? </Text>
                <Link href="/login" asChild>
                  <Pressable>
                    <Text style={styles.footerLink}>Conecteaza-te</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F3E8",
  },
  scrollContent: {
    flexGrow: 1,
  },
  screen: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: "#F7F3E8",
    overflow: "hidden",
  },
  hero: {
    position: "relative",
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: "#E98D44",
    shadowColor: "#C6782D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 12,
  },
  heroCircle: {
    position: "absolute",
    top: -28,
    right: -24,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#2F6B45",
    opacity: 0.2,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    color: "#FFF4E6",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  fieldGroup: {
    marginBottom: 30,
  },
  label: {
    marginBottom: 10,
    color: "#2D2013",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  inputWrapper: {
    minHeight: 60,
    borderWidth: 2,
    borderColor: "#F4C88A",
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  input: {
    flex: 1,
    color: "#2D2013",
    fontSize: 17,
    fontWeight: "600",
  },
  passwordChecklist: {
    marginTop: -18,
    marginBottom: 22,
    paddingLeft: 4,
    gap: 8,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ruleText: {
    marginLeft: 8,
    color: "#8A6C5B",
    fontSize: 14,
    fontWeight: "500",
  },
  ruleTextPassed: {
    color: "#2F7E4E",
    fontWeight: "700",
  },
  matchRow: {
    marginTop: -18,
    marginBottom: 22,
    paddingLeft: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  matchText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  matchTextSuccess: {
    color: "#2F7E4E",
  },
  matchTextError: {
    color: "#C1512A",
  },
  primaryButton: {
    marginTop: 8,
    minHeight: 62,
    borderRadius: 18,
    backgroundColor: "#3B8456",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#2F6B45",
    shadowColor: "#2B6A44",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: "#91B39D",
    borderColor: "#7C9D87",
    shadowOpacity: 0.12,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  footerTextRow: {
    marginTop: 34,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerText: {
    color: "#6B5947",
    fontSize: 16,
    fontWeight: "500",
  },
  footerLink: {
    color: "#2F7E4E",
    fontSize: 16,
    fontWeight: "900",
  },
});
