var Utils = (function ()
{
    var Utils = {};
    
    // Returns a new object containing the properties of `a' and `b', using
    // entries in `b' when duplicate keys are found.
    Utils.merge = function (a, b)
    {
        a = a || {};
        b = b || {};
        
        var c = {};
        
        for (var k in a) { c[k] = a[k]; }
        for (var k in b) { c[k] = b[k]; }
        
        return c;
    };
    
    // Returns a new object containing the properties of `a' and `b', using
    // entries in `a' when duplicate keys are found.
    Utils.mergeLeft = function (a, b)
    {
        a = a || {};
        b = b || {};
        
        var c = {};
        
        for (var k in b) { c[k] = b[k]; }
        for (var k in a) { c[k] = a[k]; }
        
        return c;
    };
    
    return Utils;
})();
