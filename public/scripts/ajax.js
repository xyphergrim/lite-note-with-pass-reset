/* global $ autosize */

$(document).ready(function(){
    var isChecklistOn = false;
    var ta = $("textarea");
    var totalCardCount = $(".card").length;

    // if($("#new-note-form:visible")) {
    //   // -1 to negate the .card for adding a new note
    //   totalCardCount--;
    // }

    // var archivedCardCount = $(".is-archive").length;
    // alert(totalCardCount);
    // alert(archivedCardCount);

    autosize(ta);

    // checks which elements are checked on page load for styling
    isChecked();

    // if cardCount > 30 cards hide the rest
    hideExtraCards();

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

    // for adding labels to help filter cards
    // $("#note-row").on("click", ".label-btn", function(){
    //   $(this).closest(".card-block").children(".edit-note-form").prepend(
    //     `
    //     <input type="text" class="form-control label-input" name="labelFilter" placeholder="#label">
    //     `
    //   );

    //   $(this).closest(".card-block").children(".edit-note-form").find(".update-btn").show();
    // });

    // to allow archiving of cards in case user would rather not delete them
    $("#note-row").on("click", ".archive-btn", function(){
      var archiveInput = $(this).closest(".card-block").children(".edit-note-form").children(".archive-input");

      if($(this).hasClass("disabled")) {
        // do nothing
      } else {
        // set the value of archive-input to archive the card
        archiveInput.attr("value", "on");

        // set a new class so it is not counted with totalCardCount
        archiveInput.addClass("is-archive");

        var archiveCard = true;

        $(this).closest(".card-block").children(".edit-note-form").submit();

        if(archiveCard) {
          totalCardCount--;
          console.log(totalCardCount);
          $(this).closest(".col-md-2").hide();
        }
      }
    });

    // toggle a checklist feature on note card
    $(".checklist-btn").on("click", function(){
        $(".checklist-btn").toggleClass("active");

        if($(".checklist-btn").hasClass("active")) {
            isChecklistOn = true;

            $("#done-btn").attr("value", "true");

            $(".new-note-content").remove();

            $("#new-note-form").prepend(
            `
            <div class="checkbox-txt">
              <input type="text" class="form-control new-note-text" aria-label="Text input with checkbox" name="checklists[]" placeholder="Walk the dog">
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
        }
    });

    // when todo is checked then strike through and other styling
    $("#note-row").on("change", ".ckbox", function(){
        console.log(this);
        if($(this).is(":checked")) {
            console.log(this);
            $(this).parents(".input-group").css("text-decoration", "line-through");
            $(this).parent(".input-group-addon").siblings(".note-text-input").css("color", "rgba(0, 0, 0, 0.5)");
            $(this).parents(".edit-note-form").children(".text-right").children(".update-btn").show();
        } else if(!($(this).is(":checked"))) {
            $(this).parents(".input-group").css("text-decoration", "none");
            $(this).parent(".input-group-addon").siblings(".note-text-input").css("color", "rgba(70, 74, 76, 1)");
            $(this).parents(".edit-note-form").children(".text-right").children(".update-btn").show();
        }
    });

    $("#note-row").on("click", ".note-text-input", function(){
      $(this).parents(".edit-note-form").children(".text-right").children(".update-btn").show();
    });

    $("#note-row").on("click", ".title-text", function(){
      $(this).parents(".edit-note-form").find(".update-btn").show();
    });

    $("#load-more-notes").on("click", function(){
      showExtraCards();
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

        // if(e.which == 13 && $(".note-text-input").is(":focus")) {
        //   e.preventDefault();
        //
        //   $(".edit-note-form").append(
        //     `
        //     <input type="text" class="form-control new-note-text" aria-label="Text input with checkbox" name="checklists[]">
        //     `
        //   );
        // }
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
    //       if(note.author.id.equals(currentUser._id)) {
    //         $("#user-input").after(
    //         `
    //         <div class="col-md-2">
    //             <div class="card">
    //                 <div class="card-block">
    //                     <div class="dropdown">
    //                       <button class="btn btn-secondary btn-sm dropdown-toggle more-options-btn" type="button" id="optionsDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    //                         <i class="fa fa-ellipsis-v fa-2" aria-hidden="true"></i>
    //                       </button>
    //                       <div class="dropdown-menu" aria-labelledby="optionsDropdown">
    //                         <button class="dropdown-item label-btn" type="button">Add Label</button>
    //                         <button class="dropdown-item archive-btn" type="button">Archive</button>
    //                         <!--<button class="dropdown-item" type="button">Something else here</button>-->
    //                       </div>
    //                     </div>
    //                     <div class="text-right">
    //                         <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${note._id}">
    //                             <i class="fa fa-trash-o" aria-hidden="true"></i>
    //                         </button>
    //                     </div>
    //                     <form class="edit-note-form" action="/notes/${note._id}" method="POST">
    //                       <input type="text" class="form-control title-text" name="title" placeholder="Title" value="${note.title}">
    //                         <% if(note.text !== null && note.text !== undefined) { %>
    //                             <textarea class="note-content" name="text"><%= note.text %></textarea>
    //                         <% } else { %>
    //                             <% for(var i = 0; i < note.checklists.length; i++) { %>
    //                                 <div class="input-group">
    //                                   <span class="input-group-addon">
    //                                     <input type="hidden" name="checkbox-<%= note.checklists[i] %>" value="off">
    //                                     <input type="checkbox" class="ckbox" name="checkbox-<%= note.checklists[i] %>" aria-label="Checkbox for following text input" <%= note.checkboxes[i] ? 'checked' : null %>>
    //                                   </span>
    //                                   <input type="text" class="form-control note-text-input" aria-label="Text input with checkbox" name="checklists[]" value="<%= note.checklists[i] %>">
    //                                 </div>
    //                             <% }; %>
    //                         <% } %>
    //                         <div class="text-right">
    //                             <button type="submit" class="btn btn-secondary btn-sm update-btn">Done</button>
    //                         </div>
    //                     </form>
    //                 </div>
    //             </div>
    //         </div>
    //         `
    //         );
    //       }
    //     });

          // $("#user-input").after(
          // `
          // <div class="col-md-2">
          //     <div class="card">
          //         <div class="card-block">
          //             <div class="text-right">
          //                 <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${note._id}">
          //                     <i class="fa fa-trash-o" aria-hidden="true"></i>
          //                 </button>
          //             </div>
          //             <form class="edit-note-form" action="/notes/${note._id}" method="POST">
          //                 <textarea name="note[text]">${note.text}</textarea>
          //                 <div class="text-right">
          //                     <button type="submit" class="btn btn-secondary btn-sm" id="update-btn">Done</button>
          //                 </div>
          //             </form>
          //             <p class="card-text ${note._id}">${note.text}</p>
          //         </div>
          //     </div>
          // </div>
          // `
          // );
    // });
    //=====================================================

    // SUBMIT NEW CARD
    $("#new-note-form").submit(function(e){
        e.preventDefault();

        if(isChecklistOn) {
          var noteItem = $(this).serialize();
        //   console.log(noteItem);
// <button class="dropdown-item label-btn" type="button">Add Label</button>
          $.post("/notes", noteItem, function(data){
            $("#user-input").after(
              `
              <div class="col-md-2">
                  <div class="card">
                      <div class="card-block">
                          <div class="dropdown">
                            <button class="btn btn-secondary btn-sm dropdown-toggle more-options-btn" type="button" id="optionsDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                              <i class="fa fa-ellipsis-v fa-2" aria-hidden="true"></i>
                            </button>
                            <div class="dropdown-menu" aria-labelledby="optionsDropdown">

                              <button class="dropdown-item archive-btn" type="button">Archive</button>
                            </div>
                          </div>
                          <div class="text-right">
                              <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${data._id}">
                                  <i class="fa fa-trash-o" aria-hidden="true"></i>
                              </button>
                          </div>
                          <form class="edit-note-form" action="/notes/${data._id}" method="POST">
                            <input type="hidden" class="archive-input" name="archiveValue" value="off">
                            <input type="text" class="form-control title-text" name="title" placeholder="Title" value="${data.title}">
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
            for(var i = 0; i < data.checklists.length; i++){
              $(".hidden-div-"+data._id).append(
                `
                <div class="input-group">
                  <span class="input-group-addon">
                    <input type="hidden" name="checkbox-${ data.checklists[i] }" value="off">
                    <input type="checkbox" class="ckbox" name="checkbox-${ data.checklists[i] }" aria-label="Checkbox for following text input" ${ data.checkboxes[i] ? 'checked' : null }>
                  </span>
                  <input type="text" class="form-control note-text-input" aria-label="Text input with checkbox" name="checklists[]" value="${data.checklists[i]}">
                </div>
                `
              );
            }

            $(".checklist-btn").removeClass("active");
            $(".checkbox-txt").remove();
            isChecklistOn = false;

            totalCardCount++;
            // if(totalCardCount > 30) {
            //   var items = [];

            //   $(".card").each(function(i, e){
            //     items.push($(e));
            //   });

            //   for(var i = 30; i < totalCardCount; i++){
            //     items[i].hide();
            //   }
            // }

            $("#new-note-form").prepend(
              `
              <textarea class="new-note-content" placeholder="What's on your mind?" name="text"></textarea>
              `
            );
          });
        } else {
          var noteItem = $(this).serialize();
// <button class="dropdown-item label-btn" type="button">Add Label</button>
          $.post("/notes", noteItem, function(data){
              $("#user-input").after(
               `
              <div class="col-md-2">
                  <div class="card">
                      <div class="card-block">
                          <div class="dropdown">
                            <button class="btn btn-secondary btn-sm dropdown-toggle more-options-btn" type="button" id="optionsDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                              <i class="fa fa-ellipsis-v fa-2" aria-hidden="true"></i>
                            </button>
                            <div class="dropdown-menu" aria-labelledby="optionsDropdown">

                              <button class="dropdown-item archive-btn" type="button">Archive</button>
                            </div>
                          </div>
                          <div class="text-right">
                              <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${data._id}">
                                  <i class="fa fa-trash-o" aria-hidden="true"></i>
                              </button>
                          </div>
                          <form class="edit-note-form" action="/notes/${data._id}" method="POST">
                            <input type="hidden" class="archive-input" name="archiveValue" value="off">
                            <input type="text" class="form-control title-text" name="title" placeholder="Title" value="${data.title}">
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

            totalCardCount++;

            autosize($(".note-content"));
            $(".new-note-content").val("");
          });
        }
    });

    // EDIT CARD - PUT
    $("#note-row").on("submit", ".edit-note-form", function(e){
        e.preventDefault();

        // console.log("in here in here");

        var noteItem = $(this).serialize();
        var actionUrl = $(this).attr("action");
        var $originalItem = $(this).parent(".card-block");

        $.ajax({
            url: actionUrl,
            data: noteItem,
            type: "PUT",
            originalItem: $originalItem,
            success: function(data){
              if(data.text === undefined) {
                this.originalItem.html(
                `
                <div class="dropdown">
                  <button class="btn btn-secondary btn-sm dropdown-toggle more-options-btn" type="button" id="optionsDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fa fa-ellipsis-v fa-2" aria-hidden="true"></i>
                  </button>
                  <div class="dropdown-menu" aria-labelledby="optionsDropdown">
                    <button class="dropdown-item label-btn" type="button">Add Label</button>
                    <button class="dropdown-item archive-btn" type="button">Archive</button>
                  </div>
                </div>
                <div class="text-right">
                    <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${data._id}">
                        <i class="fa fa-trash-o" aria-hidden="true"></i>
                    </button>
                </div>
                <form class="edit-note-form" action="/notes/${data._id}" method="POST">
                  <input type="hidden" class="archive-input" name="archiveValue" value="off">
                  <input type="text" class="form-control title-text" name="title" placeholder="Title" value="${data.title}">
                  <div class="hidden-div-${data._id}"></div>
                  <div class="text-right">
                     <button type="submit" class="btn btn-secondary btn-sm update-btn">Done</button>
                  </div>
                </form>
                `
                );

                // iterate through checkboxes and append them to the DOM
                for(var i = 0; i < data.checklists.length; i++ ) {
                  $(".hidden-div-"+data._id).append(
                    `
                    <div class="input-group">
                      <span class="input-group-addon">
                        <input type="hidden" name="checkbox-${ data.checklists[i] }" value="off">
                        <input type="checkbox" class="ckbox" name="checkbox-${ data.checklists[i] }" aria-label="Checkbox for following text input" ${ data.checkboxes[i] ? 'checked' : null }>
                      </span>
                      <input type="text" class="form-control note-text-input" aria-label="Text input with checkbox" name="checklists[]" value="${data.checklists[i]}">
                    </div>
                    `
                  );

                  // find which checkboxes have been "checked," and then strike-through and lighten text
                  var checkBox = $(`[name="checkbox-${data.checklists[i]}"]`);
                  console.log(checkBox);

                  if(checkBox.is(":checked")) {
                    checkBox.parents(".input-group").css("text-decoration", "line-through");
                    checkBox.parent(".input-group-addon").siblings(".note-text-input").css("color", "rgba(0, 0, 0, 0.5)");
                  }

                }
              } else {
                this.originalItem.html(
                `
                <div class="dropdown">
                  <button class="btn btn-secondary btn-sm dropdown-toggle more-options-btn" type="button" id="optionsDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fa fa-ellipsis-v fa-2" aria-hidden="true"></i>
                  </button>
                  <div class="dropdown-menu" aria-labelledby="optionsDropdown">
                    <button class="dropdown-item label-btn" type="button">Add Label</button>
                    <button class="dropdown-item archive-btn" type="button">Archive</button>
                  </div>
                </div>
                <div class="text-right">
                    <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${data._id}">
                        <i class="fa fa-trash-o" aria-hidden="true"></i>
                    </button>
                </div>
                <form class="edit-note-form" action="/notes/${data._id}" method="POST">
                    <input type="hidden" class="archive-input" name="archiveValue" value="off">
                    <input type="text" class="form-control title-text" name="title" placeholder="Title" value="${data.title}">
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

            totalCardCount--;
        }
    });

    // checks which elements are checked on page load for styling
    function isChecked(){
      var ckboxCount = $(".ckbox").length;

      var items = [];

      $(".ckbox").each(function(i, e){
        items.push($(e));
      });

      // console.log(items);

      for(var i = 0; i < ckboxCount; i++) {
        if(items[i].is(":checked")) {
          items[i].parents(".input-group").css("text-decoration", "line-through");
          items[i].parent(".input-group-addon").siblings(".note-text-input").css("color", "rgba(0, 0, 0, 0.5)");
        }
      }
    }

    // hide extra cards if more than 30 on page
    function hideExtraCards(){
      if(totalCardCount > 30) {
        var items = [];

        $(".card").each(function(i, e){
          items.push($(e));
        });

        for(var i = 30; i < totalCardCount; i++){
          items[i].hide();
        }
      } else {
        $("#load-more-notes").hide();
      }
    }

    // load 30 more cards at a time until all shown
    function showExtraCards(){
      var cardCount = $(".card:visible").length;

      if(cardCount < totalCardCount) {
        var items = [];

        $(".card:hidden").each(function(i, e){
          items.push($(e));
        });

        for(var i = 0; i < 30 && i < totalCardCount; i++){
          items[i].show();
        }
      }

      if(cardCount === totalCardCount) {
        $("#load-more-notes").hide();
      }
    }
});
