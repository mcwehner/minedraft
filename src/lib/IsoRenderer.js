var IsoRenderer = (function ()
{
    var TEXTURE_TILE_SIZE = 16;
    
    var BLOCK_TEXTURE_DATA = (function ()
    {
        // TODO: This scheme assumes every face of each block is identical,
        // which is not always true (e.g., grass). Work out how to deal with
        // this.
        
        // Values are pixel offsets indexed by block id.
        var data = [];
        
        data[1]  = [1, 0];      // Stone
        data[2]  = [0, 0];      // Grass
        data[3]  = [2, 0];      // Dirt
        data[4]  = [0, 1];      // Cobblestone
        data[5]  = [4, 0];      // Wooden plank
                                // Sapling
        data[7]  = [1, 1];      // Bedrock
        data[8]  = [13, 12];    // Water
        data[9]  = [13, 12];    // Water (stationary)
        data[10] = [13, 15];    // Lava
        data[11] = [13, 15];    // Lava (stationary)
        data[12] = [2, 1];      // Sand
        data[13] = [3, 1];      // Gravel
        data[14] = [0, 2];      // Gold
        data[15] = [1, 2];      // Iron
        data[16] = [2, 2];      // Coal ore
        data[48] = [4, 2];      // Moss stone
        data[49] = [5, 2];      // Obsidian
        data[56] = [2, 3];      // Diamond ore
        data[73] = [3, 3];      // Redstone ore
        
        for (var i = 0; i < data.length; ++i) {
            if (data[i]) {
                data[i] = [
                    data[i][0] * TEXTURE_TILE_SIZE,
                    data[i][1] * TEXTURE_TILE_SIZE
                ];
            }
        }
        
        return data;
    })();
    
    var FONT_TILE_SIZE = 8;
    
    var FONT_DATA = (function ()
    {
        var data = [];
        
        for (var i = 0; i < 128; ++i) {
            data[i] = [
                (i % 16) * FONT_TILE_SIZE,
                Math.floor(i / 16) * FONT_TILE_SIZE
            ];
        }
        
        return data;
    })();
    
    // TODO: Make private variables truly private.
    var IsoRenderer = function (options)
    {
        options = options || {
            parentElement : document.body
        };
        
        if (!options.chunk) {
            throw new Error("Missing required parameter \"chunk\".");
        }
        
        this._parentElement = options.parentElement;
        this._chunk         = options.chunk;
        this.position       = options.position || [0, 0, 0];
        
        this.initCache();
        this.setup();
    };
    
    IsoRenderer.prototype.initCache = function ()
    {
        // FIXME: This is probably not the right location for images. (Should
        // it be configurable?)
        var cacheData = {
            "terrain" : "images/terrain.png",
            "font"    : "images/font/default.png"
        };
        
        this._imageCache = {};
        
        for (var name in cacheData) {
            this._imageCache[name]     = new Image();
            this._imageCache[name].src = cacheData[name];
        }
    };
    
    IsoRenderer.prototype.setup = function ()
    {
        // TODO: Destroy any existing canvases created by this instance.
        this._canvas        = document.createElement("canvas");
        this._canvas.width  = this._parentElement.offsetWidth;
        this._canvas.height = this._parentElement.offsetHeight;
        
        this._canvas.style.position = "absolute";
        
        this._parentElement.appendChild(this._canvas);
        
        this._context = this._canvas.getContext("2d");
        
        this._viewportSize = [
            Math.min(this._parentElement.offsetWidth, this._parentElement.offsetHeight),
            Math.min(this._parentElement.offsetWidth, this._parentElement.offsetHeight)
        ];
        
        this._tileSize
            = this._viewportSize[0]
            / Math.min(this._chunk.size[0], this._chunk.size[2])
            ;
    };
    
    IsoRenderer.prototype.start = function ()
    {
        this.render();
    };
    
    IsoRenderer.prototype.render = function ()
    {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        
        for (var z = 0; z < this._chunk.size[2]; ++z) {
            for (var x = 0; x < this._chunk.size[0]; ++x) {
                var blockId     = this._chunk.getBlock([x, this.position[1], z]);
                var textureData = BLOCK_TEXTURE_DATA[blockId];
                
                if (textureData) {
                    this._context.drawImage(
                        this._imageCache.terrain,               // image
                        textureData[0], textureData[1],         // sx, sy
                        TEXTURE_TILE_SIZE, TEXTURE_TILE_SIZE,   // sw, sh
                        x * this._tileSize, z * this._tileSize, // dx, dy
                        this._tileSize, this._tileSize          // dw, dh
                    );
                }
                else if (blockId != 0) {
                    var blockIdStr   = blockId.toString();
                    var halfTileSize = this._tileSize / 2;
                    
                    for (var i = 0; i < blockIdStr.length; ++i) {
                        var charCode = blockIdStr.charCodeAt(i);
                        
                        this._context.drawImage(
                            this._imageCache.font,
                            FONT_DATA[charCode][0], FONT_DATA[charCode][1],
                            FONT_TILE_SIZE, FONT_TILE_SIZE,
                            (x * this._tileSize) + (i % 2 * halfTileSize), z * this._tileSize,
                            halfTileSize, halfTileSize
                        );
                    }
                }
            }
        }
    };
    
    IsoRenderer.prototype.translate = function (v)
    {
        this.position[0] += v[0];
        this.position[1] += v[1];
        this.position[2] += v[2];
        
        this.render();
    };
    
    return IsoRenderer;
})();
