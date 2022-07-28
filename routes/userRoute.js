const passport = require('passport')
const express = require('express');
const controller = require('../controllers/index');
let router = express.Router()

let isloggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}

router.get('/', controller.checkAuthenticatedUser);
router.get('/home', isloggedIn, controller.ViewProfilePage);
router.get('/error', isloggedIn, (req, res) => {
    res.render('error')
})


// FACEBOOK
router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']

}))

router.get('/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/error'
}), function (req, res) {
    req.session.already_Logged = 'true'
    res.redirect('/home');
}, (err, req, page_res, next) => {
    if (err) {
        page_res.render('index', {
            err_msg: 'Please Check your Internet Connection'
        })
    }
});


// GOOGLE
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/error' }), function (req, res) {
        req.session.already_Logged = 'true'
        res.redirect('/home');
    }, (err, req, page_res, next) => {
        if (err) {
            page_res.render('index', {
                err_msg: 'Please Check your Internet Connection'
            })
        }
    });

router.post('/search', controller.SearchProduct);
router.get('/download', controller.DownloadVideo);
router.get('/search', controller.ViewSearchPage);
router.get('/ViewVideo/:Id', controller.ViewVideo);
router.get('/ViewPlayList/:channel', controller.ViewPlayList);
router.get('/ViewPlayListVideo/:Id', controller.GetPlayListVideos);
router.get('/search/:pageToken', controller.SearchProductWithPage);
router.get('/logout', controller.logout);
module.exports = router