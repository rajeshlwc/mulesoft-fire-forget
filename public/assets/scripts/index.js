$(document).ready(function () {
  
  $.ajax({
		type: 'POST',
		data: JSON.stringify("Data Entered!!"),
		contentType: 'application/json',
		url: '/publish',
		success: function (data) {
			console.log('success');
			console.log(JSON.stringify(data));
		},
	});
});
