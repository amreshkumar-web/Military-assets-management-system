require('dotenv').config();
const express = require('express')
const app = express();
const loginRoutes = require('./Routes/LoginRoutes');
const dashRoutes = require('./Routes/StockRoutes')
const cookieParser = require('cookie-parser');
const { xss } = require('express-xss-sanitizer');
const helmet = require('helmet');
const cors = require("cors");
const { startMonthlyStockRollover } = require("./Scheduler/Scheduler");
/* require("./dbConnect"); */
const PORT = process.env.PORT || 5000;


/* require("./redisConnect") */
const sequelize = require("./dbConnect");
const User = require("./models/User");
app.use(cookieParser());
app.use(express.json());
/* app.use(xss()); */
app.use(xss());

app.use(helmet());

app.use(
  cors({
    origin: "https://majestic-crumble-5ef924.netlify.app", // Allow requests from frontend
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization","x-xsrf-token"], // Allowed headers
  })
);
/* const authRoutes = require("./Middlewear/Auth") */


const startServer = async () => {
  try {
    console.log("🔍 Connecting to MySQL via DATABASE_URL");
    await sequelize.sync();
    console.log("✅ MySQL Connected Successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

startServer();
startMonthlyStockRollover()
  
      



app.get("/", (req, res) => {
  res.send("✅ Server is live");
});

app.use('/user', loginRoutes);
app.use('/userData', dashRoutes);






