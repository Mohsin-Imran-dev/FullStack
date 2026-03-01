// middleware/auth.js
exports.isHost = (req, res, next) => {
  if (req.session.isLoggedIn && req.session.user.userType === 'host') {
    next();
  } else {
    res.redirect('/');
  }
};

exports.isGuest = (req, res, next) => {
  if (req.session.isLoggedIn && req.session.user.userType === 'guest') {
    next();
  } else {
    res.redirect('/');
  }
};

exports.isLoggedIn = (req, res, next) => {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
};