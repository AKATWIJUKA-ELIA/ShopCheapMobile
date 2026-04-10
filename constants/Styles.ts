import { Colors } from '@/constants/Colors';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';


export const defaultStyles = (colors: any) => StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
});
