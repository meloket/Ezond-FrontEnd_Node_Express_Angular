// jshint esversion: 6

var paneCount = 0;
var toastTimer = null;
var scrollFreeze = true;

$(document).ready(function() {

	paneSizeFix();

	// dropdown menu
	bindDropdownMenu();

	// menu
	bindMenu();
});

$(window).resize(function(e) {
	paneSizeFix();
});

function paneSizeFix() {
	$(".pa").each(function() {
		var width = $(this).outerWidth();
		var height = $(this).outerHeight();

		// Set pane width
		if ($(this).attr("data-paneWidth") !== undefined) {
			width = $(this).attr("data-paneWidth");
		} else {
			$(this).attr("data-paneWidth", width);
		}

		// Set pane height
		if ($(this).attr("data-paneHeight") !== undefined) {
			height = $(this).attr("data-paneHeight");
		} else {
			$(this).attr("data-paneHeight", height);
		}

		// Check dimensions
		if (width >= $(window).width()) {
			$(this).width($(window).width() - 8);
		} else {
			$(this).width($(this).attr("data-paneWidth"));
		}

		if (height >= $(window).height()) {
			$(this).css({
				height: $(window).height(),
				top: "0px"
			});
		} else {
			$(this).height();
			$(this).css({
				height: $(this).attr("data-paneHeight"),
				top: "8%"
			});
		}
	});

	$(".dropdown").hide();
}

function bind(id, value) {
	var element = $("[data-bind=\""+id+"\"]");
	if (element.is("input")) {
		$("[data-bind=\""+id+"\"]").val(value);
	} else if (element.is("textarea")) {
		$("[data-bind=\""+id+"\"]").val(value);
	} else if (element.is('select')){
		element.val(value);
	} else {
		$("[data-bind=\""+id+"\"]").text(value);
	}
}

function diaPane(content, confirmFunc, cancelFunc, hideOnClose) {
	$("body").append("<div id='diaPane-"+paneCount+"' class='pa pa-dia'>"+
				"<p>"+content+"</p>"+
				"<div>"+
					"<button id='diaPaneYes-"+paneCount+"' class='bn bn-suc'><i class='fa fa-check'></i>&nbsp;Yes</button>"+
					"<button id='diaPaneNo-"+paneCount+"' class='bn bn-err'><i class='fa fa-ban'></i>&nbsp;No</button>"+
				"</div>"+
			"</div>");

	$("#diaPaneYes-"+paneCount).on("click", function() {
		if (confirmFunc !== null) {
			confirmFunc($(this).parent().parent());
		}

		if (hideOnClose) {
			$(this).parent().parent().hide();
		} else {
			$(this).parent().parent().remove();
		}
	});

	$("#diaPaneNo-"+paneCount).on("click", function() {
		if (cancelFunc !== null) {
			cancelFunc($(this).parent().parent());
		}
		if (hideOnClose) {
			$(this).parent().parent().hide();
		} else {
			$(this).parent().parent().remove();
		}
	});
	paneCount++;
	return $("#diaPane-"+paneCount-1);
}

function errorPane(content, okFunc) {
	$("body").append("<div id='errorPane-"+paneCount+"' class='pa pa-err'>"+
				"<p>"+content+"</p>"+
				"<div>"+
					"<button id='errorPaneOk-"+paneCount+"' class='bn bn-std'><i class='fa fa-exclamation'></i>&nbsp;Okay</button>"+
				"</div>"+
			"</div>");

	$("#errorPaneOk-"+paneCount).on("click", function() {
		if (okFunc !== null) {
			okFunc($(this).parent().parent());
		}
		$(this).parent().parent().remove();
	});
	paneCount++;
	return $("#errorPane-"+paneCount-1);
}

function showToast(message, timer) {
	$("#toast").text(message).show();
	clearTimeout(toastTimer);
	toastTimer = setTimeout(function() {
		$("#toast").fadeOut();
	}, timer);
}

function tooltip() {
	$(".tooltip").mouseenter(function() {
		var text = $(this).attr("title");
		$(this).attr("data-title", text).removeAttr("title");
		$("body").append('<div id="tooltip" style="display: none;">'+text+'<div>');

		// Element
		var eleX = $(this).offset().left;
		var eleY = $(this).offset().top;
		var width = $(this).outerWidth();
		var height = $(this).outerHeight();

		// tooltip
		var twidth = $("#tooltip").outerWidth();
		var theight = $("#tooltip").outerHeight();

		var x = eleX - ((twidth - width) / 2);
		var y = eleY - theight - 3;

		if (x < 0) x = 1;
		if (x + twidth > $(window).width()) x = $(window).width() - twidth - 1;
		if (y < $("body").scrollTop()) y = eleY + height + 3;
		if (y + theight > $(window).height() + $("body").scrollTop()) {
			y = eleY - theight - 3;
		}

		$("#tooltip").css({
			top: y+"px",
			left: x+"px"
		}).show();
	}).mouseleave(function() {
		$(this).attr("title", $(this).attr("data-title"));
		$("#tooltip").remove();
	});
}

function dateToSQL(date, time, mer) {
	var result = "";

	// Date
	var tDate = date.split("/");
	result += tDate[2]+"-"+tDate[1]+"-"+tDate[0]+" ";

	// Time
	var tTime = time.split(":");
	if (mer === 0) {
		result += tTime[0]+":"+tTime[1]+":00";
	} else {
		var preTime = parseInt(tTime[0]);
		result += (preTime+12)+":"+tTime[1]+":00";
	}
	return result;
}

function sqlToDate(sql) {
	var result = {};
	var temp = sql.split(" ");
	// Date
	var tDate = temp[0].split("-");
	result.date = tDate[2]+"/"+tDate[1]+"/"+tDate[0];

	// Time and Meridian
	var tTime = temp[1].split(":");
	if (parseInt(tTime[0]) > 12) {
		var preTime = parseInt((tTime[0]-12));
		if (preTime < 10) preTime = "0"+preTime;
		result.time = preTime+":"+tTime[1];
		result.mer = "PM";
	} else {
		result.time = tTime[0]+":"+tTime[1];
		result.mer = "AM";
	}
	return result;
}

function bindDropdownMenu() {
	$(".dropdown-control").bind("click", function() {
		var target = $('#'+$(this).attr("data-dropdownid"));

		// Element
		var eleX = $(this).position().left;
		var eleY = $(this).position().top;
		var width = $(this).outerWidth();
		var height = $(this).outerHeight();

		// menu
		var twidth = target.outerWidth();
		var theight = target.outerHeight();

		var x = eleX - ((twidth - width) / 2);
		var y = eleY + height + 3;

		if (x < 0) x = 1;
		if (x + twidth > $(window).width()) x = $(window).width() - twidth - 1;
		if (y + theight > $(window).height() + $("body").scrollTop()) {
			y = eleY - theight - 3;
		}

		if ($(this).hasClass("dropdown-notoggle")) {
			target.css({
				top: y+"px",
				left: x+"px"
			});
		} else if (target.is(":visible")) {
			target.hide();
		} else {
			target.css({
				top: y+"px",
				left: x+"px"
			}).show();
		}

		if (!target.hasClass("dropdown-stayopen")) {
			target.bind("click", function() {
				target.hide();
			});
		}
	});
}

function isValidEmail(emailAddress) {
	var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
	var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
	var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
	var sQuotedPair = '\\x5c[\\x00-\\x7f]';
	var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
	var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
	var sDomain_ref = sAtom;
	var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
	var sWord = '(' + sAtom + '|' + sQuotedString + ')';
	var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
	var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
	var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
	var sValidEmail = '^' + sAddrSpec + '$'; // as whole string

	var reValidEmail = new RegExp(sValidEmail);

	return reValidEmail.test(emailAddress);
}

function isURLFriendly(url) {
	var strRegex = "^[a-zA-Z0-9_.-]*$";
     var re=new RegExp(strRegex);
     return re.test(url);
}

function bindMenu() {
	$(".mn-item-control").bind("mouseenter", function() {
		var submenu = $(this).find("ul").first();
		// Element
		var eleX = $(this).position().left;
		var eleY = $(this).position().top;
		var width = $(this).outerWidth();
		var height = $(this).outerHeight();

		// menu
		var twidth = submenu.outerWidth();
		var theight = submenu.outerHeight();

		var x = eleX - ((twidth - width) / 2);
		var y = eleY + height + 3;

		if ($(this).parent().hasClass("mn-sub") || $(this).parent().hasClass("mn-verti")) {
			x = eleX + width - 1;
			y -= $(this).outerHeight();
		}

		if (x < 0) x = 1;
		if (x + twidth > $(window).width()) x = $(window).width() - twidth - 1;
		if (y + theight > $(window).height() + $("body").scrollTop()) {
			y = eleY - theight - 3;
		}

		submenu.css({
			position: "absolute",
			top: y-3+'px',
			left: x+'px'
		}).show();
	}).bind("mouseleave", function() {
		$(this).find("ul").first().hide();
	});
}
