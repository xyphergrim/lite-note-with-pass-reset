var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    // passportLocalMongoose = require("passport-local-mongoose"),
    // Note = require("./models/note"),
    User = require("./models/user"),
    // middleware = require("./middleware"),
    flash = require("connect-flash");

// var middlewareObj = {};

// requiring routes
var noteRoutes = require("./routes/notes");

var port = process.env.PORT || 3000;
var url = process.env.DATABASEURL || "mongodb://localhost/lite_note";
// mongoose.connect("mongodb://localhost/lite_note_ian_version");
mongoose.connect(url);

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
});

app.use("/", noteRoutes);

app.listen(port, process.env.IP, function(){
    console.log("LiteNote Server Started");
});
