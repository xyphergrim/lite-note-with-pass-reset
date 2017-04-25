/* global $ */

$(document).ready(function(){
    $("#register-btn").on("click", function(){
        $("#login-btn").removeClass("active");
        $("#register-btn").addClass("active");
        $("#login-div").css("opacity", 0);
        $("#register-div").css("opacity", 1);
    });
    
    $("#login-btn").on("click", function(){
        $("#login-btn").addClass("active");
        $("#register-btn").removeClass("active");
        $("#login-div").css("opacity", 1);
        $("#register-div").css("opacity", 0);
    });
    
    $("#new-user-form").submit(function(e){
        e.preventDefault();
        
        var newUser = $(this).serialize();
        $.post("/register", newUser, function(data){
            window.location.replace("/notes");
        });
    });
    
    $("#new-note-form").submit(function(e){
      e.preventDefault();
       
       var noteItem = $(this).serialize();
      $.post("/notes", noteItem, function(data){
          $("#note-row").prepend(
             `
             <div class="col-md-2">
                <div class="thumbnail">
                    <div class="caption">
                        ${data.text}
                    </div>
                </div>
            </div>
             `
            );
            
            $("#new-note-form").find(".form-control").val('');
      });
    });
});