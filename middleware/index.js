var middlewareObj = {};
var Note = require("../models/note");

middlewareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()) {
        return next();
    }
    
    res.redirect("/login");
}

module.exports = middlewareObj;