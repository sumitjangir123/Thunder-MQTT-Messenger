const mongoose=require('mongoose');
mongoose.set('useCreateIndex', true);
const path= require('path');

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true
    },
    topic:{
        type:String,
        required:true
    }

},{
    timestamps:true
});

const Sub=mongoose.model('Sub',userSchema);
module.exports=Sub;