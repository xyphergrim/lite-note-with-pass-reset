var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt = require("bcrypt-nodejs");

var userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},   
    username: {type: String, required: true, unique: true},    
    password: {type: String, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

// Mongoose middleware to hash password on save()
userSchema.pre("save", function(next){
    var user = this;
    var SALT_FACTOR = 5;
    
    if(!user.isModified("password")) return next();
    
    bcrypt.genSalt(SALT_FACTOR, function(err, salt){
        if(err) return next(err);
        
        bcrypt.hash(user.password, salt, null, function(err, hash){
            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// password verification for user sign-in
userSchema.methods.comparePassword = function(candidatePassword, cb){
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    });
}

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);