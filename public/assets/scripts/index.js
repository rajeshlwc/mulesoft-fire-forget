$(document).ready(function () {

  function getQueue(){
    $.ajax({
			type: 'GET',
			contentType: 'application/json',
			url: '/consume',
			success: function (data) {
        console.log(data);

        var receivedMessages = JSON.parse(data);

        $.each(receivedMessages, function(result){
          console.log(result);
        })

			},
		});
  }
  
  $("#send").on("click", function() {
		var data = {};
		data.source = 'Heroku';
		data.message = $("#messagebox").val();

		$.ajax({
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json',
			url: '/publish',
			success: function (data) {
        console.log('success');
        getQueue();
			},
		});
	});
});
