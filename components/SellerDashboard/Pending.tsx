import React, { useMemo, useState } from 'react';
import {View, Text, StyleSheet, Image, FlatList, TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const PRIMARY = '#f97316';
const BG = '#f3f4f6';
const SURFACE = '#ffffff';
const BORDER = '#e5e7eb';
const TEXT = '#111827';
const MUTED = '#6b7280';
const DANGER = '#ef4444';

const products = [
  {
    id: '1',
    name: 'Nike Air Max 90',
    description: "Men's Sneakers - Size 10",
    price: '$129.99',
    date: 'Oct 24, 2023',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB9J8xEp2F5izjiN9w84EzLozAu5DRrbKu2f8DQZG1izhRGpcvbwDrF4135cswwgbSPuxt911z-rzGIG18fm2hzdxIL7FxC7Iyf4ESNdSX_2ecIpeDazlncf25YazMw1Z0q479aR3FTwtQA_2uKLkofE4Q-oT7T9kK-vX0-Ct4MxvzvVDqGIvyz48MP_TeX1viHiDD1OT6W5E4yP1cRIwGeLmOrDsIcPTa1foZq274nIB501AN5KYaqi-BWchPaEEf7PXwIE4nGag',
  },
  {
    id: '2',
    name: 'Sony WH-1000XM4',
    description: 'Wireless Noise Cancelling',
    price: '$248.00',
    date: 'Oct 23, 2023',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA6D1vq79Yf4ft_NObDjj-tT8IFGE49fYgKQ8HvqTkLEo3VDbVasJ_uTDZKRZ13FCagp7W3kYICj976hZwejum5Hcas5xIJYHpRfWzFA9GsuvXT2UJy2VIkXtbWK6BgkonJPRWENmjpptIFkTAA97tNnOx14AX1ijxk6VMNHwtcufc5InHufFgGmso3jeBzZHmOk8nQqH9aZZmWpxzN3oOBeI8bGYkhfOTk1RXG9kXUUj6xhuopisUxCseu3C91fro_qbvpLaBnTQ',
  },
  {
    id: '3',
    name: 'Apple Watch Series 7',
    description: 'Midnight Aluminum Case',
    price: '$399.00',
    date: 'Oct 22, 2023',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCaz9S023ysE-OVUGqV-VjKoiE_yvHijbiEjNpJEGfivVoAqOrS8tC7IVk_4yYLkDwLpyl4q8fvdDWHV0QIBzuo_M-pd9retrnEUDOlL9Ovc2yd2eracQRpklEsFX9dEDeBkN98JniV0G-rjjXU7Z76wH4JxorMH5zUcPezgrsJAA61XuAxXN-mnMSuZKoKnAXZjmtVUzroX1cniytNSbVd3VCF5UalXu6cuhEcjhBbTI9LeaB-xE1E6uTr4qumrCBRYPKMoVtirg',
  },
];

export default function PendingProductsScreen() {
  const [selected, setSelected] = useState<string[]>([]);

  const router = useRouter();
  const {colors, toggleTheme} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      {/* Action Row
      <View style={styles.actionRow}>
        <Text style={styles.selectedText}>
          {selected.length} items selected
        </Text>

        <TouchableOpacity style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={DANGER} />
          <Text style={styles.deleteText}>Delete Selected</Text>
        </TouchableOpacity>
      </View> */}

      {/* List */}
      <View style={{height:10}}/>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* <Checkbox
              value={selected.includes(item.id)}
              onValueChange={() => toggleSelect(item.id)}
              color={PRIMARY}
            /> */}

            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.info}>
              <View style={styles.row}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Pending</Text>
                </View>
              </View>

              <Text style={styles.desc} numberOfLines={1}>
                {item.description}
              </Text>

              <View style={styles.row}>
                <Text style={styles.price}>{item.price}</Text>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={12} color={colors.grayish} />
                  <Text style={styles.date}>{item.date}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  selectedText: {
    fontSize: 13,
    color: colors.gray,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteText: {
    color: DANGER,
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightgray,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.light,
  },
  info: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  desc: {
    fontSize: 13,
    color: colors.grayish,
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: colors.grayish,
  },
});
