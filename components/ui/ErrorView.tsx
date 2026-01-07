import { useTheme } from '@/contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import React, { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorViewProps {
    message?: string;
    onRetry: () => void;
    retryText?: string;
}

const ErrorView: FC<ErrorViewProps> = ({
    message = "Something went wrong. Please check your connection.",
    onRetry,
    retryText = "Try Again"
}) => {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <MaterialIcons name="error-outline" size={60} color="red" />
            <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
            <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                onPress={onRetry}
                activeOpacity={0.8}
            >
                <Text style={styles.retryText}>{retryText}</Text>
                <MaterialIcons name="refresh" size={16} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingVertical:140
    },
    message: {
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        minWidth: 140,
    },
    retryText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ErrorView;
