var InputManager = (function ()
{
    var InputManager = function (options)
    {
        options = Utils.mergeLeft(options, {
            keyElement : window // Element responding to key events
        });
        
        var self = this;
        
        this._keydownMap = {
            // special; responds to all key events
            "global" : function () { /* noop */ }
            
            // <key code> : <callback function>
        };
        
        options.keyElement.onkeydown = function (event)
        {
            // TODO: Handle normal keys.
            if (self._keydownMap[event.keyCode]) {
                self._keydownMap[event.keyCode](event);
            }
            
            self._keydownMap.global(event);
        };
    };
    
    InputManager.KEY_LEFT  = 37;
    InputManager.KEY_UP    = 38;
    InputManager.KEY_RIGHT = 39;
    InputManager.KEY_DOWN  = 40;
    
    InputManager.prototype.keydown = function ()
    {
        var callback = arguments[arguments.length - 1];
        
        for (var i = 0; i < arguments.length - 1; ++i) {
            this._keydownMap[arguments[i]] = callback;
        }
    };
    
    return InputManager;
})();
