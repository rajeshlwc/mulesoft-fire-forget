$(document).ready(function () {
  
  var data = {};
			data.source = "Heroku";
			data.message = "Message No 1";

  $.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		url: '/publish',
		success: function (data) {
			console.log('success');
			console.log(data);
		},
	});
});
