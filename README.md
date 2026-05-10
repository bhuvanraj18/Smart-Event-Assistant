<div align="center">
  <h1>✨ Smart Event Assistant</h1>
  <p><strong>A Next-Generation, AI-Powered Smart Event Assistant</strong></p>
  <p>Seamlessly plan, visualize, and budget your dream events using the power of Google Gemini AI and WebXR.</p>
</div>

<br />

## 🌟 Overview

**Lumina Event Genie** is a comprehensive web platform designed to take the stress out of event planning. By combining modern React aesthetics (Glassmorphism, GSAP Animations) with a robust Express + MongoDB backend, this application offers users intelligent chatbot assistance, automated budget planning, and an immersive AR preview engine.

---

## 🚀 Key Features

*   **🤖 AI Event Copilot:** A Gemini-powered smart chatbot that offers instant, personalized ideas for themes, decorations, and vendor recommendations based on your specific event.
*   **💸 Smart Budget Planner:** Enter your event constraints and let our AI dynamically allocate your budget, suggesting creative ways to save money while avoiding hidden expenses.
*   **🕶️ Live AR Decoration Viewer:** Visualize flower arrangements, tablescapes, and lighting setups directly in your physical space using our experimental WebXR & Three.js powered previewer.
*   **🔐 Secure Authentication:** Complete JWT-based authentication system with secure HTTP-only cookies, password hashing (bcrypt), and encrypted user sessions stored on MongoDB Atlas.
*   **📖 Vendor Directory:** Browse, filter, and connect with top-tier service providers (Catering, Venues, Photographers, etc.).

---

## 🛠️ Technology Stack

**Frontend**
*   [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
*   [GSAP](https://gsap.com/) for Premium Scroll & Entrance Animations
*   [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) + [Drei](https://github.com/pmndrs/drei) (3D/AR Mockup Engine)
*   [Lucide React](https://lucide.dev/) (Icons)
*   Pure Vanilla CSS (CSS Modules & Custom Properties)

**Backend**
*   [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
*   [MongoDB](https://www.mongodb.com/) + Mongoose (Database & ODM)
*   [Google Generative AI (Gemini)](https://ai.google.dev/) SDK
*   [JSON Web Tokens (JWT)](https://jwt.io/) & [Bcrypt](https://www.npmjs.com/package/bcrypt)

---

## ⚙️ Environment Variables

To run this project locally, you will need to configure environment variables for both the client and the server.

### 1. Backend (`server/.env`)
Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Security
JWT_SECRET=your_super_secret_jwt_signature_key

# MongoDB Connection
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/event_genie

# Google Gemini AI
GEMINI_API_KEY=your_google_gemini_api_key
```

### 2. Frontend (`client/.env`)
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
```

---

## 🏃 Quick Start Guide

You will need two terminal windows to run the frontend and backend concurrently.

### 1. Boot up the Backend
```bash
cd server
npm install
npm run dev
```
*The server will start on port 5000 and connect to your MongoDB cluster.*

### 2. Boot up the Frontend
```bash
cd client
npm install
npm run dev
```
*Vite will launch the React application at `http://localhost:5173`.*

---

## 📁 Project Architecture

```
📦 Smart-Event-Assistant
 ┣ 📂 client/               # React Frontend
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📂 components/       # Reusable UI (Navbar, GlassCards, AuthShell)
 ┃ ┃ ┣ 📂 context/          # React Context (AuthContext)
 ┃ ┃ ┣ 📂 pages/            # Main Views (Home, AIChat, BudgetPlanner, ARViewer)
 ┃ ┃ ┗ 📂 utils/            # Axios API configurations
 ┃ ┗ 📜 index.css           # Global Design System (Tokens, Animations)
 ┃
 ┣ 📂 server/               # Node.js / Express Backend
 ┃ ┣ 📂 controllers/        # Route Handlers (authController, etc.)
 ┃ ┣ 📂 middleware/         # Custom Express Middleware (JWT Protect)
 ┃ ┣ 📂 models/             # Mongoose Schemas (User, Vendor, BudgetPlan)
 ┃ ┣ 📂 routes/             # API Route Definitions
 ┃ ┣ 📂 utils/              # Token Generators & Email Transporters
 ┃ ┗ 📜 index.js            # Express Server & Gemini Initialization
 ┃
 ┗ 📜 README.md
```

---

## 🤝 Contributing
Contributions are always welcome!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

<div align="center">
  <p>Built with ❤️ for exceptional events.</p>
</div>
