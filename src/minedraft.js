window.onload = function ()
{
    var chunk    = new Chunk({
        url     : "sample-data/chunk-data/c.0.0.uncompressed.dat",
        success : chunkLoaded
    });
};

function chunkLoaded (chunk)
{
    var renderer = new IsoRenderer({
        chunk         : chunk,
        parentElement : document.getElementById("rendering_container")
    });
    
    var input = new InputManager();
    
    input.keydown(InputManager.KEY_UP, function ()
    {
        if (renderer.position[1] < chunk.size[1] - 1) {
            renderer.translate([0, 1, 0]);
        }
    });
    
    input.keydown(InputManager.KEY_DOWN, function ()
    {
        if (renderer.position[1] > 0) {
            renderer.translate([0, -1, 0]);
        }
    });
    
    renderer.start();
}