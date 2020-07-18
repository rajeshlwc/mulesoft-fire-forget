$(document).ready(function () {
  
  $.ajax({
		type: 'POST',
		data: "Data Entered!!",
		contentType: 'application/json',
		url: '/publish',
		success: function (data) {
			console.log('success');
			console.log(data);
		},
	});
});
