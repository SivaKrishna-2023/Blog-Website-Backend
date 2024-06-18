const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');

const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const postRoute = require('./routes/post');
const commentRoute = require('./routes/comments');

// Initialize dotenv to load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;
const MONGO_URL = process.env.MONGO_URL;

// CORS options
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/images", express.static(path.join(__dirname, "/images")));

// Ensure 'images' directory exists
const fs = require('fs');
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagesDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
    }
});

const upload = multer({ storage });

// Routes
app.post('/api/upload', upload.single('file'), (req, res) => {
    res.status(200).json({ message: 'Image uploaded successfully', filename: req.file.filename });
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);

// Connect to MongoDB and start server
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Database connection established");
    } catch (err) {
        console.error("Database connection failed", err);
        process.exit(1);
    }
};

app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});