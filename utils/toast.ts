import { Platform, ToastAndroid } from 'react-native';
import Toast from 'react-native-toast-message';

/**
 * Show a toast notification on both Android and iOS
 * @param message - The message to display
 * @param type - Type of toast: 'success' | 'error' | 'info'
 */
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
        // For iOS, use react-native-toast-message
        Toast.show({
            type: type,
            text1: message,
            position: 'top',
            visibilityTime: 2000,
        });
    }
};
