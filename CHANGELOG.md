# Changelog

All notable changes to this project will be documented in this file.

## [1.0.6] - 2026-03-22

### Added
- **macOS Tahoe Modal Effect:** Implemented a new frosted liquid glass visual style for Modals in Light Mode, featuring specular highlights and deep dimensional shadows to match the latest Apple visionOS/macOS design language.
- **Dynamic Accent Color Sync:** The application now actively polls and syncs with the user's macOS System Preferences Accent Color (including the default multicolor blue), applying it to UI elements in real-time without requiring a refresh.

### Changed
- **Light Mode Overhaul:** Completely rewrote the Light Mode palette to precisely match the clean, high-contrast white aesthetic of the Apple App Store.
- **True Sidebar Vibrancy:** Removed CSS backdrop filters from the sidebar in Light Mode, allowing Electron's native `under-window` vibrancy to bleed through the desktop wallpaper naturally.
- **Adaptive Dashboard Charts:** Updated Dashboard bar charts to use the system accent color with variable opacity instead of hardcoded dark grays, improving visibility in Light Mode. 

## [1.0.1] - 2026-03-21

### Fixed
- Fixed an issue where the production packaged application displayed a blank screen. This was caused by absolute paths to static assets in the SvelteKit build. Resolved by implementing a custom `app://` protocol handler in `electron/main.cjs` to properly serve the static files and support SPA fallback routing.

## [1.0.0] - Initial Release
- Initial release of the PolyWMS application.
