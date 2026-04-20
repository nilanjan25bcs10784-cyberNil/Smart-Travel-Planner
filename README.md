# 🌍 Voyagr — Smart Travel Planner

> An AI-powered travel planning app built with React, Firebase and the Claude API.

---

## 🧠 Problem Statement

Planning a trip involves juggling dozens of moving parts — itineraries, budgets, packing lists, documents, and more. Most travel apps are either too basic or too overwhelming.

**Voyagr solves this by putting everything in one place**, with an AI layer that generates smart itineraries, packing suggestions, and budget breakdowns based on your destination and preferences.

**Who is the user?** Solo travellers, couples, families, and backpackers who want a smarter way to plan trips.

**Why does it matter?** Poor planning leads to missed experiences, overspending, and travel stress. Voyagr removes the friction from trip planning.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Auth | Email/password + Google Sign-In via Firebase Auth |
| 🗺️ Dashboard | Create, manage and switch between multiple trips |
| 📅 Itinerary Builder | Day-by-day activity planner with cost tracking |
| 💰 Budget Tracker | Expense logging with category breakdown & budget progress |
| 🎒 Packing List | Categorised packing list with packed/unpacked progress |
| 📋 Document Vault | Store passport, visa, tickets with expiry alerts |
| 🤖 AI Planner | Claude-powered itinerary, packing & budget suggestions |

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Routing:** React Router v6
- **State:** useState, useContext, custom hooks
- **Backend:** Firebase Auth + Firestore
- **AI:** Anthropic Claude API (claude-sonnet-4)
- **Utilities:** date-fns, lucide-react, react-hot-toast

---

## ⚛️ React Concepts Used

| Concept | Where |
|---|---|
| Functional Components | All components |
| useState | All forms, loading states |
| useEffect | Data fetching in hooks |
| useCallback | Handlers in custom hooks |
| useMemo | Stats computation in useBudget, usePacking |
| useRef | Available for focus management |
| Context API | AuthContext, TripContext |
| Custom Hooks | useTrips, useItinerary, useBudget, usePacking, useDocuments |
| React Router | All page routing + protected routes |
| Lazy Loading | All pages via React.lazy + Suspense |
| Controlled Components | All form inputs |
| Lifting State Up | Trip context shared across all pages |
| Conditional Rendering | Auth guards, empty states, loading states |
| Lists & Keys | All list renders |

---

## 🚀 Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/your-username/smart-travel-planner.git
cd smart-travel-planner
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password + Google
4. Create a **Firestore Database** (start in test mode)
5. Go to Project Settings → Web App → copy config

```bash
cp .env.example .env
# Fill in your Firebase credentials in .env
```

### 4. Run the app
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # ProtectedRoute
│   ├── layout/         # Sidebar, AppLayout
│   ├── dashboard/      # TripCard, TripForm
│   └── ui/             # Button, Input, Modal, Badge, etc.
├── context/
│   ├── AuthContext.jsx  # Firebase auth state
│   └── TripContext.jsx  # Active trip global state
├── hooks/
│   ├── useTrips.js
│   ├── useItinerary.js
│   ├── useBudget.js
│   ├── usePacking.js
│   └── useDocuments.js
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── DashboardPage.jsx
│   ├── ItineraryPage.jsx
│   ├── BudgetPage.jsx
│   ├── PackingPage.jsx
│   ├── DocumentsPage.jsx
│   └── AIPlannerPage.jsx
├── services/
│   ├── firebase.js          # Firebase init
│   ├── firestoreService.js  # All CRUD operations
│   └── aiService.js         # Claude API calls
└── utils/
    └── helpers.js           # Formatters, constants
```

---

## 🌐 Deployment (Vercel)

```bash
npm install -g vercel
vercel
# Add environment variables in Vercel dashboard
```

Or deploy to **Netlify** by connecting your GitHub repo and setting env variables.

---

## 📜 License

MIT
