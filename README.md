Here is the complete, updated markdown content for your `README.md` file that you can copy and paste:

```markdown
# 📦 Inventory Management System (IMS)

A complete, premium MERN stack Inventory Management System designed with modern design aesthetics, session-isolated authentication, real-time WebSocket communication, and robust role-based access control.

🔗 Live Application URL: https://inventorymngt.netlify.app/

---

## 👥 Role-Based Access Control (3 User Roles)

The system features three distinct, secure user roles, each equipped with custom dashboards and action sets:

### 1. 👑 Sole Admin
The ultimate controller of the inventory ecosystem, equipped with extra safety overrides to prevent admin lockout or deletion loops.
* **User Management**: View all registered users, promote members to admin, demote admins to regular users, or delete accounts securely.
* **Category Control**: Create, view, edit, and delete product categories.
* **Product Inventory**: Add new products, update prices and stock levels, and delete items.
* **Order Overseer**: Monitor all incoming employee orders, approve/reject requests, and automatically notify suppliers when stock runs low.
* **Supplier Coordination**: Assign specific products to suppliers for automated restocking pipelines.

### 2. 💼 Employee
The operational team members who manage daily sales, restocking requests, and profile details.
* **Dynamic Catalog**: Browse all available products with live pagination, category filters, and search functionality.
* **Order Placement**: Initiate orders for inventory items with automatic quantity/stock validation.
* **Order Tracking**: View personal order history, track live statuses (Pending, Approved, Shipped, Cancelled), and cancel pending orders.
* **Profile Management**: Update personal info and change account passwords securely.

### 3. 🚚 Supplier
External partners who fulfill inventory restocking requests in real-time.
* **Stock Monitoring**: View products assigned specifically to them and monitor current stock quantities.
* **Supply Chain Management**: Review orders dispatched to them, update shipping/delivery statuses, and coordinate fulfillment.
* **Live Alerts**: Receive instant notifications when admins request stock fulfillment.

---

## ✨ Premium Features

* **Real-Time WebSocket Notifications**: Powered by `Socket.io` to deliver instantaneous alerts across all roles when orders are placed, statuses change, or inventories are updated.
* **Session-Isolated Authentication**: Employs `sessionStorage` instead of `localStorage`. This allows developers and testers to run parallel, independent admin, employee, and supplier sessions inside different tabs of the same browser!
* **Robust Security & Guards**: Safe demotion triggers, blockages for duplicate admin registrations, and sole-admin deletion protection.
* **Modern Compact UI/UX**: Designed with smooth CSS layouts, responsive sidebars, micro-interactions, clean tables, and tight typography.
* **Advanced Table Pagination**: Built-in client-side pagination (8 items per page generally, 5 items per page for Admin Orders) and filters across all listings to ensure speed and performance.

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
   - *What it does*: Allows the frontend app to talk to the backend app without getting blocked by the browser.
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

## 🚀 Step-by-Step Local Setup Guide

Follow these steps to run the project locally:

### 1. Configure Backend Variables
Create a file named `.env` inside the `backend` folder and add:
```env
PORT=5001
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
```
