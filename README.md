# 🌱 Gamified Platform to Promote Sustainable Farming Practices

A full-stack MERN application with an AI-powered recommendation system to motivate farmers to adopt sustainable farming techniques through gamification.

## 🏗️ Architecture

```
project-root/
├── client/          # React frontend (Vite + Tailwind CSS v4)
├── server/          # Node.js + Express REST API
├── ai-service/      # Python Flask AI microservice
└── package.json     # Root scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (running on localhost:27017)
- Python 3.8+

### Installation

```bash
# Install all dependencies at once
npm run install-all

# Or install individually:
cd server && npm install
cd ../client && npm install
cd ../ai-service && pip install -r requirements.txt
```

### Running the Application

Start each service in a separate terminal:

```bash
# Terminal 1: Backend API (port 5000)
cd server
npm run dev

# Terminal 2: React Frontend (port 5173)
cd client
npm run dev

# Terminal 3: AI Service (port 5001)
cd ai-service
python app.py
```

Then open **http://localhost:5173** in your browser.

## 📋 Features

### Farmer Features
- **Register & Login** with JWT authentication
- **Dashboard** showing points, badges, sustainability score, AI recommendations
- **Submit Activities** (organic farming, crop rotation, soil testing, etc.) with photo upload
- **AI Crop Recommendations** based on temperature, humidity, pH, rainfall
- **Sustainability Score** calculator with improvement suggestions
- **Leaderboard** ranking among all farmers
- **Challenges** — join and complete sustainability challenges for bonus points

### Admin Features
- **Analytics Dashboard** with Chart.js visualizations
- **User Management** — view and remove farmers
- **Activity Approval** workflow
- **Challenge Management** — create, manage, and delete challenges

### Gamification System
| Activity | Points |
|---|---|
| Organic Fertilizer | +25 |
| Crop Rotation | +30 |
| Soil Testing | +20 |
| Water Conservation | +40 |
| Composting | +20 |
| Cover Cropping | +25 |
| IPM | +35 |
| Rainwater Harvesting | +35 |
| Biodiversity Planting | +30 |
| No-Till Farming | +30 |

### Badges
| Badge | Threshold |
|---|---|
| 🌱 Eco Beginner | 100 pts |
| 🌿 Green Farmer | 300 pts |
| 🏆 Sustainability Champion | 700 pts |
| 🌍 Earth Guardian | 1,500 pts |
| 💎 Conservation Hero | 3,000 pts |

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login

### Farmer
- `GET /api/farmer/profile` — Get profile
- `PUT /api/farmer/profile` — Update profile
- `GET /api/farmer/all/list` — Admin: list all

### Activities
- `POST /api/activities` — Submit activity (with photo)
- `GET /api/activities` — My activities
- `PUT /api/activities/:id/approve` — Admin: approve

### Gamification
- `GET /api/gamification/stats` — Get stats, badges, breakdown

### Challenges
- `POST /api/challenges` — Admin: create
- `GET /api/challenges` — List all
- `POST /api/challenges/:id/join` — Join
- `POST /api/challenges/:id/complete` — Complete

### Leaderboard
- `GET /api/leaderboard` — Rankings
- `GET /api/leaderboard/my-rank` — My rank

### AI
- `POST /api/ai/recommend-crop` — Crop recommendation
- `POST /api/ai/sustainability-score` — Score calculation

### Weather
- `GET /api/weather/:location` — Weather data

## 🤖 AI Service

- **Crop Recommendation** — Random Forest classifier trained on environmental conditions
- **Sustainability Score** — Weighted scoring model with improvement suggestions
- Falls back gracefully when AI service is offline

## 🔧 Environment Variables

Create `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/sustainable-farming
JWT_SECRET=your_jwt_secret_here
AI_SERVICE_URL=http://localhost:5001
WEATHER_API_KEY=your_openweathermap_key
```
