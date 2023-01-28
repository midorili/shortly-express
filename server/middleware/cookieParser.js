const parseCookies = (req, res, next) => {
  // console.log('this is a cookie:', req.cookies);
  // console.log('headers', req.headers);
  // console.log('reqcookie', req.headers);
  // if (req.headers) {
  //   if (req.headers.cookie) {
  //     var cookieJArr = req.headers.cookie.split('; ')
  //       .map((pair) => {
  //         return pair.split('=');
  //         // console.log('pair', typeof (pair));
  //       });
  //     // console.log('jar', cookieJArr);

  //     cookieJArr.forEach((pair) => {
  //       // console.log('pair again', pair);
  //       req.cookies[pair[0]] = pair[1];
  //     });
  //     next();
  //   } else {
  //     next();
  //   }
  // } else {
  //   next();
  // }
  var cookieString = req.get('Cookie') || '';

  parsedCookies = cookieString.split('; ').reduce((cookies, cookie) => {
    if (cookie.length) {
      let index = cookie.indexOf('=');
      let key = cookie.slice(0, index);
      let token = cookie.slice(index + 1);
      cookies[key] = token;
    }
    return cookies;
  }, {});

  req.cookies = parsedCookies;

  next();
};



module.exports = parseCookies;