require('dotenv/config');
require('./db');
const express = require('express');
const hbs = require('hbs');
const app = express();
const path = require('path');


require('./config/session.config')(app);
require('./config')(app);


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

const authRoutes = require("./routes/auth.routes");
app.use("/", authRoutes);
require('./error-handling')(app);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = app;