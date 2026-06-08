# LuminaSearch (Bing Search Beautifier)

English | [简体中文](README.md/)

LuminaSearch is designed to optimize and beautify the layout of Search list. It delivers a cleaner, and visually appealing search experience.

## Screenshots

*Here are some examples of the improved search interface:*

![Example Image 1 - Bing Single-column layout](./exp/bing.png)

![Example Image 2 - Baidu Single-column layout](./exp/baidu.png)

![Example Image 3 - Google Single-column layout](./exp/google.png)

## Features
- **Single-column centered layout**
- **Two-column centered layout**
- **Eye protection mode**
- **Auto page turn**

## Environment Requirements
To build and develop this project locally, you will need:
- **Bun** or **NodeJS** installed on your system.
- A modern web browser that supports Chromium/WebExtensions API (e.g., Google Chrome, Microsoft Edge, Brave).

## Extension Permissions Required
This extension requires the following permissions in your browser to function correctly:
- **Host Permissions**: inject the custom layout scripts and CSS.
- **Storage**: To save your extension preferences and layout settings.

## Getting Started
1. Clone the repository.
2. Run `bun install` or `npm install` to install dependencies.
3. Run `bun run build` or `npm run build` to compile the extension.
4. Load the `dist` folder as an unpacked extension in your browser's extension management page.
