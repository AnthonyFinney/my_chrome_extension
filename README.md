# Volume Booster Chrome Extension

This extension allows you to boost the audio volume of any tab up to 600%. It uses the Web Audio API to apply a gain node to all audio and video elements on the page.

## Development

Install dependencies and build the extension:

```bash
npm install
npm run build
```

The compiled extension will be in the `dist/` directory. Load that folder in Chrome as an unpacked extension.
