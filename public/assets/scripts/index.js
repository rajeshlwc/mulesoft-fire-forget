$(document).ready(function () {

  function loadMessages(){

    $.ajax({
			type: 'POST',
			contentType: 'application/json',
      url: 'https://rabbitmq-mule.herokuapp.com/graphQL',
      data: JSON.stringify({ query: `{
        messages{
          message,
          source
        }
      }`
     }),
			success: function (data) {
        console.log(data);

        var receivedMessages = JSON.parse(data);

        var appendHTML = `<tr class="slds-hint-parent">
        <td role="gridcell">
          <div class="slds-truncate" title="Company One">
            ${receivedMessages.message}
          </div>
        </td>
        <td role="gridcell">
          <div class="slds-truncate" title="Director of Operations">
          ${receivedMessages.source}
          </div>
        </td>
      </tr>`;
        
      $("#tablebody").prepend(appendHTML);

			},
		});
  }

  function getQueue(){
    
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
        $("#messagebox").val('');
        //getQueue();
			},
		});
  });
  
  loadMessages();
});
