import { Colors } from '@/constants/Colors'
import { BlurView } from '@react-native-community/blur'
import * as Updates from 'expo-updates'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, DeviceEventEmitter, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const SHOW_EVENT = 'updates:show'

export function showUpdatesModal() {
  DeviceEventEmitter.emit(SHOW_EVENT)
}

export default function UpdatesModalController() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('Update available! Do you want to install it now?')
  const [downloading, setDownloading] = useState(true)
  const [updateReady, setUpdateReady] = useState(false)
  const blurOpacity = useRef(new Animated.Value(0)).current

  const fetchUpdateInBackground = useCallback(async () => {
    while (true) { // keep retrying until success
      try {
        const update = await Updates.checkForUpdateAsync()
        if (update.isAvailable) {
          setDownloading(true)
          const result = await Updates.fetchUpdateAsync()
          if (result.isNew) {
            setUpdateReady(true)
            DeviceEventEmitter.emit(SHOW_EVENT)
            return
          }
        }
      } catch (e) {
        console.log('Update check failed, retrying in 30s...', e)
      }
      await new Promise(resolve => setTimeout(resolve, 30000)) // retry every 30 sec
    }
  }, [])

  useEffect(() => {
    fetchUpdateInBackground()
  }, [fetchUpdateInBackground])

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(SHOW_EVENT, () => {
      setVisible(true)
      setDownloading(false)
    })
    return () => sub.remove()
  }, [])

  useEffect(() => {
    if (visible) {
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(blurOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  const handleUpdateNow = async () => {
    try {
      setMessage('Installing update...')
      setDownloading(true)
      await Updates.reloadAsync() // reloads app with new update
    } catch (e) {
      setMessage('Failed to install update. Please restart the app.')
      setDownloading(false)
    }
  }

  const handleLater = () => {
    setVisible(false)
    // On next launch, force reload before rendering app
    Updates.setExtraParamAsync?.('applyOnNextLaunch', 'true')
  }

  return (
    <Modal visible={visible} animationType='fade' transparent>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: blurOpacity }]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType='dark'
          blurAmount={7}
          reducedTransparencyFallbackColor="rgba(0,0,0,0.3)"
        />
      </Animated.View>

      <View style={styles.container}>
        <StatusBar barStyle={'light-content'} backgroundColor={Colors.background} />
        <View style={styles.card}>
          <Text style={styles.title}>App Update</Text>
          <Text style={styles.subtitle}>{message}</Text>

          {downloading ? (
            <ActivityIndicator size='large' color={Colors.light} style={{ marginTop: 16 }} />
          ) : (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: Colors.primary }]}
                onPress={handleUpdateNow}
              >
                <Text style={[styles.buttonText, { color: Colors.dark }]}>Update Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: Colors.gray }]}
                onPress={handleLater}
              >
                <Text style={styles.buttonText}>Later</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.background,
    borderColor: '#222',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: Colors.light,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: Colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.light,
    fontWeight: '800',
  },
})
