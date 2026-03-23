---
name: gen-test
description: Generate tests for unicornstudio-react hooks and components
disable-model-invocation: true
---

# Test Generation

Generate tests for the unicornstudio-react library.

## Setup (if no test framework is configured)

If no test config exists yet:

1. Recommend installing vitest + @testing-library/react + jsdom
2. Create a vitest.config.ts at the project root
3. Add a `test` script to package.json

## Generating Tests

When the user specifies a file or module to test:

1. Read the source file to understand its exports, props, and behavior
2. Generate a test file in a `__tests__/` directory adjacent to the source, named `<module>.test.tsx` or `<module>.test.ts`
3. Cover:
   - Default behavior and rendering
   - Props variations
   - Edge cases (missing props, invalid values)
   - Hook behavior (state changes, cleanup, side effects)
   - WebGL detection fallback paths

## Conventions

- Use `describe`/`it` blocks
- Mock external dependencies (UnicornStudio SDK, next/script, next/image)
- Test both React and Next.js variants when applicable
- Verify cleanup functions are called on unmount
