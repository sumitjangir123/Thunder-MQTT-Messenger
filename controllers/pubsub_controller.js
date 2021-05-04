const Sub = require("../models/sub");
const Chat = require("../models/chat_print");
module.exports.sub = async function(req,res){
    if(req.user){
        return res.render('subscribe', {
            title: "Subscribe"
        })
    }else{
        return res.render('user_sign_in', {
            title: "Thunder ! Sign In"
        })
    }
}

module.exports.unsubscribe = async function(req,res){
    if(req.user){
        await Sub.deleteMany({
            email : req.user.email,
            topic : req.params.topic
        })
        req.flash('success', 'Unsubscribed')
        return res.redirect('back');
    }else{
        return res.render('user_sign_in', {
            title: "Thunder ! Sign In"
        })
    }
}


module.exports.update = async function(req,res){
    if(req.user){
        let sub = await Sub.findOne({topic: req.body.topic,email : req.params.email});
        if(sub==null){
            Sub.create({
                email: req.params.email,
                name: req.body.name,
                topic:req.body.topic
            }, function (err, user) {
                if (err) {
                    console.log("error in sub :( ",err);
                    req.flash('error', 'error in subscription !')
                    return res.redirect('back');
                }
                req.flash('success', 'Subscribed')
                return res.redirect('back');
            })
        }else{
            req.flash('error', 'Already Subscribed')
            return res.redirect('back');
        }
        
    }else{
        return res.render('user_sign_in', {
            title: "Thunder ! Sign In"
        })
    }
}

module.exports.create_chat = async function(req,res){
    if(req.xhr){
        
        await Chat.create({
            email: req.body.email,
            topic: req.body.topic,
            message:req.body.message
        }, function (err,chat) {
            if (err) {
                console.log("error in creating chat :( ",err);
            }
            console.log("chat created");
            
            return res.status(200).json({
                data: {
                    post : chat
                },
                message: 'Post Created !'
            })
        })

        
    }
}

