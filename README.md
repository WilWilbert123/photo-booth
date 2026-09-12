# Photo Booth Studio

A production-grade, offline-first web application designed for instant photo capture, real-time visual effects, AR face landmark tracking, and custom photo strip generation.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Installation Guide](#step-by-step-installation-guide)
5. [Step-by-Step Usage Guide](#step-by-step-usage-guide)
6. [Project Structure](#project-structure)
7. [Storage and Data Management](#storage-and-data-management)
8. [Build and Deployment Guide](#build-and-deployment-guide)
9. [Troubleshooting](#troubleshooting)
10. [License](#license)

---

## Features

- Real-Time Camera Stream: Interactive live canvas preview with mirror flipping, camera device selection, and resolution presets.
- Multiple Capture Modes: Single Photo, Polaroid Frame, 4-Shot Grid, Photo Strip Layout, Boomerang Video, and Animated GIF mode.
- Real-Time Visual Effects: Color filters, vintage presets, canvas shaders, and AR face tracking props using TensorFlow.js.
- Local Storage & Offline Support: Photos and settings are stored locally in IndexedDB using offline-first Progressive Web App architecture.
- Gallery & Export Tools: Download individual photos, generated photo strips, or export zip archives.
- System Diagnostics & Data Control: View real-time browser storage quota and clear cache or application data safely.

---

## Tech Stack

- Framework: Next.js 16 (App Router, Turbopack)
- Library: React 19, TypeScript
- Styling: Tailwind CSS
- State Management: Zustand
- Face Tracking: TensorFlow.js & Face Landmarks Detection
- Storage: IndexedDB & LocalStorage
- Icons: Lucide React

---

## Prerequisites

Before setting up the project, ensure you have the following installed on your machine:

- Node.js: Version 18.17.0 or higher
- npm: Version 9.0.0 or higher (or yarn / pnpm)
- Modern Web Browser: Google Chrome, Mozilla Firefox, Apple Safari, or Microsoft Edge with camera permissions enabled.

---

## Step-by-Step Installation Guide

Follow these steps to set up the repository on your local environment:

### Step 1: Clone the Repository

Clone the project repository to your local directory:

```bash
git clone https://github.com/WilWilbert123/photo-booth.git
cd photo-booth
```

### Step 2: Install Project Dependencies

Install all required package dependencies using npm:

```bash
npm install
```

### Step 3: Run the Development Server

Start the local Next.js development server:

```bash
npm run dev
```

### Step 4: Open Application in Browser

Navigate to the following address in your web browser:

```
http://localhost:3000
```

Grant browser permission to access your camera when prompted.

---

## Step-by-Step Usage Guide

### Step 1: Taking a Photo or Photo Strip

1. Navigate to the **Booth** tab in the sidebar.
2. Select your desired capture mode (PHOTO, POLAROID, 4-SHOT, PHOTO_STRIP, BOOMERANG, GIF) using the layout icon on the left preview panel.
3. Toggle the countdown timer (Off, 3s, 5s, 10s) using the bottom control bar.
4. Press the large circular capture button in the center to start the countdown and capture sequence.

### Step 2: Applying Visual Effects and AR Props

1. Click on any effect card in the right panel (e.g., Vintage, Black & White, AR Glasses, Cowboy Hat).
2. Adjust the effect intensity slider to customize filter strength.
3. Observe real-time changes rendered directly onto the camera preview canvas.

### Step 3: Viewing and Downloading Captures

1. Navigate to the **Gallery** tab in the sidebar.
2. Click on any captured item to open the high-resolution view modal.
3. Select **Download** to save the image or photo strip directly to your device.
4. Select **Delete** to remove the item from local IndexedDB storage.

### Step 4: Managing Storage and Settings

1. Navigate to the **Settings** tab in the sidebar.
2. View real-time browser storage metrics (Used vs Available storage).
3. Use **Clear Cache** to free up cached assets without deleting photos.
4. Use **Clear All Data** to reset application settings and clear saved IndexedDB photo records.

---

## Project Structure

```text
photo-booth/
├── app/                  # Next.js App Router pages and layouts
│   ├── booth/            # Main Photo Booth view
│   ├── gallery/          # Saved photo gallery
│   ├── settings/         # Application configuration & storage usage
│   ├── favicon.ico       # Tab icon (multi-resolution)
│   ├── icon.png          # App tab icon
│   ├── layout.tsx        # Root layout with sidebar and intro splash
│   └── page.tsx          # Root redirect to booth
├── components/           # UI and Feature Components
│   ├── booth/            # Camera preview, capture controls, overlays
│   ├── gallery/          # Gallery grid, detail modal, strip builder
│   ├── pwa/              # Service worker registration
│   └── ui/               # Sidebar, IntroSplash, ThemeProvider, Toggles
├── hooks/                # Custom React Hooks
│   ├── useCamera.ts      # MediaDevices camera acquisition and streams
│   ├── useEffects.ts     # Canvas rendering and shader filter pipeline
│   └── usePhotoBooth.ts  # Capture sequence execution and state machine
├── lib/                  # Utilities, Render Pipeline & Canvas Logic
│   ├── audio/            # Sound effects synthesizer
│   ├── canvas/           # Composite image processor
│   ├── effects/          # Filter registry and AR face detection engine
│   ├── export/           # Photo strip and GIF generation utilities
│   └── storage/          # IndexedDB migrations and storage quota helper
├── public/               # Static assets, logo.png, AR prop SVGs
├── store/                # Zustand global state stores
└── types/                # TypeScript interface definitions
```

---

## Storage and Data Management

- All captured photos, thumbnails, and generated photo strips are stored locally in the browser's IndexedDB instance (`PhotoBoothDB`).
- No data is transmitted to external servers, ensuring full user privacy and offline operability.
- Storage capacity depends on available browser quota. Storage usage can be monitored under the Settings page.

---

## Build and Deployment Guide

### Step 1: Create Production Build

To build the application for production deployment, run:

```bash
npm run build
```

This compiles TypeScript, optimizes static assets, and builds the Next.js production bundle.

### Step 2: Test Production Build Locally

Start the production server locally to verify the production build:

```bash
npm run start
```

### Step 3: Deployment Options

- Vercel: Connect your GitHub repository to Vercel for automatic zero-configuration deployment.
- Docker / Node Server: Deploy the output of `npm run build` on any standard Node.js server environment.

---

## Troubleshooting

### Camera Not Found / Permission Denied
- Ensure camera access is allowed in browser site permissions.
- Verify no other application (Zoom, Teams, Skype) is exclusively locking the hardware camera device.

### Face Tracking / AR Effect Not Rendering
- AR face tracking requires WebGL support enabled in your browser settings.
- Ensure proper face lighting for TensorFlow.js detection models.

### Double Click Navigation Error
- All sidebar navigation buttons include built-in debouncing and `useTransition` locks to prevent stream interruption errors.

---

## License

Distributed under the MIT License. See `LICENSE` for details.
