;
(function ($) {

	var $viewport = $('html,body');
	var pushState_supported = window.history && window.history.pushState;
	var ajaxNavs = $();

	function AjaxNav(dom) {

		var nav = this;
		nav.wrap = $(dom);

		var o = {
			target: '#AjaxNav-viewport',

			excludedLinks: '.AjaxNav--exclude',
			excludeExternalLinks: true,

			serverHelper: function(nav) {
				return 'target='+nav.target.attr('id');
			},

			beforeRequest: function() {},
			afterRequest: function() {},
			afterFail: function() {},

			successEvent: 'contentReady',

			scrollTo: 'top'
		};

		nav.init = function (options) {

			if (!pushState_supported) {
				return;
			}

			setProperties(options);

			if (dom.ajaxNav) {
				return dom.ajaxNav;
			}

			buildElements();
			setMethods();
			bindEvents();

			dom.ajaxNav = nav;
			return dom.ajaxNav;
		};

		function setProperties(options) {

			if (options && options.target && typeof options.target === 'string') {
				options.target = '#' + options.target;
			}

			$.extend(o, options);

			nav.target = $(o.target).eq(0);

		}

		function buildElements() {

			nav.links = nav.wrap.find('a').not(o.excludedLinks);
			if (o.excludeExternalLinks)
				nav.links = nav.links.filter(function() {
					return !isExternal(this.href);
				});
			ajaxNavs = ajaxNavs.add(nav.wrap);

		}

		function setMethods() {

			nav.request = function(link) {

				var href = link;

				if (typeof link === 'undefined') {
					return false;
				}

				if (typeof link === 'string') {
					link = nav.links.filter('[href="' + link + '"]');
				}
				else {
					href = link.attr('href');
				}

				if (!link.length || href == window.location.href) {
					return false;
				}

				var beforeRequestResponse = true;

				if (typeof o.beforeRequest == 'function')
					beforeRequestResponse = o.beforeRequest(nav);

				if (!beforeRequestResponse)
					return false;

				nav.target.css('opacity', .5);

				// add query param for optional server optimization
				var serverHelper = '';

				if (typeof o.serverHelper == 'string')
					serverHelper += o.serverHelper.trim();

				else if (typeof o.serverHelper == 'function')
					serverHelper += o.serverHelper(nav).trim();

				if (serverHelper !== '')
					serverHelper = (link.attr('href').indexOf('?') === -1 ? '?' : '&') + serverHelper;

				$
					.get(link.attr('href').split("#")[0] + serverHelper)
					.done(function (data) {
						var newTarget = $(data).find(o.target).css('opacity', .5);

						if (newTarget.length) {
							nav.target.replaceWith(newTarget);
							nav.target = newTarget;

							ajaxNavs.trigger('pageChange.ajaxNav');

							if (!!o.successEvent)
								$(document).trigger(o.successEvent);

							if (typeof o.afterRequest == 'function')
								o.afterRequest(newTarget, nav);
						}

						setTimeout(function () {
							nav.target.css('opacity', 1);
						}, 100);
					})
					.fail(function (e) {
						nav.target.css('opacity', 1);
						if (typeof o.afterFail == 'function')
							o.afterFail(e, nav);
					})
				;

				if (o.scrollTo === 'top' && $(window).scrollTop() !== 0)
					$viewport.animate({
						scrollTop: 0
					});

				else if (o.scrollTo === 'target' && $(window).scrollTop() !== nav.target.offset().top)
					$viewport.animate({
						scrollTop: nav.target.offset().top
					});

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

					var activeLink = nav.links.filter('[href="'+window.location.pathname+'"]');

					if (activeLink.length) {
						nav.links.removeClass('active');
						activeLink.addClass('active');
						nav.target = $(o.target);
					}
				}
			};

			$(window).off('.ajaxNav').on('popstate.ajaxNav', events.popstate);
			nav.wrap.on('click.ajaxNav', 'a', events.click);
			nav.wrap.on('pageChange.ajaxNav', events.pageChange);
		}
	}

	/**
	 * isExternal
	 * check if provided link is from the same host or cross domain
	 * @param url
	 * @returns {boolean}
	 */
	function isExternal(url) {
		var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
		if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return true;
		if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[location.protocol]+")?$"), "") !== location.host) return true;
		return false;
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