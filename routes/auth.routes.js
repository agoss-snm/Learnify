const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const domPurifier = require('dompurify');
const multer = require('multer');
const path = require('path');


// Require the User models in order to interact with the database
const User = require("../models/User.model");
const Resource = require('../models/Resource.model')
const Comment = require('../models/Comment.model')

// middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");


// Directorio donde se guardarán las imágenes

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads')); // Ruta relativa a la carpeta padre
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });



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
router.get('/new-resource', isLoggedIn, (req, res) => {
  res.render('auth/new-resource');
});

router.post('/new-resource', isLoggedIn, upload.single('image'), (req, res, next) => {
  const { title, category, content, code } = req.body;
  // Accede a la información del archivo cargado
  const image = req.file;
  const author = req.session.currentUser._id;
  const email =req.session.currentUser.email;
  Resource.create({ title, category, content, code, image, author,email }) // Agrega 'image' a los datos que se guardan en la base de datos

    .then(data => {
      res.redirect('/resources');
    })
    .catch(error => next(error));
});


router.get('/resources', (req, res, next) => {
  Resource.find()
    .populate('_id') // --> we are saying: give me whole user object with this ID (author represents an ID in our case)
    .then(allResources => {
      // console.log("Posts from the DB: ", dbPosts);
      res.render('auth/resources', { resources: allResources });
    })
    .catch(err => {
      console.log(`Err while getting the posts from the DB: ${err}`);
      next(err);
    });
});

/**Resource detail Routes */
router.get('/resource/:id', (req, res, next) => {
  const { id } = req.params;
  Resource.findById(id)
    .populate("comments")
    .then(data => {
      console.log('data' + data.commets) // Ruta correcta para el formulario de comentarios
      res.render('auth/resource-detail.hbs', { resource: data });
    })
    .catch(error => {
      console.log('Error while retrieving resource details: ', error);
      next(error);
    });
});


/**get del edit */
router.get('/resource/:id/edit', isLoggedIn, (req, res, next) => {
  const { id } = req.params;
  Resource.findById(id)
    .then(resourceEdit => {
      res.render('auth/edit-resource.hbs', { data: resourceEdit });
    })
    .catch(error => next(error));
});

/**post del edit */
router.post('/resource/:id/edit', (req, res, next) => {
  const { id } = req.params;
  const { title, category, content, code } = req.body;
  Resource.findByIdAndUpdate(id, { title, category, content, code }, { new: true })
    .then(updateResource => res.redirect(`/resources`)) // go to the details page to see the updates
    .catch(error => next(error));
});


//delete
router.post('/resource/:id/delete', isLoggedIn, (req, res, next) => {
  const { id } = req.params;
  Resource.findByIdAndDelete(id)
    .then(() => res.redirect('/resources'))
    .catch(error => next(error));
});

/**get de category HTML */
// GET /resources/categoryHtml
router.get('/resources/categoryHtml', (req, res, next) => {
  Resource.find({ category: 'HTML' })
    .then(allResourcesHtml => {
      res.render('auth/categoryHtml', { html: allResourcesHtml });
    })
    .catch(error => {
      console.log('Error while getting the resources from the DB:', error);
      next(error);
    });
});

// GET /resources/categoryCss
router.get('/resources/categoryCss', (req, res, next) => {
  Resource.find({ category: 'CSS' })
    .then(allResourcesCss => {
      res.render('auth/categoryCss', { css: allResourcesCss });
    })
    .catch(error => {
      console.log('Error while getting the resources from the DB:', error);
      next(error);
    });
});

// GET /resources/categoryJs
router.get('/resources/categoryJs', (req, res, next) => {
  Resource.find({ category: 'JAVASCRIPT' })
    .then(allResourcesJs => {
      res.render('auth/categoryJs', { js: allResourcesJs });
    })
    .catch(error => {
      console.log('Error while getting the resources from the DB:', error);
      next(error);
    });
});

// GET /resources/categoryPhp
router.get('/resources/categoryPhp', (req, res, next) => {
  Resource.find({ category: 'PHP' })
    .then(allResourcesPhp => {
      res.render('auth/categoryPhp', { php: allResourcesPhp });
    })
    .catch(error => {
      console.log('Error while getting the resources from the DB:', error);
      next(error);
    });
});

// GET /resources/categoryPython
router.get('/resources/categoryPython', (req, res, next) => {
  Resource.find({ category: 'PYTHON' })
    .then(allResourcesPython => {
      res.render('auth/categoryPython', { python: allResourcesPython });
    })
    .catch(error => {
      console.log('Error while getting the resources from the DB:', error);
      next(error);
    });
});


router.get("/resources", (req, res, next) => {
  console.log('hola')
  Resource.find()
    .populate({
      path: "comments",
      populate: {
        path: "author",
        model: "User",
      },
    })
    .then((resources) => {
      console.log('res' + resources)
      res.render("auth/resources", { resources: resources });
    })
    .catch((error) => {
      console.log("Error al obtener los recursos: ", error);
      next(error);
    });
});


router.post('/resource/:id/comment', isLoggedIn, (req, res, next) => {
  const { id } = req.params;
  const { author, content } = req.body;
  Resource.findById(id)
    .populate('author')
    .then((resource) => {
      // Crear un nuevo comentario
      const newComment = new Comment({
        author: req.session.currentUser._id, // Utiliza el ID del autor del comentario desde la sesión del usuario actual
        content: content,
        email:  req.session.currentUser.email,
      });

      // Guardar el comentario en la base de datos
      return newComment.save();
    })
      .then((comment) => {
        // Asocia el comentario al recurso
        return Resource.findByIdAndUpdate(id, { $push: { comments: comment._id } }, { new: true });
     
      
    })
    .then((updatedResource)=>{
      res.redirect('/resource/'+id);
    })
    .catch((error) => {
      console.log('Error al crear el comentario:', error);
      next(error);
    });
});


module.exports = router;
