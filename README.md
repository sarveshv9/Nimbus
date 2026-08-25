# 🌤️ Nimbus

> A modern, premium weather experience built as a frontend engineering showcase.

![Nimbus Application](public/favicon.ico)

**Nimbus** is a production-quality weather visualization platform that leverages the absolute latest capabilities of **Angular 22**. Rather than relying on external component libraries or CSS frameworks, Nimbus features a meticulously crafted, custom glassmorphic design system and bespoke interactive SVG charts.

The primary purpose of this project is to demonstrate modern frontend engineering practices, reactive state management, and an uncompromising focus on UI/UX and performance.

---

## ✨ Features

- **Dynamic Weather Theming:** The application intelligently shifts its color palette and background gradient based on the current weather condition and time of day.
- **Atmospheric Effects:** Pure CSS, mathematically precise animations for rain, snow, and lightning that respect system `prefers-reduced-motion` settings.
- **Glassmorphic UI:** A custom design system built with CSS variables that seamlessly blends over the dynamic backgrounds.
- **Interactive SVG Visualizations:** Custom-built line and bar charts for the forecast timeline, an animated sunrise/sunset arc, and a wind direction compass.
- **Command-Palette Search:** A fast, debounced RxJS-powered location search overlay triggered by `⌘K`.
- **Offline Persistence:** User preferences and saved locations are robustly cached using a custom local storage abstraction.

## 🏗️ Architecture & Technology Stack

Nimbus is built to showcase the future of Angular development:

* **Zoneless CSR:** Runs completely without `zone.js`, relying purely on Signals for change detection to maximize performance.
* **Signal-Based State:** Custom, decoupled stores (`WeatherStore`, `SettingsStore`, `LocationStore`) utilize Angular Signals (`signal`, `computed`, `effect`) for fine-grained reactivity.
* **Modern Control Flow:** Extensive use of `@if`, `@for`, and `@defer` to lazy-load non-critical UI elements like the Air Quality bento card.
* **RxJS Pipelines:** Complex asynchronous streams (e.g., geocoding autocomplete with `debounceTime` and `switchMap`) are handled elegantly with RxJS.
* **Component Modularity:** Standalone components featuring modern `input()` signals and `ChangeDetectionStrategy.OnPush`.
* **Zero External Dependencies:** No Tailwind, no component libraries, no charting libraries. Everything from the SVG weather icons to the interactive graphs is written from scratch.

## 🚀 Getting Started

### Prerequisites
- Node.js `v22.22.3` or higher
- npm `v10+`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sarveshv9/Nimbus.git
   cd Nimbus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run start
   ```

4. Navigate to `http://localhost:4200/`.

## 📡 API Integration

Nimbus is fully functional and uses the excellent [Open-Meteo API](https://open-meteo.com/) for its data layer. Open-Meteo requires no API key for non-commercial use, making this project completely self-contained.

- Open-Meteo Forecast API
- Open-Meteo Geocoding API
- Open-Meteo Air Quality API

## 🧪 Testing

The project uses modern testing tools configured for speed and reliability:
- **Unit Testing:** Vitest

```bash
npm run test
```

## 📄 License

This project is open-source and available under the MIT License.
