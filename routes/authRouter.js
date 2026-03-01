const express = require("express");
const isAlreadyAuth = require('../middleware/isAlreadyAuth');
const authController = require("../controllers/authController");
const authRouter = express.Router();

authRouter.get("/login", isAlreadyAuth, authController.getLogin);
authRouter.post("/login", authController.postLogin);
authRouter.post("/logout", authController.postLogout);
authRouter.get("/signup", isAlreadyAuth, authController.getSignup);
authRouter.post("/signup", authController.postSignup);
module.exports = authRouter;
