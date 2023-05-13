const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// Require the User model in order to interact with the database
const User = require("../models/User.model");
const Resource = require('../models/Resource.model')

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/signup", isLoggedOut, (req, res) => {
  res.render("auth/signup");
});


router.post('/signup', isLoggedOut, async (request, response) => {
  const { email, password } = request.body;
  if (!email || !password) {
    response.render('auth/signup', { errorMessage: 'All fields are mandatory. Please provide your username, email and password.' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create({
      email: email,
      password: hashedPassword
    });
    console.log(email, hashedPassword);
    response.render('auth/signup', { Message: 'User Created, please loggin' });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      response.status(500).render('auth/signup', { errorMessage: error.message });
    } else if (error.code === 11000) {
      response.status(500).render('auth/signup', {
        errorMessage: 'Email is already used.'
      });
    } else {
      next(error);
    }
  }


});


// GET /auth/login

router.get("/login", isLoggedOut, (req, res, next) => {
  res.render("auth/login");
});


// POST login route ==> to process form data
router.post('/login', isLoggedOut, async (req, res, next) => {
  const { email, password } = req.body;
  console.log('SESSION =====> ', req.session);
  if (email === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Please enter both, email and password to login.'
    });
    return;
  }

  await User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        res.render('auth/login', { errorMessage: 'Incorrect password o e-mail' });
        return;
      } else if (bcrypt.compareSync(req.body.password, user.password)) {
        //res.render('user/user-profile', { user });
        req.session.currentUser = user;
        res.redirect('/profile');

      } else {
        res.render('auth/login', { errorMessage: 'Incorrect password o e-mail' });
      }
    })
    .catch(error => next(error));
});

//profile User
router.get('/profile', isLoggedIn, (req, res) => {
  res.render('user/profile');
});
// Router Post Logout

router.post('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) next(err);
    res.redirect('/');
  });
});

//Resources routes
router.get('/new-resource', (req, res) => {
  res.render('auth/new-resource');
});


router.post('/new-resource', (req, res, next) => {
  const { title, category, content, code } = req.body;

  console.log(req.body)
  Resource.create({ title, category, content, code })

    .then(data => {
      res.redirect('/resources')
    })
    .catch(error => next(error));
});


router.get('/resources', (req, res, next) => {
  Resource.find()
  .then(allResources => {
      res.render ('auth/resources', {resources: allResources});
  })
  .catch(error => {
      console.log('Error while getting the resources from the DB: ', error);
      next(error);
  });
});

/**Resource detail Routes */
router.get('/resource/:id', (req, res, next) => {
  const { id } = req.params;
  Resource.findById(id)
      .then(data => res.render('auth/resource-detail.hbs', { resource: data }))
      .catch(error => {
          console.log('Error while retrieving resource details: ', error);
          next(error);
      });
});









module.exports = router;
