---
name: release
description: Bump version, update changelog, build, lint, type-check, and publish unicornstudio-react to npm
disable-model-invocation: true
---

# Release Workflow

Follow these steps in order:

## 1. Pre-flight checks

- Run `git status` to ensure working tree is clean
- Run `npm run lint` and `npm run type-check` to verify no issues
- Run `npm run build` to verify the build succeeds

## 2. Determine version bump

Ask the user what type of release this is:
- **patch** (bug fixes, dependency updates)
- **minor** (new features, backward-compatible)
- **major** (breaking changes)

If the user provided a specific version number, use that instead.

## 3. Bump version

- Run `npm version <patch|minor|major|specific-version> --no-git-tag-version`
- Read the new version from package.json

## 4. Update CHANGELOG.md

- If CHANGELOG.md exists, add a new entry at the top with the version and date
- If it doesn't exist, create one with the initial entry
- Include a summary of changes since the last release (use `git log` to find them)

## 5. Commit and tag

- Stage package.json, CHANGELOG.md, and any other changed files
- Commit with message: `release: vX.Y.Z`
- Create a git tag: `vX.Y.Z`

## 6. Publish

- Confirm with the user before publishing
- Run `npm publish`
- Run `git push && git push --tags`

## 7. Summary

Report the published version and npm URL.
