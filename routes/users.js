const express =require('express');
const router=express.Router();
const passport=require('passport');

//setting up user controller call
const userController=require("../controllers/user_controller");

router.get("/signUp",userController.signUp);
router.get("/signIn",userController.signIn);
router.post("/create_user",userController.create_user);
router.get('/profile/:id',passport.checkAuthentication,userController.profile);
router.get('/forgotPasswordEnterMail',userController.EnterMail);
router.post('/reset-password',userController.resetPassword);
router.get('/reset-password/:token',userController.resetForm);
router.post('/set-new-password',userController.setNewPass);
//use passport as an middleware to authenticate
router.post("/create_session",passport.authenticate(
    'local',
    {failureRedirect : '/users/signIn'}
),userController.createSession);
router.get('/signOut',userController.destroySession);
router.post('/profile/update/:id',userController.update);

//google login
router.get('/auth/google',passport.authenticate('google',{scope : ['profile','email','https://www.googleapis.com/auth/calendar']}));
router.get('/auth/google/callback',passport.authenticate(
    'google',
    {failureRedirect:'/users/signIn'}
),userController.createSession);

//facebook login
router.get('/auth/facebook',passport.authenticate('facebook',{scope:['email']}));
router.get('/auth/facebook/callback',passport.authenticate(
    'facebook',
    {failureRedirect:'/users/signIn'}
),userController.createSession);

//make it available for index.js
module.exports=router;
