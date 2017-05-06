/* global $ autosize */

$(document).ready(function(){
    var isChecklistOn = false;
    var isChecklist = false;
    var ta = $("textarea");

    autosize(ta);

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

    // show the update-btn (done) when clicking on editable card
    $("#note-row").on("click", ".note-content", function(){
        $(this).siblings(".text-right").children(".update-btn").show();
    });

    // toggle a checklist feature on note card
    $(".checklist-btn").on("click", function(){
        $(".checklist-btn").toggleClass("active");

        if($(".checklist-btn").hasClass("active")) {
            isChecklistOn = true;
            isChecklist = true;

            $("#done-btn").attr("value", "true");

            $(".new-note-content").remove();

            $("#new-note-form").prepend(
            `
            <div class="checkbox-txt">
              <input type="text" class="form-control new-note-text" aria-label="Text input with checkbox" name="checklists[]">
            </div>
            `
            );


        } else {
            // alert("checklist-btn is NOT active now");
            // need to remove checklist and clear note card
            $("#new-note-form").prepend(
              `
              <textarea class="new-note-content" placeholder="What's on your mind?" name="text"></textarea>
              `
            );

            $(".checkbox-txt").remove();
            isChecklistOn = false;
            isChecklist = false;
        }
    });

    // if($(".ckbox").is(":checked")) {
    //     $(".ckbox-div").css("text-decoration", "line-through");
    // }

    // when todo is checked then strike through and other styling
    $("#note-row").on("change", ".ckbox", function(){
        console.log(this);
        if($(this).is(":checked")) {
            console.log(this);
            $(this).closest(".ckbox-div").css("text-decoration", "line-through");
            $(this).parent(".ckbox-div").siblings(".text-right").children(".update-btn").show();
            $(this).parents(".edit-note-form").children(".text-right").children(".update-btn").show();
        } else if(!($(this).is(":checked"))) {
            $(this).closest(".ckbox-div").css("text-decoration", "none");
        }
    });

    $("#note-row").on("click", ".note-text-input", function(){
      $(this).parents(".edit-note-form").children(".text-right").children(".update-btn").show();
    });

    $(document).keypress(function(e) {
        // if Enter key is pressed while the note-text-input has focus, and
        // isChecklistOn = true, then append the following content to the checkbox-txt
        if(e.which == 13 && $(".new-note-text").is(":focus") && isChecklistOn) {
          e.preventDefault();

          $(".checkbox-txt").append(
            `
            <input type="text" class="form-control new-note-text" aria-label="Text input with checkbox" name="checklists[]">
            `
          );

          $(".new-note-text").focus();
        }
    });

    // watch all clicks on the document for submitting notes
    // $(document).click(function(event) {
    //     if what was clicked is not the original card block
    //     if(!$(this).is($('#new-note-content').closest('.card-block'))) {
    //         if($('#new-note-content').text().length) {
    //             $('#new-note-form').submit();
    //             $('#new-note-content').text('');
    //         }
    //     }
    // });

    //=====================================================
    // GET CARDS
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
    //=====================================================

    // SUBMIT NEW CARD
    $("#new-note-form").submit(function(e){
        e.preventDefault();

        if(isChecklistOn) {
          var noteItem = $(this).serialize();
        //   console.log(noteItem);

          $.post("/notes", noteItem, function(data){
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
                            <div class="hidden-div-${data._id}"></div>
                            <div class="text-right">
                               <button type="submit" class="btn btn-secondary btn-sm update-btn">Done</button>
                            </div>
                          </form>
                      </div>
                  </div>
              </div>
              `
            );

            // no boostrap style
            // <div class="ckbox-div">
            //   <input type="checkbox" class="ckbox">
            //   <input type="text" class="form-control note-text-input" aria-label="Text input with checkbox" name="checklists[]" value="${checklistItem}">
            // </div>
            data.checklists.forEach(function(checklistItem){
              $(".hidden-div-"+data._id).append(
                `
                <div class="input-group">
                  <span class="input-group-addon">
                    <input type="checkbox" class="ckbox" aria-label="Checkbox for following text input">
                  </span>
                  <input type="text" class="form-control note-text-input" aria-label="Text input with checkbox" name="checklists[]" value="${checklistItem}">
                </div>
                `
              );
            });

            $(".checklist-btn").removeClass("active");
            $(".checkbox-txt").remove();
            isChecklistOn = false;

            $("#new-note-form").prepend(
              `
              <textarea class="new-note-content" placeholder="What's on your mind?" name="text"></textarea>
              `
            );
          });
        } else {
          var noteItem = $(this).serialize();
        //   console.log(noteItem);

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
                              <textarea class="note-content" name="text">${data.text}</textarea>
                              <div class="text-right">
                                  <button type="submit" class="btn btn-secondary btn-sm update-btn">Done</button>
                              </div>
                          </form>
                      </div>
                  </div>
              </div>
               `
              );

            autosize($(".note-content"));
            $(".new-note-content").val("");
          });
        }
    });

    // EDIT CARD - PUT
    $("#note-row").on("submit", ".edit-note-form", function(e){
        e.preventDefault();

        var noteItem = $(this).serialize();
        var actionUrl = $(this).attr("action");
        var $originalItem = $(this).parent(".card-block");

        // console.log(noteItem);
        // debugger
        console.log($originalItem);

        $.ajax({
            url: actionUrl,
            data: noteItem,
            type: "PUT",
            originalItem: $originalItem,
            success: function(data){
              if(data.text === undefined) {
                this.originalItem.html(
                `
                <div class="text-right">
                    <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${data._id}">
                        <i class="fa fa-trash-o" aria-hidden="true"></i>
                    </button>
                </div>
                <form class="edit-note-form" action="/notes/${data._id}" method="POST">
                  <div class="hidden-div-${data._id}"></div>
                  <div class="text-right">
                     <button type="submit" class="btn btn-secondary btn-sm update-btn">Done</button>
                  </div>
                </form>
                `
                );

                data.checklists.forEach(function(checklistItem){
                  $(".hidden-div-"+data._id).append(
                    `
                    <div class="input-group">
                      <span class="input-group-addon">
                        <input type="checkbox" class="ckbox" aria-label="Checkbox for following text input">
                      </span>
                      <input type="text" class="form-control note-text-input" aria-label="Text input with checkbox" name="checklists[]" value="${checklistItem}">
                    </div>
                    `
                  );
                });
              } else {
                this.originalItem.html(
                `
                <div class="text-right">
                    <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${data._id}">
                        <i class="fa fa-trash-o" aria-hidden="true"></i>
                    </button>
                </div>
                <form class="edit-note-form" action="/notes/${data._id}" method="POST">
                    <textarea class="note-content" name="text">${data.text}</textarea>
                    <div class="text-right">
                        <button type="submit" class="btn btn-secondary btn-sm update-btn">Done</button>
                    </div>
                </form>
                `
                );
                autosize($(".note-content"));
              }

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
