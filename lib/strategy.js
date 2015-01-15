/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , Profile = require('./profile')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError
  , localOauth2 = require('./oauth2')
  ;


/**
 * `Strategy` constructor.
 *
 * The weixin authentication strategy authenticates requests by delegating to
 * weixin using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your weixin application's Client ID
 *   - `clientSecret`  your weixin application's Client Secret
 *   - `callbackURL`   URL to which weixin will redirect the user after granting authorization
 *   - `scope`         valid scopes include:
 *                     'snsapi_base', 'snsapi_login'.
 *                     (see http://developer.github.com/v3/oauth/#scopes for more info)
 *   — `userAgent`     optional, you can set your own userAgent
 *
 * Examples:
 *
 *     passport.use(new WeixinStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/weixin/callback',
 *         userAgent: 'myapp.com'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://open.weixin.qq.com/connect/qrconnect';
  options.tokenURL = options.tokenURL || 'https://api.weixin.qq.com/sns/oauth2/access_token';
  options.scopeSeparator = options.scopeSeparator || ',';
  options.customHeaders = options.customHeaders || {};
  options.scope = options.scope || 'snsapi_login';

  if (!options.customHeaders['User-Agent']) {
    options.customHeaders['User-Agent'] = options.userAgent || 'passport-weixin';
  }

  OAuth2Strategy.call(this, options, verify);
  this.name = 'weixin';
  this._appid = options.clientID;
  this._secret = options.clientSecret;
  this._requireState = options.requireState === undefined ? true : options.requireState;
  this._userProfileURL = options.userProfileURL || 'https://api.weixin.qq.com/sns/userinfo';

  // hack for weixin
  this.authenticate = localOauth2.authenticate;
  this._loadUserProfile = localOauth2._loadUserProfile;
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.authorizationParams = function(req, options){
  options.appid = typeof this._appid === 'function' ? this._appid(req) : this._appid;
  if(this._requireState && !options.state){
    throw new Error('Authentication Parameter `state` Required');
  }else{
    return options;
  }
};

Strategy.prototype.tokenParams = function(req, options){
  options.appid = typeof this._appid === 'function' ? this._appid(req) : this._appid;
  options.secret = typeof this._secret === 'function' ? this._secret(req) : this._secret;
  return options;
};

/**
 * Retrieve user profile from weixin.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `weixin`
 *   - `id`               the user's unionid ID
 *   - `displayName`      the user's nickname
 *   - `profileUrl`       the URL of the profile for the user on weixin
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, openid, done) {
  var userProfileURL = this._userProfileURL + '?openid=' + openid;
  this._oauth2.get(userProfileURL, accessToken, function(err, body, res) {
    var json;
    if (err) {
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }

    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }

    var profile = Profile.parse(json);
    profile.provider = 'weixin';
    profile._raw = body;
    profile._json = json;

    done(null, profile);
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
