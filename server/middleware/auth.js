const models = require('../models');
const Promise = require('bluebird');
// const db = require('../db');

module.exports.createSession = (req, res, next) => {
  // var username = req.body.username;
  var password = req.body.password;
  req.session = {};
  // query database for session
  if (req.cookies.shortlyid) {
    models.Sessions.get({ hash: req.cookies.shortlyid })
      .then(result => {
        if (result) {
          // console.log(result.hash);
          req.session.hash = result.hash;
          res.cookie('shortlyid', result.hash);
          if (result.userId !== null) {
            req.session.userId = result.userId;
            models.Users.get({ id: result.userId })
              .then(userInfo => {
                req.session.user = { username: userInfo.username };
                next();
              })
              .catch(err => {
                console.log(err);
              });
          } else {
            next();
          }

        } else {
          models.Sessions.create()
            .then(result => {
              // console.log('ressi', result);
              models.Sessions.get({ id: result.insertId })
                .then(TextRow => {
                  req.session.hash = TextRow.hash;
                  res.cookie('shortlyid', TextRow.hash);

                  if (TextRow.userId !== null) {
                    req.session.userId = TextRow.userId;
                    models.Users.get({ id: TextRow.userId })
                      .then(userInfo => {
                        // console.log('userinfo', userInfo);
                        req.session.user = { username: userInfo.username };
                        next();
                      })
                      .catch(err => {
                        console.log(err);
                      });
                  } else {
                    next();
                  }
                })
                .catch(err => {
                  console.log(err);
                });
            })
            .catch(err => {
              console.log('err', err);
            });
        }
      })
      .catch(err => {
        console.log('err', err);
      });
  } else {
    models.Sessions.create()
      .then(result => {
        console.log('ressi', result);
        models.Sessions.get({ id: result.insertId })
          .then(TextRow => {
            req.session.hash = TextRow.hash;
            res.cookie('shortlyid', TextRow.hash);
            if (TextRow.userId !== null) {
              req.session.userId = TextRow.userId;
              models.Users.get({ id: TextRow.userId })
                .then(userInfo => {
                  // console.log('userinfo', userInfo);
                  req.session.user = { username: userInfo.username };
                  next();
                })
                .catch(err => {
                  console.log(err);
                });

            } else {
              next();
            }

          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log('err', err);
      });
  }
};





//



// models.Users.get({ username: username })
// .then(result => {
//   if (result) {
//     userId = result.id;
//     console.log('resi', result);
//     console.log('userid', userId);
//   }
// })
// .catch(err => {
//   console.log('err', err);
// });
// [ 'shortlyid', '18ea4fb6ab3178092ce936c591ddbb90c99c9f66' ],
// [ 'otherCookie', '2a990382005bcc8b968f2b18f8f7ea490e990e78' ],
// [ 'anotherCookie', '8a864482005bcc8b968f2b18f8f7ea490e577b20' ]
// if exists
// grab hash
// send back as cookie on res headers
// otherwise
// use model.sessions.create to make session
// };

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

