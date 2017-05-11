var express = require("express");
var router = express.Router();
var Note = require("../models/note");
var User = require("../models/user");
var passport = require("passport");

// Root route
router.get("/", function(req, res){
    res.redirect("/notes");
});

// REGISTER ROUTE
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username, profileName: req.body.profileName});

    User.register(newUser, req.body.password, function(err, user){
        if(err) {
            req.flash("error", "Email has already been registered");
            console.log(err);
            return res.redirect("/notes");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to LiteNote " + user.profileName + "!");
            res.redirect("/notes");
        });
    });
});

// LOGIN ROUTE
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/notes",
        failureRedirect: "/notes",
        failureFlash: true
    }), function(req, res){
});

// LOGOUT ROUTE
router.get("/logout", function(req, res){
    req.logout();
    console.log("logout successful");
    res.redirect("/notes");
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
                res.render("archive", {notes: notes});
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
    // formData.isChecklist = req.isChecklist;

    // var formData = {};
    // req.body.note ? formData.text = req.body.note.text : formData.checklists = req.body.checklists;

    if(formData.checklists) {
      // console.log(formData.checklists.length);
        for(var i = 0; i < formData.checklists.length; i++) {
            if(formData.checklists[i] === "") {
                formData.checklists.splice(i, 1);
                i--;
            }
        }
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
    if(req.body.text) {
      var newNoteData = req.body;
      
      if(req.body.archiveValue === "on") {
          var isArchive = true;
          newNoteData.archive = isArchive;
      }
    } else {
      // set checkboxes var equal to req.body
      var checkboxes = Object.assign({}, req.body);
      // remove the checklists array
      delete checkboxes.checklists;
      // remove the title because we only need checkboxes
      delete checkboxes.title;
      // remove the label
      //   delete checkboxes.labelFilter;
      // remove the archive variable
      delete checkboxes.archiveValue;
      // create an empty array
      var checkboxValues = [];
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
      
    //   var labelArray = 
      
    //   if(req.params.label === null || req.params.label === undefined) {
    //     var labelArray = [];
    //     labelArray.push(req.body.labelFilter);
    //   } else {
    //     var labelArray = req.params.label;
    //     labelArray.push(req.body.labelFilter);
    //   }

      // create brand new object from checkboxValues and req.body.checklists
      var newNoteData = {};
    //   newNoteData.label.push(req.body.labelFilter);
      newNoteData.archive = isArchive;
      newNoteData.title = req.body.title;
      newNoteData.checklists = req.body.checklists;
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

module.exports = router;