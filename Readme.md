# 🔐 SecureLogin - Backend Setup

This is the backend for the SecureLogin project, built with Node.js, Express, Redis, Nodemailer, and MariaDB.

---

## 📦 Step 1: Install Dependencies

Make sure you have Node.js installed. Then:

```bash
cd Backend
npm install



------------------------------------------------------------------------------------------------


🛠️ Step 2: MariaDB Setup (Local or Cloud)
You must install MariaDB locally or use a free cloud-based solution (like Planetscale or db4free).

Install MariaDB: https://mariadb.org/download/

Create a database:

Note down the username and password – you’ll need this in .env.



-----------------------------------------------------------------------------------------



🔐 Step 3: Redis Setup (using Upstash)
Use Upstash to get a free Redis instance:

Visit: https://upstash.com/

Create a free account and new Redis database.

Copy the Redis URL and set it in .env as REDIS_SECRET_CODE.




----------------------------------------------------------------------------------


📧 Step 4: Nodemailer Setup
To send OTP via email, you need a 2nd app password for your Gmail.

Go to Google Account Security

Turn on 2-step verification.

Go to App passwords → Generate password for "Mail".

Copy that and use it as NODEMAILER_SECRET_CODE in .env.


----------------------------------------------------------------------------------------

 Step 5: Setup .env File
Create a .env file inside the Backend folder with this structure



REDIS_SECRET_CODE=redis://default:<your_upstash_redis_url>
NODEMAILER_SECRET_CODE=<your_app_password>
JWT_SECRET_KEY=<your_custom_secret_key>
DATABASE_SECRET_KEY=<your_mariadb_password>




-------------------------------------------------------------------------------------------

🚀 Step 6: Run the Server
Once everything is set up:


npm start

Or if you're using nodemon:

nodemon server.js