/* global $ */

$(document).ready(function(){
    $("#register-btn").on("click", function(){
        $("#login-btn").removeClass("active");
        $("#register-btn").addClass("active");
    });
    
    $("#login-btn").on("click", function(){
        $("#login-btn").addClass("active");
        $("#register-btn").removeClass("active");
    });
    
    $('#login-modal').on('hidden.bs.modal', function (e) {
        $("#login-btn").removeClass("active");
        $("#login-form").find(".form-control").val('');
    });
    
    $('#register-modal').on('hidden.bs.modal', function (e) {
        $("#register-btn").removeClass("active");
        $("#new-user-form").find(".form-control").val('');
    });
    
    $("#logout-btn").on("click", function(){
        $.get("/logout", function(data){
            window.location.replace("/notes");
            // debugger
        });
    });
    
    $("#login-form").submit(function(e){
        e.preventDefault();
        
        var user = $(this).serialize();
        
        $.post("/login", user, function(data){
            if(!data.error) {
                $("#login-modal").modal("hide");
                // window.location.replace("/notes");
                $("#new-note-form").prepend(
                `
                <div class="alert alert-success">
                    <strong>${data.message}</strong>
                </div>
                `
                );
                // debugger
                $(".alert-success").delay(2000).fadeOut();
            } else {
                $("#login-modal").modal("hide");
                $(".jumbotron").prepend(
                `
                <div class="alert alert-danger">
                    <strong>${data.error}</strong>
                </div>
                `
                );
                $(".alert-danger").delay(2000).fadeOut();
            }
        });
    });
    
    $("#new-user-form").submit(function(e){
        e.preventDefault();
        
        var newUser = $(this).serialize();
        
        $.post("/register", newUser, function(data){
            if(!data.error) {
                $("#register-modal").modal("hide");
                // window.location.replace("/notes");
                $("#new-note-form").prepend(
                `
                <div class="alert alert-success">
                    <strong>${data.message}</strong>
                </div>
                `
                );
            } else {
                $("#register-modal").modal("hide");
                $("#new-note-form").prepend(
                `
                <div class="alert alert-success">
                    <strong>${data.message}</strong>
                </div>
                `
                );
            }
        });
    });
    
    $("#new-note-form").submit(function(e){
      e.preventDefault();
       
       var noteItem = $(this).serialize();
      $.post("/notes", noteItem, function(data){
          if(!data.error) {
            $("#note-row").prepend(
             `
             <div class="col-md-2" id="note-col">
                <div class="card">
                    <div class="card-block">
                        ${data.text}
                    </div>
                </div>
            </div>
             `
            );
            
            $("#new-note-form").find(".form-control").val('');
          }
      });
    });
});