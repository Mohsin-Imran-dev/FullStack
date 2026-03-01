require("dotenv").config();

const express = require("express");
const path = require("path");
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtil");
const multer = require('multer');
const errorsController = require("./controllers/errors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("❌ MongoDB connection string is missing");
  process.exit(1);
}

// MongoDB options
const mongoOptions = {
  tls: true,
  tlsAllowInvalidCertificates: true,
};

console.log("🔄 Connecting to MongoDB...");

mongoose
  .connect(MONGO_URL, mongoOptions)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Session store
    const store = new MongoDBStore({
      uri: MONGO_URL,
      collection: "sessions",
      mongooseConnection: mongoose.connection,
      connectionOptions: {
        tls: true,
        tlsAllowInvalidCertificates: true,
      },
    });

    store.on("error", (error) => {
      console.log("⚠️ Session store error:", error.message);
    });

    const randomString = (length)=>{
      const characters = 'abcdefghijklmnopqrstuvwxyz';
      let result = '';
      for(let i=0 ; i<length; i++){
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    }

    const storage = multer.diskStorage({
      destination: (req, file, cb)=>{
        cb(null, "uploads/");
      },
      filename: (req, file, cb)=>{
        cb(null, randomString(10) + '-' + file.originalname);
      }
    });
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
    
    const multerOptions = {
      storage,
      fileFilter
    }
    // Middleware
    app.use(express.static(path.join(rootDir, "public")));
    app.use('/uploads', express.static(path.join(rootDir, "uploads")));
    app.use('/host/uploads', express.static(path.join(rootDir, "uploads")));
    app.use(express.urlencoded({ extended: true }));
    app.use(
  multer(multerOptions).fields([
    { name: "photo", maxCount: 1 },
    { name: "pdf", maxCount: 1 }
  ])
);


app.use(
  session({
    secret: "Knowledge Gate AI",
    resave: true,            
    saveUninitialized: true,   
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: false,            
      sameSite: 'lax'
    },
    name: 'connect.sid'         
  })
);

    // Locals middleware
    app.use((req, res, next) => {
      res.locals.isLoggedIn = req.session.isLoggedIn;
      res.locals.userType = req.session.user ? req.session.user.userType : null;
      next();
    });

    app.use((req, res, next) => {
      req.isLoggedIn = req.session.isLoggedIn;
      next();
    });

    // Routes - STORE ROUTER PEHLE (ismein / route hai)
    app.use(storeRouter);  // ← YEH PEHLE AAYEGA
    app.use(authRouter);

    app.use("/host", hostRouter);
    app.use(errorsController.pageNotFound);

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server listening on: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ Error while connecting to MongoDB:", err.message);
    process.exit(1);
  });