var Das = {};

(function() {
    
    //
    //
    //
    Das.version = '0.2.0';
    Das.browser = {};

    Das.isZepto = false;
    Das.$ = window.jQuery;
    Das.jQuery = window.jQuery;
    
    if(!Das.$ && window.Zepto ) {
        Das.$ = window.Zepto;
        Das.Zepto = window.Zepto;
        Das.isZepto = true;
    }
    
    if(window._DasBrowser)
        Das.Browser = {
            IE : true
        };

    
    var _log = function(){};
    if(window.console)
        _log = function(e){
            window.console.log(e)
        };

    Das.log = _log;

    Das.AsyncReady = Das.$.proxy(function(){},window);

    Das.callBackCaller = function (callback,that) {
        var _that = that || window;
        
        if(typeof callback == 'function') 
            return callback.call(_that);
    };
    
 
})();