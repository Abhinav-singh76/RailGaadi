# RailGaadi 🚆

RailGaadi is a real-time train tracking and journey companion app. It shows live train status, journey progress, weather-aware context, and lets users share their journey with others.

## ✨ Features

- **Live train search & tracking** — search trains and view real-time status
- **Journey view** — track an ongoing journey with an interactive map and status panel
- **Shareable journeys** — generate a shareable link so others can follow your trip
- **Weather-aware context** — journey context enriched with weather data
- **Analytics** — insights and stats on trains/journeys
- **Explore** — discover trains and routes

## 🏗️ Project Structure

This is a monorepo managed with npm workspaces.

```
RailGaadi/
├── packages/
│   ├── backend/          # Express/Node backend API
│   │   ├── src/
│   │   │   ├── providers/    # Data providers (mock, OpenWeather, RailRadar)
│   │   │   ├── routes/       # API routes (trains, context, share)
│   │   │   └── services/     # Business logic (train, share services)
│   │   └── .env.example
│   │
│   ├── frontend/         # React + Vite + TypeScript frontend
│   │   ├── src/
│   │   │   ├── api/           # API client layer
│   │   │   ├── components/    # UI, map, and journey components
│   │   │   ├── pages/         # App pages (Home, Explore, Journey, etc.)
│   │   │   ├── store/         # App state (Zustand)
│   │   │   └── styles/        # Global styles & design tokens
│   │   └── .env.example
│   │
│   └── types/            # Shared TypeScript types across packages
```

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, TypeScript
- **Shared:** Common types package for type safety across frontend/backend
- **Data Providers:** Mock data, OpenWeather API, RailRadar API

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

```bash
git clone https://github.com/Abhinav-singh76/RailGaadi.git
cd RailGaadi
npm install
```

### Environment Variables

Copy the example env files and fill in your own values:

```bash
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```

### Running the app

```bash
# Run backend
cd packages/backend
npm run dev

# Run frontend (in a separate terminal)
cd packages/frontend
npm run dev
```

## 📄 License

This project is currently unlicensed. Add a license file if you plan to open source it.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.
