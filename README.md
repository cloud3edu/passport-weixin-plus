## passport-weixin
passport oauth2 strategy for weixin

### Install

```bash
npm install passport-weixin-plus
```

### Usage

```js
var passport = require('passport')
  , WeixinStrategy = require('passport-weixin')
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

### License
MIT
