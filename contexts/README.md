# Theme Context Usage

This theme context provides a global theme management system for the React Native app with automatic system theme detection and manual toggling capabilities.

## Features

- **System Theme Detection**: Automatically detects and follows the device's system theme (light/dark)
- **Manual Toggle**: Users can manually switch between light and dark themes
- **Persistence**: Theme preference is saved and restored when the app reloads
- **Default Dark Mode**: App defaults to dark mode when system theme is not available

## Usage

### 1. Import the hook in your component

```tsx
import { useTheme } from '@/contexts/ThemeContext';
```

### 2. Use the theme in your component

```tsx
function MyComponent() {
  const { theme, colors, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>
        Current theme: {theme}
      </Text>
      <Button title="Toggle Theme" onPress={toggleTheme} />
    </View>
  );
}
```

### 3. Available properties

- `theme`: Current theme ('light' | 'dark')
- `themeMode`: Current theme mode ('light' | 'dark' | 'system')
- `colors`: Color palette based on current theme
- `setThemeMode(mode)`: Set theme mode programmatically
- `toggleTheme()`: Toggle between light and dark themes

### 4. Color palettes

- **Dark mode** (default): Uses `Colors` from `@/constants/Colors`
- **Light mode**: Uses `lightColors` from `@/constants/Colors`

## Theme Behavior

1. **App Launch**: 
   - If no saved preference exists, defaults to system theme
   - If system theme is light, switch is ON
   - If system theme is dark, switch is OFF

2. **Manual Toggle**:
   - Toggling the switch overrides system theme
   - Preference is saved and persists across app restarts

3. **System Theme Changes**:
   - When in 'system' mode, app automatically follows system theme changes
   - When manually set to 'light' or 'dark', ignores system changes

## Integration Example

```tsx
// Before (hardcoded colors)
<View style={{ backgroundColor: Colors.background }}>
  <Text style={{ color: Colors.text }}>Hello</Text>
</View>

// After (theme-aware)
const { colors } = useTheme();
<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.text }}>Hello</Text>
</View>
```
