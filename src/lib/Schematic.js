var Schematic = (function ()
{
    var Schematic = function (options)
    {
        options = options || {};
        
        this.chunk = new Chunk();
        this.chunk.load({
            url      : options.url,
            callback : chunkLoadCallback
        });
    };
    
    function chunkLoadCallback (chunk)
    {
        chunk.setSize(
            chunk.nbt.getTag("Length").valueOf(),
            chunk.nbt.getTag("Height").valueOf(),
            chunk.nbt.getTag("Width").valueOf()
        );
    };
    
    return Schematic;
})();
