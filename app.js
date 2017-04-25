var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer");
    
mongoose.connect("mongodb://localhost/lite_note");
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

var userSchema = new mongoose.Schema({
    username: String,
    password: String
});

var User = mongoose.model("User", userSchema);

var noteSchema = new mongoose.Schema({
    text: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

var Note = mongoose.model("Note", noteSchema);

app.get("/", function(req, res){
    res.redirect("/notes");
});

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