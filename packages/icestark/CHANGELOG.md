# Changelog

## [2.8.5] - 2026-02-11

### Added
- Added `independent` configuration option to `RuntimeConfig` interface
- Added smart loading strategy for runtime dependencies

### Changed
- Enhanced `loaded` logic for runtime libraries with whitelist support
- Updated whitelist libraries to use proper casing: 'React', 'ReactDOM'
- Improved dependency loading for libraries that require React/ReactDOM re-initialization

### Fixed
- Fixed runtime library loading strategy to properly handle independent dependencies
- Fixed version instance caching for non-whitelist libraries

## [2.8.4] - Previous releases
- See git history for previous changes
