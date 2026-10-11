# Fuel — Minimal Nutrition Intelligence PWA

> Radical reductive nutrition intelligence powered by Gemini Multimodal Vision.

**Live App (GitHub Pages):** [https://theprogrammersingh.github.io/fuel-nutrition/](https://theprogrammersingh.github.io/fuel-nutrition/)  
**Alternative Deployment (Firebase):** [https://fuel-nutrition-c920a7.web.app](https://fuel-nutrition-c920a7.web.app)

---

## ✨ Features

- **⚡ Instant Food Photo Estimation**: Snap a photo of your plate to estimate calories, protein, carbs, and fat in seconds using Google Gemini Multimodal Vision.
- **🤖 Choose Your Gemini Model**: Select between **Gemini 3.8 Flash** *(Recommended)*, **Gemini 3.5 Flash-Lite**, and **Gemini 2.5 Flash** models directly in the app.
- **🔒 Private & Local-First**: Your API key and food logs stay 100% on your device in local storage. Zero subscriptions, zero external databases.
- **🎯 Dynamic Nutritional Nudge Engine**: Contextual recommendations based on daily macro progress:
  - *Scenario A*: Calorie window tight; protein deficit (high-density lean suggestions like Whey Isolate, Egg Whites).
  - *Scenario B*: Calorie budget open (balanced protein meals).
  - *Scenario C*: Protein goal achieved (fibrous greens celebration).
- **📱 Progressive Web App (PWA)**:
  - 1-click native install prompt on Android (Chrome) and Desktop (Chrome / Edge).
  - Step-by-step visual installation guidance for Apple iOS Safari (*Share → Add to Home Screen*) and macOS Safari (*Add to Dock*).
  - Service worker caching for fast offline launching.
- **🎛️ Interactive Portion Multiplier**: Easily tweak estimations with Light (0.75x), Standard (1.0x), and Hearty (1.5x) multipliers, or fine-tune with ±25 kcal and ±2g protein steppers.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS (Kinetic Fuel design system: zinc monochrome with emerald accents)
- **Icons**: Material Symbols Outlined
- **Typography**: Geist
- **Hosting**: GitHub Pages (via GitHub Actions) & Firebase Hosting

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/theprogrammersingh/fuel-nutrition.git
cd fuel-nutrition

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Building for Production

```bash
npm run build
npm run preview
```

---

## 🔑 Gemini API Key Setup

Fuel connects directly to Google Gemini using your personal API key:
1. Obtain a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
2. During the in-app welcome flow or under **Settings**, paste your API key.
3. Test your key with the built-in **Test Key** button.
