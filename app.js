var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    Note = require("./models/note"),
    User = require("./models/user"),
    middleware = require("./middleware"),
    flash = require("connect-flash");

var middlewareObj = {};
    
mongoose.connect(process.env.DATABASEURL);
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(flash());

// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "litenote is so lite it is liter than the cloud!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware to run for every route
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

// ROUTES
app.get("/", function(req, res){
    res.redirect("/notes");
});

// had this --> middleware.isLoggedIn,
app.get("/notes", function(req, res){
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

// LOGIN ROUTE
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/notes",
        failureRedirect: "/notes",
        failureFlash: true
    }), function(req, res){
});

// FOR AJAX LOGIN
// app.post("/login", function(req, res, next){
//     passport.authenticate("local", function(err, user, info){
//         if(err) { return res.status(500).json("ERROR!"); }
//         if(!user) { return res.status(500).json("ANOTHER ERROR!"); }
//         req.logIn(user, function(err){
//             if(err) { return res.status(500).json("MORE ERROR STUFF!"); }
//             res.status(200).json({message: "Welcome back to LiteNote " + user.profileName});
//             console.log(user.username + " is logged in");
//         });
//     })(req, res, next);
// });

// REGISTER ROUTE
app.post("/register", function(req, res){
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

// FOR AJAX REGISTER
// app.post("/register", function(req, res){
//     var newUser = new User({username: req.body.username, profileName: req.body.profileName});
    
//     User.register(newUser, req.body.password, function(err, user){
//         if(err) {
//             res.status(500).json({message: "Server error!", error: err});
//             console.log(err);
//         }
//         passport.authenticate("local")(req, res, function(){
//             res.status(200).json({message: "Welcome to LiteNote!"});
//             console.log("new user registered: " + user.username);
//         });
//     });
// });

// LOGOUT ROUTE
app.get("/logout", function(req, res){
    req.logout();
    console.log("logout successful");
    res.redirect("/notes");
})

// POST ROUTE
app.post("/notes", function(req, res){
    req.body.note.text = req.sanitize(req.body.note.text);
    var formData = req.body.note.text;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    
    console.log(formData);
    
    if(formData !== undefined) {
        if(formData.trim() !== "") {
            var newNote = {text: formData, author: author};
        
            Note.create(newNote, function(err, newlyCreated){
                if(err) {
                    console.log(err);
                } else {
                    res.json(newlyCreated);
                }
            });
        }
    }
});

// UPDATE ROUTE
app.put("/notes/:id", function(req, res){
    Note.findByIdAndUpdate(req.params.id, req.body.note, {new: true}, function(err, note){
        if(err) {
            console.log(err);
        } else {
            console.log(note);
            res.json(note);
        }
    });
});

// DELETE ROUTE
app.delete("/notes/:id", function(req, res){
    Note.findByIdAndRemove(req.params.id, function(err, note){
        if(err) {
            console.log(err);
        } else {
            res.json(note);
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("LiteNote Server Started");
});