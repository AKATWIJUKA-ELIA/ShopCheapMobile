import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSearchStore } from './SearchStore';

interface RecentSearchesProps {
    onInteraction?: () => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ onInteraction }) => {
    const { recentSearches, clearSearches } = useSearchStore();
    const { colors } = useTheme();

    if (recentSearches.length === 0) return null;

    return (
        <Pressable style={styles.container} onPressIn={onInteraction}>
            <BlurView
                style={StyleSheet.absoluteFill}
                blurType="dark"
                blurAmount={10}
                reducedTransparencyFallbackColor="white"
                pointerEvents="none"
            />
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.grayish }]}>Recent Searches</Text>
                <TouchableOpacity onPress={clearSearches}>
                    <Text style={[styles.clearText, { color: colors.primary }]}>Clear All</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                scrollEnabled={recentSearches.length > 5}
                keyboardShouldPersistTaps="always"
            >
                {recentSearches.map((item, index) => (
                    <Pressable
                        key={index}
                        style={[styles.item, { borderBottomColor: colors.primary + '20' }]}
                        onPressIn={onInteraction}
                    >
                        <Ionicons name="time-outline" size={16} color={colors.grayish} />
                        <Text style={[styles.itemText, { color: colors.light }]}>{item}</Text>
                    </Pressable>
                ))}
            </ScrollView>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 46,
        left: 0,
        right: 0,
        borderRadius: 12,
        overflow: 'hidden',
        padding: 12,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        zIndex: 999,
        // Height is dynamic based on content
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    clearText: {
        fontSize: 12,
        fontWeight: '600',
    },
    list: {
        gap: 2,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderBottomWidth: 1,
        gap: 12,
    },
    itemText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default RecentSearches;
