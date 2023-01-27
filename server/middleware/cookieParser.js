const parseCookies = (req, res, next) => {
  // console.log('this is a cookie:', req.cookies);
  // console.log('headers', req.headers);
  // console.log('reqcookie', req.headers);
  if (req.headers) {
    if (req.headers.cookie) {
      var cookieJArr = req.headers.cookie.split('; ')
        .map((pair) => {
          return pair.split('=');
          // console.log('pair', typeof (pair));
        });
      // console.log('jar', cookieJArr);

      cookieJArr.forEach((pair) => {
        // console.log('pair again', pair);
        req.cookies[pair[0]] = pair[1];
      });
      next();
    }

  }

};

module.exports = parseCookies;