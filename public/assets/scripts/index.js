$(document).ready(function () {
	function loadMessages() {
		$.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: 'https://rabbitmq-mule.herokuapp.com/graphQL',
			data: JSON.stringify({
				query: `{
         messages{
          message,
					source,
					orderid,
					productname,
					price,
					createddate,
					owner,
					quantity,
					billingaddress,
					shippingaddress,
					status
         }
        }`,
			}),
			success: function (result) {
				console.log(result);
				var appendHTML = '';
				var appendHTML1 = '';

			

			if(result.data.messages.length === 0){
				appendHTML1 = appendHTML1 + '<div style="text-align:center;"><span >No orders yet!!</span></div>';
			}else{
				let orders = result.data.messages.reduce((r, a) => {
					r[a.orderid] = [...r[a.orderid] || [], a];
					return r;
				 }, {});
				for (var k in orders){

					appendHTML1 = appendHTML1 +`	<h1><span class="slds-page-header__title slds-truncate" title="Contacts (will truncate)">Order Id #  ${k}</span></h1>`;
					
					$.each(orders[k], function (i, row) {
						appendHTML1 = appendHTML1 +`	<div style="margin-top:10px">Item ${i+1}</div>
						<ul class="slds-page-header__detail-list">
							<li class="slds-page-header__detail-item">
								<div class="slds-text-title slds-truncate" title="Field 1">Product</div>
								<div title="Burlington Textile Weaving Plant Generator">
									<a href="javascript:void(0);">  ${row.productname}</a>
								</div>
							</li>
							<li class="slds-page-header__detail-item">
								<div class="slds-text-title slds-truncate" title="Address (2)"> Shipping Address
								
								</div>
								<div title="Multiple Values">
								${row.shippingaddress}
								</div>
							</li>
							<li class="slds-page-header__detail-item">
								<div class="slds-text-title slds-truncate" title="Close Date">Order Start Date</div>
								<div title="11/1/2018"> ${row.createddate}</div>
							</li>
							<li class="slds-page-header__detail-item">
								<div class="slds-text-title slds-truncate" title="Opportunity Owner">Owner</div>
								<div title="Hyperlink">
									<div class="slds-media slds-media_small">
										<div class="slds-media__figure">
											<span class="slds-avatar slds-avatar_circle slds-avatar_x-small">
												<img alt="Person name" src="/assets/images/avatar2.jpg" title="User avatar" />
											</span>
										</div>
										<div class="slds-media__body">
											<a href="javascript:void(0);">${row.owner}</a>
										</div>
									</div>
								</div>
							</li>
							<li class="slds-page-header__detail-item">
								<div class="slds-text-title slds-truncate" title="Amount">Price</div>
								<div title="$375,000.00">${row.price}</div>
							</li>
							<li class="slds-page-header__detail-item">
							<div class="slds-text-title slds-truncate" > Quantity
							
							</div>
							<div title="Multiple Values">
							${row.quantity}
							</div>
						</li>
						</ul>
						<hr/>
					`

					});

					
					
				

				}
			}
				 
			

				$.each(result.data.messages, function (i, row) {
					appendHTML =
						appendHTML +
						`<tr class="slds-hint-parent">
                <td role="gridcell">
                  <div class="slds-truncate" title="Company One">
                    ${row.message}
                  </div>
                </td>
                <td role="gridcell">
                  <div class="slds-truncate" title="Director of Operations">
                    ${row.source}
                  </div>
                </td>
							</tr>`;
					});
			//	$('#tablebody').prepend(appendHTML);
				$('#ordercontainer').prepend(appendHTML1);
			},
		});
	}

	$('#send').on('click', function () {
		var data = {};
		data.source = 'Heroku';
		data.message = $('#messagebox').val();

		$.ajax({
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json',
			url: '/publish',
			success: function (data) {
				console.log('success');
				$('#messagebox').val('');
				//getQueue();
			},
		});
	});

	loadMessages();
});
