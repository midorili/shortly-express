const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const Auth = require('./middleware/auth');
const models = require('./models');
const cookieParser = require('./middleware/cookieParser.js');
const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser);
app.use(Auth.createSession);

var verifySession = (req, res, next) => {
  // if req.session has a user
  // console.log('sesh', req.session);
  // if (models.Sessions.isLoggedIn(req.session)) {
  //   if (req.session.user) {
  //     res.render('index');
  //   } else {
  //     res.redirect('/login');
  //   }
  // } else {
  //   next();
  // }

  if (!models.Sessions.isLoggedIn(req.session)) {
    res.redirect('/login');
  } else {
    next();
  }
};

app.get('/', verifySession,
  (req, res) => {
    // console.log('sesh2', req.session);

    res.render('index');
    // verifySession(req.session);
  });

app.get('/create', verifySession,
  (req, res) => {
    res.render('index');
    // verifySession(req.session);
  });

app.get('/links', verifySession,
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/login',
  (req, res) => {
    res.render('login');
  });

app.get('/signup',
  (req, res) => {
    res.render('signup');
  });

app.get('/logout', (req, res, next) => {
  models.Sessions.delete({ hash: req.session.hash })
    .then(confirmDelete => {
      res.cookie('shortlyid', '');
      res.redirect('/login');
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/login', (req, res, next) => {
  // console.log('req', req.body);
  var username = req.body.username;
  var password = req.body.password;
  models.Users.get({ username })
    .then(results => {
      // console.log(results);
      if (results) {
        // console.log('resultID', results.id);
        if (models.Users.compare(password, results.password, results.salt)) {
          return models.Sessions.update({ hash: req.session.hash }, { userId: results.id })
            .then(update => {
              // console.log('update', update);
              req.session.user = results.username;
              req.session.userId = update.insertId;
              // console.log('session', req.session);
              res.redirect('/');
            });
          // req.userData = { username: req.body.username, userId: results.id };

        } else {
          res.redirect('/login');
        }
      } else {
        res.redirect('/login');
      }
    })
    .catch(err => console.log(err));
});

app.post('/signup', (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;
  models.Users.get({ username })
    .then(result => {
      if (result) {
        res.redirect('/signup');
      } else {
        models.Users.create({ username, password })
          .then(userInserted => {
            models.Sessions.update({ hash: req.session.hash }, { userId: userInserted.insertId })
              .then(update => {
                // console.log('update', update);
                req.session.user = { username };
                req.session.userId = update.insertId;
                // console.log('session', req.session);
                res.redirect('/');
              });
          });
      }
    })
    .catch(err => {
      console.log(err);
    });

});

// app.use(cookieParser);
// app.use(session.createSession);
/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
