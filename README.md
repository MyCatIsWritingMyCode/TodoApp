# 🏡 ChoreQuest

> A modern, gamified, cross-platform family to-do and chore management application built with **React Native / Expo Router** and an **ASP.NET Core (.NET 10)** REST API.

---

## 🚀 Features

- **Gamified Family Task Management**: Daily tasks, weekly goals, and recurring chores with XP rewards, household leveling, and streak tracking.
- **Task Organization**: Organize tasks into rooms/areas (e.g. *Kitchen*, *Living Room*, *Garden*) with subtasks and progress tracking.
- **Per-User Theme / Skin Engine**: Every family member can choose their own visual palette (*Vanilla*, *Berry*, *Dark*, *Light*).
- **Interactive Calendar & Memos**: Monthly task consistency heatmap and a shared household whiteboard for family notes.
- **Family Skill Tree**: Unlock helpful perks using skill points earned by completing chores.
- **Multi-Language (i18n)**: Full English 🇬🇧 and German 🇩🇪 localization.
- **Cross-Platform**: Runs on iOS, Android, and Web with native feel and animations.
- **ASP.NET Core REST API**: Secure JWT authentication, AES-256-GCM field encryption, rate limiting, and PostgreSQL database integration.

---

## 📂 Project Architecture

```
TodoApp/
├── Backend/                    # ASP.NET Core (.NET 10) Minimal API
│   ├── Data/                   # EF Core DbContext & Migrations
│   ├── DTOs/                   # Request/Response Data Transfer Objects
│   ├── Endpoints/              # Modular Minimal API route endpoints
│   ├── Models/                 # Domain entities (User, TodoItem, Household, etc.)
│   ├── Services/               # Auth, Security, Todos, and Gamification services
│   ├── appsettings.json        # Local configuration (do not commit secrets!)
│   ├── appsettings.Example.json# Safe configuration template
│   └── Dockerfile              # Container deployment for production
├── Frontend/                   # React Native & Expo Router app
│   ├── src/
│   │   ├── app/                # Expo Router file-based screens (auth, tabs, etc.)
│   │   ├── components/         # Reusable UI components
│   │   ├── config/             # Tier & pricing configurations
│   │   ├── i18n/               # English & German localization
│   │   ├── services/           # REST API client & celebration effects
│   │   ├── store/              # Zustand global state management
│   │   └── theme/              # Multi-skin theme engine
│   ├── app.json                # Expo project manifest
│   └── package.json            # Node.js dependencies
├── render.yaml                 # Render.com cloud deployment blueprint
└── TodoApp.slnx                # Visual Studio solution file
```

---

## 🛠️ Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+) & `npm`
- [Expo Go](https://expo.dev/go) app (for running on iOS/Android device) or a modern web browser

---

### 1. Backend Setup (`Backend/`)

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Configure your database connection string in `appsettings.json` (or copy from `appsettings.Example.json`):
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=YOUR_DB_HOST;Port=5432;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true;"
     }
   }
   ```
3. Run database migrations:
   ```bash
   dotnet ef database update
   ```
4. Start the API server:
   ```bash
   dotnet run
   ```
   The API will listen on `http://localhost:5287` with interactive Scalar API docs available at `http://localhost:5287/scalar/v1`.

---

### 2. Frontend Setup (`Frontend/`)

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
   - Press **w** to open in the web browser.
   - Scan the QR code with **Expo Go** on Android or the Camera app on iOS.

---

## 🔐 Environment & Security Checklist

- **Database Credentials**: Never commit database passwords or JWT signing keys to public version control. Keep `appsettings.json` local or use .NET User Secrets / environment variables (`DATABASE_URL`).
- **Production Secrets**: In production, configure secrets via environment variables in your hosting provider (e.g. Render, Azure, Docker).

---

## 📄 License

This project is licensed under the MIT License.
