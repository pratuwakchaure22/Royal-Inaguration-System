# 🎭 Smart Curtain — GitHub Pages Edition

A real-time mobile-controlled inauguration display with cinematic curtain animations, 20+ poster images, participant names, next/previous navigation, confetti, gold shower, fireworks, and streamers.

## Architecture

This GitHub Pages edition is fully static. It replaces the original Node.js/Express/Socket.IO runtime with Firebase Realtime Database:

`Mobile Controller → Firebase Realtime Database → Laptop/Smart Board Display`

## One-time Firebase setup

1. Create a Firebase project.
2. Add a Web App to the project.
3. Enable **Realtime Database**.
4. Copy your Firebase Web App configuration into `firebase-config.js`.
5. For testing, configure Realtime Database rules appropriately. Do not leave an unrestricted production database open indefinitely.

## Deploy on GitHub Pages

1. Upload all files in this repository to the root of your GitHub repository.
2. Open **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Choose `main` and `/(root)`.
5. Save and wait for deployment.

Your URLs will be:

- Main page: `https://USERNAME.github.io/REPOSITORY/`
- Display: `https://USERNAME.github.io/REPOSITORY/display.html`
- Controller: `https://USERNAME.github.io/REPOSITORY/controller.html`

## Important

Both the display and controller require internet access because commands synchronize through Firebase. The original local Node.js version is better for offline events; this edition is designed specifically for GitHub Pages hosting.
