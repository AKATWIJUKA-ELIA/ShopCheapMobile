import CategoryTile from "@/components/CategoryTile";
import RefreshScrollView from "@/components/RefreshScrollView";
import ErrorView from "@/components/ui/ErrorView";
import FloatingButton from "@/components/ui/FloatingBtn";
import { openHelpSideBar } from "@/components/ui/help";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { AUTH_TOKEN, CATEGORIES_API_URL, Category } from "@/types/product";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useSearchStore } from "@/components/SearchStore";

const Categories = () => {
  const { colors, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { query } = useSearchStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(CATEGORIES_API_URL,
        {
                headers: {
                        'Content-Type': 'application/json',
                        "X-Auth-Token": AUTH_TOKEN
                },
               method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data.data as Category[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ padding: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 10 }}>
            Loading categories...
          </Text>
        </View>
      );
    }

    if (error) {
      return <ErrorView message={error} onRetry={fetchCategories} />;
    }

    return (
      <View style={styles.gridWrap}>
        {categories
          .filter((c) =>
            (c.cartegory || c.title || "")
              .toLowerCase()
              .includes((query || "").toLowerCase()),
          )
          .map((c, idx) => (
            <CategoryTile
              key={idx}
              title={c.cartegory || c.title || "No Name"}
              image={
                typeof c.image === "string" && c.image.length > 0
                  ? { uri: c.image }
                  : Array.isArray(c.image)
                    ? { uri: c.image[0] }
                    : c.image
                      ? c.image
                      : require("@/assets/images/placeholder.webp")
              }
            />
          ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <RefreshScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshFn={fetchCategories}
      >
        {/* <SectionHeader title='All Categories' /> */}
        <Text
          style={{
            color: Colors.primary,
            fontSize: 16,
            fontWeight: "600",
            textAlign: "center",
            marginTop: 5,
          }}
        >
          All Categories
        </Text>
        {renderContent()}
      </RefreshScrollView>
      <FloatingButton
        onPress={openHelpSideBar}
        icon="message-alert"
        color={Colors.primary}
        onLongPress={toggleTheme}
      />
    </View>
  );
};

export default Categories;

const appStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gridWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
  });
