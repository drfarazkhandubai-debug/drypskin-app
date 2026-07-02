# App Icons

Place the following files here before running EAS Build:

| File | Size | Notes |
|------|------|-------|
| `icon-1024.png` | 1024 × 1024 px | iOS App Store icon — no alpha channel, no rounded corners |
| `icon-512.png`  | 512 × 512 px   | Android adaptive icon foreground |
| `adaptive-icon-bg.png` | 108 × 108 dp | Android adaptive icon background (solid color or simple pattern) |

**iOS requirements:**
- PNG format, no transparency
- Square, Apple applies rounded corners automatically

**Android requirements:**
- Adaptive icon: foreground (512×512) + background layer (108dp safe zone)
- Configure `android.adaptiveIcon` in `app.json` when ready
