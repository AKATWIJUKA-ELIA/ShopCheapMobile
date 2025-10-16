import { Redirect } from 'expo-router'
import React, { useEffect } from 'react'

export default function NotFoundScreen() {
  useEffect(() => {
    // Redirect to home page when this screen loads
  }, [])

  return <Redirect href="/(tabs)/home" />
}
