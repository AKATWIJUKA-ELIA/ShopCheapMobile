import { UserAvatar } from "@/components/UserAvatar";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { UPDATE_USER_API_URL } from "@/types/product";
import { showToast } from "@/utils/toast";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";


export default function UserProfile() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [editData, setEditData] = useState({
    username: user?.username || "",
    phone: user?.phoneNumber || "",
  });

  const displayUser = {
    name: user?.username || "Guest User",
    email: user?.email || "No email provided",
    phone: user?.phoneNumber || "Not set",
    address: "Kampala, Uganda",
  };


  const handleUpdateProfile = async () => {
    if (!user) return;
    if (!editData.username.trim()) {
      showToast("Username cannot be empty", "error");
      return;
    }

    try {
      setLoading(true);
      setLoadingStatus("Saving changes...");

      const payload = {
        User: {
          ...user,
          username: editData.username,
          phoneNumber: editData.phone,
          updatedAt: Date.now(),
        }
      };

      const res = await fetch(UPDATE_USER_API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('[Profile] Update response:', JSON.stringify(data, null, 2));

      if (res.ok && (data.success || data.succes)) {
        // Only update user if we received valid user data
        if (data.user && data.user._id) {
          console.log('[Profile] Updating user with API response');
          setUser(data.user);
        } else {
          // If API didn't return user data, update local state with our payload
          console.log('[Profile] API did not return user, updating with local data');
          setUser({
            ...user,
            username: editData.username,
            phoneNumber: editData.phone,
          });
        }
        setIsEditing(false);
        showToast("Profile updated successfully!", "success");
      } else {
        showToast(data.message || "Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      showToast("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
      setLoadingStatus("");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {Platform.OS === 'android' ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Card */}
        <View style={styles.profileSection}>
          <UserAvatar name={isEditing ? editData.username : displayUser.name} size={120} />
          <Text style={styles.userName}>{displayUser.name}</Text>
          <Text style={styles.userEmail}>{displayUser.email}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'USER'}</Text>
          </View>
        </View>

        {/* Info Items */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionLabel}>Account Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.iconBox}>
                <Feather name="user" size={18} color={colors.primary} />
              </View>
              <View style={styles.infoTexts}>
                <Text style={styles.label}>Username</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={editData.username}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, username: text }))}
                    placeholder="Enter username"
                    placeholderTextColor={colors.grayish}
                  />
                ) : (
                  <Text style={styles.value}>{displayUser.name}</Text>
                )}
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoItem}>
              <View style={styles.iconBox}>
                <Feather name="phone" size={18} color={colors.primary} />
              </View>
              <View style={styles.infoTexts}>
                <Text style={styles.label}>Phone Number</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={editData.phone}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, phone: text }))}
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.grayish}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.value}>{displayUser.phone}</Text>
                )}
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoItem}>
              <View style={styles.iconBox}>
                <Feather name="map-pin" size={18} color={colors.primary} />
              </View>
              <View style={styles.infoTexts}>
                <Text style={styles.label}>Default Address</Text>
                <Text style={styles.value}>{displayUser.address}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoItem}>
              <View style={styles.iconBox}>
                <Feather name="calendar" size={18} color={colors.primary} />
              </View>
              <View style={styles.infoTexts}>
                <Text style={styles.label}>Member Since</Text>
                <Text style={styles.value}>
                  {user?._creationTime ? new Date(user._creationTime).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.editBtn, { flex: 1, backgroundColor: 'red' }]}
                onPress={() => setIsEditing(false)}
                disabled={loading}
              >
                <Text style={[styles.editBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editBtn, { flex: 2 }]}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator color={colors.background} size="small" />
                    <Text style={[styles.editBtnText, { marginLeft: 10, fontSize: 14 }]}>{loadingStatus}</Text>
                  </View>
                ) : (
                  <Text style={styles.editBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.8}
              onPress={() => setIsEditing(true)}
            >
              <Feather name="edit-3" size={18} color={colors.background} style={{ marginRight: 8 }} />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  profileSection: {
    alignItems: "center",
    padding: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary + '20', // Transparent primary
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  userEmail: {
    color: colors.grayish,
    fontSize: 16,
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 12,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 99,
  },
  roleText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  infoContainer: {
    padding: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTexts: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.grayish,
    fontWeight: "600",
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "700",
  },
  separator: {
    height: 1,
    backgroundColor: colors.grayish,
    marginHorizontal: 16,
  },
  editBtn: {
    marginTop: 30,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  editBtnText: {
    color: colors.background,
    fontWeight: "800",
    fontSize: 16,
  },
  input: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "700",
    padding: 0,
    marginTop: 2,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  }
});