const express = require('express')
const app = express()
const port = process.env.PORT || 4700
const session = require('express-session')
const path = require('path')
const passport = require('passport')
const bodyParser = require('body-parser')
const cors = require('cors')
const facebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const routes = require('./routes/userRoute.js')
const config = require('./config/config.js')
const hbs = require('hbs');
const publicDir = path.join(__dirname , '/public') //setting path to html file directory
const viewsDirectory = path.join(__dirname , '/views')
const viewsPartials = path.join(__dirname, '/partials')
const header = path.join(__dirname + '/partials/header.hbs');

app.set('view engine', 'hbs')
app.set('views', viewsDirectory) //changing default folder directory of views to custom name (templates/views)
hbs.registerPartials(viewsPartials)
hbs.registerPartial('header', header);
app.use(express.static(publicDir))

app.use(cors())

app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use(session({
    resave : false,
    saveUninitialized : true,
    secret : 'SECRET'
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, cb) => {
    cb(null, user)
})

passport.deserializeUser((obj, cb) => {
    cb(null, obj)
})

passport.use(new facebookStrategy({
    clientID : config.facebookAuth.clientID,
    clientSecret : config.facebookAuth.clientSecret,
    callbackURL : config.facebookAuth.callbackURL,
    profileFields : ['id','displayName','name','gender','picture.type(large)','email']
},
    (accessToken, refreshToken, profile, done) => {
       // console.log(profile._json.picture)
       // console.log('facebook profile')
        console.log('User Logged In via Facebook');
        return done(null, profile)
    }

))

passport.use(new GoogleStrategy({
    clientID: config.googleAuth.clientID,
    clientSecret: config.googleAuth.clientSecret,
    callbackURL: config.googleAuth.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    //console.log('google profile :')
    //console.log(profile)
    console.log('User Logged In via Google Account');
    return done(null, profile)
  }
));


app.use('/', routes)
app.listen(port, () => {
    console.log('server is listening at Port : ' + port)
})