/**

    GameMap

    (had to rename from Map as in ES6 there is a new Map() object and it was causing conflicts)
    Handles all Map-related properties and functionality.

*/

'use strict';

let GameMap = {

    init(config = {}, layers=[{name: 'bg', tilesetNames: null, data: null}]) {
        //
        this.name           = config.name       || '';
        this.TILES_WIDE     = config.width      || 32; // default: one room wide
        this.TILES_HIGH     = config.height     || 22; // default: one room tall
        this.layers         = [];

        // setup the layers
        for (var layer of layers) {
            layer.tilesetNames  = layer.tilesetNames    || null;
            layer.data          = layer.data            || null;

            this.addLayer( layer.name, layer.tilesetNames, layer.data );
        }

        return this;
    },

    setup() {
        this._scale         = Global.scale;

        // store the map pixel dimensions
        this.WIDTH          = this.TILES_WIDE * Global.TILE_SIZE;
        this.HEIGHT         = this.TILES_HIGH * Global.TILE_SIZE;

        this.selectedLayer  = 0;

        // setup the layers
        for (var layer of this.layers) {
            layer.setup();
        }
    },

    getWidthInPx() {
        return this.WIDTH;
    },

    getHeightInPx() {
        return this.HEIGHT;
    },

    scale(scale) {
        this._scale = scale;
        for (var layer of this.layers) {
            layer.scale(scale);
        }
    },

    pxToCell(x, y) {
        let row = Math.floor( (y / this.HEIGHT) * this.TILES_HIGH );
        let col = Math.floor( (x / this.WIDTH) * this.TILES_WIDE );

        return (row * this.TILES_WIDE) + col;
    },

    cellToPx(cell) {
        return {
            x: (cell % this.TILES_WIDE) * Global.TILE_SIZE,
            y: Math.floor(cell / this.TILES_WIDE) * Global.TILE_SIZE
        }
    },

    addLayer(name, tilesetNames, data) {
        name = name || 'Layer ' + (this.layers.length + 1);

        let layer = Object.create(Layer);
        layer.init(name, this.TILES_WIDE, this.TILES_HIGH, tilesetNames, data);

        this.layers.push(layer);
    },

    getLayer(layerName) {
        for (var layer of this.layers) {
            if( layer.name == layerName ) {
                return layer;
            }
        }

        return false;
    },

    //--------------------------------------------------------------------

    addTile(cell, tileIndex, tilesetName) {
        this.layers[this.selectedLayer].addTile(cell, tileIndex, tilesetName);
    },

    addPattern(cell, pattern) {
        let layer = this.layers[this.selectedLayer];

        for (var row = 0; row < pattern.TILES_HIGH; row++) {
            for (var col = 0; col < pattern.TILES_WIDE; col++) {

                let newCell     = (row * layer.TILES_WIDE) + col + cell;
                let tileIndex   = pattern.data[ (row * pattern.TILES_WIDE) + col ];

                layer.addTile(newCell, tileIndex, pattern.sprite.name);
                layer.renderTile(newCell);
            }
        }
    },

    // the only thing different to adding a collision layer is we add directly to the collision layer. It doesn't matter what layer we're currently on.
    addCollision(cell, tile) {
        let layer = this.getLayer('collision');
        layer.addTile(cell, tile);
    },

    // Adding entities is slightly different again. We add directly to the entity layer, but we also save the x and y coords instead of tile cells.
    addEntity(entity, x, y) {
        let layer = this.getLayer('entities');
        return layer.addEntity(entity.id, x, y);
    },

    //--------------------------------------------------------------------

    renderTile(cell) {
        this.layers[this.selectedLayer].renderTile(cell);
    },

    renderCollisionTile(cell) {
        let layer = this.getLayer('collision');
        layer.renderTile(cell);
    },

    renderEntity(idx) {
        let layer = this.getLayer('entities');
        layer.render(); // just render the whole layer. Won't be as many objects as tiles. Should be speedy.
    },

    render() {
        for(var layer of this.layers) {
            layer.render();
        }
    }

}
