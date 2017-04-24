var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser");
    
mongoose.connect("mongodb://localhost/lite_note");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

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
    res.redirect("/notes");
});

app.get("/notes", function(req, res){
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

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("LiteNote Server Started");
});