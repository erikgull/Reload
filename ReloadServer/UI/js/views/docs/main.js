define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../../templates/docs/main.html'
], function($, _, Backbone, docsTemplate){

    var DocsView = Backbone.View.extend({

        el: $('#container'),

        render: function () {
            console.log('render Docs VIEW');
            // Using Underscore we can compile our template with data
            var data = {};
            var compiledTemplate = _.template( docsTemplate, data );
            // Append our compiled template to this Views "el"
            this.$el.html( compiledTemplate );
        }
    });

    // Our module now returns our view
    return DocsView;
});

