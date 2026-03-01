
const Home = require("../Models/home");
const fs = require("fs");
const path = require("path");  // ✅ YEH ADD KARO

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

const UPLOAD_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Helper function to save file to correct location
const saveUploadedFile = (file) => {
  if (!file) return "";
  
  // Railway volume path
  const uploadDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '../uploads');
  
  // Unique filename generate karo
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filename = uniqueSuffix + '-' + file.originalname;
  const filepath = path.join(uploadDir, filename);
  
  // File ko move karo temporary se permanent location par
  fs.renameSync(file.path, filepath);
  
  // Sirf filename return karo, full path nahi
  return filename;
};

exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, description } = req.body;

  // ✅ YEH CHANGE KARO - Sirf filename save karo
  const photo = req.files?.photo ? saveUploadedFile(req.files.photo[0]) : "";
  const pdf = req.files?.pdf ? saveUploadedFile(req.files.pdf[0]) : "";

  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,  // Ab sirf filename store hoga, e.g., "123456789-file.jpg"
    pdf,    // Sirf filename
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

      // ✅ YEH CHANGE KARO
      if (req.files?.photo) {
        // Purani file delete karo agar exist kare
        if (home.photo) {
          const oldPhotoPath = path.join(UPLOAD_DIR, home.photo);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
        // Naya photo save karo aur sirf filename store karo
        home.photo = saveUploadedFile(req.files.photo[0]);
      }

      if (req.files?.pdf) {
        // Purani file delete karo
        if (home.pdf) {
          const oldPdfPath = path.join(UPLOAD_DIR, home.pdf);
          if (fs.existsSync(oldPdfPath)) {
            fs.unlinkSync(oldPdfPath);
          }
        }
        // Naya pdf save karo
        home.pdf = saveUploadedFile(req.files.pdf[0]);
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
  
  // Pehle home find karo files delete karne ke liye
  Home.findById(homeId)
    .then(home => {
      if (home) {
        // Photo delete karo
        if (home.photo) {
          const photoPath = path.join(UPLOAD_DIR, home.photo);
          if (fs.existsSync(photoPath)) {
            fs.unlinkSync(photoPath);
          }
        }
        // PDF delete karo
        if (home.pdf) {
          const pdfPath = path.join(UPLOAD_DIR, home.pdf);
          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
          }
        }
      }
      // Phir home delete karo
      return Home.findByIdAndDelete(homeId);
    })
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