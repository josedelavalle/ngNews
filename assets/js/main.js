/*
	Verti by Pixelarity
	pixelarity.com @pixelarity
	License: pixelarity.com/license
*/

(function($) {

	skel.breakpoints({
		xlarge: '(max-width: 1680px)',
		large: '(max-width: 1280px)',
		medium: '(max-width: 980px)',
		small: '(max-width: 736px)'
	});

	$(function() {

		var	$window = $(window),
			$body = $('body');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				$body.removeClass('is-loading');
			});

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Prioritize "important" elements on medium.
			skel.on('+medium -medium', function() {
				$.prioritize(
					'.important\\28 medium\\29',
					skel.breakpoint('medium').active
				);
			});

		// Dropdowns.
			$('#nav > ul').dropotron({
				mode: 'fade',
				noOpenerFade: true,
				speed: 300
			});

		// Off-Canvas Navigation.



			$('#work')
				.scrollex({
					top:		'0vh',
					bottom:		'0vh',
					delay:		50,
					initialize:	function() {

									var t = $(this);

									t.find('.row.images')
										.addClass('inactive');

								},
					terminate:	function() {

									var t = $(this);

									t.find('.row.images')
										.removeClass('inactive');

								},
					enter:		function() {

									var t = $(this),
										rows = t.find('.row.images'),
										length = rows.length,
										n = 0;

									rows.each(function() {
										var row = $(this);
										window.setTimeout(function() {
											row.removeClass('inactive');
										}, 100 * (length - n++));
									});

								},
					leave:		function(t) {

									var t = $(this),
										rows = t.find('.row.images'),
										length = rows.length,
										n = 0;

									rows.each(function() {
										var row = $(this);
										window.setTimeout(function() {
											row.addClass('inactive');
										}, 100 * (length - n++));
									});

								}
				});
			// // Navigation Toggle.
			// 	$(
			// 		'<div id="navToggle">' +
			// 			'<a href="#navPanel" class="toggle"></a>' +
			// 		'</div>'
			// 	)
			// 		.appendTo($body);
			//
			// // Navigation Panel.
			// 	$(
			// 		'<div id="navPanel">' +
			// 			'<nav>' +
			// 				$('#nav').navList() +
			// 			'</nav>' +
			// 		'</div>'
			// 	)
			// 		.appendTo($body)
			// 		.panel({
			// 			delay: 500,
			// 			hideOnClick: true,
			// 			hideOnSwipe: true,
			// 			resetScroll: true,
			// 			resetForms: true,
			// 			side: 'left',
			// 			target: $body,
			// 			visibleClass: 'navPanel-visible'
			// 		});

			// Fix: Remove navPanel transitions on WP<10 (poor/buggy performance).
				if (skel.vars.os == 'wp' && skel.vars.osVersion < 10)
					$('#navToggle, #navPanel, #page-wrapper')
						.css('transition', 'none');

	});

})(jQuery);
