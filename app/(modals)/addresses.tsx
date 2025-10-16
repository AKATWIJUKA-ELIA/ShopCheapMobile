import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

export default function Addresses() {
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home', details: 'Bugema, Uganda', isPrimary: true },
    { id: 2, label: 'Office', details: 'Kampala, Uganda', isPrimary: false },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDetails, setNewDetails] = useState('');

  const addAddress = () => {
    if (!newLabel || !newDetails) {
      Alert.alert('Error', 'Please fill in both label and address');
      return;
    }
    const newAddress = {
      id: Date.now(),
      label: newLabel,
      details: newDetails,
      isPrimary: addresses.length === 0,
    };
    setAddresses([...addresses, newAddress]);
    setNewLabel('');
    setNewDetails('');
    setModalVisible(false);
  };

  const setPrimaryAddress = (id: number) => {
    setAddresses(addresses.map(addr => ({ ...addr, isPrimary: addr.id === id })));
  };

  const renderItem = ({ item }:any) => (
    <View style={styles.addressCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.addressLabel}>{item.label} {item.isPrimary ? '(Primary)' : ''}</Text>
        <Text style={styles.addressDetails}>{item.details}</Text>
      </View>
      {!item.isPrimary && (
        <TouchableOpacity onPress={() => setPrimaryAddress(item.id)} style={styles.primaryButton}>
          <Text style={{ color: 'white' }}>Set as Primary</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{flexDirection:'row'}}>
        {Platform.OS === 'android'? (
          <TouchableOpacity onPress={() => router.back()} style={{
              backgroundColor:Colors.background, 
              padding:20
            }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary}/>
          </TouchableOpacity>
        ): undefined}

        <Text style={{color:Colors.primary, fontSize:24, fontWeight:'bold', padding:20}}>
          {`${addresses.length} ${addresses.length === 1 ? 'Address' : 'Addresses'}`}
        </Text>
      </View>
      
      <FlatList
        data={addresses}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Feather name="plus" size={20} color={Colors.dark} />
        <Text style={{ color: Colors.dark, marginLeft: 8, fontWeight:'bold' }}>Add Address</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Address</Text>
            <TextInput
              placeholder="Label (Home, Office...)"
              placeholderTextColor={Colors.grayish}
              style={styles.input}
              value={newLabel}
              onChangeText={setNewLabel}
            />
            <TextInput
              placeholder="Full Address"
              placeholderTextColor={Colors.grayish}
              style={[styles.input, { height: 80 }]}
              value={newDetails}
              onChangeText={setNewDetails}
              multiline
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalButton, { backgroundColor: 'red', marginRight: 8 }]}>
                <Text style={{color:'white'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addAddress} style={[styles.modalButton, { backgroundColor: Colors.dark }]}>
                <Text style={{ color: 'white' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addressCard: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 14,
    color: '#374151',
  },
  primaryButton: {
    backgroundColor: Colors.dark,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightgray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: Colors.background,
    color:Colors.text
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  }
})
