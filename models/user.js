const mongoose=require('mongoose');
mongoose.set('useCreateIndex', true);
const multer= require('multer');
const path= require('path');

//here it converts path into the string
const AVATAR_PATH= path.join('/uploads/users/avatars');

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    avatar:{
        type:String
    }
},{
    timestamps:true
});


let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,'..',AVATAR_PATH));
    },
    filename: function (req, file, cb) {
        //Date.now() is used because if some users uploads the files with same name than that can be overridden so to prevent that.
      cb(null, file.fieldname + '-' + Date.now());
    }
  })

//static methods

userSchema.statics.uploadAvatar=multer({storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    }
}).single('avatar');
userSchema.statics.avatarPath=AVATAR_PATH;

const User=mongoose.model('User',userSchema);
module.exports=User;