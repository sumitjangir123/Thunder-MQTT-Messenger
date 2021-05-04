const fs= require('fs');
const rfs= require('rotating-file-stream');
const path= require('path');

const logDirectory= path.join(__dirname, '../production_logs');
//if logDirectory is not exist than create it 
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accessLogStream= rfs.createStream('access.log',{
  interval: '1d',
  path: logDirectory
});

const development= {
    name: 'development',
    asset_path: './assets',
    session_cookie_key: 'something_something',
    db: 'multimedia',
    smtp: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'thethunderbirdus@gmail.com',
          pass: 'thunder'
        }
    },
    google_client_id: "922852696533-qrr4lrcdb3uj5sjdjcqi1g90fc5mpsoq.apps.googleusercontent.com",
    google_client_secret: "",
    google_call_back_url: "http://localhost:8000/users/auth/google/callback",

    jwt_secret: 'codeial',
    morgan: {
      mode: 'dev',
      options: {stream: accessLogStream}
    } 

}
// eval(process.env.THUNDER_ENVIRONMENT)==undefined ? development : eval(process.env.THUNDER_ENVIRONMENT)
module.exports= development;