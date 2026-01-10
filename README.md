# unicornstudio-react

[![npm version](https://badge.fury.io/js/unicornstudio-react.svg)](https://badge.fury.io/js/unicornstudio-react)
[![npm downloads](https://img.shields.io/npm/dm/unicornstudio-react.svg)](https://www.npmjs.com/package/unicornstudio-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%2B-blue.svg)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-13%2B-black.svg)](https://nextjs.org/)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/unicornstudio-react-example?file=app%2Fpage.tsx)

A React component for embedding [Unicorn.Studio](https://unicorn.studio) interactive scenes in your applications. Compatible with both React (Vite) and Next.js frameworks.

> ⚠️ **Important**: This package is a community-created wrapper component and is **not officially affiliated** with Unicorn.Studio. It depends on Unicorn.Studio's proprietary script and services.

## Features

- 🚀 **Easy Integration** - Simple React component for Next.js projects
- 🎨 **Full TypeScript Support** - Complete type definitions included
- ⚡ **Performance Optimized** - Lazy loading and efficient resource management
- 📱 **Responsive** - Works seamlessly across devices
- 🎮 **Interactive** - Support for mouse/touch interactions
- 🔧 **Flexible** - Extensive customization options
- 🧹 **Clean Architecture** - Proper cleanup and memory management
- 🛡️ **Error Handling** - Comprehensive error states and fallbacks

## Installation

```bash
npm install unicornstudio-react
# or
yarn add unicornstudio-react
# or
pnpm add unicornstudio-react
```

## Usage

This package supports both React (Vite/CRA) and Next.js environments with optimized imports:

### For React (Vite, Create React App, etc.)

Use the default import for standard React applications:

```tsx
import UnicornScene from "unicornstudio-react";

export default function MyComponent() {
  return (
    <UnicornScene projectId="YOUR_PROJECT_EMBED_ID" width={800} height={600} />
  );
}
```

### For Next.js

Use the Next.js-optimized version with enhanced performance:

```tsx
import UnicornScene from "unicornstudio-react/next";

export default function MyComponent() {
  return (
    <UnicornScene projectId="YOUR_PROJECT_EMBED_ID" width={800} height={600} />
  );
}
```

> **Note**: The Next.js version uses Next.js `Script` and `Image` components for better performance and optimization. The React version uses standard `<script>` and `<img>` elements for broader compatibility.

### With Custom JSON File

**React (Vite/CRA):**

```tsx
import UnicornScene from "unicornstudio-react";

export default function MyComponent() {
  return (
    <UnicornScene
      jsonFilePath="/path/to/your/scene.json"
      width="100%"
      height="400px"
      scale={0.8}
      dpi={2}
    />
  );
}
```

**Next.js:**

```tsx
import UnicornScene from "unicornstudio-react/next";

export default function MyComponent() {
  return (
    <UnicornScene
      jsonFilePath="/path/to/your/scene.json"
      width="100%"
      height="400px"
      scale={0.8}
      dpi={2}
    />
  );
}
```

### Advanced Configuration

Both React and Next.js versions support the same props:

```tsx
// For React: import UnicornScene from "unicornstudio-react";
// For Next.js: import UnicornScene from "unicornstudio-react/next";
import UnicornScene from "unicornstudio-react";

export default function MyComponent() {
  const handleLoad = () => {
    console.log("Scene loaded successfully!");
  };

  const handleError = (error: Error) => {
    console.error("Scene loading failed:", error);
  };

  return (
    <UnicornScene
      projectId="YOUR_PROJECT_EMBED_ID"
      width="100vw"
      height="100vh"
      scale={1}
      dpi={1.5}
      fps={60}
      altText="Interactive 3D scene"
      ariaLabel="Animated background scene"
      className="my-custom-class"
      lazyLoad={true}
      production={true}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
```

## Placeholder Support

The component now supports flexible placeholder options that can be displayed while loading, on error, or when WebGL is not supported.

### Image Placeholder

```tsx
<UnicornScene
  projectId="YOUR_PROJECT_ID"
  placeholder="/path/to/placeholder.jpg"
  width={800}
  height={600}
/>
```

### CSS/Tailwind Placeholder

```tsx
<UnicornScene
  projectId="YOUR_PROJECT_ID"
  placeholderClassName="bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"
  width="100%"
  height="400px"
/>
```

### Custom React Component Placeholder

```tsx
<UnicornScene
  projectId="YOUR_PROJECT_ID"
  placeholder={
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading 3D Scene...</p>
      </div>
    </div>
  }
  width={600}
  height={400}
/>
```

### Placeholder Behavior Options

- `showPlaceholderWhileLoading`: Shows placeholder during scene initialization (default: `true`)
- `showPlaceholderOnError`: Shows placeholder when scene fails to load (default: `true`)
- The placeholder automatically shows when WebGL is not supported

## Props

| Prop                          | Type                     | Default   | Description                                                                |
| ----------------------------- | ------------------------ | --------- | -------------------------------------------------------------------------- |
| `projectId`                   | `string`                 | -         | The Unicorn Studio project embed ID (required if not using `jsonFilePath`) |
| `jsonFilePath`                | `string`                 | -         | Path to a self-hosted JSON file (required if not using `projectId`)        |
| `width`                       | `number \| string`       | `"100%"`  | Width of the scene container                                               |
| `height`                      | `number \| string`       | `"100%"`  | Height of the scene container                                              |
| `scale`                       | `number`                 | `1`       | Rendering scale (0.25-1, lower values improve performance)                 |
| `dpi`                         | `number`                 | `1.5`     | Pixel ratio for rendering quality                                          |
| `fps`                         | `number`                 | `60`      | Frames per second (0-120)                                                  |
| `altText`                     | `string`                 | `"Scene"` | Alternative text for accessibility                                         |
| `ariaLabel`                   | `string`                 | -         | ARIA label for the scene                                                   |
| `className`                   | `string`                 | `""`      | Additional CSS classes                                                     |
| `lazyLoad`                    | `boolean`                | `true`    | Load scene only when scrolled into view                                    |
| `production`                  | `boolean`                | `true`    | Use production CDN                                                         |
| `paused`                      | `boolean`                | `false`   | Pause or resume the scene animation                                        |
| `placeholder`                 | `string \| ReactNode`    | -         | Placeholder content (image URL or React component)                         |
| `placeholderClassName`        | `string`                 | -         | CSS classes for placeholder div (when using CSS placeholder)               |
| `showPlaceholderOnError`      | `boolean`                | `true`    | Show placeholder when scene fails to load                                  |
| `showPlaceholderWhileLoading` | `boolean`                | `true`    | Show placeholder while scene is loading                                    |
| `onLoad`                      | `() => void`             | -         | Callback when scene loads successfully                                     |
| `onError`                     | `(error: Error) => void` | -         | Callback when scene fails to load                                          |

## Styling

The component uses inline styles for maximum compatibility. You can customize the appearance by:

1. **Using the `className` prop** to add your own CSS classes
2. **Wrapping the component** in a styled container
3. **Using CSS variables** for dynamic dimensions:

```tsx
<div style={{ "--unicorn-width": "100%", "--unicorn-height": "500px" }}>
  <UnicornScene projectId="YOUR_PROJECT_ID" />
</div>
```

## Getting Your Project ID

1. Create your scene at [Unicorn Studio](https://unicorn.studio)
2. Click on "Embed" in the export options
3. Copy the project ID from the embed code

## Framework Compatibility

### React Version (Default)

- ✅ **Vite** - Optimized for modern React development
- ✅ **Create React App (CRA)** - Classic React setup
- ✅ **Webpack** - Custom React builds
- ✅ **Parcel** - Zero-configuration bundler
- ✅ **Rollup** - ES modules bundler

### Next.js Version (`/next`)

- ✅ **Next.js 13+** - App Router and Pages Router
- ✅ **Next.js 14+** - Latest features and optimizations
- ✅ **Vercel deployment** - Optimized hosting
- ✅ **Static exports** - JAMstack compatibility

## Dependencies & Requirements

### Unicorn.Studio Script Dependency

This component **depends on Unicorn.Studio's proprietary script** (`unicornStudio.umd.js`) which:

- ✅ Is automatically loaded from Unicorn.Studio's official CDN
- ❌ Is **NOT bundled** or stored in this package
- 🏢 Is **owned and hosted** by Unicorn.Studio (UNCRN LLC)
- ⚖️ Is subject to [Unicorn.Studio's Terms of Service](https://unicorn.studio/terms)

### Custom Script URL (Advanced)

```tsx
// ⚠️ Use custom script URL (may violate Unicorn.Studio TOS)
// Only use if you have explicit permission from Unicorn.Studio
const constants = {
  UNICORN_STUDIO_CDN_URL: "https://your-custom-cdn.com/unicornStudio.umd.js",
};
```

**Warning**: Using a custom script URL may violate Unicorn.Studio's Terms of Service. Consult their legal terms before implementing.

**React/Next.js Example usage:**

```tsx
<UnicornScene
  projectId="YOUR_PROJECT_EMBED_ID"
  sdkUrl="https://your-custom-cdn.com/unicornStudio.umd.js"
  width={800}
  height={600}
/>
```

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers with WebGL support

## Versioning Strategy

This package's version **follows Unicorn.Studio's script version** (e.g., v1.4.26) to ensure compatibility. Version format:

- `1.4.26` - Matches Unicorn.Studio script v1.4.26
- Patch versions (e.g., `1.4.26-1`) may be added for component-specific fixes

## Performance Tips

1. **Use appropriate scale values** - Lower values (0.5-0.8) can significantly improve performance on lower-end devices
2. **Enable lazy loading** - Scenes will only initialize when visible
3. **Optimize your scenes** - Keep texture sizes reasonable in Unicorn Studio
4. **Set appropriate DPI** - Use lower DPI values for better performance

## Troubleshooting

### Scene not loading

- Verify your project ID is correct
- Check network requests for the Unicorn Studio script
- Ensure you're not mixing `projectId` and `jsonFilePath`

### Performance issues

- Reduce the `scale` prop value
- Lower the `dpi` setting
- Decrease `fps` for less demanding animations

### TypeScript errors

- Ensure you have the latest version installed
- Check that your tsconfig includes the necessary DOM types

## Development & Architecture

This component is based on the [official Unicorn.Studio React example](https://github.com/hiunicornstudio/unicornstudio.js/blob/main/components/unicornstudio-react.tsx) with the following improvements:

### Enhancements Over Official Example

1. **Modern React Patterns**
   - Custom hooks for script loading and scene management
   - Proper TypeScript integration with full type definitions
   - Next.js `Script` component for optimized loading

2. **Better Architecture**
   - Separation of concerns (hooks, types, constants)
   - Proper cleanup and memory management
   - Error boundaries and comprehensive error handling

3. **Enhanced Developer Experience**
   - Complete TypeScript support
   - Inline styles for zero-config styling
   - Extensive prop customization options
   - npm package distribution

4. **Production Ready**
   - Proper build pipeline with tsup
   - CommonJS and ESM support
   - Automated script deduplication
   - Comprehensive documentation

## Legal & Licensing

### This Package (MIT License)

This React component wrapper is released under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Unicorn.Studio Dependencies

- **Unicorn.Studio Script**: Proprietary software owned by UNCRN LLC
- **Terms**: Subject to [Unicorn.Studio's Terms of Service](https://unicorn.studio/terms)
- **Licensing**: Commercial use governed by Unicorn.Studio's licensing terms

### Disclaimer

This package is a **community-created wrapper** and is **not officially affiliated** with Unicorn.Studio or UNCRN LLC. The authors of this package:

- Do not store, distribute, or modify Unicorn.Studio's proprietary scripts
- Are not responsible for Unicorn.Studio's service availability or performance
- Recommend users comply with Unicorn.Studio's Terms of Service
- Provide this wrapper "as-is" without warranty

For official support or licensing questions regarding Unicorn.Studio, contact [Unicorn.Studio directly](https://unicorn.studio/contact).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
git clone https://github.com/diegopeixoto/unicornstudio-react.git
cd unicornstudio-react
npm install
npm run dev
```

## Links

- [Unicorn Studio](https://unicorn.studio) - Official website
- [Unicorn Studio Documentation](https://unicorn.studio/docs) - Official docs
- [GitHub Repository](https://github.com/diegopeixoto/unicornstudio-react) - This package
- [npm Package](https://www.npmjs.com/package/unicornstudio-react) - npm registry

---

**Author**: Diego Peixoto  
**License**: MIT (for this wrapper component only)  
**Not affiliated with**: Unicorn.Studio or UNCRN LLC
