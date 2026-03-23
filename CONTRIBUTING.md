# Contributing to unicornstudio-react

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [contato@diegopeixoto.com](mailto:contato@diegopeixoto.com).

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/unicornstudio-react.git
   cd unicornstudio-react
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your change:
   ```bash
   git checkout -b my-feature
   ```

## Development

```bash
npm run dev          # Start development with watch mode
npm run build        # Build the library
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Project Structure

The library has dual framework support:

- `src/shared/` - Shared code between React and Next.js versions
- `src/react/` - React version (Vite-compatible)
- `src/next/` - Next.js version
- `src/index.tsx` - Main entry point

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.

## Submitting Changes

1. Make sure your code passes all checks:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```
2. Commit your changes with a clear message describing what you changed and why.
3. Push to your fork and open a Pull Request.

## Pull Request Guidelines

- Keep PRs focused on a single change.
- Describe what the PR does and why in the description.
- Ensure all checks pass before requesting review.
- Update documentation if your change affects the public API.

## Reporting Issues

Use [GitHub Issues](https://github.com/diegopeixoto/unicornstudio-react/issues) to report bugs or suggest features. Please include:

- A clear description of the issue
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Your environment (React/Next.js version, browser, OS)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
