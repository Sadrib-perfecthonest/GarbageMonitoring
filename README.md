# ♻️ TrashTrack - IoT-Based Smart Garbage Monitoring System

**TrashTrack** is an IoT-based smart garbage monitoring website designed to optimize waste management using sensor technology and real-time alerts. Built with Arduino hardware and a Node.js backend, it monitors bin levels and notifies authorities when bins are full — all in a sleek, responsive web interface.

---

## 🌐 Website Features

- User login & registration
- Real-time garbage level monitoring via ultrasonic sensor
- Email notifications when bins are full (using Brevo API)
- Socket-powered live updates
- Admin dashboard for monitoring bins
- MongoDB-backed data storage

---

## 🧠 Technologies Used

### 🖥️ Frontend
- HTML
- CSS

### 🌐 Backend (Node.js)
- `express` – Web server
- `mongoose` – MongoDB ODM
- `bcryptjs` – Password hashing
- `jsonwebtoken` – User authentication
- `dotenv` – Environment variables
- `cors` – Cross-Origin Requests
- `nodemailer` – Email service (with Brevo API)
- `serialport` – Arduino communication
- `socket.io` – Real-time updates
- `axios` – HTTP requests

---

## 🗃️ Database

- **MongoDB** – Stores user data, garbage level readings, and system status

---

## 🔧 Hardware & Components

- **Arduino Uno**
- **Ultrasonic Sensor (HC-SR04)** – Measures bin fill level
- **Jumper Wires**
- **Breadboard**
- **Arduino IDE** – Used for programming the microcontroller

---

## 📬 Email Notifications

The system uses **Brevo (Sendinblue)** via Nodemailer to send automated email alerts when garbage bins reach maximum capacity.

---

## 📌 Project Setup

1. **Clone the repository**
2. **Run `npm install` in the backend folder**
3. **Configure `.env` with MongoDB URI and Brevo credentials**
4. **Upload the Arduino sketch using Arduino IDE**
5. **Run the backend server**
6. **Open the frontend in a browser**

---

## 💡 Future Improvements

- Add bin location tracking via GPS
- Add SMS notifications
- Mobile app interface
- Admin analytics dashboard

---



