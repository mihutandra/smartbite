import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavBar } from "../components/BottomNavBar";
import { useAuth } from "../context/auth-context";
import { useLocation } from "../context/location-context";
import { type UpdateProfilePayload, type UserProfile } from "../types/auth";
import { formatShortDate } from "../utils/product_detail";

export default function PersonalInfoScreen() {
  const insets = useSafeAreaInsets();
  const { status, updateProfile, user } = useAuth();
  const { requestUserLocation } = useLocation();
  const [form, setForm] = useState<ProfileFormState>(() => createFormState(user));
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [feedback, setFeedback] = useState<ProfileFeedback | null>(null);

  useEffect(() => {
    setForm(createFormState(user));
    setIsEditing(false);
  }, [user]);

  const hasChanges = useMemo(() => {
    if (!user) {
      return false;
    }

    return (
      form.name.trim() !== user.name ||
      form.email.trim() !== user.email ||
      normalizeOptionalInput(form.phone) !== user.phone
    );
  }, [form, user]);

  if (status === "loading") {
    return (
      <SafeAreaView style={styles.loadingScreen} edges={["top", "left", "right", "bottom"]}>
        <ActivityIndicator color="#5D9B68" size="large" />
      </SafeAreaView>
    );
  }

  if (status !== "authenticated" || !user) {
    return <Redirect href="/login" />;
  }

  const currentUser = user;

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setFeedback(null);
  }

  function startEditing() {
    setForm(createFormState(currentUser));
    setFeedback(null);
    setIsEditing(true);
  }

  function resetForm() {
    setForm(createFormState(currentUser));
    setFeedback(null);
    setIsEditing(false);
  }

  async function saveProfile() {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName) {
      setFeedback({ type: "error", message: "Numele este obligatoriu." });
      return;
    }

    if (!trimmedEmail) {
      setFeedback({ type: "error", message: "Emailul este obligatoriu." });
      return;
    }

    const payload: UpdateProfilePayload = {
      name: trimmedName,
      email: trimmedEmail,
      phone: normalizeOptionalInput(form.phone),
    };

    setIsSaving(true);
    setFeedback(null);

    try {
      await updateProfile(payload);
      setFeedback({ type: "success", message: "Profilul a fost actualizat." });
      setIsEditing(false);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Nu am putut actualiza profilul.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function updateCurrentLocation() {
    setIsUpdatingLocation(true);
    setFeedback(null);

    try {
      const nextLocation = await requestUserLocation({ waitForProfileSync: true });

      if (!nextLocation) {
        setFeedback({
          type: "error",
          message: "Nu am putut actualiza locatia. Verifica permisiunea pentru locatie.",
        });
        return;
      }

      setFeedback({ type: "success", message: "Locatia a fost actualizata." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Nu am putut actualiza locatia.",
      });
    } finally {
      setIsUpdatingLocation(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      <StatusBar style="light" />

      <View style={styles.deviceShell}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.hero, { paddingTop: insets.top + 18 }]}>
            <View style={styles.heroCircleLarge} />
            <View style={styles.heroCircleSmall} />

            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Feather color="#FFFFFF" name="arrow-left" size={20} />
            </Pressable>

            <View style={styles.avatar}>
              <Feather color="#111111" name="user" size={42} />
            </View>
            <Text numberOfLines={1} style={styles.heroTitle}>
              {user.name}
            </Text>
            <Text numberOfLines={1} style={styles.heroSubtitle}>
              {user.email}
            </Text>
          </View>

          <View style={styles.body}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLabel}>
                <Text style={styles.sectionLabelText}>SETARI PROFIL</Text>
              </View>

              {!isEditing ? (
                <Pressable onPress={startEditing} style={styles.editButton}>
                  <Feather color="#4F9465" name="edit-2" size={16} />
                  <Text style={styles.editButtonText}>Editeaza</Text>
                </Pressable>
              ) : null}
            </View>

            {isEditing ? (
              <View style={styles.formGroup}>
                <EditableInfoRow
                  icon="user"
                  label="Nume"
                  onChangeText={(value) => updateField("name", value)}
                  placeholder="Numele tau"
                  value={form.name}
                />
                <View style={styles.divider} />
                <EditableInfoRow
                  autoCapitalize="none"
                  icon="mail"
                  keyboardType="email-address"
                  label="Email"
                  onChangeText={(value) => updateField("email", value)}
                  placeholder="email@exemplu.ro"
                  value={form.email}
                />
                <View style={styles.divider} />
                <EditableInfoRow
                  icon="phone"
                  keyboardType="phone-pad"
                  label="Telefon"
                  onChangeText={(value) => updateField("phone", value)}
                  placeholder="Necompletat"
                  value={form.phone}
                />
              </View>
            ) : (
              <View style={styles.infoGroup}>
                <InfoRow icon="user" label="Nume" value={user.name} />
                <View style={styles.divider} />
                <InfoRow icon="mail" label="Email" value={user.email} />
                <View style={styles.divider} />
                <InfoRow icon="phone" label="Telefon" value={user.phone || "Necompletat"} />
              </View>
            )}

            {feedback ? (
              <View
                style={[
                  styles.feedbackBox,
                  feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError,
                ]}
              >
                <Feather
                  color={feedback.type === "success" ? "#3F7A55" : "#B85432"}
                  name={feedback.type === "success" ? "check-circle" : "alert-circle"}
                  size={17}
                />
                <Text
                  style={[
                    styles.feedbackText,
                    feedback.type === "success" ? styles.feedbackSuccessText : styles.feedbackErrorText,
                  ]}
                >
                  {feedback.message}
                </Text>
              </View>
            ) : null}

            {isEditing ? (
              <View style={styles.actionsRow}>
                <Pressable
                  disabled={isSaving}
                  onPress={resetForm}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    isSaving && styles.disabledButton,
                    pressed ? styles.pressedButton : null,
                  ]}
                >
                  <Feather color="#6E5C50" name="x" size={17} />
                  <Text style={styles.secondaryButtonText}>Anuleaza</Text>
                </Pressable>

                <Pressable
                  disabled={!hasChanges || isSaving}
                  onPress={() => void saveProfile()}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (!hasChanges || isSaving) && styles.disabledButton,
                    pressed && hasChanges ? styles.pressedButton : null,
                  ]}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Feather color="#FFFFFF" name="save" size={17} />
                  )}
                  <Text style={styles.primaryButtonText}>
                    {isSaving ? "Se salveaza" : "Salveaza"}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.sectionLabel}>
              <Text style={styles.sectionLabelText}>LOCATIE</Text>
            </View>

            <View style={styles.infoGroup}>
              <InfoRow icon="map-pin" label="Locatie curenta" value={user.location || "Necompletata"} />
              <View style={styles.divider} />
              <Pressable
                disabled={isUpdatingLocation}
                onPress={() => void updateCurrentLocation()}
                style={({ pressed }) => [
                  styles.locationAction,
                  isUpdatingLocation && styles.disabledButton,
                  pressed ? styles.pressedButton : null,
                ]}
              >
                {isUpdatingLocation ? (
                  <ActivityIndicator color="#4F9465" size="small" />
                ) : (
                  <View style={styles.infoIcon}>
                    <Feather color="#4E8B5B" name="crosshair" size={18} />
                  </View>
                )}
                <View style={styles.infoTextBlock}>
                  <Text style={styles.infoLabel}>Actualizare</Text>
                  <Text style={styles.infoValue}>
                    {isUpdatingLocation ? "Se actualizeaza locatia..." : "Foloseste locatia dispozitivului"}
                  </Text>
                </View>
                <Feather color="#D8BDA5" name="chevron-right" size={20} />
              </Pressable>
            </View>

            <View style={styles.sectionLabel}>
              <Text style={styles.sectionLabelText}>CONT</Text>
            </View>

            <View style={styles.infoGroup}>
              <InfoRow icon="calendar" label="Creat la" value={formatShortDate(user.created_at)} />
              <View style={styles.divider} />
              <InfoRow icon="refresh-ccw" label="Actualizat la" value={formatShortDate(user.updated_at)} />
            </View>
          </View>
        </ScrollView>

        <BottomNavBar
          activeTab="profile"
          onTabPress={(tab) => {
            if (tab === "home") {
              router.replace("/home" as never);
              return;
            }

            if (tab === "map") {
              router.replace("/home?view=map" as never);
              return;
            }

            if (tab === "search") {
              router.push("/search" as never);
              return;
            }

            if (tab === "cart") {
              router.push("/cart" as never);
              return;
            }

            router.replace("/profile" as never);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

type ProfileFormState = {
  email: string;
  name: string;
  phone: string;
};

type ProfileFeedback = {
  message: string;
  type: "error" | "success";
};

type InfoRowProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
};

type EditableInfoRowProps = {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  icon: keyof typeof Feather.glyphMap;
  keyboardType?: "default" | "email-address" | "phone-pad";
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

function EditableInfoRow({
  autoCapitalize = "sentences",
  icon,
  keyboardType = "default",
  label,
  onChangeText,
  placeholder,
  value,
}: EditableInfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Feather color="#4E8B5B" name={icon} size={18} />
      </View>
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoLabel}>{label}</Text>
        <TextInput
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B8A390"
          style={styles.infoInput}
          value={value}
        />
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Feather color="#4E8B5B" name={icon} size={18} />
      </View>
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text numberOfLines={2} style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function createFormState(user: UserProfile | null): ProfileFormState {
  return {
    email: user?.email ?? "",
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  };
}

function normalizeOptionalInput(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue || null;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },
  deviceShell: {
    flex: 1,
    backgroundColor: "#FFFDF8",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    marginHorizontal: 14,
    minHeight: 260,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: "#4F9465",
    paddingHorizontal: 24,
    paddingBottom: 28,
    shadowColor: "#376747",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 22,
    elevation: 10,
  },
  heroCircleLarge: {
    position: "absolute",
    top: -36,
    right: -28,
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: "rgba(236, 191, 120, 0.26)",
  },
  heroCircleSmall: {
    position: "absolute",
    bottom: -44,
    left: -34,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  backButton: {
    alignSelf: "flex-start",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    marginBottom: 10,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
  },
  heroTitle: {
    marginTop: 14,
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },
  heroSubtitle: {
    marginTop: 6,
    color: "#FFF8EC",
    fontSize: 13,
    fontWeight: "800",
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  sectionHeaderRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionLabel: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#F1C790",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  sectionLabelText: {
    color: "#9D5730",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  editButton: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D9E8DC",
    backgroundColor: "#F5FBF6",
    paddingHorizontal: 12,
  },
  editButtonText: {
    color: "#4F9465",
    fontSize: 13,
    fontWeight: "900",
  },
  formGroup: {
    overflow: "hidden",
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F0E3D4",
    backgroundColor: "#FFFFFF",
    shadowColor: "#B89573",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  infoGroup: {
    overflow: "hidden",
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F0E3D4",
    backgroundColor: "#FFFFFF",
    shadowColor: "#B89573",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  infoRow: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  locationAction: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(78, 139, 91, 0.1)",
    backgroundColor: "#EAF4EE",
  },
  infoTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    color: "#A98B73",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  infoValue: {
    marginTop: 5,
    color: "#342D28",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 21,
  },
  infoInput: {
    marginTop: 4,
    minHeight: 30,
    color: "#342D28",
    fontSize: 15,
    fontWeight: "900",
    padding: 0,
  },
  feedbackBox: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  feedbackSuccess: {
    borderColor: "#C8E2D0",
    backgroundColor: "#EDF8F0",
  },
  feedbackError: {
    borderColor: "#F0C8B8",
    backgroundColor: "#FFF1EA",
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  feedbackSuccessText: {
    color: "#3F7A55",
  },
  feedbackErrorText: {
    color: "#B85432",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4F9465",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#E7D7C7",
    backgroundColor: "#FFFFFF",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryButtonText: {
    color: "#6E5C50",
    fontSize: 14,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.48,
  },
  pressedButton: {
    transform: [{ scale: 0.98 }],
  },
  divider: {
    height: 2,
    backgroundColor: "#F0E3D4",
  },
});
