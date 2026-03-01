const express = require("express");
const hostController = require("../controllers/hostController");
const auth = require("../middleware/auth");  // ✅ Import middleware
const hostRouter = express.Router();

// Host routes - sirf host access kar sake
hostRouter.get("/add-home", auth.isHost, hostController.getAddHome);
hostRouter.post("/add-home", auth.isHost, hostController.postAddHome);
hostRouter.get("/bookings", auth.isHost, hostController.getHostBookings);
hostRouter.get("/host-home-list", auth.isHost, hostController.addHostHome);
hostRouter.get("/edit-home/:homeId", auth.isHost, hostController.getEditHome);
hostRouter.post("/edit-home", auth.isHost, hostController.postEditHome);
hostRouter.post("/delete-home/:homeId", auth.isHost, hostController.postDeleteHome);

module.exports = hostRouter;