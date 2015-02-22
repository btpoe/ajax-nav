;
(function ($) {

	var $viewport = $('html,body');
	var pushState_supported = window.history && window.history.pushState;
	var ajaxNavs = $();

	$.fn.imagesLoaded = $.fn.imagesLoaded || function() { return { always: function() { return this; } }; };

	function AjaxNav(wrap) {

		var nav = this;
		nav.wrap = $(wrap);

		var el = {
			dom: nav.wrap.get(0),
			wrap: nav.wrap
		};

		var o = {
			target: '#AjaxNav-viewport',
			scrollToTop: true
		};

		nav.init = function (options) {

			if (!pushState_supported) {
				return;
			}

			setProperties(options);

			if (el.dom.ajaxNav) {
				return el.dom.ajaxNav;
			}

			buildElements();
			setMethods();
			bindEvents();

			el.dom.ajaxNav = nav;
			return el.dom.ajaxNav;
		};

		function setProperties(options) {

			if (options && options.target) {
				options.target = '#' + options.target;
			}

			$.extend(o, options);

			el.target = $(o.target);

		}

		function buildElements() {

			nav.links = el.links = el.wrap.find('a');
			ajaxNavs = ajaxNavs.add(el.wrap);

		}

		function setMethods() {

			nav.request = function(link) {

				var href = link;

				if (typeof link === 'undefined') {
					return false;
				}

				if (typeof link === 'string') {
					link = el.links.filter('[href="'+link+'"]');
				}
				else {
					href = link.attr('href');
				}

				if (!link.length || href == window.location.href) {
					return false;
				}

				el.target.css('opacity', .5);

				$
					.get(link.attr('href'))
					.done(function(data) {
						var newTarget = $(data).find(o.target).css('opacity', .5);

						if (newTarget.length) {
							el.target.replaceWith(newTarget);
							el.target = newTarget;

							ajaxNavs.trigger('pageChange.ajaxNav');

							$(document).trigger('contentReady')
								.imagesLoaded()
								.always(function() {
									$(document).trigger('contentLoaded')
								});
						}

						setTimeout(function() {
							el.target.css('opacity', 1);
						}, 100);
					})
					.fail(function() {
						el.target.css('opacity', 1);
					})
				;

				if (o.scrollToTop && $(window).scrollTop() !== 0) {
					$viewport.animate({
						scrollTop: 0
					});
				}

				return true;
			}

		}

		function bindEvents() {

			var events = {
				popstate: function(e) {

					ajaxNavs.each(function() {

						if (
							(!e.originalEvent.state && this.ajaxNav.links.filter('[href="'+window.location.pathname+'"]'))
							||
							e.originalEvent.state.target == o.target
						) {
							this.ajaxNav.request(window.location.pathname);
							return false;
						}
					});

				},
				click: function (e) {
					e.preventDefault();

					nav.request($(this));

					history.pushState({target: o.target}, null, $(this).attr('href'));

				},
				pageChange: function(e) {

					var activeLink = el.links.filter('[href="'+window.location.pathname+'"]');

					if (activeLink.length) {
						el.links.removeClass('active');
						activeLink.addClass('active');
						el.target = $(o.target);
					}
				}
			};

			$(window).off('.ajaxNav').on('popstate.ajaxNav', events.popstate);
			el.wrap.on('click.ajaxNav', 'a', events.click);
			el.wrap.on('pageChange.ajaxNav', events.pageChange);
		}
	}

	$.fn.ajaxNav = function (options) {
		return this.each(function () {
			var opts = $(this).data('ajaxNav');
			if (typeof opts === 'string') {
				opts = new Function('return {'+opts+'};')();
			}
			opts = $.extend({}, options, opts);
			return new AjaxNav(this).init(opts);
		});
	};

})(jQuery || Zepto);