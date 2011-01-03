var Chunk = (function ()
{
    // TODO: Make private variables truly private.
    var Chunk = function (options)
    {
        options = options || {};
        
        // TODO: Make it possible for this to be a new, "empty" chunk.
        this._nbt = null;
        this.size = options.size || [16, 128, 16];
        
        if (options.url) {
            this.load(options);
        }
    };
    
    Chunk.prototype.load = function (options)
    {
        options  = options || {};
        var self = this;
        
        XHR({
            url     : options.url,
            success : function (response)
            {
                self._nbt = TAG.parseNamed(
                    new BinaryFile(response.data, { bigEndian: true })
                );
                
                self.onload(options);
            },
            error : function ()
            {
                console.log("Couldn't load chunk.");
                
                if (options.error) {
                    options.error();
                }
            }
        });
    };
    
    Chunk.prototype.onload = function (options)
    {
        var sizeX = this._nbt.hasTag("Width") ? this._nbt.getTag("Width").value : this.size[0];
        var sizeY = this._nbt.hasTag("Height") ? this._nbt.getTag("Height").value : this.size[1];
        var sizeZ = this._nbt.hasTag("Length") ? this._nbt.getTag("Length").value : this.size[2];
        
        this.size = [sizeX, sizeY, sizeZ];
        
        if (options.success) { options.success(this); }
    };
    
    // TODO: Decide if these should just be removed, assuming `size' remains
    // a public attribute (and if not, make it truly private).
    Chunk.prototype.setSize = function (size)
    {
        this.size = size;
    };
    
    Chunk.prototype.getSize = function ()
    {
        return this.size;
    };
    
    Chunk.prototype.getBlock = function (pos)
    {
        var blocks = this._nbt.getTag("Level").getTag("Blocks");
        
        // This is a block id.
        return blocks.bytes[pos[1] + (pos[2] * this.size[1] + (pos[0] * this.size[1] * this.size[2]))];
    };
    
    return Chunk;
})();
