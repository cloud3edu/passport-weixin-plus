## passport-weixin-plus
passport oauth2 strategy for weixin
Support multiple appids and appsecrets based on different requests

### Install

``` bash
npm install passport-weixin-plus
```

### Usage

``` js
var passport = require('passport')
  , WeixinStrategy = require('passport-weixin-plus')
  ;

passport.use(new WeixinStrategy({
  clientID: 'CLIENTID'
  , clientSecret: 'CLIENT SECRET'
  , callbackURL: 'CALLBACK URL'
  , requireState: false
  , scope: 'snsapi_login'
}, function(accessToken, refreshToken, profile, done){
  done(null, profile);
}));

or

passport.use(new WeixinStrategy({
  clientID: function(req) {
    //return different appid for different req
  },
  clientSecret: function(req) {
    //return different secret for different req
  },
  callbackURL: function(req) {
    //return different callbackURL for different req
  },
  requireState: false,
  scope: 'snsapi_login'
}, function(accessToken, refreshToken, profile, done){
  done(null, profile);
}));
```


### Example

```js
var config = {
  weixinAuth: {
    host2appKeyMap: {
      'demo.mydomain.cn': {
        appkey: '1xxxxxxxxxxxxxxxxx',
        secret: '1yyyyyyyyyyyyyyyyyyyyyyyy'
      },
      'xxx.mydomain.cn': {
        appkey: '2xxxxxxxxxxxxxxxxx',
        secret: '2yyyyyyyyyyyyyyyyyyyyyyyy'
      },
      'www.mydomain.cn': {
        appkey: '3xxxxxxxxxxxxxxxxx',
        secret: '3yyyyyyyyyyyyyyyyyyyyyyyy'
      }
    },
    callbackURL: '/auth/weixin/callback'
  },
};

passport.use(new WeixinStrategy({
  clientID: function(req) {
    return config.weixinAuth.host2appKeyMap[req.headers.host].appkey;
  },
  clientSecret: function(req) {
    return config.weixinAuth.host2appKeyMap[req.headers.host].secret;
  },
  callbackURL: function(req) {
    return "http://" + req.headers.host + config.weixinAuth.callbackURL;
  },
  requireState: false,
  scope: 'snsapi_login',
  passReqToCallback: true
}, function(req, token, refreshToken, profile, done) {
  done(null, profile);
}));

router.get('/auth/weixin/callback', function(req, res, next) {
  passport.authenticate('weixin', function(err, user, info) {
    if (err) return next(err)

    //do anything as you like

    res.send(user);
  })(req, res, next);
});
```

### License
MIT
