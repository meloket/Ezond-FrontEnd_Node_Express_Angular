/**
 * Environment file
 */
(function ($) {
    'use strict';

    ezondapp
        .constant('jQuery', $)
        .constant('config', {
            defaultTimeZone: 'UTC',
        })
})(jQuery);