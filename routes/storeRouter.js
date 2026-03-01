const express = require("express");
const storeController = require("../controllers/storeController");
const auth = require("../middleware/auth");  // ✅ Import middleware
const storeRouter = express.Router();

// Public routes - sab dekh sakte hain
storeRouter.get("/", storeController.addIndex);
storeRouter.get("/index", storeController.addHome);
storeRouter.get("/index/:homeId", storeController.getHomeDetails);
storeRouter.get("/rules/:homeId", storeController.getHouseRules);

// Guest only routes - sirf logged in guests
storeRouter.get("/favourites", auth.isGuest, storeController.getFavoriteList);
storeRouter.post("/favourites", auth.isGuest, storeController.postAddToFavorites); 
storeRouter.post("/favourites/delete/:homeId", auth.isGuest, storeController.postRemoveFromFavorites);
storeRouter.get("/confirm-booking/:homeId", auth.isGuest, storeController.getConfirmBooking);
storeRouter.post("/confirm-booking/:homeId", auth.isGuest, storeController.postConfirmBooking);

module.exports = storeRouter;