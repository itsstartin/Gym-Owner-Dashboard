🔥 Gym Management System
A full-stack web application built to help gym owners manage members, attendance, payments, and business insights efficiently.
🔗 Live Demo: https://gym-hub-jet.vercel.app⁠�
💻 Backend Repo: https://github.com/itsstartin/Gym-Owner-Dashboard/backend
🧠 Overview
This project is designed as a SaaS-style system where each gym owner can manage their own data independently. It provides tools to track attendance, monitor payments, and analyze revenue through an intuitive dashboard.
⚙️ Features
👤 Member Management
Add and manage gym members
Assign membership plans (Basic, Premium, VIP)
Track member status (Active, Due, Expired)
💰 Payment System
Record member payments
Automatically calculate:
Total paid amount
Due amount
Payment status
View recent transactions and overdue members
📊 Analytics Dashboard
Revenue trends (last 6 months)
Attendance patterns (weekly & daily)
Membership insights by plan
📅 Attendance Tracking
Members can mark attendance via unique access links
No login required for attendance marking
Data used for analytics and inactivity detection
🔔 Notification System
Alerts for:
Inactive members
Expired memberships
Prevents duplicate notifications using smart logic
📧 Email Integration
Integrated with Brevo API
Sends:
Attendance access links
Payment reminders
🔐 Authentication
JWT-based login system
Secure and isolated data for each user
🏗️ Tech Stack
Frontend
React (Vite)
Tailwind CSS
Material UI
Redux Toolkit
Axios
Chart.js
Backend
Django
Django REST Framework
SQLite
JWT Authentication
Deployment
Frontend: Vercel
Backend: Render
🧠 Architecture Highlights
RESTful API design for modular backend structure
Backend-driven business logic for payments and member status
Token-based access system for attendance without authentication
Optimized data handling by shifting calculations from frontend to backend
⚠️ Note
The backend is hosted on Render free tier, so the first request may take a few seconds to start the server.
🚀 Getting Started (Optional)
Bash
# Clone repository
git clone https://github.com/itsstartin/Gym-Owner-Dashboard

# Install dependencies
npm install

# Run frontend
npm run dev
📌 Future Improvements
Plain text
• PostgreSQL integration  
• Role-based access control  
• Mobile optimization  
• Payment gateway integration
🧑‍💻 Author
Salim Rasheed K K
📧 salimrash91@gmail.com
🔗 github.com/itsstartin
