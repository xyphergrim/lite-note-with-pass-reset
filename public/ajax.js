/* global $ autosize */

$(document).ready(function(){
    var currentForm;
    
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
        // console.log("inside textarea");
        
        var ta = $("textarea");
        
        autosize(ta);
        autosize.update(ta);
    });
    
    $(".checklist-btn").on("click", function(){
        $(".checklist-btn").toggleClass("active");
        
        if($(".checklist-btn").hasClass("active")) {
            // alert("checklist-btn is active now");
        } else {
            // alert("checklist-btn is NOT active now");
        }
    });
    
    // $.get("/notes", function(notes){
    //     notes.forEach(function(note){

    //             $("user-input").after(
    //             `
    //             <div class="col-md-2">
    //                 <div class="card">
    //                     <div class="card-block">
    //                         <div class="text-right">
    //                             <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${note._id}">
    //                                 <i class="fa fa-trash-o" aria-hidden="true"></i>
    //                             </button>
    //                         </div>
    //                         <form class="edit-note-form" action="/notes/${note._id}" method="POST">
    //                             <textarea name="note[text]">${note.text}</textarea>
    //                             <div class="text-right">
    //                                 <button type="submit" class="btn btn-secondary btn-sm" id="update-btn">Done</button>
    //                             </div>
    //                         </form>
    //                         <p class="card-text ${note._id}">${note.text}</p>
    //                     </div>
    //                 </div>
    //             </div>
    //             `
    //             );

    //     });
    // });
    
    $("#new-note-form").submit(function(e){
      e.preventDefault();
       
    //   var noteItem = $(this).serialize();
    var userInput = $(".note-content").html();
    var noteItem = $(this).children(".hidden-ta").val(userInput);
    // console.log(noteItem);
    // console.log(this);
    // debugger;
    
      $.post("/notes", noteItem, function(data){
        // debugger
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
                        <div class="note-content" contenteditable="true">${data.text}</div>
                        <textarea name="note[text]" class="hidden-ta"></textarea>
                        <div class="text-right">
                            <button type="submit" class="btn btn-secondary btn-sm" id="update-btn">Done</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
         `
        );
        
        // console.log($(".delete-card-btn").attr("class"));
        
        // $("#new-note-form").find("textarea").val('');
        $(this).children(".note-content").val('');
      });
    });
    
    // assign the currentForm variable so when you click off the form
    // it will submit any changes you made -- not quite working yet
    $(".note-content").on("click", function(){
        currentForm = $(this).parent(".edit-note-form");
    });
    
    // $("#note-row").on("click", ".card-text", function(){
    //     currentForm = $(this).siblings(".edit-note-form");
    //     $(this).css("display", "none");
    //     currentForm.toggle();
    //     currentForm.children("textarea").focus();
        
    //     // $(".enlarged-note").css("display", "block");
    //     // $(".enlarged-textarea").focus();
        
    //     var ta = $("textarea");
        
    //     autosize(ta);
    //     autosize.update(ta);
    // });
    
    // watch all clicks on the document for submitting notes
    $(document).click(function(event) { 
        // console.log("document click");
        
        // if(!$(event.target).closest(".note-content").length) {
        //     if(currentForm) {
        //         $(currentForm).submit();
        //     }
        // }
    });
    
    // EDIT NOTE - PUT
    $("#note-row").on("submit", ".edit-note-form", function(e){
        e.preventDefault();
        
        var userInput = $(this).children(".note-content").html();
        var noteItem = $(this).children(".hidden-ta").val(userInput);
        
        // var noteItem = $(this).serialize();
        var actionUrl = $(this).attr("action");
        var $originalItem = $(this).parent(".card-block");
        
        // debugger
        
        $.ajax({
            url: actionUrl,
            data: noteItem,
            type: "PUT",
            originalItem: $originalItem,
            success: function(data){
                this.originalItem.html(
                `
                <div class="text-right">
                    <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${data._id}">
                        <i class="fa fa-trash-o" aria-hidden="true"></i>
                    </button>
                </div>
                <form class="edit-note-form" action="/notes/${data._id}" method="POST">
                    <div class="note-content" contenteditable="true">${data.text}</div>
                    <textarea class="hidden-ta" name="note[text]"></textarea>
                    <div class="text-right">
                        <button type="submit" class="btn btn-secondary btn-sm" id="update-btn">Done</button>
                    </div>
                </form>
                `
                );
            }
        });
    });
    
    // DELETE CARD
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



// OLD CODE
//=======================================================
//=======================================================
//=======================================================


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