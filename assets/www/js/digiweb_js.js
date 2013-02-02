function loadLoginForm() {
	$('#account_container').load('login_form.html', function(){
		addLoginButtonHandler();
	});		
}

function paymentFormHack(){
	$('#account_container').load('payment_template.html', function(){ //this is a hack for testing the Account Overview Page
		addLoginButtonHandler();
		$('[data-role=footer]').hide();
		$('[data-role=content]').css({'height':'140%', 'position':'relative'});
	});	
}

function showAccountOverview(userid, password){
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
				var status = json.status;		
			}
			catch(e){
				alert('There was an error with the server response.');
			}
						
			// Check for valid login before proceeding:
			if(status != 1){
				alert('You username and password were not recognised. Please try again.');
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
				var account_overview = template;
				account_overview = account_overview.replace('{{username}}', username);
				account_overview = account_overview.replace('{{current_balance}}', current_balance);
				account_overview = account_overview.replace('{{last_payment_amt}}', last_payment_amt);
				account_overview = account_overview.replace('{{last_payment_day}}', last_payment_day);
				account_overview = account_overview.replace('{{last_payment_month}}', last_payment_month);
				account_overview = account_overview.replace('{{last_payment_year}}', last_payment_year);
				// Insert into relevant container 
				$('#account_container').html(account_overview);
				// Add a logout button, as we are now in a secure area:
				$('#account_header').append('<button class="logout-button" id="logout_button">X</button>');
				// Add onclick event to logout button:
				addPaymentLinkHandler(username, current_balance);
				addLogoutHandler();
			});
		},
		error: function(){
			// This should be replaced by a template:
			alert('Sorry. You cannot connect to the server at this time.');
		}
	});
}

// Arm the Login button:
function addLoginButtonHandler() {
	$('#login_submit').bind('click', function(){
        // Serialize the form data by hand, as submit is causing the page to reload the default Ajax call:
		userid = $('#userid').val();
		password = $('#password').val();
		// Call the Account Overview page loader:
		showAccountOverview(userid, password); 
	})
}

function addLogoutHandler() {
	$('#logout_button').bind('click', function() {
		$('#logout_button').remove();
		window.location = 'index.html';
		loadLoginForm();
	})
}

function addPaymentLinkHandler(userid, balance) {
	$('#payment_button').bind('click', function() {

		$.get('payment_template.html', function(template){
			$('[data-role=footer]').hide();
			$('[data-role=content]').css({'height':'140%', 'position':'relative'});

			// Place the template here:
			template = template.replace('{{payment_balance}}', balance);
			$('#account_container').html(template);
			
			addPaymentButtonHandler();
		});

	});
}

function addPaymentButtonHandler() {
	$('#submit_payment').bind('click', function() {
		var payment_amount = $('#payment_amt').val();

		// Validate input:
		if (payment_amount == '' || isNaN(payment_amount)){
			alert('You must enter a valid number');
		}
		else {
			r = confirm('Please confirm that you wish to pay €'+ payment_amount + ' from your bill');
			if(r) {
				// alert('Great! You hit OK.');
				sendPaymentDetails();
			}
			else {
				alert('Your payment was not sent.');
			}
		}
		
	});
}

function sendPaymentDetails(){
	var formdata = $('#payment_form').serialize();
	alert(formdata);

	$.ajax({
		type: 'GET',
		data:  {userid: 'userid', password: 'password'},
		url: 'https://darkglue.my.phpcloud.com/digiweb/pay/',
		contentType: 'application/json; charset=utf-8',
        dataType: 'json',
		success: function(json){
			// Extract information from json response:
			var status = json.status;
			
			// Check for valid login before proceeding:
			if(status != 1){
				alert('You username and password were not recognised. Please try again.');
				return;
			}

			window.location = 'index.html';

		},
		error: function(){
			// This should be replaced by a template:
			alert('Sorry. You cannot connect to the server at this time.');
		}
	});
}

/*********** ONLOAD FUNCTION ***************/

function armButtons() {

	$.ajaxSetup ({
	    // Disable caching of AJAX responses
	    cache: false
	});

	// Listener to hide the footer when the on-screen keyboard is shown:
	var initialScreenSize = window.innerHeight;	
	window.addEventListener("resize", function() {
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

	// Accordion expand-collapse for all dropdowns:
	$('.accordion-parent').bind('click', function(){
		// declare a variable for the icon span
		var icon_span = $(this).find('span.drop-menu-icon');
		// toggle the child list and swap the icon in the callback:
		$(this).siblings('div.accordion-child').slideToggle('fast', function(){
			icon_span.toggleClass('dmi-expanded');
		});
	});

	// Populate the field with the clicked item:
	$('.accordion-li').bind('click', function() {
		// define a variable for the parent element:
		var parent_element = $(this).parent().siblings('div.accordion-parent');
		// place the selected text in the parent
		parent_element.find('span.drop-menu-text').text($(this).text());
		// Close the child and swap the icon in the callback:		
		$(this).parent().slideToggle('fast', function(){
			parent_element.find('span.drop-menu-icon').toggleClass('dmi-expanded');
		});
	});

	$('#submit_payment').bind('click', function() {
		var payment_amount = $('#payment_amt').val();

		// Validate input:
		if (payment_amount == '' || isNaN(payment_amount)){
			alert('You must enter a valid number');
		}
		else {
			r = confirm('Please confirm that you wish to pay €'+ payment_amount + ' from your bill');
			if(r) {
				alert('Great! You hit OK.');
			}
			else {
				alert('You hit Cancel.');
			}
		}
		
	});

}

	