# 🏥 MediVance Health Systems - Clinical & Telemedicine Platform

> **A Next-Generation Full-Stack Healthcare Operating System** powered by Express.js, MongoDB, Three.js 3D graphics, PeerJS Video Consultations, AI Clinical Chatbot, and HIPAA-compliant Clinical Workspaces.

---

## 🌟 Key Features & Workspaces

- **🏠 Landing Page (`index.html`)**: Modern healthcare web showcase with interactive 3D elements, specialist directory, and online appointment booking.
- **🔑 Authentication & Single Sign-On (`loginpage.html`)**: Role-based access control (Doctor, Patient, Assistant) with interactive **Google & Apple ID SSO Consent Modal** and HIPAA privacy agreement.
- **🩺 Doctor Clinical OS (`drdashbaord.html`)**: Real-time patient queue dispatcher, active consultation workspace, E-Prescriptions generator, critical vitals emergency alerts, and automated procedure billing.
- **😷 Patient Health Portal (`pdashbaord.html`)**: Daily vitals tracker, pill reminder schedule with visual completion feedback, electronic health vault with PDF download & upload, and instant payment receipt issuing.
- **📋 Assistant & Nurse Desk (`adsahbaord.html`)**: Vitals entry log, triage level assessment, room occupancy tracker, and Code Blue emergency SOS dispatcher.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/medivance-healthcare.git
cd medivance-healthcare
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory or root directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/medivance
JWT_SECRET=medivance_jwt_secret_key_2024_healthcare_platform
JWT_EXPIRE=7d
```

### 4. Seed Database (Optional Demo Data)
Populate MongoDB with demo doctors, patients, and appointment queues:
```bash
npm run seed
```

### 5. Run Application
Start the full-stack server:
```bash
npm start
```
Open **`http://localhost:5000/index.html`** in your browser!

---

## 🔑 Demo Access Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| 🩺 **Doctor** | `doctor@medivance.com` | `Password123!` |
| 😷 **Patient** | `patient@medivance.com` | `Password123!` |
| 📋 **Assistant** | `assistant@medivance.com` | `Password123!` |

---

## ☁️ Deployment Instructions for GitHub / Cloud Hosting

### Deploying to Render / Railway / Heroku
1. Push repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - MediVance Healthcare OS"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/medivance-healthcare.git
   git push -u origin main
   ```
2. Connect your GitHub repository on Render or Railway.
3. Set the **Build Command** to: `npm install`
4. Set the **Start Command** to: `npm start`
5. Add environment variable `MONGO_URI` (e.g. your MongoDB Atlas connection string).

---

## 📜 License
This project is licensed under the MIT License.
