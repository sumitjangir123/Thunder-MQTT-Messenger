const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'token.json';
const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User = require('../models/user');
const env = require('./environment');
const { json } = require('express');

//tell passport to use a new strategy for google login 
passport.use(new googleStrategy({
    clientID: "656640366395-5tcdds420ghq7195tfsbi04i7rduaans.apps.googleusercontent.com",
    clientSecret: "hFTuBGp0WALLex6g9eh2mrCZ",
    callbackURL: "http://localhost:8000/users/auth/google/callback"
},
    function (accessToken, refreshToken, profile, cb) {

            var o = {}
            var key = 'access_token';
            o[key] = accessToken;

            var temp=JSON.stringify(o);
            // fs.writeFile(TOKEN_PATH, JSON.stringify(o), (err) => {
            //     if (err) return console.error(err);
            //     console.log('Token stored to', TOKEN_PATH);
            // });


          
            // Load client secrets from a local file.
            fs.readFile('credentials.json', (err, content) => {
              if (err) return console.log('Error loading client secret file:', err);
              // Authorize a client with credentials, then call the Google Calendar API.
              authorize(JSON.parse(content), listEvents);
            });
            
            /**
             * Create an OAuth2 client with the given credentials, and then execute the
             * given callback function.
             * @param {Object} credentials The authorization client credentials.
             * @param {function} callback The callback to call with the authorized client.
             */
            function authorize(credentials, callback) {
              const {client_secret, client_id, redirect_uris} = credentials.installed;
              const oAuth2Client = new google.auth.OAuth2(
                  client_id, client_secret, redirect_uris[0]);
            
              // Check if we have previously stored a token.
              fs.readFile(TOKEN_PATH, (err, token) => {
                oAuth2Client.setCredentials(JSON.parse(temp));
                callback(oAuth2Client);
              });
            }
            
            /**
             * Get and store new token after prompting for user authorization, and then
             * execute the given callback with the authorized OAuth2 client.
             * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
             * @param {getEventsCallback} callback The callback for the authorized client.
             */
            
            
            /**
             * Lists the next 10 events on the user's primary calendar.
             * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
             */
            function listEvents(auth) {
              const calendar = google.calendar({version: 'v3', auth});







            //event creation starts from here




              const eventStartTime = new Date()

              eventStartTime.setDate(eventStartTime.getDate())
              
              // Create a new event end date instance for temp uses in our calendar.
              const eventEndTime = new Date()
              eventEndTime.setDate(eventEndTime.getDate())
              eventEndTime.setMinutes(eventEndTime.getMinutes() + 45)
              
              // Create a dummy event for temp uses in our calendar
              const event = {
                summary: "Class Schedule",
                location: "Jawahar Lal Nehru Marg, Jhalana Gram, Malviya Nagar, Jaipur, Rajasthan 302017",
                description: "by Thunder Meet",
                colorId: 1,
                conferenceData: {
                  createRequest: {
                    requestId: "zzz",
                    conferenceSolutionKey: {
                      type: "hangoutsMeet"
                    }
                  }
                },
                start: {
                  dateTime: eventStartTime,
                  timeZone: 'Asia/Kolkata',
                },
                end: {
                  dateTime: eventEndTime,
                  timeZone: 'Asia/Kolkata',
                },
              }
              
              // Check if we a busy and have an event on our calendar for the same time.
              calendar.freebusy.query(
                {
                  resource: {
                    timeMin: eventStartTime,
                    timeMax: eventEndTime,
                    timeZone: 'Asia/Kolkata',
                    items: [{ id: 'primary' }],
                  },
                },
                (err, res) => {
              
                  
                  // Check for errors in our query and log them if they exist.
                  if (err) return console.error('Free Busy Query Error: ', err)
              
                  // Create an array of all events on our calendar during that time.
                  const eventArr = res.data.calendars.primary.busy
              
                  // Check if event array is empty which means we are not busy
                  if (eventArr.length === 0)
                    // If we are not busy create a new calendar event.
                    return calendar.events.insert(
                      { calendarId: 'primary',conferenceDataVersion:'1',resource: event},
                      err => {
                        // Check for errors and log them if they exist.
                        if (err) return console.error('Error Creating Calender Event:', err)
                        // Else log that the event was created.
                        return console.log('Calendar event successfully created.')
                      }
                    )
              
                  // If event array is not empty log that we are busy.
                  return console.log(`Sorry I'm busy...`)
                }
              )
              






            //event creation ends here








            //next 10 events shows here


              calendar.events.list({
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
              }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const events = res.data.items;
                if (events.length) {
                  console.log('Upcoming 10 events:');
                  events.map((event, i) => {
                    const start = event.start.dateTime || event.start.date;
                    console.log(`${start} - ${event.summary}`);
                  });
                } else {
                  console.log('No upcoming events found.');
                }
              });
            }









            //next 10 events shown end here












    //managing our local thunder meet users here 



    //find a user 
            User.findOne({ email: profile.emails[0].value }).exec(function (err, user) {
                if (err) { console.log('error in google strategy-passport', err); return; }
            if (user) {
                //if user is found, set this user as req.user
                return cb(null, user);
            } else {
                //if not found then create the user and set it as req.user
                User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: crypto.randomBytes(20).toString('hex'),
                    avatar: profile.photos[0].value
                }, function (err, user) {
                    if (err) { console.log('error in creating the user in google strategy-passport', err); return; }
                    else {
                        return cb(null, user);
                    }
                });
            }
        });
    }
));

module.exports = passport;