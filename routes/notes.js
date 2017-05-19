var express = require("express");
var router = express.Router();
var Note = require("../models/note");
var User = require("../models/user");
var passport = require("passport");
var async = require("async");
var crypto = require("crypto");
var nodemailer = require("nodemailer");

// Root route
router.get("/", function(req, res){
    res.redirect("/notes");
});

// REGISTER ROUTE
router.post("/register", function(req, res){
    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    user.save(function(err){
        if(err) {
            console.log(err);
            req.flash("error", "Email or username is already in use.");
            res.redirect("/notes");
        } else {
          req.logIn(user, function(err){
              // send welcome email to new user
              var smtpTransporter = nodemailer.createTransport({
                  service: "SendPulse",
                  auth: {
                      user: "jc.xypher@gmail.com",
                      pass: process.env.SENDPULSEPASS
                  }
              });
              var mailOptions = {
                  to: user.email,
                  from: "jc.xypher@gmail.com",
                  subject: "Welcome to LiteNote!",
                  text: "Hello, " + user.username + "! Thanks for signing up with LiteNote! We hope you enjoy your stay."
              };
              smtpTransporter.sendMail(mailOptions, function(err){
                  // req.flash("info", "An e-mail has been sent to " + user.email + " with further instructions.");
                  // done(err, "done");
                  if(err) {
                    console.log(err);
                  }
              });

              req.flash("success", "Welcome to LiteNote, " + user.username + "!");
              res.redirect("/notes");
          });
        }
    });
});

// LOGIN ROUTE
router.post("/login", function(req, res, next){
    passport.authenticate("local", function(err, user, info){
        if(err) return next(err);
        if(!user) {
            req.flash("error", "Invalid username or password.");
            return res.redirect("/notes");
        }
        req.logIn(user, function(err){
            if(err) return next(err);
            return res.redirect("/notes");
        });
    })(req, res, next);
});

// LOGOUT ROUTE
router.get("/logout", function(req, res){
    req.logout();
    console.log("logout successful");
    res.redirect("/notes");
});

// RESET PASSWORD ROUTE
router.get("/forgot", function(req, res){
    res.render("forgot", {user: req.user});
});

// GET ROUTE - Index
router.get("/notes", function(req, res){
    Note.find({}, null, {sort: {createdAt: -1}}, function(err, notes){
        if(err) {
            console.log(err);
        } else {
            if(req.xhr) {
                res.json(notes);
            } else {
                res.render("index", {notes: notes});
            }
        }
    });
});

// GET ROUTE - Archive
router.get("/notes/archive", function(req, res){
    Note.find({}, null, {sort: {createdAt: -1}}, function(err, notes){
        if(err) {
            console.log(err);
        } else {
            if(req.xhr) {
                res.json(notes);
            } else {
                res.render("archive", {notes: notes, currentPage: "archive"});
            }
        }
    });
});

// POST ROUTE
router.post("/notes", function(req, res){
    var author = {
      id: req.user._id,
      username: req.user.username
    };
    var formData = req.body;
    formData.author = author;

    if(req.body.btnChoiceValue === "on") {
        console.log("checklist note card added");
        formData.checklists = [""];
    } else {
      formData.text = "";
    }

    // var formData = {};
    // req.body.note ? formData.text = req.body.note.text : formData.checklists = req.body.checklists;

    if(formData.checklists) {
      // console.log("formData Checklists is true");
      // // console.log(formData.checklists.length);
      //   for(var i = 0; i < formData.checklists.length; i++) {
      //       if(formData.checklists[i] === "") {
      //           formData.checklists.splice(i, 1);
      //           i--;
      //       }
      //   }
      // create an array with as many spaces as there are checklists
      formData.checkboxes = new Array(req.body.checklists.length);
    }

    Note.create(formData, function(err, newlyCreated){
        if(err) {
            console.log(err);
        } else {
          console.log(formData);
            res.json(newlyCreated);
        }
    });
});

// UPDATE ROUTE
router.put("/notes/:id", function(req, res){
    if(req.body.text || req.body.text === "") {
      var newNoteData = req.body;

      if(req.body.archiveValue === "on") {
          var isArchive = true;
          newNoteData.archive = isArchive;
      }

      if(req.body.pinValue === "on") {
          var isPinned = true;
          newNoteData.isPinned = isPinned;
      } else if(req.body.pinValue === "off") {
          var isPinned = false;
          newNoteData.isPinned = isPinned;
          // console.log(newNoteData.isPinned);
      }
    } else {
      // create brand new object from checkboxValues and req.body.checklists
      var newNoteData = {};

      var checklistCount = req.body.checklists;

      // set checkboxes var equal to req.body
      var checkboxes = Object.assign({}, req.body);
      // remove the checklists array
      delete checkboxes.checklists;
      // remove the title because we only need checkboxes
      delete checkboxes.title;
      // remove the archive variable
      delete checkboxes.archiveValue;
      // remove the pin variable
      delete checkboxes.pinValue;
      // create an empty array
      var checkboxValues = [];

      for(var i = 0; i < checklistCount.length; i++) {
        if(checklistCount[i] === "") {
            checklistCount.splice(i, 1);

            // if(newNoteData.checkboxes.length > 0) {
            //   newNoteData.checkboxes.splice(i, 1);
            // }

            // newCheckCount = checklistCount.length;
            i--;
            // isSpliced = true;
        }
      }

      // create an array with as many spaces as there are checklists
      newNoteData.checkboxes = new Array(checklistCount.length);

      // iterate over the object and create a new array that indicates if the checkbox was checked or not
      for(checkbox in checkboxes) {
        // console.log("checkbox is: " + checkbox);

          if(checkboxes[checkbox] === 'off') {
              checkboxValues.push(false);
          } else {
              checkboxValues.push(true);
          }
      }

      if(req.body.archiveValue === "on") {
          var isArchive = true;
      }

      if(req.body.pinValue === "on") {
          var isPinned = true;
      } else if(req.body.pinValue === "off") {
          var isPinned = false;
      }

      // assign values to the new object
      newNoteData.isPinned = isPinned;
      newNoteData.archive = isArchive;
      newNoteData.title = req.body.title;
      newNoteData.checklists = checklistCount;
      newNoteData.checkboxes = checkboxValues;
    }

    // update the note with new data
    Note.findByIdAndUpdate(req.params.id, newNoteData, {new: true}, function(err, note){
        if(err) {
            console.log(err);
        } else {
            console.log(note);
            res.json(note);
        }
    });
});

// DELETE ROUTE
router.delete("/notes/:id", function(req, res){
    Note.findByIdAndRemove(req.params.id, function(err, note){
        if(err) {
            console.log(err);
        } else {
            console.log("Note deleted");
            res.json(note);
        }
    });
});

// POST ROUTE FOR FORGOT PASSWORD
router.post("/forgot", function(req, res, next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){
                var token = buf.toString("hex");
                done(err, token);
            });
        },
        function(token, done){
            User.findOne({email: req.body.email}, function(err, user){
                if(!user) {
                    req.flash("error", "No account with that email address exists.");
                    return res.redirect("/forgot");
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token, user, done){
            var smtpTransporter = nodemailer.createTransport({
                service: "SendPulse",
                auth: {
                    user: "jc.xypher@gmail.com",
                    pass: process.env.SENDPULSEPASS
                }
            });
            var mailOptions = {
                to: user.email,
                from: "jc.xypher@gmail.com",
                subject: "LiteNote Password Reset",
                text: "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
                    "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
                    "http://" + req.headers.host + "/reset/" + token + "\n\n" +
                    "If you did not request this, please ignore this email and your password will remain unchanged.\n"
            };
            smtpTransporter.sendMail(mailOptions, function(err){
                req.flash("info", "An e-mail has been sent to " + user.email + " with further instructions.");
                done(err, "done");
            });
        }
    ], function(err){
        if(err) return next(err);
        res.redirect("/forgot");
    });
});

// RESET PAGE ROUTE
router.get("/reset/:token", function(req, res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
        if(!user) {
            req.flash("error", "Password reset token is invalid or has expired.");
            return res.redirect("/forgot");
        }
        // console.log(user.resetPasswordToken);
        res.render("reset", {user: req.user, resetPasswordToken: req.params.token});
    });
});

// POST ROUTE FOR /RESET/:TOKEN
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.password = req.body.password;
        var confirmPassword = req.body.confirmPassword;

        if(user.password === confirmPassword) {
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        } else {
          req.flash("error", "Passwords entered don't match.");
          return res.redirect("/reset/"+user.resetPasswordToken);
        }


      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'SendPulse',
        auth: {
          user: 'jc.xypher@gmail.com',
          pass: process.env.SENDPULSEPASS
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'jc.xypher@gmail.com',
        subject: 'LiteNote password has been changed',
        text: 'Greetings from LiteNote,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

module.exports = router;
