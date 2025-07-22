# Volume Booster Chrome Extension

This extension allows you to boost the audio volume of any tab up to 600%. It uses the Web Audio API to apply effects to all audio and video elements on the page.

## Features

- Boost volume up to **600%**
- Control the volume of any tab
- Optional **voice boost** and **bass boost** filters
- Fine-grained slider control from **0%** to **600%**
- Quickly switch to any audible tab with a single click

## Development

Install dependencies and build the extension:

```bash
npm install
npm run build
```

The compiled extension will be in the `dist/` directory. Load that folder in Chrome as an unpacked extension.
