/**
* JSON RPC library for communicating over websockets in nodejs.
*
* https://github.com/enix/node-jsonrpc-ws
* 
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*
*/
var sys = require('sys');

var JSONRPC = {
    
    functions: {},

	/**
	* Opens a JSON rpc server on the given websocket by listening to messages.
	*
	* @name listen
	* @param Socket socket The websocket object to observe.
	*
	* @type void
	*/    
	listen : function(message, response){
		var self = this;
		console.log(message);
		var responseObject = self.handleMessage( message );

		console.dlog("SENDING RESPONSE: " + JSON.stringify(responseObject));
		response.writeHead(200, {
					  'Content-Length': JSON.stringify(responseObject).length,
					  'Content-Type': 'application/json',
					  'Pragma': 'no-cache',
					  'Cache-Control': 'no-cache',
					  'Expires': '-1'
					});
		response.write( JSON.stringify(responseObject) );
		response.end("");
				
	},

    /**
    * Finds all function entries defined in the given model to exposes them via rpc.
    *
    * @example 
	*    var TestModule = {
	*      add: function (a, b) { return a + b }
	*    }
	*    rpc.exposeModule('rpc', TestModule);
	*
    * @result Exposes the given module with the given prefix. Remote functioname 'rpc.add'
    *
    * @name exposeModule
    * @param String mod The function prefix.
    * @param Object object The module to expose. 
    *
    * @type void
    */
    exposeModule: function(mod, object) {
        var funcs = [];
        for(var funcName in object) {
            var funcObj = object[funcName];
            if(typeof(funcObj) == 'function') {
                this.functions[mod + '.' + funcName] = funcObj;
                funcs.push(funcName);
            }
        }
        JSONRPC.trace('***', 'exposing module: ' + mod + ' [funcs: ' + funcs.join(', ') + ']');
    },

    /**
    * Exposes the given function via rpc.
    *
    * @example 
	*    function add(a, b) { return a + b }
	*    rpc.expose('add', add);
	*
    * @result Exposes the given function under the given name . Remote functioname 'add'
    *
    * @name expose
    * @param String mod The function name.
    * @param Object object The function to expose. 
    *
    * @type void
    */   
    expose: function(name, func) {
    	JSONRPC.trace('***', 'exposing: ' + name);
        this.functions[name] = func;
    },
    
    trace: function(direction, message) {
        sys.puts('   ' + direction + '   ' + message);
    },
 
    handleMessage: function(message) {
	
		JSONRPC.trace('-->', 'response (id ' + message.id + '): ');
	
	    // Check for the required fields, and if they aren't there, then
	    // dispatch to the handleInvalidRequest function.
	    if(!(message.method && message.params)) {
	    	return {
	    		'id': message.id,
	    		'result': null,
	        	'error': 'Invalid Request'
	      	};
	    }
	    console.log( this.functions );
	    console.log("### " + this.functions.hasOwnProperty(message.method));
	    if(!this.functions.hasOwnProperty(message.method)) {
	    	return {
		    	'id': message.id,
	        	'result': null,
	        	'error': 'Function not found'
	      	};
	    }

	    // Build our success handler
	    var onSuccess = function(funcResp) {
	    	JSONRPC.trace('SUCCESS-->', 'response (id ' + message.id + '): ' + funcResp);

	      	return {
				'id': message.id,
	        	'result': funcResp,
	        	'error': null
	      	};
	    };

	    // Build our failure handler (note that error must not be null)
	    var onFailure = function(failure) {
	    	JSONRPC.trace('-->', 'failure: ' + failure);

	      	return {
	         	'id': message.id,
		    	'result': null,
			 	'error': failure || 'Unspecified Failure'
	      	};
	    };

	    JSONRPC.trace('<--', 'request (id ' + message.id + '): ' + message.method + '(' + message.params.join(', ') + ')');

	    // Try to call the method, but intercept errors and call our onFailure handler.
	    var method = this.functions[message.method];

	    try {
	    	var resp = method.apply(null, message.params);
	    	console.log("AFTER APPLY:----->", resp);
      		return onSuccess(resp);
	    }
	    catch(err) {
	    	return onFailure(err);
	    }
    }
}

module.exports = JSONRPC;
