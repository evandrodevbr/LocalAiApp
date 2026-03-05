# Local AI Companion

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37) ![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white) ![LMStudio](https://img.shields.io/badge/Powered_by-LMStudio-5E5DF0?style=for-the-badge)

> A fully local, privacy-first AI companion app built with React Native and Expo. Your data never leaves your device.

This application connects directly to your own local AI models, completely offline. Currently in alpha, it pairs flawlessly with the [LMStudio](https://lmstudio.ai) local inference API. We developed and tested it against **Qwen3.5 (without thinking)** to guarantee a smooth, zero-latency experience.

*Roadmap: Future updates will introduce direct in-app model downloads and support for external APIs.*

---

## Features

- **100% Offline Inference:** Complete privacy. Zero cloud dependency.
- **Plug & Play LMStudio:** Instantly detects and fetches active models from your local server.
- **Persistent Sessions:** Chat histories and settings are saved locally using Zustand and `AsyncStorage`.
- **Developer-Friendly UI:** Real-time markdown rendering with syntax highlighting and 1-click code copying.
- **Minimalist Dark Mode:** High-contrast, distraction-free interface built on NativeWind principles.

---

## Quick Start

To run this application, you will need both the frontend development environment and a local AI engine running.

### 1. Model Server (LMStudio)

1. Extract and open [LMStudio](https://lmstudio.ai/).
2. Download a compatible model (e.g., Llama 3, Qwen2.5, Mistral).
3. Open the **Local Server** tab (`<->`).
4. Enable **CORS** and set the port (default: `1234`).
5. Click **Start Server**.

> **Note:** If testing on a physical mobile device, locate your machine's local IPv4 address (e.g., `192.168.1.X`).

### 2. Mobile Client (App)

Ensure you have [Node.js](https://nodejs.org/) (v18+) and the [Expo Go](https://expo.dev/go) app installed.

```bash
git clone https://github.com/evandrodevbr/LocalAiApp.git
cd LocalAiApp
npm install
npx expo start
```

Scan the QR code with Expo Go, or type `i`/`a` to launch a simulator.

### 3. Connection

1. Open the app and tap the **Settings** icon.
2. Enter your LMStudio server IP and Port (e.g., `192.168.1.X:1234`).
3. Tap **Test Connection**.

Once connected, your available models will load automatically.

---

## Bug Reports & Contributing

Found an issue or have a suggestion? We welcome community involvement!

👉 **[Report an Issue or Request a Feature](https://github.com/evandrodevbr/LocalAiApp/issues)**

When creating an issue, please include:

- A clear description of the bug.
- Steps to reproduce.
- Relevant screenshots or environment details.

---

## Acknowledgments

Thank you for exploring this project! Our mission is to share knowledge and foster an open-source collaborative ecosystem around offline AI solutions. All feedback, testing, and code contributions are highly appreciated.

<br>
<br>
