window.onload = function ()
{
    var chunk    = new Chunk({
        url     : "../chunk-data/c.0.0.dat",
        //url     : "../MCRS-schematics/test_02.uncompressed.schematic",
        success : chunkLoaded
    });
};

function chunkLoaded (chunk)
{
    var renderer = new IsoRenderer({
        chunk         : chunk,
        parentElement : document.getElementById("rendering_container")
    });
    
    var miniRenderer = new IsoRenderer({
        chunk         : chunk,
        parentElement : document.getElementById("mini_renderer")
    });
    
    var input = new InputManager();
    
    input.keyDown(function (keyCode)
    {
        var v = [0, 0, 0];
        
        if (InputManager.KEY_UP == keyCode) {
            if (renderer.position[1] < chunk.size[1] - 1) { ++v[1]; }
        }
        else if (InputManager.KEY_DOWN == keyCode) {
            if (renderer.position[1] > 0) { --v[1]; }
        }
        
        renderer.translate(v);
        miniRenderer.translate(v);
    });
    
    renderer.start();
    miniRenderer.start();
    
    miniRenderer.translate([0, 1, 0]);
}