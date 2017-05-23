/* global $ autosize */

$(document).ready(function(){
    // global variables
    var isChecklistOn = false;
    var isUndo = false;
    var ta = $("textarea");
    var totalCardCount = $(".card").length;
    var currentInput;
    var oldPin; // for pinning cards
    var oldChild; // for undo deletion
    var timeoutID; // to delay deletion

    // if($("#new-note-form:visible")) {
    //   // -1 to negate the .card for adding a new note
    //   totalCardCount--;
    // }

    // var archivedCardCount = $(".is-archive").length;
    // alert(totalCardCount);
    // alert(archivedCardCount);

    // enable the autosize.js on textareas
    autosize(ta);

    // checks which elements are checked on page load for styling
    isChecked();

    // if cardCount > 30 cards hide the rest
    hideExtraCards();

    // tooltip and modal activators
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

    $("#note-row").on("focus", ".note-text-input", function(){
      currentInput = $(this);
      // console.log(currentInput);
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
        // set the value of archive-input to "on" to archive the card
        archiveInput.attr("value", "on");

        // set a new class so it is not counted with totalCardCount
        archiveInput.addClass("is-archive");

        var archiveCard = true;

        $(this).closest(".card-block").children(".edit-note-form").submit();

        if(archiveCard) {
          totalCardCount--;
          // console.log(totalCardCount);
          $(this).closest(".card-col").hide();
        }
      }
    });

    // to allow pinning of cards
    $("#note-row").on("click", ".pin-btn", function(){
      console.log($(this));
      $(this).addClass("active");
      $(this).css("background-color", "rgba(230, 230, 230)"); //#e6e6e6 i believe this property must be rgba
      // console.log($(this).attr("class"));

      var pinInput = $(this).closest(".card-block").find(".pin-input");
      var toPinItem = $(this).closest(".card-col");
      // console.log(toPinItem);
      // set the value of pin-input to "on" to pin the card
      pinInput.attr("value", "on");
      pinInput.addClass("active-pin");

      $(this).closest(".card-block").children(".edit-note-form").submit();
      // console.log(toPinItem);
      oldPin = toPinItem.remove();
      // console.log(oldPin);
      $("#pin-row").prepend(oldPin);
    });

    // to unpin cards
    $("#pin-row").on("click", ".pin-btn", function(){
      $(this).removeClass("active");
      // console.log("in here");
      var pinInput = $(this).closest(".card-block").find(".pin-input");
      var toPinItem = $(this).closest(".card-col");

      // set the value of pin-input to "off" to unpin the card
      pinInput.attr("value", "off");
      pinInput.removeClass("active-pin");

      $(this).closest(".card-block").children(".edit-note-form").submit();
      // console.log("did it post?");
      oldPin = toPinItem.remove();

      $("#note-row").prepend(oldPin);
    });

    // when todo is checked then strike through and other styling - NEED TO REFACTOR THIS INTO A FUNCTION
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
    //========
    $("#pin-row").on("change", ".ckbox", function(){
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

    // show update-btn if the following elements are focused or clicked on
    $("#note-row").on("click", ".note-text-input", function(){
      $(this).parents(".edit-note-form").children(".text-right").children(".update-btn").show();
    });
    $("#note-row").on("click", ".title-text", function(){
      $(this).parents(".edit-note-form").find(".update-btn").show();
    });
    $("#note-row").on("focus", ".note-text-input", function(){
      $(this).parents(".edit-note-form").find(".update-btn").show();
    });
    $("#note-row").on("focus", ".note-content", function(){
      $(this).parents(".edit-note-form").find(".update-btn").show();
    });
    //=======
    $("#pin-row").on("click", ".note-text-input", function(){
      $(this).parents(".edit-note-form").children(".text-right").children(".update-btn").show();
    });
    $("#pin-row").on("click", ".title-text", function(){
      $(this).parents(".edit-note-form").find(".update-btn").show();
    });
    $("#pin-row").on("focus", ".note-text-input", function(){
      $(this).parents(".edit-note-form").find(".update-btn").show();
    });
    $("#pin-row").on("focus", ".note-content", function(){
      $(this).parents(".edit-note-form").find(".update-btn").show();
    });

    // load more notes if button is clicked
    $("#load-more-notes").on("click", function(){
      showExtraCards();
    });

    // append a new checklist text box inside the notecard
    $(document).keypress(function(e) {
        if(e.which == 13 && $(".note-text-input").is(":focus")) {
          e.preventDefault();

          var inputNode = $('<input type="text" class="form-control note-text-input" aria-label="Text input with checkbox" name="checklists[]" value="">');

          $(currentInput).closest(".edit-note-form").find(".update-btn").before(inputNode);
          inputNode.focus();
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

    // add a new notecard
    $("#note-btn").on("click", function(){
      $(".btn-choice-input").attr("value", "off");
      $("#new-note-form").submit();
    });

    // add a new checklist card
    $("#checklist-btn").on("click", function(){
      isChecklistOn = true;
      $(".btn-choice-input").attr("value", "on");
      $("#new-note-form").submit();
    });

    // if the user clicks "Undo" in the warning alert then restore the recently deleted note
    $(".container-fluid").on("click", ".alert-link", function(){
      $(".alert-warning").remove();
      $("#note-row").prepend(oldChild);
      window.clearTimeout(timeoutID); // clear the timeout so it doesn't delete
    });

    // SUBMIT NEW CARD
    $("#new-note-form").submit(function(e){
        e.preventDefault();

        if(isChecklistOn) {
          var noteItem = $(this).serialize();

          $.post("/notes", noteItem, function(data){
            $("#note-row").prepend(
              `
              <div class="col-sm-6 col-md-4 col-lg-3 card-col">
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
                          <button type="button" class="btn btn-secondary btn-sm pin-btn">
                            <i class="fa fa-thumb-tack" aria-hidden="true"></i>
                          </button>
                          <div class="text-right">
                              <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${data._id}">
                                  <i class="fa fa-trash-o" aria-hidden="true"></i>
                              </button>
                          </div>
                          <form class="edit-note-form" action="/notes/${data._id}" method="POST">
                            <input type="hidden" class="pin-input" name="pinValue" value="off">
                            <input type="hidden" class="archive-input" name="archiveValue" value="off">
                            <input type="text" class="form-control title-text" name="title" placeholder="Title" value="${data.title}">
                            <div class="hidden-div-${data._id}">

                            </div>
                            <div class="text-right">
                               <button type="submit" class="btn btn-secondary btn-sm update-btn">Done</button>
                            </div>
                          </form>
                      </div>
                  </div>
              </div>
              `
            );

            for(var i = 0; i < data.checklists.length; i++){
              $(".hidden-div-"+data._id).append(
                `
                <div class="input-group">
                  <span class="input-group-addon">
                    <input type="hidden" name="checkbox-${ data.checklists[i] }" value="off">
                    <input type="checkbox" class="ckbox" name="checkbox-${ data.checklists[i] }" aria-label="Checkbox for following text input" ${ data.checkboxes[i] ? 'checked' : null }>
                  </span>
                  <input type="text" class="form-control note-text-input" aria-label="Text input with checkbox" name="checklists[]" placeholder="Walk the dog" value="${data.checklists[i]}">
                </div>
                `
              );
            }

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
          });
        } else if(!isChecklistOn) {
          var noteItem = $(this).serialize();

          $.post("/notes", noteItem, function(data){
              $("#note-row").prepend(
               `
              <div class="col-sm-6 col-md-4 col-lg-3 card-col">
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
                          <button type="button" class="btn btn-secondary btn-sm pin-btn">
                            <i class="fa fa-thumb-tack" aria-hidden="true"></i>
                          </button>
                          <div class="text-right">
                              <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${data._id}">
                                  <i class="fa fa-trash-o" aria-hidden="true"></i>
                              </button>
                          </div>
                          <form class="edit-note-form" action="/notes/${data._id}" method="POST">
                            <input type="hidden" class="pin-input" name="pinValue" value="off">
                            <input type="hidden" class="archive-input" name="archiveValue" value="off">
                            <input type="text" class="form-control title-text" name="title" placeholder="Title" value="${data.title}">
                              <textarea class="note-content" name="text" placeholder="What's on your mind?">${data.text}</textarea>
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
          });
        }
    });

    // EDIT CARD #note-row - PUT
    $("#note-row").on("submit", ".edit-note-form", function(e){
        e.preventDefault();

          var noteItem = $(this).serialize();
          var actionUrl = $(this).attr("action");
          var $originalItem = $(this).parent(".card-block");

          // console.log(noteItem);
          // debugger;

        $.ajax({
            url: actionUrl,
            data: noteItem,
            type: "PUT",
            originalItem: $originalItem,
            success: function(data){
              if(data.checklists.length > 0) {
                this.originalItem.html(
                `
                <div class="dropdown">
                  <button class="btn btn-secondary btn-sm dropdown-toggle more-options-btn" type="button" id="optionsDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fa fa-ellipsis-v fa-2" aria-hidden="true"></i>
                  </button>
                  <div class="dropdown-menu" aria-labelledby="optionsDropdown">

                    <button class="dropdown-item archive-btn" type="button">Archive</button>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm pin-btn">
                  <i class="fa fa-thumb-tack" aria-hidden="true"></i>
                </button>
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

                // console.log(data.isPinned);

                if(data.isPinned) {
                  $(".edit-note-form").prepend(
                    `
                    <input type="hidden" class="pin-input active-pin" name="pinValue" value="on">
                    `
                  );
                } else {
                  $(".edit-note-form").prepend(
                    `
                    <input type="hidden" class="pin-input" name="pinValue" value="off">
                    `
                  );
                }

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
                  // console.log(checkBox);

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

                    <button class="dropdown-item archive-btn" type="button">Archive</button>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm pin-btn">
                  <i class="fa fa-thumb-tack" aria-hidden="true"></i>
                </button>
                <div class="text-right">
                    <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${data._id}">
                        <i class="fa fa-trash-o" aria-hidden="true"></i>
                    </button>
                </div>
                <form class="edit-note-form" action="/notes/${data._id}" method="POST">
                    <input type="hidden" class="archive-input" name="archiveValue" value="off">
                    <input type="text" class="form-control title-text" name="title" placeholder="Title" value="${data.title}">
                    <textarea class="note-content" name="text" placeholder="What's on your mind?">${data.text}</textarea>
                    <div class="text-right">
                        <button type="submit" class="btn btn-secondary btn-sm update-btn">Done</button>
                    </div>
                </form>
                `
                );

                if(data.isPinned) {
                  $(".edit-note-form").prepend(
                    `
                    <input type="hidden" class="pin-input active-pin" name="pinValue" value="on">
                    `
                  );
                } else {
                  $(".edit-note-form").prepend(
                    `
                    <input type="hidden" class="pin-input" name="pinValue" value="off">
                    `
                  );
                }

                autosize($(".note-content"));
              }
            }
        });
    });

    // EDIT CARD #pin-row - PUT
    $("#pin-row").on("submit", ".edit-note-form", function(e){
        e.preventDefault();

          var noteItem = $(this).serialize();
          var actionUrl = $(this).attr("action");
          var $originalItem = $(this).parent(".card-block");

          // console.log(noteItem);
          // debugger;

        $.ajax({
            url: actionUrl,
            data: noteItem,
            type: "PUT",
            originalItem: $originalItem,
            success: function(data){
              if(data.checklists.length > 0) {
                this.originalItem.html(
                `
                <div class="dropdown">
                  <button class="btn btn-secondary btn-sm dropdown-toggle more-options-btn" type="button" id="optionsDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fa fa-ellipsis-v fa-2" aria-hidden="true"></i>
                  </button>
                  <div class="dropdown-menu" aria-labelledby="optionsDropdown">

                    <button class="dropdown-item archive-btn" type="button">Archive</button>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm pin-btn">
                  <i class="fa fa-thumb-tack" aria-hidden="true"></i>
                </button>
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

                // console.log(data.isPinned);

                if(data.isPinned) {
                  $(".edit-note-form").prepend(
                    `
                    <input type="hidden" class="pin-input active-pin" name="pinValue" value="on">
                    `
                  );
                } else {
                  $(".edit-note-form").prepend(
                    `
                    <input type="hidden" class="pin-input" name="pinValue" value="off">
                    `
                  );
                }

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
                  // console.log(checkBox);

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

                    <button class="dropdown-item archive-btn" type="button">Archive</button>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm pin-btn">
                  <i class="fa fa-thumb-tack" aria-hidden="true"></i>
                </button>
                <div class="text-right">
                    <button type="submit" class="btn btn-secondary btn-sm delete-card-btn" data-id="${data._id}">
                        <i class="fa fa-trash-o" aria-hidden="true"></i>
                    </button>
                </div>
                <form class="edit-note-form" action="/notes/${data._id}" method="POST">
                    <input type="hidden" class="archive-input" name="archiveValue" value="off">
                    <input type="text" class="form-control title-text" name="title" placeholder="Title" value="${data.title}">
                    <textarea class="note-content" name="text" placeholder="What's on your mind?">${data.text}</textarea>
                    <div class="text-right">
                        <button type="submit" class="btn btn-secondary btn-sm update-btn">Done</button>
                    </div>
                </form>
                `
                );

                if(data.isPinned) {
                  $(".edit-note-form").prepend(
                    `
                    <input type="hidden" class="pin-input active-pin" name="pinValue" value="on">
                    `
                  );
                } else {
                  $(".edit-note-form").prepend(
                    `
                    <input type="hidden" class="pin-input" name="pinValue" value="off">
                    `
                  );
                }

                autosize($(".note-content"));
              }
            }
        });
    });

    // DELETE CARD
    $("#note-row").on("click", ".delete-card-btn", function(){
        // assign the item to delete into a temp variable - oldChild
        var toDeleteItem = $(this).closest(".card-col");
        oldChild = toDeleteItem.remove();
        // console.log(oldChild);
        $(".container-fluid").prepend(
          `
          <div class="container">
            <div class="alert alert-warning" role="alert">
              <strong>Note Deleted</strong> -- <a class="alert-link" href="#">Undo</a>
            </div>
          </div>
          `
        );
        $(".alert-warning").delay(8000).fadeOut(); // 8 seconds

        var $itemToDelete = $(this).closest(".card-col");
        var actionUrl = $(this).attr("data-id");

        // sets a timeout (delay) to give the user time to undo accidental deletions
        timeoutID = window.setTimeout(function(){
          $.ajax({
              type: "DELETE",
              url: "/notes/" + actionUrl,
              itemToDelete: $itemToDelete,
              success: function(data){
                  this.itemToDelete.remove();
              }
          });

          totalCardCount--;
        }, 8000); // 8 seconds
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
