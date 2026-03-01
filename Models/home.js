const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const homeSchema = new mongoose.Schema({
  houseName: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
  photo: String,
  pdf: String,
  description: String,
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// homeSchema.pre('findOneAndDelete', async function(){
//   const homeId = this.getQuery()._id;
//   await Favourite.deleteMany({houseId: homeId});
// })
module.exports = mongoose.model("Home", homeSchema);
