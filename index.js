/*  EXPRESS */

const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

app.get('/', function(req, res) {
  res.render('pages/auth');
});

const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));


/*  PASSPORT SETUP  */

const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/success', (req, res) => {
    res.render('pages/success', { userProfile: userProfile });
});
//app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*  Google AUTH  */
 
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '782937663122-2vtvbtcar85o6dqgdcp9jnpidhrd1r1o.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
});

//pattern
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ... (Other server configurations)

app.post('/success', (req, res) => {
  const numLines = parseInt(req.body.numLines);
  let diamond = '';
  if (!isNaN(numLines) && numLines > 0 && numLines <= 100) {
    diamond = generateDiamond(numLines);
  } else {
    diamond = 'Please enter a valid number of lines (1 to 100)';
  }
  res.render('pages/success', { userProfile: userProfile, diamond: diamond });
});

function generateDiamond(numLines) {
  let diamond = '';
  const half = Math.ceil(numLines / 2);
  for (let i = 1; i <= numLines; i++) {
    const spaces = Math.abs(half - i);
    const stars = numLines - 2 * spaces;
    diamond += ' '.repeat(spaces) + 'FORMULAQSOLUTIONS'.substring(0, stars) + '\n';
  }
  return diamond;
}

//logout
app.get('/logout', (req, res)=>{
  res.clearCookie('session-token');
  res.redirect('/login')

})
