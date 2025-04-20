require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Server } = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = "your_secret_key"; 

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect("mongodb://127.0.0.1:27017/smart_garbage", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to Local MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

const DustbinSchema = new mongoose.Schema({
    driverEmail: String,
    dustbinId: { type: String, unique: true },
    fillPercentage: Number,
    isFull: Boolean,
    lastEmailSentAt: { type: Date, default: null } 
});

const UserSchema = new mongoose.Schema({
    driverName: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', UserSchema);
const Dustbin = mongoose.model('Dustbin', DustbinSchema);

const server = Server(app);
const io = socketIo(server, { cors: { origin: "*" } });

const { SerialPort } = require('serialport');  
const { ReadlineParser } = require('@serialport/parser-readline');
const port = new SerialPort({ path: 'COM7', baudRate: 9600 });  
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

let isUserLoggedIn = false;


parser.on('data', async (data) => {
    console.log("Incoming serial data:", data);
    if (!isUserLoggedIn) return;

    const fillMatch = data.match(/Fill:\s*(\d+)%/);
if (!fillMatch) return;

const fillPercentage = parseInt(fillMatch[1]);
const isFull = fillPercentage >= 99;

// Update database and emit
const dustbin = await Dustbin.findOneAndUpdate(
    { dustbinId: "dustbin-1" },
    { fillPercentage, isFull },
    { upsert: true, new: true, maxTimeMS: 5000, setDefaultsOnInsert: true }
);

io.emit('update', { fillPercentage, isFull, dustbinId: "dustbin-1" });


    if (isFull) {
        const now = new Date();
        const lastEmailTime = dustbin.lastEmailSentAt ? new Date(dustbin.lastEmailSentAt) : null;
        const timeDifference = lastEmailTime ? (now - lastEmailTime) / (1000 * 60) : 9999;

        if (!lastEmailTime || timeDifference >= 30) {
            const user = await User.findOne();
            if (user) {
                await sendEmail(user.email);
                await Dustbin.updateOne({ dustbinId: "dustbin-1" }, { lastEmailSentAt: now });
            }
        }
    }
});


const axios = require('axios');

async function sendEmail(userEmail) {
    const user = await User.findOne({ email: userEmail });
    if (!user) return;

    const brevoApiKey = "";

    axios.post("", {
        sender: { name: "TrashTrack", email: "sadribshaiyanislam@gmail.com" },
        to: [{ email: user.email, name: user.driverName }],
        subject: "🚨 Trash Bin Full Alert 🚨",
        textContent: `Hello ${user.driverName},\n\nYour trash bin is full! Please empty it to ensure efficient waste management.\n\nBest regards,\nTrashTrack System`
    }, {
        headers: { "api-key": brevoApiKey, "Content-Type": "application/json" }
    }).then(() => {
        console.log("📧 Email alert sent successfully to:", user.email);
    }).catch(error => {
        console.error("Email Error:", error);
    });
}

app.post('/register', async (req, res) => {
    const { driverName, email, password } = req.body;

    if (!driverName || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ driverName, email, password: hashedPassword });
        await user.save();
        res.json({ message: "User registered successfully!", email: user.email });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: "Email already exists" });
        } else {
            res.status(500).json({ error: "Something went wrong. Try again." });
        }
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ email: user.email }, SECRET_KEY);
        isUserLoggedIn = true;
        res.json({ token });

    } catch (error) {
        res.status(500).json({ error: "Something went wrong. Try again." });
    }
});

app.post('/logout', async (req, res) => {
    isUserLoggedIn = false; 
    res.json({ message: "User logged out successfully" });
});

app.get('/dustbin', async (req, res) => {
    const dustbin = await Dustbin.findOne();
    res.json(dustbin);
});

app.post('/createDustbin', async (req, res) => {
    try {
        const { dustbinId } = req.body;

        if (!dustbinId || dustbinId.trim() === "") {
            return res.status(400).json({ error: "Dustbin ID is required" });
        }

        const newDustbin = new Dustbin({
            dustbinId: dustbinId.trim(),  
            driverEmail: "example@example.com",
            fillPercentage: 0,
            isFull: false
        });

        await newDustbin.save();
        res.json({ message: "Dustbin created successfully!", dustbinId });
    } catch (error) {
        res.status(500).json({ error: "Failed to create dustbin" });
    }
});

app.get(["/login", "/register"], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
