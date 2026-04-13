import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { AUTH_API_URL, UPDATE_USER_API_URL } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomPopup from './PopUp';

interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
    const { colors, theme } = useTheme();
    const { user } = useAuthStore();
    const styles = useMemo(() => appStyles(colors, theme), [colors, theme]);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

    const handleUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);

            // 1. Verify Current Password
            const authRes = await fetch(AUTH_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user?.email, password: currentPassword }),
            });

            const authData = await authRes.json();

            if (!authRes.ok || !authData.success) {
                Alert.alert('Error', authData.message || 'Incorrect current password');
                setLoading(false);
                return;
            }

            // 2. Update to New Password
            const payload = {
                User: {
                    ...user,
                    passwordHash: newPassword,
                    updatedAt: Date.now(),
                }
            };

            const updateRes = await fetch(UPDATE_USER_API_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const updateData = await updateRes.json();

            if (updateRes.ok && (updateData.success || updateData.succes)) {
                Alert.alert('Success', 'Password changed successfully!');
                // Clear state and close
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                onClose();
            } else {
                Alert.alert('Error', updateData.message || 'Failed to update password');
            }
        } catch (error) {
            console.error('Change password error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomPopup
            visible={visible}
            onClose={onClose}
            heightPercent={0.62}
            widthPercent={0.85}
            blurType={'dark'}
            blurAmount={5}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Change Password</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Current Password */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Current Password</Text>
                    <View style={styles.field}>
                        <Ionicons name="lock-closed-outline" size={18} color={colors.grayish} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter current password"
                            placeholderTextColor={colors.grayish}
                            secureTextEntry={!showPass.current}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPass(p => ({ ...p, current: !p.current }))}>
                            <Ionicons name={showPass.current ? "eye-off-outline" : "eye-outline"} size={18} color={colors.grayish} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* New Password */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.field}>
                        <Ionicons name="key-outline" size={18} color={colors.grayish} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new password"
                            placeholderTextColor={colors.grayish}
                            secureTextEntry={!showPass.new}
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPass(p => ({ ...p, new: !p.new }))}>
                            <Ionicons name={showPass.new ? "eye-off-outline" : "eye-outline"} size={18} color={colors.grayish} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Confirm New Password */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm New Password</Text>
                    <View style={styles.field}>
                        <Ionicons name="checkmark-circle-outline" size={18} color={colors.grayish} />
                        <TextInput
                            style={styles.input}
                            placeholder="Repeat new password"
                            placeholderTextColor={colors.grayish}
                            secureTextEntry={!showPass.confirm}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))}>
                            <Ionicons name={showPass.confirm ? "eye-off-outline" : "eye-outline"} size={18} color={colors.grayish} />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.saveBtnText}>Update Password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </CustomPopup>
    );
}

const appStyles = (colors: any, theme: string) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
        width: '100%',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    closeBtn: {
        position: 'absolute',
        right: -10,
        top: -5,
        padding: 10,
    },
    content: {
        gap: 16,
    },
    inputContainer: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme === 'dark' ? colors.text : colors.grayish,
        marginLeft: 4,
    },
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme === 'dark' ? colors.card : '#f5f5f5',
        borderColor: colors.primary + '30',
        borderWidth: 1,
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 50,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: 14,
    },
    saveBtn: {
        backgroundColor: colors.primary,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    saveBtnText: {
        color: '#000',
        fontWeight: '800',
        fontSize: 16,
    },
});
