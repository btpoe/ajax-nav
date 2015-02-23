# ajax-nav
Partial page changes via ajax and pushstates

## Dependencies

- jQuery - https://github.com/jquery/jquery


## Setup

Simply call `$('.AjaxNav').ajaxNav();` in your javascript.
Your html will require something similar to the following:

```html
<div class="AjaxNav">
    <a href="/here/sub1">Some additional content</a>
    <a href="/here/sub2">Even more content...</a>
</div>
<div id="AjaxNav-viewport">
    ...
</div>
```


## Options

The following are all the available options and their defaults:

```javascript
$('.AjaxNav').ajaxNav({
    target: '#AjaxNav-viewport',
    			
    excludedLinks: '.AjaxNav--exclude',
    excludeExternalLinks: true,

    serverHelper: function(target) {
        return 'target='+target;
    },

    beforeRequest: function() {},
    afterRequest: function() {},
    afterFail: function() {},

    successEvent: 'contentReady',

    scrollTo: 'top'
});
```

You can also override options on specific elements by using the `data-ajax-nav` attribute like so:

```html
<div class="AjaxNav" data-ajax-nav="beforeRequest: function() { return confirm('Are you sure you want to navigate away from this page?'); }">
    ...
</div>
```

###target

The target can either be the id of a DOM element or a pre-selected element (DOM or jQuery).
If you pass in multiple elements, it will be filtered down to the first item in the array,
so be sure to only pass in one item for reliable results.

###excludedLinks

You can pass in either a css selector or a pre-selected list of elements that you want to exclude from the plugin's functionality.
In other words, excluded links will behave with their native functionality (unless you have other javascript logic applied to them).

Bonus: You can also pass in a function that will test each anchor. If the function returns true, the anchor will be excluded.

###excludeExternalLinks

Boolean. If true (default), the plugin will exclude anchor elements with href's pointing to external domains.
If set to false, it will attempt to treat external links the same, however the plugin does not handle cross-domain issues,
so it's up to you to handle those scenarios accordingly.

###serverHelper

This is an optional parameter for server optimization. jQuery supports partial loading of pages, however,
the server still builds the entire page. This option allows for you to clue your sever in that you are only looking for
a portion of the page. It's up to you to add server logic for partial page generation.

You can either pass in a string that will be added as a query param or a function that returns a string.
If you build a function, you have access to the AjaxNav instance through the first parameter of the function.

###beforeRequest

Callback to perform any actions before the ajax request is made. If returns false, request will be cancelled.

###afterRequest

Callback to perform any actions after the ajax request has been completed and new target has replaced the old content.

###afterFail

Callback to perform any actions in the event of a failed request.

###successEvent

Event to trigger to the document. This event is triggered immediately after the `afterRequest` callback.
It is useful to trigger any additional logic that is in a private scope.

Note: Any new content loaded on the page will not have any javascript bound to it like you may expect on a traditional page load.
Using either the `afterRequest` callback or the `successEvent` is a good way to bind necessary logic to these new DOM elements.

###scrollTo

If set to `'top'` and the viewport is not scrolled to the top of the page,
clicking on an AjaxNav link will scroll the page to the top of the screen.
If set to `'target'`, the viewport will scroll to the target element when clicking an AjaxNav link.
If set to false, the page will remain in place. 