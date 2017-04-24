var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser");
    
mongoose.connect("mongodb://localhost/lite_note");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

var userSchema = new mongoose.Schema({
    username: String,
    password: String
});

var User = mongoose.model("User", userSchema);

var noteSchema = new mongoose.Schema({
    text: String
});

var Note = mongoose.model("Note", noteSchema);

app.get("/", function(req, res){
    res.redirect("/index");
});

app.get("/index", function(req, res){
    Note.find({}, function(err, notes){
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