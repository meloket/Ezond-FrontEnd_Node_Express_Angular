$(document).ready(function(){

	$('#ezond-add-ga-widget').click(function(e){

		e.preventDefault();

		var data = {
	        dashboardID: 77,
			did: "testgawidget",
			view: 81823481
	    };

	    $.post("/user/addWidget", data, function(widget) {
	       	
	        $(widget).appendTo('.widget-holder');
	        
	    });

	});

	$('#ezond-add-gaw-widget').click(function(e){

		e.preventDefault();

		var data = {
	        dashboardID: 77,
			did: "testgawwidget",
			view: 5304258854
	    };

	    $.post("/user/addWidget", data, function(widget) {
	       	
	        $(widget).appendTo('.widget-holder');
	        
	    });

	});

	$('#ezond-add-facebook-widget').click(function(e){

		e.preventDefault();

		var data = {
	        dashboardID: 77,
			did: "testfacebookwidget",
			view: 3258355322
	    };

	    $.post("/user/addWidget", data, function(widget) {
	       	
	        $(widget).appendTo('.widget-holder');
	        
	    });

	});

});