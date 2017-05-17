"use strict";

/* global $ autosize */

$(document).ready(function () {
  var isChecklistOn = false;
  var isUndo = false;
  var ta = $("textarea");
  var totalCardCount = $(".card").length;
  var currentInput;
  var oldChild;
  var timeoutID;

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

  $("[data-toggle='tooltip']").tooltip({ trigger: "hover" });

  $("#register-btn").on("click", function () {
    $("#login-btn").removeClass("active");
    $("#register-btn").addClass("active");
  });

  $("#login-btn").on("click", function () {
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
  $("#note-row").on("click", ".note-content", function () {
    $(this).siblings(".text-right").children(".update-btn").show();
  });

  $("#note-row").on("focus", ".note-text-input", function () {
    currentInput = $(this);
    console.log(currentInput);
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
  $("#note-row").on("click", ".archive-btn", function () {
    var archiveInput = $(this).closest(".card-block").children(".edit-note-form").children(".archive-input");

    if ($(this).hasClass("disabled")) {
      // do nothing
    } else {
      // set the value of archive-input to archive the card
      archiveInput.attr("value", "on");

      // set a new class so it is not counted with totalCardCount
      archiveInput.addClass("is-archive");

      var archiveCard = true;

      $(this).closest(".card-block").children(".edit-note-form").submit();

      if (archiveCard) {
        totalCardCount--;
        console.log(totalCardCount);
        $(this).closest(".card-col").hide();
      }
    }
  });

  // toggle a checklist feature on note card
  $(".checklist-btn").on("click", function () {
    $(".checklist-btn").toggleClass("active");

    if ($(".checklist-btn").hasClass("active")) {
      isChecklistOn = true;

      $("#done-btn").attr("value", "true");

      $(".new-note-content").remove();

      $("#new-note-form").prepend("\n            <div class=\"checkbox-txt\">\n              <input type=\"text\" class=\"form-control new-note-text\" aria-label=\"Text input with checkbox\" name=\"checklists[]\" placeholder=\"Walk the dog\">\n            </div>\n            ");
    } else {
      // alert("checklist-btn is NOT active now");
      // need to remove checklist and clear note card
      $("#new-note-form").prepend("\n              <textarea class=\"new-note-content\" placeholder=\"What's on your mind?\" name=\"text\"></textarea>\n              ");

      $(".checkbox-txt").remove();
      isChecklistOn = false;
    }
  });

  // when todo is checked then strike through and other styling
  $("#note-row").on("change", ".ckbox", function () {
    console.log(this);
    if ($(this).is(":checked")) {
      console.log(this);
      $(this).parents(".input-group").css("text-decoration", "line-through");
      $(this).parent(".input-group-addon").siblings(".note-text-input").css("color", "rgba(0, 0, 0, 0.5)");
      $(this).parents(".edit-note-form").children(".text-right").children(".update-btn").show();
    } else if (!$(this).is(":checked")) {
      $(this).parents(".input-group").css("text-decoration", "none");
      $(this).parent(".input-group-addon").siblings(".note-text-input").css("color", "rgba(70, 74, 76, 1)");
      $(this).parents(".edit-note-form").children(".text-right").children(".update-btn").show();
    }
  });

  $("#note-row").on("click", ".note-text-input", function () {
    $(this).parents(".edit-note-form").children(".text-right").children(".update-btn").show();
  });

  $("#note-row").on("click", ".title-text", function () {
    $(this).parents(".edit-note-form").find(".update-btn").show();
  });

  $("#note-row").on("focus", ".note-text-input", function () {
    $(this).parents(".edit-note-form").find(".update-btn").show();
  });

  $("#note-row").on("focus", ".note-content", function () {
    $(this).parents(".edit-note-form").find(".update-btn").show();
  });

  $("#load-more-notes").on("click", function () {
    showExtraCards();
  });

  // append a new checklist text box inside the notecard
  $(document).keypress(function (e) {
    if (e.which == 13 && $(".note-text-input").is(":focus")) {
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
  $("#note-btn").on("click", function () {
    $(".btn-choice-input").attr("value", "off");
    $("#new-note-form").submit();
  });

  // add a new checklist card
  $("#checklist-btn").on("click", function () {
    isChecklistOn = true;
    $(".btn-choice-input").attr("value", "on");
    $("#new-note-form").submit();
  });

  // if the user clicks "Undo" in the info alert then restore/post the recently deleted note
  $(".container-fluid").on("click", ".alert-link", function () {
    $(".alert-info").remove();
    $("#note-row").prepend(oldChild);
    window.clearTimeout(timeoutID);
  });

  // SUBMIT NEW CARD
  $("#new-note-form").submit(function (e) {
    e.preventDefault();

    if (isChecklistOn) {
      var noteItem = $(this).serialize();

      $.post("/notes", noteItem, function (data) {
        $("#note-row").prepend("\n              <div class=\"col-sm-6 col-md-4 col-lg-3 card-col\">\n                  <div class=\"card\">\n                      <div class=\"card-block\">\n                          <div class=\"dropdown\">\n                            <button class=\"btn btn-secondary btn-sm dropdown-toggle more-options-btn\" type=\"button\" id=\"optionsDropdown\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                              <i class=\"fa fa-ellipsis-v fa-2\" aria-hidden=\"true\"></i>\n                            </button>\n                            <div class=\"dropdown-menu\" aria-labelledby=\"optionsDropdown\">\n                              <button class=\"dropdown-item archive-btn\" type=\"button\">Archive</button>\n                            </div>\n                          </div>\n                          <div class=\"text-right\">\n                              <button type=\"submit\" class=\"btn btn-secondary btn-sm delete-card-btn\" data-id=\"" + data._id + "\">\n                                  <i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i>\n                              </button>\n                          </div>\n                          <form class=\"edit-note-form\" action=\"/notes/" + data._id + "\" method=\"POST\">\n                            <input type=\"hidden\" class=\"archive-input\" name=\"archiveValue\" value=\"off\">\n                            <input type=\"text\" class=\"form-control title-text\" name=\"title\" placeholder=\"Title\" value=\"" + data.title + "\">\n                            <div class=\"hidden-div-" + data._id + "\">\n\n                            </div>\n                            <div class=\"text-right\">\n                               <button type=\"submit\" class=\"btn btn-secondary btn-sm update-btn\">Done</button>\n                            </div>\n                          </form>\n                      </div>\n                  </div>\n              </div>\n              ");

        for (var i = 0; i < data.checklists.length; i++) {
          $(".hidden-div-" + data._id).append("\n                <div class=\"input-group\">\n                  <span class=\"input-group-addon\">\n                    <input type=\"hidden\" name=\"checkbox-" + data.checklists[i] + "\" value=\"off\">\n                    <input type=\"checkbox\" class=\"ckbox\" name=\"checkbox-" + data.checklists[i] + "\" aria-label=\"Checkbox for following text input\" " + (data.checkboxes[i] ? 'checked' : null) + ">\n                  </span>\n                  <input type=\"text\" class=\"form-control note-text-input\" aria-label=\"Text input with checkbox\" name=\"checklists[]\" value=\"" + data.checklists[i] + "\">\n                </div>\n                ");
        }

        // $(".checklist-btn").removeClass("active");
        // $(".checkbox-txt").remove();
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

        // $("#new-note-form").prepend(
        //   `
        //   <textarea class="new-note-content" placeholder="What's on your mind?" name="text"></textarea>
        //   `
        // );
      });
    } else if (!isChecklistOn) {
      var noteItem = $(this).serialize();

      $.post("/notes", noteItem, function (data) {
        $("#note-row").prepend("\n              <div class=\"col-sm-6 col-md-4 col-lg-3 card-col\">\n                  <div class=\"card\">\n                      <div class=\"card-block\">\n                          <div class=\"dropdown\">\n                            <button class=\"btn btn-secondary btn-sm dropdown-toggle more-options-btn\" type=\"button\" id=\"optionsDropdown\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                              <i class=\"fa fa-ellipsis-v fa-2\" aria-hidden=\"true\"></i>\n                            </button>\n                            <div class=\"dropdown-menu\" aria-labelledby=\"optionsDropdown\">\n\n                              <button class=\"dropdown-item archive-btn\" type=\"button\">Archive</button>\n                            </div>\n                          </div>\n                          <div class=\"text-right\">\n                              <button type=\"submit\" class=\"btn btn-secondary btn-sm delete-card-btn\" data-id=\"" + data._id + "\">\n                                  <i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i>\n                              </button>\n                          </div>\n                          <form class=\"edit-note-form\" action=\"/notes/" + data._id + "\" method=\"POST\">\n                            <input type=\"hidden\" class=\"archive-input\" name=\"archiveValue\" value=\"off\">\n                            <input type=\"text\" class=\"form-control title-text\" name=\"title\" placeholder=\"Title\" value=\"" + data.title + "\">\n                              <textarea class=\"note-content\" name=\"text\">" + data.text + "</textarea>\n                              <div class=\"text-right\">\n                                  <button type=\"submit\" class=\"btn btn-secondary btn-sm update-btn\">Done</button>\n                              </div>\n                          </form>\n                      </div>\n                  </div>\n              </div>\n               ");

        totalCardCount++;

        autosize($(".note-content"));
      });
    }
    // else if(isUndo) {
    //   $("#note-row").prepend(oldChild);
    //
    //   var postThis = oldChild.find(".edit-note-form");
    //   var noteItem = postThis.serialize();
    //
    //   $.post("/notes", noteItem, function(data){
    //     // posting to /notes
    //   });
    //
    //   isUndo = false;
    // }
  });

  // EDIT CARD - PUT
  $("#note-row").on("submit", ".edit-note-form", function (e) {
    e.preventDefault();

    var noteItem = $(this).serialize();
    var actionUrl = $(this).attr("action");
    var $originalItem = $(this).parent(".card-block");

    $.ajax({
      url: actionUrl,
      data: noteItem,
      type: "PUT",
      originalItem: $originalItem,
      success: function success(data) {
        if (data.checklists.length > 0) {
          this.originalItem.html("\n                <div class=\"dropdown\">\n                  <button class=\"btn btn-secondary btn-sm dropdown-toggle more-options-btn\" type=\"button\" id=\"optionsDropdown\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                    <i class=\"fa fa-ellipsis-v fa-2\" aria-hidden=\"true\"></i>\n                  </button>\n                  <div class=\"dropdown-menu\" aria-labelledby=\"optionsDropdown\">\n\n                    <button class=\"dropdown-item archive-btn\" type=\"button\">Archive</button>\n                  </div>\n                </div>\n                <div class=\"text-right\">\n                    <button type=\"submit\" class=\"btn btn-secondary btn-sm delete-card-btn\" data-id=\"" + data._id + "\">\n                        <i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i>\n                    </button>\n                </div>\n                <form class=\"edit-note-form\" action=\"/notes/" + data._id + "\" method=\"POST\">\n                  <input type=\"hidden\" class=\"archive-input\" name=\"archiveValue\" value=\"off\">\n                  <input type=\"text\" class=\"form-control title-text\" name=\"title\" placeholder=\"Title\" value=\"" + data.title + "\">\n                  <div class=\"hidden-div-" + data._id + "\"></div>\n                  <div class=\"text-right\">\n                     <button type=\"submit\" class=\"btn btn-secondary btn-sm update-btn\">Done</button>\n                  </div>\n                </form>\n                ");

          // iterate through checkboxes and append them to the DOM
          for (var i = 0; i < data.checklists.length; i++) {
            $(".hidden-div-" + data._id).append("\n                    <div class=\"input-group\">\n                      <span class=\"input-group-addon\">\n                        <input type=\"hidden\" name=\"checkbox-" + data.checklists[i] + "\" value=\"off\">\n                        <input type=\"checkbox\" class=\"ckbox\" name=\"checkbox-" + data.checklists[i] + "\" aria-label=\"Checkbox for following text input\" " + (data.checkboxes[i] ? 'checked' : null) + ">\n                      </span>\n                      <input type=\"text\" class=\"form-control note-text-input\" aria-label=\"Text input with checkbox\" name=\"checklists[]\" value=\"" + data.checklists[i] + "\">\n                    </div>\n                    ");

            // find which checkboxes have been "checked," and then strike-through and lighten text
            var checkBox = $("[name=\"checkbox-" + data.checklists[i] + "\"]");
            // console.log(checkBox);

            if (checkBox.is(":checked")) {
              checkBox.parents(".input-group").css("text-decoration", "line-through");
              checkBox.parent(".input-group-addon").siblings(".note-text-input").css("color", "rgba(0, 0, 0, 0.5)");
            }
          }
        } else {
          this.originalItem.html("\n                <div class=\"dropdown\">\n                  <button class=\"btn btn-secondary btn-sm dropdown-toggle more-options-btn\" type=\"button\" id=\"optionsDropdown\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                    <i class=\"fa fa-ellipsis-v fa-2\" aria-hidden=\"true\"></i>\n                  </button>\n                  <div class=\"dropdown-menu\" aria-labelledby=\"optionsDropdown\">\n\n                    <button class=\"dropdown-item archive-btn\" type=\"button\">Archive</button>\n                  </div>\n                </div>\n                <div class=\"text-right\">\n                    <button type=\"submit\" class=\"btn btn-secondary btn-sm delete-card-btn\" data-id=\"" + data._id + "\">\n                        <i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i>\n                    </button>\n                </div>\n                <form class=\"edit-note-form\" action=\"/notes/" + data._id + "\" method=\"POST\">\n                    <input type=\"hidden\" class=\"archive-input\" name=\"archiveValue\" value=\"off\">\n                    <input type=\"text\" class=\"form-control title-text\" name=\"title\" placeholder=\"Title\" value=\"" + data.title + "\">\n                    <textarea class=\"note-content\" name=\"text\">" + data.text + "</textarea>\n                    <div class=\"text-right\">\n                        <button type=\"submit\" class=\"btn btn-secondary btn-sm update-btn\">Done</button>\n                    </div>\n                </form>\n                ");
          autosize($(".note-content"));
        }
      }
    });
  });

  // DELETE CARD
  $("#note-row").on("click", ".delete-card-btn", function () {
    // var parentNode = document.getElementById("note-row");
    var toDeleteItem = $(this).closest(".card-col");
    oldChild = toDeleteItem.remove();
    // console.log(oldChild);
    $(".container-fluid").prepend("\n          <div class=\"container\">\n            <div class=\"alert alert-info\" role=\"alert\">\n              <strong>Note Deleted</strong> -- <a class=\"alert-link\" href=\"#\">Undo</a>\n            </div>\n          </div>\n          ");
    $(".alert-info").delay(8000).fadeOut();

    var $itemToDelete = $(this).closest(".card-col");
    var actionUrl = $(this).attr("data-id");

    // sets a timeout (delay) to give the user time to undo accidental deletions
    timeoutID = window.setTimeout(function () {
      $.ajax({
        type: "DELETE",
        url: "/notes/" + actionUrl,
        itemToDelete: $itemToDelete,
        success: function success(data) {
          this.itemToDelete.remove();
        }
      });

      totalCardCount--;
    }, 8000);
  });

  // checks which elements are checked on page load for styling
  function isChecked() {
    var ckboxCount = $(".ckbox").length;

    var items = [];

    $(".ckbox").each(function (i, e) {
      items.push($(e));
    });

    // console.log(items);

    for (var i = 0; i < ckboxCount; i++) {
      if (items[i].is(":checked")) {
        items[i].parents(".input-group").css("text-decoration", "line-through");
        items[i].parent(".input-group-addon").siblings(".note-text-input").css("color", "rgba(0, 0, 0, 0.5)");
      }
    }
  }

  // hide extra cards if more than 30 on page
  function hideExtraCards() {
    if (totalCardCount > 30) {
      var items = [];

      $(".card").each(function (i, e) {
        items.push($(e));
      });

      for (var i = 30; i < totalCardCount; i++) {
        items[i].hide();
      }
    } else {
      $("#load-more-notes").hide();
    }
  }

  // load 30 more cards at a time until all shown
  function showExtraCards() {
    var cardCount = $(".card:visible").length;

    if (cardCount < totalCardCount) {
      var items = [];

      $(".card:hidden").each(function (i, e) {
        items.push($(e));
      });

      for (var i = 0; i < 30 && i < totalCardCount; i++) {
        items[i].show();
      }
    }

    if (cardCount === totalCardCount) {
      $("#load-more-notes").hide();
    }
  }
});