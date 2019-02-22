// jshint esversion:6
var activeDashboard = 0;
var activeWidgetSet = 0;
var activeWidget = 0;
var agencyDashboard = false;
var agencyDashboardUserID = 0;
var newWidget = null;
var progressReportChart = null;
var gridster = null;
var authWindow = null;

$(document).ready(function() {
    //createCharts();
    tooltip();

    //loadGridster();       //<!--myrecoverable_comment-->

    // load up first dashboard
    if ($("#myDashboards").length > 0) {
        loadFirstDashboard();
    }

    // bind dashboard click
    $("body").on("click", ".dashboard", function() {
        var dashboardID = $(this).attr("data-did");
        var dashboardName = $(this).children().first().text();
        agencyDashboardUserID = 0;
        agencyDashboard = false;
        $("#clientDashboardMessage").hide();
        if (dashboardName === "") {
            $("#clientDashboardMessage").show();
            dashboardName = $(this).text();
            agencyDashboardUserID = $(this).attr("data-ownerID");
            agencyDashboard = true;
        }
        loadDashboard(dashboardID, dashboardName);
    });

    // bind widget settings click
    $("body").on("click", ".widgetSettingsButton", function() {
        var parent = $(this).parent().parent();
        var oldActiveWidget = activeWidget;
        activeWidget = parent.attr("data-id");
        // bind settings data
        if (oldActiveWidget !== activeWidget) {
            bind("settingsWidgetName", parent.attr("data-widgetName"));
            bind("settingsWidgetDescription", parent.find(".description").text());
            bind("settingsWidgetSize", parent.attr("data-widgetSize"));
        }

        // show/hide pane
        if (oldActiveWidget === activeWidget && $("#widgetSettingsPane").is(":visible")) {
            $("#widgetSettingsPane").hide();
        } else if (oldActiveWidget !== activeWidget && !$("#widgetSettingsPane").is(":visible")) {
            $("#widgetSettingsPane").show();
        } else if (oldActiveWidget === activeWidget && !$("#widgetSettingsPane").is(":visible")) {
            $("#widgetSettingsPane").show();
        }
    });

    $('.plan-item').dblclick(function () {

        if($(this).data('deleted') == 1) {
            return false;
        }

        var planModal = $('#edit-plan');
        planModal.show();

        var planId = $(this).data('plan-id');
        var plan;
        $.get(
            '/admin/plan',
            {id: planId},
            function (response) {
                plan = response.plan || {};
                if (plan) {
                    var isExtra = Boolean(plan.extra);
                    var planType = isExtra ? 'Extra' : 'Billing';
                    var isDisabled = plan.disabled_at != null;
                    planModal.find('#disable-plan').text(isDisabled ? 'Enable' : 'Disable');

                    for(key in plan) {
                        if(key.indexOf('_number') >=0) {
                            var input = planModal.find('input[name="' + key + '"]');
                            input.val(plan[key]);
                            input.prop('disabled', plan[key] == null);
                        }
                    }
                    planModal.find('input[name="name"]').val(plan.name);
                    planModal.find('input[name="plan-id"]').val(plan.id);
                    planModal.find('input[name="plan-stripe_id"]').val(plan.stripe_id);
                    planModal.find('.plan-header').text(planType + ' plan: "' + plan.name + '" (' + plan.price / 100 + ' $/' + plan.interval + ')');
                    planModal.find('input[name="plan-disabled"]').val(isDisabled ? 1 : '');
                }
            }
        );
    });

    $('#save-plan').click(function () {
        var plan = $('#edit-plan');
        var planNameField = plan.find('input[name="name"]');

        if(planNameField.val() == '') {
            planNameField.addClass('required_field');
            return false;
        }
        planNameField.removeClass('required_field');

        var planData = {
            id: plan.find('input[name="plan-id"]').val(),
            name: planNameField.val(),
            campaignsNumber: plan.find('input[name="campaigns_number"]').val() || null,
            keywordsNumber: plan.find('input[name="keywords_number"]').val() || null,
            adKeywordsNumber: plan.find('input[name="ad_keywords_number"]').val() || null,
        };

        $.post(
            '/admin/updatePlan',
            {plan: planData},
            function (response) {
                $('#edit-plan').hide();
                window.location.reload();
            }
        );
    });

    $('#disable-plan').click(function () {
        var plan = $('#edit-plan');
        var data = {
            id: plan.find('input[name="plan-id"]').val(),
            disable: plan.find('input[name="plan-disabled"]').val() == '',
        };

        $.post(
            '/admin/togglePlanStatus',
            {data: JSON.stringify(data)},
            function (response) {
                $('#edit-plan').hide();
                window.location.reload();
            }
        );
    });

    $('#delete-plan').click(function () {
        var plan = $('#edit-plan');

        var data = {
            id: plan.find('input[name="plan-id"]').val(),
            stripeId: plan.find('input[name="plan-stripe_id"]').val() || null,
        }

        $.post(
            '/admin/deletePlan',
            {plan: data},
            function (response) {
                $('#edit-plan').hide();
                window.location.reload();
            }
        );
    })

});

function removeProgressReport() {
    $("#progressReport").slideUp(function() {
        $("#progressReport").remove();
        $.post("user/disableProgressReport");
    });
}

function createCharts() {
        var progressReportChartCtx = $("#progressReportChart").get(0).getContext("2d");

    var options = {
			responsive: false,
			pointDot: false
	};

    var data = {
	    labels: [],
	    datasets: [
	        {
	            fillColor: "rgba(35, 123, 230, 0.6)",
	            strokeColor: "rgba(220,220,220,1)",
	            pointColor: "rgba(220,220,220,1)",
	            pointStrokeColor: "#fff",
	            pointHighlightFill: "#fff",
	            pointHighlightStroke: "rgba(220,220,220,1)",
                lineWidth: 10,
	            data: [65, 20, 10, 81, 56, 55, 40]
	        }
	    ]
	};

    progressReportChart = new Chart(progressReportChartCtx).Line(data, options);
}

function toggleAddDashboard(type) {
    if (type === "agency") {
        bind("addDashboardPaneTitle", "New Agency Dashboard");
    } else {
        bind("addDashboardPaneTitle", "New Dashboard");
    }
    $("#addDashboardPane").toggle();
}

function showHidePaneSection(name, hideName) {
    if (hideName) {
        $("[data-pa-section='"+hideName+"']").hide();
    }
    $("[data-pa-section='"+name+"']").show();
}

function resetPaneSections(container) {
    $(container + " .pa-body").each(function(index) {
        if (index === 0) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function createWidget(provider) {
    if (provider === "facebook-insights") {
        errorPane("Facebook Widgets are coming soon...", null);
        return;
    }
}

function toggleNetworks() {
    $("#networksPane").toggle();
    resetPaneSections("#addWidgetPane");
}

function toggleAddWidget() {
    $("#addWidgetPane").toggle();
    resetPaneSections("#addWidgetPane");
}

function setActiveDashboard(id) {
    activeDashboard = id;
}

function saveSingleWidget() {
    if (!checkIfUserNetworkExists(newWidget.networkID)) {
        return;
    }
    var widgetName = $("#widgetName").val();
    // If no widget name use default name of widget
    if (widgetName.length === 0) {
        widgetName = newWidget.name;
    }

    var widgetDescription = $("#widgetDescription").val() ;
    var widgetSize =  $("#widgetSize").val();
    var widgetID = 1;

    widgetSize = getWidgetRealSize(widgetSize);

    var data = {
        dashboardID: activeDashboard,
        name: widgetName,
        size: $("#widgetSize").val() || newWidget.size,
        description: widgetDescription,
        did: newWidget.did,
        view: $("#networkViewList").val()
    };

    if (data.view === "-1") {
        errorPane("You must select a view to attach to this widget", null);
        return;
    }

    if (agencyDashboard) {
        data.userID = agencyDashboardUserID;
    }

    $.post("user/addWidget", data, function(widget) {
        appendWidget(widget);
        $("#addWidgetPane").toggle();
        resetPaneSections("#addWidgetPane");
    });
}

function saveWidgetSet() {
    var widgetSet = widgetSets[activeWidgetSet];
    if (!checkIfUserNetworkExists(widgetSet.network)) {
        return false;
    }

    widgetSet.dashboardID = activeDashboard;

    var data = {
        widgets: JSON.stringify(widgetSet),
        view: $("#networkViewListSet").val()
    };

    if (agencyDashboard) {
        data.userID = agencyDashboardUserID;
    }

    if (data.view === "-1") {
        errorPane("You must select a view to attach to this widget set", null);
        return;
    }

    $.post("user/addMultipleWidgets", data, function(widgets) {
        for (var i = 0; i < widgets.length; i++) {
            appendWidget(widgets[i]);
        }

        $("#addWidgetPane").toggle();
        resetPaneSections("#addWidgetPane");
    });
}

function loadDashboard(id, name, force) {
    if (activeDashboard !== id || force) {
        activeDashboard = id;
        bind("dashboardName", name);
        if ($("#widgetContainer").children().length > 0) {
            gridster.remove_all_widgets();
        }

        //load dashboard settings
        getDashboardData(id, function(dashboard) {
            $("#settingDashboardName").val(dashboard.name);
            $("#settingsDashboardDescription").val(dashboard.description);
            if ($("#settingsDashboardClientID").length > 0) {
                bind("settingsDashboardClientID", dashboard.ownerID);
                bind("settingsDashboardActive", dashboard.active);
            }
            for (var i = 0; i < dashboard.widgets.length; i++) {
                appendWidget(dashboard.widgets[i]);
            }
        });

    }
}

function getDashboardData(id, callback) {
    $.post("user/getdashboard", {id: id}, function(dashboard) {
        callback(dashboard);
    });
}

function appendWidget(widget) {
    var layout = "";
    if (!doesNetworkExist(widget.network)) {
        var network = "";
        if (widget.network === 1) {
            network = "Google Analytics";
        } else if (widget.network === 2) {
            network = "Google Adwords";
        }
        layout = "<br/><br/>Warning: This widget is not available until you add the network: <b>"+network+"</b> to your account.";
    } else {
        layout = loadWidgetLayout(widget);
    }

    var size = getWidgetRealSize(widget.size);
                // Load a html and charts for this widget
    gridster.add_widget("<li class='widget' data-id='"+widget.id+"' data-widgetName='"+widget.name+"' data-widgetSize='"+widget.size+"'>"+
        "<div class='widget-header handle'>"+
        "<button data-title='Refresh Widget' class='bn bn-otr bn-left bn-s tooltip'><i class='fa fa-refresh'></i></button>"+widget.name+
        "<button class='bn bn-otr bn-right bn-s widgetSettingsButton'><i class='fa fa-cog'></i></button></div>"+
        layout+"<span class='hide description'>"+widget.description+"</span></li>", size.x, size.y, widget.positionCol, widget.positionRow);

    // load charts
    if (chartsToLoad.length > 0) {

        for (var i = 0; i < chartsToLoad.length; i++) {
            loadChart(chartsToLoad[i].id, chartsToLoad[i].data);
        }

        chartsToLoad = [];
    }
}

function findObjectPropertInArray(name, array) {
    for (var i = 0; i < array.length; i++) {
        for (var key in array[i]) {
            if (key === name) {
                return array[i][key];
            }
        }
    }
    return false;
}

var chartsToLoad = [];

function loadWidgetLayout(widget) {
    var widgetData = widget.data;

    var valuePrefix = findObjectPropertInArray("valuePrefix", widgetData);
    var valuePostfix = findObjectPropertInArray("valuePostfix", widgetData);
    var valueLabel = findObjectPropertInArray("valueLabel", widgetData);
    var value = findObjectPropertInArray("value", widgetData);

    if (!valuePrefix) {
        valuePrefix = "";
    }

    if (!valuePostfix) {
        valuePostfix = "";
    }

    if (!valueLabel) {
        valueLabel = "";
    }

    var html = "";
    if (widget.layout === "standard") {
        var labelString = "<br/><br/>";
        if (valueLabel) {
            labelString = "<br/><br/>"+valueLabel+"<br/><br/>";
        }
        html = "<div style='font-size: 20px;'>" + labelString +
                "<span style='font-size: 50px;'>" +
                     valuePrefix + value + valuePostfix + "</font></div>";
    }

    if (widget.layout === "gaoverview") {
        html = "<div class='gaoverview'>"+
            "<div class='views-today'>Views<br/>today<br/>"+widgetData[0].value+"</div><br/>"+
            "<div class='bounces-chart'>"+
            "Bounces<br/>"+
            "<canvas id='widget"+widget.id+"bounces' width='250' height='110'></canvas>"+
            "</div>"+
            "<div class='pageviews-chart'>"+
            "age Views<br/>"+
            "<canvas id='widget"+widget.id+"pageviews' width='250' height='110'></canvas>"+
            "</div>"+
        "</div>";

        addChartToLoader("widget"+widget.id+"bounces", widgetData[1].pageviewhistory);
        addChartToLoader("widget"+widget.id+"pageviews", widgetData[2].bouncehistory);
    }

    return html;
}

function addChartToLoader(id, data) {
    chartsToLoad.push({id: id, data: data});
}

function loadChart(id, chartData) {
    var ctx = $("#"+id).get(0).getContext("2d");

    var options = {
        responsive: false,
        animationSteps: 10,
        bezierCurveTension : 0.3,
        pointDot: true,
        datasetStrokeWidth : 0.1
    };

    var data = {
	    labels: [],
	    datasets: [
	        {
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
	            data: chartData
	        }
	    ]
	};

    new Chart(ctx).Line(data, options);
}

function getWidgetRealSize(sizeString) {
    var size = {
        x: 2,
        y: 2
    };

    if (sizeString === "s") {
        size.x = 1;
        size.y = 1;
    } else if (sizeString === "m") {
        size.x = 1;
        size.y = 1;
    } else if (sizeString === "l") {
        size.x = 6;
        size.y = 2;
    }

    return size;
}

function dashboardSettings() {
    $("#dashboardSettingsPane").toggle();
}

function saveDashboard() {
    var data = {
            name: $("#newDashboardName").val(),
            description: $("#newDashboardDescription").val()
    };

    if (data.name.length < 3) {
        errorPane("Dashboard name must be atleast 3 characters long.", null, null);
        return;
    }

    // Check if this is an agency dashboard add and attach extra data
    if ($("#newDashboardClientID").length > 0 && $("#newDashboardClientID").val() != "-1") {
        data.id = $("#newDashboardClientID").val();
    }

    if ($("#newDashboardActive").length > 0) {
        data.active = $("#newDashboardActive").val();
    }

    $.post("user/addDashboard", data, function(dashboardID) {
        agencyDashboard = false;
        if ($("#newDashboardClientID").length > 0 && $("#newDashboardClientID").val() !== "-1") {
            agencyDashboard = true;
            agencyDashboardUserID = $("#newDashboardClientID").val();
            setActiveDashboard(dashboardID);
            bind("dashboardName", data.name);

            if ($("#widgetContainer ul").children().length > 0) {
                gridster.remove_all_widgets();
            }
            $("#addDashboardPane").hide();
            return;
        }
        // Check if dashboard list is empty, if so show dashboard buttons
        if ($("#myDashboards").children().length === 0) {
            $(".dashboardInfo button").show();
        }

        $("#myDashboards").append("<li data-did='"+dashboardID+"' class='dashboard'>"+
            "<a href='#' class='lt-item'>"+data.name+"</a></li>");
        setActiveDashboard(dashboardID);
        bind("dashboardName", data.name);
        if ($("#widgetContainer ul").children().length > 0) {
            gridster.remove_all_widgets();
        }

        $(".no-dashboard-message").hide();

        $("#addDashboardPane").hide();
    });
}

function deleteDashboard() {
    diaPane("Are you sure you want to delete this dashboard?", function() {
        $.post("user/deleteDashboard", {id: activeDashboard}, function() {
            $("#myDashboards li[data-did='"+activeDashboard+"']").remove();
            gridster.remove_all_widgets();
            loadFirstDashboard();
            $("#dashboardSettingsPane").hide();
            if ($("#myDashboards").children().length === 0) {
                $(".dashboardInfo button").hide();
                $(".no-dashboard-message").show();
                bind("dashboardName", "");
                $("#clientDashboardMessage").hide();
            } else {
                $(".dashboardInfo button").show();
            }
        });
    }, null);
}

function updateDashboard() {
    var data = {
        id: activeDashboard,
        name: $("#settingDashboardName").val(),
        description: $("#settingsDashboardDescription").val()
    };

    if ($("#settingsDashboardClientID").length > 0 && $("#settingsDashboardClientID").val() != "-1") {
        data.id = $("#settingsDashboardClientID").val();
    }

    if ($("#settingsDashboardActive").length > 0) {
        data.active = $("#settingsDashboardActive").val();
    }

    if (data.name.length < 3) {
        errorPane("Dashboard name must be atleast 3 characters long.", null, null);
        return;
    }

    // Check if this is an agency dashboard add and attach extra data
    if ($("#settingsDashboardClientID").length > 0 && $("#settingsDashboardClientID").val() != "-1") {
        data.ownerID = $("#settingsDashboardClientID").val();
    }

    if ($("#settingsDashboardActive").length > 0) {
        data.active = $("#settingsDashboardActive").val();
    }

    $.post("user/updateDashboard", data, function() {
        $("#myDashboards li[data-did='"+activeDashboard+"']").find("a").text(data.name);
        bind("dashboardName", data.name);
    });
}

function deleteWidget() {
    diaPane("Are you sure you want to delete this widget?", function() {
        $.post("user/deleteWidget", {id: activeWidget}, function() {
            gridster.remove_widget($(".widget[data-id='"+activeWidget+"']"), saveWidgetPositions());
            $("#widgetSettingsPane").hide();
            activeWidget = 0;
        });
    }, null);
}

function updateWidget() {
    var data = {
        id: activeWidget,
        name: $("#settingsWidgetName").val(),
        description: $("#settingsWidgetDescription").val(),
        size: $("#settingsWidgetSize").val()
    };

    if (data.name.length < 3) {
        errorPane("Widget name must be atleast 3 characters long.", null, null);
        return;
    }

    $.post("user/updateWidget", data, function(res) {
        $(".widget[data-id='"+data.id+"']").find(".widget-name").text(data.name);

        if ($(".widget[data-id='"+activeWidget+"']").data("data-widgetSize") !== data.size) {
            var widgetSize = getWidgetRealSize(data.size);
            gridster.resize_widget($(".widget[data-id='"+activeWidget+"']"), widgetSize.x, widgetSize.y, false);
            saveWidgetPositions();
        }
    });
}

function saveWidgetPositions() {
    var pos = gridster.serialize();
    for (var i = 0; i < pos.length; i++) {
        pos[i].id = $("#widgetContainer ul").children().eq(i).attr("data-id");
    }
    $.post("user/saveWidgetPositions", {widgets: pos});
}

function loadGridster() {
    console.log("LOADED")
    $(".gridster ul").gridster({
        widget_margins: [8, 8],
        widget_base_dimensions: [50, 50],
        draggable: {
            handle: ".widget-header",
            stop: function(e, ui, $widget) {
                saveWidgetPositions();
            }
        },
        resize: {
            enabled: true,
            stop: function(e, ui, $widget) {
                saveWidgetPositions();
            }
        },
        min_rows: 20,
        min_cols: 5,
        avoid_overlapped_widgets: true
    }).data("gridster").disable();

    gridster = $(".gridster ul").gridster().data("gridster").disable();
}

function showWidgetSetInfo(index) {
    activeWidgetSet = index;
    var widgetSet = widgetSets[index];

    // set name
    bind("widgetSetName", widgetSet.name);

    // clear any widgets in container
    $("#widgetSetWidgetList").html("");

    for (var i = 0; i < widgetSet.widgets.length; i++) {
        var widget = widgetSet.widgets[i];
        $("#widgetSetWidgetList").append("<li>"+widget.name+"</li>");
    }

    showHidePaneSection('widgetSet', 'widgetMain');
    $("#networkViewListSet").find("option").remove();
    $("#networkViewListSet").append("<option value='-1'>Select View</option>");
    var network = findUserNetworkByType(widgetSet.network);
    if (network) {
        var views = network.viewID.split(",");
        for (var j = 0; j < views.length; j++) {
            $("#networkViewListSet").append("<option value='"+views[j]+"'>"+views[j]+"</option>");
        }
    }
}

function loadFirstDashboard() {
    if ($("#myDashboards").children().length > 0) {
        var dashboardID = $("#myDashboards").children().first().attr("data-did");
        var dashboardName = $("#myDashboards").children().first().text();
        loadDashboard(dashboardID, dashboardName, false);
    }
}

function toggleMainbar() {
    if (parseInt($("#mainBar").css("margin-right")) < 0) {
        $("#mainBar").animate({
            marginRight: "0px"
        });
    } else {
        $("#mainBar").animate({
            marginRight: "-300px"
        });
    }

}

function getWidgetByDID(did) {
    for (var i = 0; i < allWidgets.length; i++) {
        if (allWidgets[i].did === did) {
            return allWidgets[i];
        }
    }
    return false;
}

function widgetConfirm(did) {
    showHidePaneSection("widgetSettings", "widgetMain");
    showHidePaneSection("widgetSettings", "allWidgets");
    newWidget = getWidgetByDID(did);
    $("#networkViewList").find("option").remove();
    $("#networkViewList").append("<option value='-1'>Select View</option>");
    var network = findUserNetworkByType(newWidget.networkID);
    if (network) {
        var views = network.viewID.split(",");
        for (var i = 0; i < views.length; i++) {
            $("#networkViewList").append("<option value='"+views[i]+"'>"+views[i]+"</option>");
        }
    }
}

function findUserNetworkByType(type) {
    for (var i = 0; i < networks.length; i++) {
        if (networks[i].networkID === type) {
            return networks[i];
        }
    }
    return false;
}

function addNetwork(id) {
    $.post("user/addNetwork", {id: id}, function(link) {
        console.log(link);
        authWindow = window.open(link, "Ezond Authorize Network");
        window.addEventListener("message", function(event) {
            var data = JSON.parse(event.data);
            // add network to list
            if ($("#userNetworkList li[data-id='"+data.userNetworkID+"']").length === 0) {
                console.log(data);
                networks.push({
                    userID: data.userID,
                    networkID: data.networkID,
                    networkName: data.networkName,
                    account: data.accountID,
                    viewID: data.views,
                });
                console.log(networks);
                $("#userNetworkList").append("<li class='li-item' data-id='"+data.userNetworkID+"' data-networkID='"+data.networkID+"'>("+data.networkName+") "+
                data.accountID+"<button class='bn bn-err bn-right bn-s' onclick='removeNetwork("+data.userNetworkID+")'>Remove</button></li>");
                $.post("user/updateWidgetsOfNetwork", {id: data.networkID}, function() {
                    loadDashboard(activeDashboard, $("#dashboardName").text(), true);
                });
            }
            //authWindow.close();
            authWindow = null;
        });
    });
}

function removeNetwork(id) {
    $.post("user/deleteNetwork", {id: id}, function() {
        $("#userNetworkList li[data-id='"+id+"']").remove();
        for (var i = 0; i < networks.length; i++) {
            if (networks[i].id === id) {
                delete networks[i];
            }
        }
    });
}

function checkIfUserNetworkExists(id) {
    if (agencyDashboard && agencyDashboardUserID !== 0) {
        return true;
    } else if (doesNetworkExist(id)) {
        return true;
    } else {
        diaPane("You do not have any networks that can supply information to the selected widget(s), please add the correct network.", null, null);
        return false;
    }
}

function addClient() {
    var data = {
        first_name: $("#addClientFirstName").val(),
        last_name: $("#addClientLastName").val(),
        company: $("#addClientCompany").val(),
        email: $("#addClientEmail").val(),
        agencyAccess: $("#addClientAccess").val(),
        agencyName: $("#agencyName").text()
    };

    if (data.first_name.length < 3) {
        errorPane("Clients first name must be above 3 characters in length", null);
        return;
    }

    if (data.email.length < 3) {
        errorPane("Clients email must be above 3 characters in length", null);
        return;
    }

    if (!isValidEmail(data.email)) {
        errorPane("Clients email is not valid", null);
        return;
    }

    var name = data.first_name + " " + data.last_name;

    $.post("user/addClient", data, function(data) {
        if (data === -1) {
            errorPane("Email already taken.", null);
            return;
        }
        diaPane("You have added " + name +
         " to your agency, you can start attaching dashboards and widgets to the clients dashboard, do you want to add " +
          name + "'s first dashboard ?", function() {
              $("#agencyPane").hide();
              toggleAddDashboard();
          }, null);
        $("#addClientFirstName").val("");
        $("#addClientLastName").val("");
        $("#addClientEmail").val("");
        $("#addClientCompany").val("");
    });
}

function doesNetworkExist(id) {
    if ($("#userNetworkList li[data-networkID='"+id+"']").length > 0) {
        return true;
    }
    return false;
}

function toggleAgencyPane() {
    resetPaneSections("#agencyPane");
    $("#agencyPane").toggle();
}

function sendFeedback() {
    var data = {
        feedback: $("#feedbackMessage").val()
    };

    if (data.feedback.length < 10) {
        errorPane("Feedback message is too short.", null);
        return;
    }

    $.post("user/sendFeedback", data, function() {
        $("#feedbackMessage").val("");
        $("#feedbackPane").hide();
        diaPane("Thank you for your feedback, we will use it to better Ezond Marketting App.", null, null);
    });
}

function createAgency() {
    var data = {
        name: $("#agencyName").val(),
        country: $("#agencyCountry").val()
    };

    if (data.name.length < 3) {
        errorPane("Agency name too short, must be atleast 3 characters.", null);
        return;
    }

    if (data.country.length === 0) {
        errorPane("Agency country cannot be blank.", null);
        return;
    }

    $.post("user/addAgency", data, function(data) {
        location.reload();
    });
}

jQuery.fn.extend({
  toggleVis: function() {
      if (this.css("visibility") === "hidden") {
          this.css("visibility","visible");
      } else {
          this.css("visibility","hidden");
      }
  }
});
