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
    
mongoose.connect("mongodb://localhost/lite_note");
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

// LOGIN ROUTES
// app.get("/login", function(req, res){
//     res.render("login");
// });

// app.post("/login", passport.authenticate("local", {
//     successRedirect: "/notes",
//     failureRedirect: "/login",
//     failureFlash: true
//     }), function(req, res){
// });

// NEW LOGIN ROUTES
app.post("/login", passport.authenticate("local"));

app.post("/login", passport.authenticate("local", {
    successRedirect: "/notes",
    failureRedirect: "/notes",
    failureFlash: true
}));

// REGISTER ROUTE
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username, profileName: req.body.profileName});
    
    User.register(newUser, req.body.password, function(err, user){
        if(err) {
            // req.flash("error", "Email has already been registered");
            console.log(err);
            // return res.redirect("/login");
        }
        // passport.authenticate("local")(req, res, function(){
        //     req.flash("success", "Welcome to LiteNote " + user.profileName + "!");
        //     res.redirect("/notes");
        // });
        
        passport.authenticate("local", {
            successRedirect: "/notes",
            failureRedirect: "/notes",
            failureFlash: true
        });
    });
});

// app.post("/register", passport.authenticate("local"));

// app.post("/register", passport.authenticate("local", {
//     successRedirect: "/notes",
//     failureRedirect: "/notes",
//     failureFlash: true
// }));

// had this --> middleware.isLoggedIn,
app.get("/notes", function(req, res){
    Note.find({}, null, {sort: {createdAt: -1}}, function(err, allNotes){
        if(err) {
            console.log(err);
        } else {
            if(req.xhr) {
                res.json(allNotes);
            } else {
                res.render("index", {notes: allNotes});
            }
        }
    });
});

app.post("/notes", function(req, res){
    req.body.note.text = req.sanitize(req.body.note.text);
    var formData = req.body.note;
    Note.create(formData, function(err, newNote){
        if(err) {
            console.log(err);
        } else {
            res.json(newNote);
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("LiteNote Server Started");
});