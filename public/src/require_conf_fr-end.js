require.config({
    paths: {
        "jquery": "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-alpha1/jquery",
        "underscore": "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min",
        "backbone": "https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.3/backbone-min",
        "text": "https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min",
        "mustache": "https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.4/handlebars",
        "lodash":"https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min",
        "dust": "../../../bower_components/dustjs/dist/dust-full-0.3.0",
        "dustHelper": "../../../bower_components/dustjs-helpers/dist/dust-helpers"
    },

    shim:{
        "dust": {
            exports: "dust"
        },
        "dustHelper":{
            deps:["dust"],
            exports:["dust.helpers"]

        }
    }
});

require.config({
    config: {
        'bar': {
            size: 'large'
        },
        'baz': {
            color: 'blue'
        }
    }
});

//define.amd.dust = true;