$( document ).ready(function() {
    var getComments = function(event){
        var parentNode = event.target.parentNode;
        var getInputs = parentNode.querySelectorAll('input.hiddenIds');
        $(".prevComments").empty();
        console.log("Get inputs: " + getInputs);
       $.each(getInputs, function( index, element ) {
            console.log(element.value); //Every id for any element that has a comment.
            if(element.value !== false ){ //need to check that element.value === the id of the comment doc i want
                $.ajax({
                method: "GET",
                url: "/comments/" + element.value
            }).done(function(data){
                for(var i = 0; i < data.length; i++){
                    console.log("Data: " + data.comment);
                    var htmlScript = "<h4>";
                    htmlScript += data.comment.title;
                    htmlScript += "</h4>";
                    htmlScript += "<p>"
                    htmlScript += data.comment.body;
                    htmlScript += "</p>"
                    $(".prevComments").append(htmlScript);
                }
            })
           }
       
      });
       
    }

    $(".commentButton").on("click" , getComments);

})