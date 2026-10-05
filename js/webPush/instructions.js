export const instructions ={
  "ios": [
    { "icon": "settings", "description": "Open the Settings app" },
    { "icon": "bell", "description": "Tap “Notifications”" },
    { "icon": "phone", "description": "Find your app in the list" },
    { "icon": "check", "description": "Turn on “Allow Notifications”" }
  ],
  "android_pwa": [
    { "icon": "phone", "description": "Press & hold the app icon" },
    { "icon": "info", "description": "Tap “App info” or the “i” icon" },
    { "icon": "bell", "description": "Open “Notifications” settings" },
    { "icon": "check", "description": "Turn on “Allow notifications”" }
  ],
  "android_browser": [
    { "icon": "list", "description": "Open Chrome menu (⋮)" },
    { "icon": "settings", "description": "Tap “Settings”" },
    { "icon": "bell", "description": "Open “Site settings” → “Notifications”" },
    { "icon": "check", "description": "Allow notifications for this site" }
  ],
  "windows": [
    { "icon": "lock", "description": "Click the lock icon in the address bar" },
    { "icon": "bell", "description": "Open “Site settings” → “Notifications”" },
    { "icon": "check", "description": "Set notifications to “Allow”" },
    { "icon": "microsoft", "description": "Also check Windows Settings → System → Notifications" }
  ],
  "macos": [
    { "icon": "world", "description": "In Safari: open Settings/Preferences" },
    { "icon": "bell", "description": "Go to Websites → Notifications" },
    { "icon": "check", "description": "Allow notifications for this website" },
    { "icon": "apple", "description": "Also check macOS Settings → Notifications" }
  ],
  "fallback": [
    { "icon": "settings", "description": "Open your browser or device settings" },
    { "icon": "bell", "description": "Find notification settings" },
    { "icon": "check", "description": "Allow notifications for this app/site" }
  ]
}
