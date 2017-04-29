/* global $ autosize */

$(document).ready(function(){
    // $(document).click(function(e){
    //     // check for left mouse button
    //     if(e.which === 1) {
            
    //     }
    // });
    
    $("[data-toggle='tooltip']").tooltip({trigger: "hover"});
    
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
    
    $("textarea").on("focus", function(){
        // var width = $("textarea").width();
        // console.log(width);
        autosize($("textarea"));
    });
    
    $("#new-note-form").submit(function(e){
      e.preventDefault();
       
      var noteItem = $(this).serialize();
      
      $.post("/notes", noteItem, function(data){
        //   debugger
        $("#user-input").after(
         `
        <div class="col-md-2">
            <div class="card">
                <div class="card-block">
                    <div class="text-right">
                        <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${data._id}">
                            <i class="fa fa-trash-o" aria-hidden="true"></i>
                        </button>
                    </div>
                    <form class="edit-note-form" action="/notes/${data._id}" method="POST">
                        <textarea name="note[text]">${data.text}</textarea>
                        <div class="text-right">
                            <button type="submit" class="btn btn-secondary btn-sm" id="update-btn">Done</button>
                        </div>
                    </form>
                    <p class="card-text ${data._id}">${data.text}</p>
                </div>
            </div>
        </div>
         `
        );
        
        // console.log($(".delete-card-btn").attr("class"));
        
        $("#new-note-form").find("textarea").val('');
      });
    });
    
    $("#note-row").on("click", ".card-text", function(){
        var currentForm = $(this).siblings(".edit-note-form");

        $(this).css("display", "none");
        currentForm.toggle();
        currentForm.children("textarea").focus();
    });
    
    // take focus off of edit-note-form if clicked outside of form
    $(document).click(function(event) { 
        if(!$(event.target).closest('.edit-note-form').length) {
            if($('.edit-note-form').is(":focus")) {
                $('.edit-note-form').blur();
                // $(".edit-note-form").css("display", "none");
                // $(".edit-note-form").siblings(".card-text").css("dispaly", "show");
            }
        }        
    });
    
    $("#note-row").on("click", ".delete-card-btn", function(){
        // alert("button clicked!");
        
        var confirmResponse = confirm("Delete this card?");
        
        if(confirmResponse) {
            var $itemToDelete = $(this).closest(".col-md-2");
            
            $.ajax({
                type: "DELETE",
                url: "/notes/" + $(this).attr("data-id"),
                itemToDelete: $itemToDelete,
                success: function(data){
                    this.itemToDelete.remove();
                }
            });
        }
    });
});



    // $("#logout-btn").on("click", function(){
    //     $.get("/logout", function(data){});
    // });
    
    // $("#modal-login-btn").on("click", function(){
    //     $("#login-modal").modal("hide");
    // });
    
    // $("#login-form").submit(function(e){
    //     e.preventDefault();
        
    //     var user = $(this).serialize();
        
    //     $.post("/login", user, function(data){
    //         if(!data.error) {
    //             $("#login-modal").modal("hide");
    //             // window.location.replace("/notes");
    //             $("#new-note-form").prepend(
    //             `
    //             <div class="alert alert-success">
    //                 <strong>${data.message}</strong>
    //             </div>
    //             `
    //             );
    //             // debugger
    //             $(".alert-success").delay(2000).fadeOut();
    //         } else {
    //             $("#login-modal").modal("hide");
    //             $(".jumbotron").prepend(
    //             `
    //             <div class="alert alert-danger">
    //                 <strong>${data.error}</strong>
    //             </div>
    //             `
    //             );
    //             $(".alert-danger").delay(2000).fadeOut();
    //         }
    //     });
    // });
    
    // $("#new-user-form").submit(function(e){
    //     e.preventDefault();
        
    //     var newUser = $(this).serialize();
        
    //     $.post("/register", newUser, function(data){
    //         if(!data.error) {
    //             $("#register-modal").modal("hide");
    //             // window.location.replace("/notes");
    //             $("#new-note-form").prepend(
    //             `
    //             <div class="alert alert-success">
    //                 <strong>${data.message}</strong>
    //             </div>
    //             `
    //             );
    //         } else {
    //             $("#register-modal").modal("hide");
    //             $("#new-note-form").prepend(
    //             `
    //             <div class="alert alert-success">
    //                 <strong>${data.message}</strong>
    //             </div>
    //             `
    //             );
    //         }
    //     });
    // });
    
    // $.get("/notes", function(notes){
    //     notes.forEach(function(note){
    //         $("#note-row").prepend(
    //         `
    //         <div class="col-md-2">
    //             <div class="card">
    //                 <div class="card-block">
    //                     <div class="text-right">
    //                         <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${note._id}">
    //                             <i class="fa fa-trash-o" aria-hidden="true"></i>
    //                         </button>
    //                     </div>
    //                     <p class="card-text">${note.text}</p>
    //                 </div>
    //             </div>
    //         </div>
    //         `
    //         );
    //     });
    // });