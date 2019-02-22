/**
 * Date picker directive
 */
ezondapp.directive('datepickerRange', function() {

    return {
        restrict: 'E',
        replace: true,
        link: function($scope, elem, atts) {

            var dtp = $(elem[0]).daterangepicker({
                ranges: {
                    Today: [moment(), moment()],
                    Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
                    "Last 7 Days": [moment().subtract(6, "days"), moment()],
                    "Last 30 Days": [moment().subtract(29, "days"), moment()],
                    "This Month": [moment().startOf("month"), moment().endOf("month")],
                    "Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")]
                },
                alwaysShowCalendars: !0
            });

            dtp.on('apply.daterangepicker', function() {

                dtp.val();
            });

            $scope.$on('$destroy', function() {

                dtp.remove();
            })
        },
        template: "<input type='text' class=\"form-control\" />"
    }
});