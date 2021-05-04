const User = require("../models/user");
const fs = require('fs');
const path = require('path');
const queue = require('../config/kue');
const resetPasswordEmail = require('../workers/reset_password_email');
const ResetPasswordToken = require('../models/reset_password_token');
const crypto = require('crypto');
var mongoose = require('mongoose');

module.exports.profile = async function (req, res) {
    //no. of registered users

    let user = await User.findById(req.params.id);
    
    return res.render('profile', {
        title: "profile page",
        profile_user: user,
    })
}
module.exports.signUp = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/users/profile');
    }
    return res.render('user_sign_up', {
        title: "Thunder ! Sign Up"
    })
}

module.exports.signIn = function (req, res) {

    if (req.isAuthenticated()) {
        return res.redirect('/users/profile');
    }

    return res.render('user_sign_in', {
        title: "Thunder ! Sign In"
    })

}

module.exports.create_user = function (req, res) {
    if (req.body.password != req.body.confirm_password) {
        console.log("error in creating user");
        return res.redirect('back');
    }

    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            console.log("error in finding the user in signing up !!!");
            return res.redirect('back');
        }
        if (!user) {
            User.create(req.body, function (err, user) {
                if (err) {
                    console.log("error in creating the user :( ");
                    return res.redirect('back');
                }
                return res.redirect("/users/signIn");
            })
        }
        else {
            req.flash('error', 'User Is Already Registered')
            return res.redirect('back');
        }
    })
}

// sign in and create a session for the user
module.exports.createSession = function (req, res) {
    req.flash('success', 'logged in successfully');
    return res.redirect('/');
}

//to sign out the user
module.exports.destroySession = function (req, res) {
    req.logout();
    req.flash('success', 'session destroyed');
    return res.redirect('/');
}

module.exports.update = async function (req, res) {

    if (req.user.id == req.params.id) {
        try {
            let user = await User.findById(req.params.id);
            User.uploadAvatar(req, res, function (err) {
                if (err) {
                    console.log('****multer error', err);
                }

                user.name = req.body.name;
                user.email = req.body.email;

                if (req.file) {

                    // if (fs.existsSync(path.join(__dirname, '..', user.avatar))) {
                    //     fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                    // }

                    //this is saving the path of the uploaded file into the avatar field in the user
                    user.avatar = User.avatarPath + '/' + req.file.filename;
                }
                user.save();
                return res.redirect('back');
            });
        } catch (error) {
            req.flash('error', 'Unauthorized');
            return res.redirect('back');
        }
    } else {
        req.flash('error', 'Unauthorized');
        return res.status(401).send('Unauthorized');
    }

}

module.exports.EnterMail = function (req, res) {
    res.render('enterMail', {
        title: 'Reset Your Password'
    })
}

module.exports.resetPassword = async function (req, res) {
    try {
        let user = await User.findOne({ email: req.body.email });

        if (user) {
            let resetToken = await ResetPasswordToken.create({
                user: user._id,
                token: crypto.randomBytes(20).toString('hex'),
                isValid: true
            });

            resetToken = await resetToken.populate('user', 'name email').execPopulate();
            // commentsMailer.newComment(comment);

            let job = queue.create('passQueue', resetToken).save(function (err) {
                if (err) { console.log('error in creating a queue', err); return; }

                console.log('job enqueued', job.id)
            })

            req.flash('success', 'check your email account, your token will be expire in 5 mins');
            return res.redirect('back');

        } else {
            req.flash('error', 'Looks like the user is not registered!');
            return res.redirect('back');
        }
    } catch (error) {
        console.log('Error', error); return;
    }
}

module.exports.resetForm = async function (req, res) {
    // console.log(req.params.token);
    let resetPasswordToken = await ResetPasswordToken.findOne({ token: req.params.token });

    if (resetPasswordToken) {
        if (resetPasswordToken.isValid == true) {

            let doc = {
                isValid: false,
                updatedAt: Date.now(),
            }

            ResetPasswordToken.findByIdAndUpdate(resetPasswordToken.id, doc, function (err, raw) {
                return res.render('passResForm', {
                    title: 'Enter your password',
                    token: req.params.token
                });
            });
        } else {
            console.log('your token has been expired');
            req.flash('error', 'your token has been expired ! Generate a new one');
            return res.redirect('back');
        }
    } else {
        req.flash('error', 'your token has been expired');
        return res.redirect('back');
    }
}

module.exports.setNewPass = async function (req, res) {
    try {

        if (req.body.password != req.body.confirm_password) {
            req.flash('error', 'bhai password to sahi daal de :(');
            return res.redirect('back');
        }

        let user = await ResetPasswordToken.findOne({ token: req.body.token });

        if (user) {
            user = await user.populate('user').execPopulate();

            let pass = {
                password: req.body.password
            }

            User.findByIdAndUpdate(user.user.id, pass, function (err, raw) {
                req.flash('success', 'Woo-hoo! your password has been changed');
                return res.redirect('/users/signIn');
            });
        } else {
            console.log('user not found'); return;
        }
    } catch (error) {
        console.log('error', error); return;
    }
}
