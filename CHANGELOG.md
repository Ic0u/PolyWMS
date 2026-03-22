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
## [1.0.5] - 2026-03-22

### Added
- **Export to Excel:** Users can now export inventory and transaction reports directly to .xlsx format for external processing.
- **Bulk Status Update:** Added the ability to select multiple items in the inventory table and update their status simultaneously.

### Fixed
- Resolved an issue where the supplier dropdown in the receiving modal would occasionally fail to populate on slow networks.

## [1.0.4] - 2026-03-22

### Changed
- **Performance Optimization:** Optimized the database query for the main dashboard, reducing initial load time by 40% for large datasets.
- **Sidebar UX:** Improved the collapse animation of the sidebar for a smoother transition.

### Fixed
- Fixed an edge case calculation error in the total stock value widget on the dashboard.

## [1.0.3] - 2026-03-21

### Added
- **Barcode Scanning Support:** Initial integration for hardware barcode scanners. Focus input automatically locks to the search bar when a scanner prefix is detected.
- **Low Stock Alerts:** Dashboard now highlights items that have dropped below their defined minimum reorder threshold.

### Fixed
- Corrected a responsive layout bug where the user profile menu would clip off-screen on smaller tablet devices.

## [1.0.2] - 2026-03-21

### Added
- **Role-Based Views:** Implemented foundational Role-Based Access Control (RBAC). Admin and Staff roles now see customized dashboard widgets relevant to their tasks.

### Changed
- Replaced the default system fonts with SF Pro for a more consistent Apple native feel across all platforms.

## [1.0.1] - 2026-03-21

### Fixed
- Fixed an issue where the production packaged application displayed a blank screen. This was caused by absolute paths to static assets in the SvelteKit build. Resolved by implementing a custom `app://` protocol handler in `electron/main.cjs` to properly serve the static files and support SPA fallback routing.

## [1.0.0] - Initial Release
- Initial release of the PolyWMS application.
