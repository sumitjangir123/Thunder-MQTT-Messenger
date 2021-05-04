const mongoose=require('mongoose');
mongoose.set('useCreateIndex', true);
const path= require('path');

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    topic:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    }

},{
    timestamps:true
});

const Chat=mongoose.model('Chat',userSchema);
module.exports=Chat;