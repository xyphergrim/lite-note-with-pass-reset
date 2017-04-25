/* global $ */

$(document).ready(function(){
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