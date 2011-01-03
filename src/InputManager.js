var InputManager = (function ()
{
    var InputManager = function (options)
    {
        options = options || {};
        
        var self = this;
        
        this._keyDown = function () { /* noop */ };
        
        window.onkeydown = function (event)
        {
            self._keyDown(event.keyCode);
        };
    };
    
    InputManager.KEY_LEFT  = 37;
    InputManager.KEY_UP    = 38;
    InputManager.KEY_RIGHT = 39;
    InputManager.KEY_DOWN  = 40;
    
    InputManager.prototype.keyDown = function (callback)
    {
        this._keyDown = callback;
    };
    
    return InputManager;
})();
