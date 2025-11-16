# Changelog

## [1.4.33-1] - 2025-10-28

### Added

#### Custom Script URL Support

- **New `sdkUrl` prop**: Added ability to specify a custom URL for the Unicorn Studio SDK script
  - Allows loading the SDK from custom CDNs or self-hosted locations
  - Defaults to the official Unicorn Studio CDN URL if not specified
  - Available for both React and Next.js components

### Usage Example

```tsx
<UnicornScene
  projectId="YOUR_PROJECT_EMBED_ID"
  sdkUrl="https://your-custom-cdn.com/unicornStudio.umd.js"
  width={800}
  height={600}
/>
```

### Technical Details

- Modified both React and Next.js components to accept the new `sdkUrl` prop
- Updated TypeScript definitions to include the optional `sdkUrl` property
- Maintains backward compatibility with existing implementations

### Contributors

- @schellenbergk - Added custom script URL support

### Note

Using a custom script URL may violate Unicorn.Studio's Terms of Service. Please consult their legal terms before implementing this feature.

## [1.4.29-1] - 2025-08-15

### Fixed

#### Next.js App Router Compatibility

- **Prevented duplicate script initialization**: Modified `useUnicornStudioScript` hook to check if UnicornStudio is already loaded before setting the loaded state, preventing duplicate triggers in Next.js App Router environments
- **Added mount-time script detection**: Added `useEffect` hook to detect if UnicornStudio is already available when the component mounts, ensuring proper initialization in server-side rendered contexts
- **Improved error handling**: Updated error handler to properly reset the `isLoaded` state when script loading fails

#### Scene Initialization Improvements

- **Prevented concurrent initializations**: Added `isInitializingRef` flag to prevent multiple simultaneous scene initialization attempts, which could occur during React's strict mode or rapid re-renders
- **Optimized re-initialization logic**: Improved detection of already initialized scenes with the same configuration to avoid unnecessary re-initializations
- **Better cleanup handling**: Separated cleanup logic into its own `useEffect` to ensure proper resource management on component unmount
- **Fixed initialization key reset**: Added proper reset of initialization key when projectId or jsonFilePath changes, allowing fresh initialization with new parameters

### Internal

- Removed debug console.log statements
- Updated package version to include hotfix suffix (-1)

### Technical Details

This hotfix addresses critical issues that were affecting the library's compatibility with Next.js App Router, particularly in scenarios involving:

- Server-side rendering (SSR)
- React Strict Mode
- Component remounting and hot module replacement (HMR)
- Rapid prop changes

The changes ensure more robust initialization and cleanup processes, preventing memory leaks and duplicate scene instances.
