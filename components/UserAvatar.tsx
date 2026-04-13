import { useTheme } from '@/contexts/ThemeContext';
import React, { FC } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface UserAvatarProps {
    name: string;
    size?: number;
    style?: ViewStyle;
}

export const UserAvatar: FC<UserAvatarProps> = ({ name, size = 120, style }) => {
    const { colors } = useTheme();

    const getInitials = (name: string) => {
        const names = name.split(' ');
        let initials = names[0].substring(0, 1).toUpperCase();

        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    };

    const getBackgroundColor = (name: string) => {
        // Generate a consistent color based on the name
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Use the hash to pick a color from a predefined list or generate one
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 60%, 50%)`;
    };

    const initials = getInitials(name || 'Guest');
    const backgroundColor = getBackgroundColor(name || 'Guest');

    return (
        <View style={[
            styles.avatar,
            {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: colors.primary
            },
            style
        ]}>
            <Text style={[
                styles.initials,
                {
                    fontSize: size * 0.4,
                    color: '#FFFFFF'
                }
            ]}>
                {initials}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    avatar: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    initials: {
        fontWeight: 'bold',
    },
});
