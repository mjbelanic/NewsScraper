$( document ).ready(function() {
    var getComments = function(event){
        var parentNode = event.target.parentNode;
        var getInputs = parentNode.querySelectorAll('input.hiddenIds');
        $(".prevComments").empty();
       $.each(getInputs, function( index, element ) {
           if(element.value!== false ){
                $.ajax({
                method: "GET",
                url: "/comments/" + element.value
            }).done(function(data){
                var htmlScript = "<h4>";
                htmlScript += data.comment[0].title;
                htmlScript += "</h4>";
                htmlScript += "<p>"
                htmlScript += data.comment[0].body;
                htmlScript += "</p>"
                console.log(data);
                $(".prevComments").append(htmlScript);
            })
           }
       
      });
       
    }

    $("#commentGetter").on("click" , getComments);

})