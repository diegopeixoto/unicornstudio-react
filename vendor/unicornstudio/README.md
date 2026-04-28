Place the Unicorn Studio SDK files here before publishing:

- `vendor/unicornstudio/unicornStudio.umd.js`
- `vendor/unicornstudio/extensions/model-renderer.js`
- `vendor/unicornstudio/extensions/three-bundle.js`

Then run:

```bash
npm run sync-sdk
```

That command generates `src/shared/sdk-bundle.ts`, which is what the package loads by default at runtime.
