require('dotenv/config');
require('./db');
const express = require('express');
const hbs = require('hbs');
const app = express();
const path = require('path');
const authRoutes = require("./routes/auth.routes");


require('./config/session.config')(app);
require('./config')(app);
require('./error-handling')(app);



hbs.registerHelper('if_eq', function(a, b, opts) {
  if(a == b) 
      return opts.fn(this);
  else
      return opts.inverse(this);
});

app.use(function(req, res, next) {
    console.log(req.session)
    if (req.session.currentUser) {
      res.locals.user = req.session.currentUser;
    }
    next();
  });

// 👇 Start handling routes here
const index = require('./routes/index.routes');
app.use('/', index);
app.use("/", authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



module.exports = app;