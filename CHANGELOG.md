# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-03-21

### Fixed
- Fixed an issue where the production packaged application displayed a blank screen. This was caused by absolute paths to static assets in the SvelteKit build. Resolved by implementing a custom `app://` protocol handler in `electron/main.cjs` to properly serve the static files and support SPA fallback routing.

## [1.0.0] - Initial Release
- Initial release of the PolyWMS application.
