define(['durandal/app', 'durandal/system', 'durandal/composition', 'jquery'], function(app, system, composition, $) {
    var fadeOutDuration = 100;
    var endValues = {
        opacity: 1
    };
    var clearValues = {
        opacity: '',
		display: 'block'
    };

    /**
     * @class FadeinModule
     * @constructor
     */
    var fadein = function(context) {
        return system.defer(function(dfd) {
            function endTransition() {
                dfd.resolve();
				app.trigger('transition:endTransition');
            }

            if (!context.child) {
                $(context.activeView).fadeOut(fadeOutDuration, endTransition);
            } else {
                var duration = context.duration || 250;
                var fadeOnly = !!context.fadeOnly;

                function startTransition() {
					app.trigger('transition:startTransition');
                    context.triggerAttach();

                    var startValues = {
                        opacity: 0,
						display: 'block'
                    };

                    var $child = $(context.child);

                    $child.css(startValues);
                    $child.animate(endValues, duration, 'swing', function () {
                        $child.css(clearValues);
                        endTransition();
                    });
                }

                if (context.activeView) {
                    $(context.activeView).fadeOut(fadeOutDuration, startTransition);
                } else {
                    startTransition();
                }
            }
        }).promise();
    };

    return fadein;
});
