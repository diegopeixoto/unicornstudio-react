# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Setup

```bash
npm install
```

### Development

- `npm run dev` - Start development with watch mode
- `npm run build` - Build the library (CommonJS, ESM, and TypeScript definitions)
- `npm run lint` - Run ESLint on .ts and .tsx files
- `npm run type-check` - Run TypeScript type checking without emitting files

### Testing

This project uses Vitest and Testing Library with a jsdom environment.

- `npm run test` - Run the full test suite once
- `npm run test:watch` - Run tests in watch mode during development

### Pre-publish workflow

Before publishing, the following commands are automatically run:

1. `npm run lint`
2. `npm run type-check`
3. `npm run build`

## Architecture

This is a React component library that wraps Unicorn Studio's WebGL animation system with support for both standard React and Next.js frameworks. The codebase follows a clean, modular structure:

### Directory Structure

```text
src/
├── shared/           # Shared code between React and Next.js versions
│   ├── types.ts      # TypeScript type definitions
│   ├── constants.ts  # Configuration constants
│   ├── utils.ts      # Utility functions (WebGL detection, validation)
│   ├── styles.ts     # Inline style definitions
│   └── hooks.ts      # useUnicornScene hook (framework-agnostic)
├── react/            # React version (Vite-compatible)
│   ├── index.tsx     # React component using standard script/img elements
│   └── hooks.ts      # useUnicornStudioScript hook for React
├── next/             # Next.js version
│   ├── index.tsx     # Next.js component using Script/Image components
│   └── hooks.ts      # useUnicornStudioScript hook for Next.js
└── index.tsx         # Main entry point (exports React version by default)
```

### Core Components

- **UnicornScene** (React): Uses standard HTML `<script>` and `<img>` elements for broad compatibility
- **UnicornScene** (Next.js): Uses Next.js `Script` and `Image` components for optimization
- **Shared Hooks**:
  - `useUnicornScene`: Handles scene initialization, cleanup, and WebGL detection (framework-agnostic)
- **Framework-Specific Hooks**:
  - `useUnicornStudioScript` (React): Manages script loading with vanilla DOM APIs
  - `useUnicornStudioScript` (Next.js): Works with Next.js Script component

### Key Design Decisions

1. **Dual Framework Support**: Separate optimized implementations for React and Next.js
2. **Shared Core Logic**: Common functionality extracted to shared modules
3. **Framework-Specific Optimizations**: Next.js version uses Script/Image components, React version uses standard elements
4. **Subpath Exports**: Enables `unicornstudio-react` (React) and `unicornstudio-react/next` (Next.js) imports
5. **TypeScript First**: Full type definitions with global augmentation for window.UnicornStudio
6. **Optional Next.js Dependency**: Next.js is an optional peer dependency

### Build Configuration

- **tsup**: Handles bundling with dual entry points
- **Entry Points**:
  - `src/index.tsx` → `dist/index.*` (React version)
  - `src/next/index.tsx` → `dist/next.*` (Next.js version)
- **Outputs**: Both CJS and ESM formats with TypeScript definitions
- **Externals**: react, react-dom (required), next (optional)

### Important Constraints

1. This package depends on Unicorn Studio's proprietary script loaded from their CDN
2. The package version follows Unicorn Studio's script version (e.g., 1.4.26)
3. React and React-DOM are required peer dependencies
4. Next.js is an optional peer dependency (only needed for `/next` import)
5. The npm package name and repo name are both `unicornstudio-react` (https://github.com/diegopeixoto/unicornstudio-react)

## Code Style

- ESLint + Prettier configured — formatting is enforced automatically via hooks
- `@typescript-eslint/no-explicit-any` is set to `warn` — avoid `any` but it won't block builds
- `react-in-jsx-scope` is off — no need to import React in JSX files
- `react/prop-types` is off — use TypeScript interfaces instead

## Gotchas

1. **CDN version coupling**: The package version must match Unicorn Studio's CDN script version. When bumping, update both the `version` in package.json and the script URL constant in `src/shared/constants.ts`.
2. **Dual entry points**: Changes to shared code in `src/shared/` affect both React and Next.js builds — always verify both entry points after modifications.
3. **Next.js imports**: `next/script` and `next/image` are externalized in tsup config. Never import Next.js modules from the React entry point (`src/react/` or `src/index.tsx`).
