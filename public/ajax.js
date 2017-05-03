/* global $ autosize */

$(document).ready(function(){
    var currentForm;
    var isChecklistOn = false;
    
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
    
    // if using textarea
    // $("textarea").on("focus", function(){
    //     // console.log("inside textarea");
        
    //     var ta = $("textarea");
        
    //     autosize(ta);
    //     autosize.update(ta);
    // });
    
            // <ul>
            //     <li><input type="checkbox">Feature Under Construction</li>
            // </ul>
    $(".checklist-btn").on("click", function(){
        $(".checklist-btn").toggleClass("active");
        
        if($(".checklist-btn").hasClass("active")) {
            isChecklistOn = true;
            $("#new-note-content").append(
            `
            <div class="form-check">
                <label class="form-check-label">
                    <input class="form-check-input" type="checkbox" value="" name="note[checkBox]">

                </label>
            </div>
            `
            );
        } else {
            // alert("checklist-btn is NOT active now");
            // need to remove checklist and clear note card
            $("#new-note-content").text("");
            isChecklistOn = false;
        }
    });
    
    
    // AJAX GET NOTES
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
    
    // AJAX SUBMIT NEW NOTE
    $("#new-note-form").submit(function(e){
        e.preventDefault();
       
        var isChecked = false;
       
        if($(".form-check-input").prop("checked")) {
           isChecked = true;
        }
       
        // console.log(isChecked);
        // var noteItem = $(this).serialize();
        var userInput = $(".note-content").html();
        var noteItem = $(this).children(".hidden-ta").val(userInput);
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
                                <button type="submit" class="btn btn-secondary btn-sm update-btn">Done</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
             `
            );
        
            // $("#new-note-form").find("textarea").val('');
            $("#new-note-content").text("");
            $(".checklist-btn").removeClass("active");
            isChecklistOn = false;
        });
    });
    
    // if using textarea
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
    
    // assign the currentForm variable so when you click off the form
    // it will submit any changes you made
    $(".note-content").on("click", function(){
        currentForm = $(this).parent(".edit-note-form");
    });
    
    // show the update-btn (done) when clicking on editable note
    $("#note-row").on("click", ".note-content", function(){
        $(this).siblings(".text-right").children(".update-btn").show();
    });
    
    // watch all clicks on the document for submitting notes -- not quite working yet
    // $(document).click(function(event) { 
    //     // if what was clicked is not the original card block
    //     if(!$(this).is($('#new-note-content').closest('.card-block'))) {
    //         if($('#new-note-content').text().length) {
    //             $('#new-note-form').submit();
    //             $('#new-note-content').text('');
    //         }
    //     }
    // });
    
    $(document).keypress(function(e) {
        // if Enter key is pressed while the new-note-content has focus, and 
        // isChecklistOn = true, then append the following content to the new-note-content
        if(e.which == 13 && $("#new-note-content").is(":focus") && isChecklistOn) {
            // e.preventDefault();

            $("#new-note-content").append(
            `
            <div class="form-check">
                <label class="form-check-label">
                    <input class="form-check-input" type="checkbox" value="">

                </label>
            </div>
            `
            );
        }
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
                        <button type="submit" class="btn btn-secondary btn-sm update-btn">Done</button>
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