const db = require('../config/mongoose');
const User = require("../models/user");
const Sub = require("../models/sub");
const Chat = require("../models/chat_print");

//home controller
module.exports.home = async function (req, res) {
    try {
        //populate users
      
        let subs= []
        let chats=[]
        if(req.user){
            subs= await Sub.find({email : req.user.email}).sort('-createdAt');
            chats = await Chat.find({email: req.user.email}).sort('-createdAt');
        }
        //populate the array of friendships that is present in users schema but only if user is signed in
        return res.render('home', {
            title: "Thunder MQTT Messenger",
            subs:subs,
            chats:chats
        });
    } catch (err) {
        console.log('Error', err);
        return;
    }
}

module.exports.about= async function(req,res){
    try {
        return res.render('about', {
            title: "Sumit Kumar"
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports.policies= async function(req,res){
    try {
        return res.render('privacyPolicies',{
            title: "privacy policies"
        })
    } catch (error) {
        console.log(error);
    }
}
