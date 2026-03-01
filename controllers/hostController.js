
const Home = require("../Models/home");
const fs = require("fs");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnd",
    pageName: "AddHome",
    editing: false,
    isLoggedIn: req.isLoggedIn,
  });
};

exports.addHostHome = (req, res, next) => {
  Home.find().then((registeredHome) => {
    res.render("host/host-home-list", {
      registeredHome: registeredHome,
      pageTitle: "Host Homes List",
      pageName: "Host Home",
      isLoggedIn: req.isLoggedIn,
    });
  });
};

exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, description } = req.body;

  const photo = req.files?.photo ? req.files.photo[0].path : "";
  const pdf = req.files?.pdf ? req.files.pdf[0].path : "";

  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
    pdf,
    description,
    userId: req.session.user._id,
  });

  home.save()
    .then(() => res.redirect("/host/host-home-list"))
    .catch(err => console.log(err));
};


exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";
  Home.findById(homeId).then((home) => {
    if (!home) {
      return res.redirect("/host/host-home-list");
    }
    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit Your Home",
      pageName: "Host Home",
      editing: editing,
      isLoggedIn: req.isLoggedIn,
    });
  });
};

exports.postEditHome = (req, res, next) => {
  const { _id, houseName, price, location, rating, description } = req.body;

  Home.findById(_id)
    .then((home) => {
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.description = description;

      if (req.files?.photo) {
        if (home.photo) fs.unlink(home.photo, () => { });
        home.photo = req.files.photo[0].path;
      }

      if (req.files?.pdf) {
        if (home.pdf) fs.unlink(home.pdf, () => { });
        home.pdf = req.files.pdf[0].path;
      }

      return home.save();
    })
    .then(() => {

      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.log("Error updating home:", err);
      res.redirect("/host/host-home-list");
    });
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((error) => {
      console.log("Error deleting home:", error);
    });
};

// hostController.js mein ye function add karo
// hostController.js mein getHostBookings function update karo

// hostController.js mein getHostBookings function update karo

exports.getHostBookings = async (req, res, next) => {
  try {
    // Sirf host ko dikhao
    if (!req.session.isLoggedIn || req.session.user.userType !== "host") {
      return res.redirect("/");
    }

    const Booking = require("../Models/booking");
    const Home = require("../Models/home");
    
    console.log("Host ID:", req.session.user._id); // Debug
    
    // Host ke saare homes find karo
    const hostHomes = await Home.find({ userId: req.session.user._id });
    console.log("Host Homes found:", hostHomes.length); // Debug
    
    const homeIds = hostHomes.map(home => home._id);
    console.log("Home IDs:", homeIds); // Debug
    
    // In homes ki saari bookings find karo
    const bookings = await Booking.find({ 
      homeId: { $in: homeIds } 
    }).populate("homeId").sort({ bookingDate: -1 });
    
    console.log("Bookings found:", bookings.length); // Debug
    
    res.render("host/bookings", {
      bookings: bookings,
      pageTitle: "My Homes Bookings",
      pageName: "Host Bookings",
      isLoggedIn: req.isLoggedIn,
    });
  } catch (err) {
    console.log("Error fetching host bookings:", err);
    res.redirect("/host/host-home-list");
  }
};