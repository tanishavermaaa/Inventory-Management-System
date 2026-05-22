# Inventory Management System (IMS)

A complete MERN stack Inventory Management System featuring:
- **Sole Admin Security Guards**: Protects logout/removal loops, user demotion safety, and blocks redundant admin registrations.
- **Session-Isolated Authentication**: Employs `sessionStorage` instead of `localStorage` to allow parallel, independent user and admin testing inside the same browser (different tabs).
- **Modern Compact UI/UX**: Tighter Sidebar alignment and less vertical spacing.
- **Table Pagination**: Frontend pagination (8 items per page generally, 5 items per page for Admin Orders) and filters built into all list layouts.
- **Real-Time Notification System**: Fully integrated with Socket.io for immediate notifications on order placements, approvals, and account closures.

---

## 📦 Required Packages & Installation Guide (Simplified)

Below is the simple list of packages required to run the system, what they do, and how to install them.

### 🔌 Backend Dependencies
To install all of these automatically, go to the `backend` folder and run `npm install`. If you want to install them one-by-one, run the command shown below:

```bash
cd backend
```

1. **`express`** (Web Framework)
   - *What it does*: The engine that runs the backend. It receives requests from the frontend and sends back answers.
   - *Install command*: `npm install express`
2. **`mongoose`** (Database Connector)
   - *What it does*: Connects the backend server to MongoDB to store/retrieve products, users, and orders.
   - *Install command*: `npm install mongoose`
3. **`cors`** (Cross-Origin Resource Sharing helper)
   - *What it does*: Allows the frontend app (running on port 5173) to talk to the backend app (running on port 5000) without getting blocked by the browser.
   - *Install command*: `npm install cors`
4. **`dotenv`** (Environment Config Loader)
   - *What it does*: Reads configurations (like database URL and passwords) securely from the `.env` file.
   - *Install command*: `npm install dotenv`
5. **`bcryptjs`** (Password Encrypter)
   - *What it does*: Scrambles user passwords so they are stored securely in the database instead of plain text.
   - *Install command*: `npm install bcryptjs`
6. **`jsonwebtoken`** (Login Session Handler)
   - *What it does*: Generates secure login tokens (keys) so the server knows which user is logged in.
   - *Install command*: `npm install jsonwebtoken`
7. **`socket.io`** (Real-Time Communication Router)
   - *What it does*: Sends instant updates to the frontend (like live order status notifications).
   - *Install command*: `npm install socket.io`
8. **`nodemailer`** (Email Sender)
   - *What it does*: Allows the backend to send automated emails.
   - *Install command*: `npm install nodemailer`
9. **`nodemon`** (Auto-Restart Tool)
   - *What it does*: Restarts the server automatically every time you save changes to your backend code.
   - *Install command*: `npm install --save-dev nodemon`

---

### 🎨 Frontend Dependencies
To install all of these automatically, go to the `frontend` folder and run `npm install`. If you want to install them one-by-one, run the command shown below:

```bash
cd frontend
```

1. **`react`** & **`react-dom`** (UI Foundation)
   - *What it does*: The main framework used to build interactive user interfaces on the screen.
   - *Install command*: `npm install react react-dom`
2. **`vite`** (Fast Development Server)
   - *What it does*: Runs the local development website and compiles the frontend code rapidly.
   - *Install command*: `npm install --save-dev vite`
3. **`axios`** (HTTP Request Builder)
   - *What it does*: Used by the frontend code to send GET, POST, or PUT requests to the backend server.
   - *Install command*: `npm install axios`
4. **`bootstrap`** (CSS Style Framework)
   - *What it does*: Provides premade designs for buttons, tables, forms, and grid layouts.
   - *Install command*: `npm install bootstrap`
5. **`react-icons`** (Modern Icon Library)
   - *What it does*: Displays user-friendly icons (like boxes, trucks, carts, and locks) on dashboard views.
   - *Install command*: `npm install react-icons`
6. **`react-router-dom`** (Page Navigator)
   - *What it does*: Helps switch between different views (like Dashboard page, Orders page, Profile page) in the web browser URL.
   - *Install command*: `npm install react-router-dom`
7. **`socket.io-client`** (Real-Time Client Connection)
   - *What it does*: Connects the web browser client to the backend socket server to listen for live alerts.
   - *Install command*: `npm install socket.io-client`
8. **`react-hot-toast`** & **`react-toastify`** (Alert Popups)
   - *What it does*: Displays success and error popups in the browser corners when actions are taken.
   - *Install command*: `npm install react-hot-toast react-toastify`

---

## 🚀 Step-by-Step Setup Guide

Follow these steps to deploy and run both parts:

### 1. Configure Backend Variables
Create a file named `.env` inside the `backend` folder and add:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signature_secret_key
```

### 2. Startup Backend Server
```bash
cd backend
npm install
npm run dev
```

### 3. Startup Frontend Website
```bash
cd ../frontend
npm install
npm run dev
```
*(Open the link shown in the terminal, usually `http://localhost:5173`)*
