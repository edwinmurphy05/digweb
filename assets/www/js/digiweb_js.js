// Delclare the globals array;
var user_globals = [];
user_globals['payment'] = false;

/*********** ONLOAD FUNCTION ***************/

function armButtons() {

	$.ajaxSetup ({
	    // Disable caching of AJAX responses
	    cache: false
	});

	// Listener to hide the footer when the on-screen keyboard is shown:
	var initialScreenSize = window.innerHeight;	
	window.addEventListener("resize", function() {
		if (user_globals['payment']){
			return;
		}
	    if(window.innerHeight < initialScreenSize){
	    	$("[data-role=footer]").hide();	        
	    }
	    else{
	        $("[data-role=footer]").show();
	    }
	});

	// Load the login_form into the ajax container:
	loadLoginForm();

	// Enable to override loign screen:
	// paymentFormHack();

	// // Accordion expand-collapse for all dropdowns:
	// $('.accordion-parent').bind('click', function(){
	// 	// declare a variable for the icon span
	// 	var icon_span = $(this).find('span.drop-menu-icon');
	// 	// toggle the child list and swap the icon in the callback:
	// 	$(this).siblings('div.accordion-child').slideToggle('fast', function(){
	// 		icon_span.toggleClass('dmi-expanded');
	// 	});
	// });

	// // Populate the field with the clicked item:
	// $('.accordion-li').bind('click', function() {
	// 	// define a variable for the parent element:
	// 	var parent_element = $(this).parent().siblings('div.accordion-parent');
	// 	// place the selected text in the parent
	// 	parent_element.find('span.drop-menu-text').text($(this).text());
	// 	// Close the child and swap the icon in the callback:		
	// 	$(this).parent().slideToggle('fast', function(){
	// 		parent_element.find('span.drop-menu-icon').toggleClass('dmi-expanded');
	// 	});
	// });

	// $('#submit_payment').bind('click', function() {
	// 	var payment_amount = $('#payment_amt').val();

	// 	// Validate input:
	// 	if (payment_amount == '' || isNaN(payment_amount)){
	// 		alert('You must enter a valid number');
	// 	}
	// 	else {
	// 		r = confirm('Please confirm that you wish to pay €'+ payment_amount + ' from your bill');
	// 		if(r) {
	// 			alert('Great! You hit OK.');
	// 		}
	// 		else {
	// 			alert('You hit Cancel.');
	// 		}
	// 	}
		
	// });

}

/********************* STANDARD FUNCTIONS ************************************/ 

function loadLoginForm() {
	$('#account_container').load('login_form.html', function(){
		bindLoginButtonEvent();
	});		
}

// function paymentFormHack(){
// 	$('#account_container').load('payment_template.html', function(){ //this is a hack for testing the Account Overview Page
// 		bindLoginButtonEvent();
// 		$('[data-role=footer]').hide();
// 		$('[data-role=content]').css({'height':'140%', 'position':'relative'});
// 	});	
// }

// Arm the Login button:
function bindLoginButtonEvent() {
	$('#login_submit').bind('click', function(){
        // Serialize the form data by hand, as submit is causing the page to reload the default Ajax call:
		userid = $('#userid').val();
		password = $('#password').val();

		user_globals['userid'] = userid;
		user_globals['password'] = password;

		// Call the Account Overview page loader:
		showAccountOverview(userid, password); 
	})
}

function showAccountOverview(userid, password){
	// These steps reset the view in case user is redirected from another part of the app
	user_globals['payment'] = false;
	$('[data-role=content]').css({'height':'80%', 'position':'relative'});
	$('[data-role=footer]').show();

	// Make ajax call, and use response data to populate account_overview_template.html
	$.ajax({
		type: 'POST',
		// crossDomain: true,
		data:  {userid: userid, password: password},
		url: 'https://darkglue.my.phpcloud.com/digiweb/account/',
		// contentType: 'application/json; charset=utf-8',
        // dataType: 'json',
		success: function(response){
			// Extract information from json response:
			try {
				var json = $.parseJSON(response);						
			}
			catch(e){
				alert('There was an error with the server response.');
				return;
			}
			
			// Check for valid login before proceeding:
			var login_status = parseInt(json.status);
			if(login_status != 1){
				alert('Your username and password were not recognised. Please try again.');
				return;
			}

			// Grab the information from the JSON response:
			var username = json.username;
			var current_balance = json.current_balance;
			var last_payment_amt = json.last_payment_amt;
			var last_payment_day = json.last_payment_day;
			var last_payment_month = json.last_payment_month;
			var last_payment_year = json.last_payment_year;

			// Place into template:
			$.get('account_overview_template.html', function(template){
				var account_template = template;
				account_template = account_template.replace('{{username}}', username);
				account_template = account_template.replace('{{current_balance}}', current_balance);
				account_template = account_template.replace('{{last_payment_amt}}', last_payment_amt);
				account_template = account_template.replace('{{last_payment_day}}', last_payment_day);
				account_template = account_template.replace('{{last_payment_month}}', last_payment_month);
				account_template = account_template.replace('{{last_payment_year}}', last_payment_year);
				
				// Insert into relevant container and bind events
				$('#account_container').html(account_template);
				bindAccountOverviewEvents(username, current_balance);
				
				// Add a logout button as user is now in a secure area
				$('#logout_button').show();				
				bindLogoutEvent();
			});
		},
		error: function(){
			// This should be replaced by a template:
			alert('Sorry. You cannot connect to the server at this time.');
		}
	});
}

function bindAccountOverviewEvents(userid, balance) {

	// 'Make a Payment' button loads the credit card payment form from a template:
	$('#payment_button').bind('click', function() {
		// Get the HTML template:
		$.get('payment_template.html', function(template){
			user_globals['payment'] = true;
			$('[data-role=footer]').hide();
			$('[data-role=content]').css({'height':'180%', 'position':'relative'});

			// Insert the user's balance into the page for information
			payment_template = template.replace('{{payment_balance}}', balance);
			$('#account_container').html(payment_template);
			// Enable the 'submit payment' button:
			bindPaymentFormEvents();
		});
	});

	// Bind event to the County live search box:

}

function bindPaymentFormEvents() {

	// 'Submit Payment' button validates the form and calls the submit function
	$('#submit_payment').bind('click', function() {
		var payment_amount = $('#payment_amount').val();

		// Validate input:
		if (payment_amount == '' || isNaN(payment_amount)){
			alert('You must enter a valid number');
		}
		else {
			var payment_confirmed = confirm('Please confirm that you wish to pay €'+ payment_amount + ' from your bill');
			if(payment_confirmed) {
				submitPaymentDetails();
			}
			else {
				alert('Your payment was not sent.');
			}
		}		
	});
}

// Form submission function
function submitPaymentDetails(){
	var formdata = $('#payment_form').serializeArray();
	formdata.push({name: 'userid', value: user_globals['userid']});
	formdata.push({name: 'password', value: user_globals['password']});

	$.ajax({
		type: 'POST',
		data:  formdata,
		url: 'https://darkglue.my.phpcloud.com/digiweb/pay/',
		success: function(response){
			// Extract information from json response:
			try {
				var json = $.parseJSON(response);
			}
			catch(e){
				alert('There was an error with the server response.');
				return;
			}

			// Check for valid login before proceeding:
			var pay_success = parseInt(json.payment_status);

			if(pay_success === 1){
				alert('Your payment was received. Thank you.');
				showAccountOverview(user_globals['userid'], user_globals['password']);
			}
			else {
				alert('Your username and password were not recognised. Please try again.');
				return;
			}			
		},
		error: function(){
			var try_again = confirm('Sorry, could connect to the server. Do you want to try again?');

			if (!try_again) {
				alert('Your payment has not been processed. Please try again later.');
				// Redirect to Account Overview page:
				showAccountOverview(user_globals['userid'], user_globals['password']);
			}			
		}
	});
}

// Finally, add logout functionality:
function bindLogoutEvent() {
	$('#logout_button').bind('click', function() {
		window.location = 'index.html';
		loadLoginForm();
		$('#logout_button').hide();		
	});
}	