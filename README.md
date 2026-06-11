# SellSmart — Intelligent Inventory & Sales Management System

> **"Your Shop, Running Itself."**  
> A full-stack MERN + FastAPI ML application for small Indian retailers.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.10+
- A [Clerk](https://clerk.com) account (free)

---

## 1. Client (React + Vite)

```bash
cd client
cp .env.example .env
# Edit .env — add your VITE_CLERK_PUBLISHABLE_KEY
npm install
npm run dev
# → http://localhost:5173
```

---

## 2. Server (Express + MongoDB)

```bash
cd server
cp .env.example .env
# Edit .env — add MONGO_URI and CLERK_SECRET_KEY
npm install
npm run dev
# → http://localhost:5000
```

---

## 3. ML Service (Python FastAPI)

```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000
```

---

## 🔑 Environment Variables

### client/.env
| Variable | Value |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | From Clerk Dashboard |
| `VITE_API_URL` | `http://localhost:5000` |

### server/.env
| Variable | Value |
|---|---|
| `PORT` | `5000` |
| `MONGO_URI` | `mongodb://localhost:27017/sellsmart` |
| `CLERK_SECRET_KEY` | From Clerk Dashboard |
| `ML_SERVICE_URL` | `http://localhost:8000` |

---

## 🏗️ Project Structure

```
SellSmart/
├── client/                  # React + Vite + TailwindCSS
│   └── src/
│       ├── pages/           # Home, Dashboard, Inventory, Sales, Udhaari, MLReport, Analytics
│       ├── components/      # Layout, Navbar, Sidebar, StatCard, Charts, etc.
│       └── utils/           # api.js, formatters.js, generatePDF.js
├── server/                  # Node.js + Express + MongoDB
│   ├── models/              # Product, Sale, Udhaari
│   ├── routes/              # products, sales, udhaari, analytics, ml
│   └── middleware/          # clerkAuth, errorHandler
└── ml-service/              # Python FastAPI
    ├── models/              # linear_regression.py, decision_tree.py
    ├── routers/             # predict.py
    └── schemas/             # request.py
```

---

## ✨ Features

| Feature | Status |
|---|---|
| Clerk Authentication | ✅ |
| Real-time Inventory | ✅ |
| Low Stock Alerts | ✅ |
| Daily Sales Tracker | ✅ |
| Date-wise Sales History | ✅ |
| Udhaari (Credit) Ledger | ✅ |
| WhatsApp Payment Reminder | ✅ |
| ML Demand Prediction (Linear Regression) | ✅ |
| Restock Classification (Decision Tree) | ✅ |
| Weekly Earnings Chart | ✅ |
| Category Revenue Breakdown | ✅ |
| PDF Invoice Generator | ✅ |
| Profit Margin Tracker | ✅ |

---

## 🎨 Design

- **Theme:** Pure black / grey / white — no other colors
- **Font:** Inter (Google Fonts)
- **UI:** Glassmorphism cards, micro-animations, dark tables
- **Charts:** Recharts with dark custom tooltips

---

## 🤖 ML Pipeline

```
MongoDB Sales History (6 months)
         ↓
  Linear Regression per product
  → Predicted qty for next month
         ↓
  Decision Tree Classifier
  → Stock More / Stock Same / Stock Less
         ↓
  Displayed in ML Report page
```
