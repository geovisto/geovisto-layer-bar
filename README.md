# Geovisto Barlayer Tool

Tool which provides the map layer functionality for [Geovisto core library](https://github.com/geovisto/geovisto).

This repository is a snapshot of Geovisto `tools/layers/bar` derived from the development repository: [geovisto/geovisto-map](https://github.com/geovisto/geovisto-map).

## Usage

![image](https://user-images.githubusercontent.com/44326793/231517793-49dfea9d-b7bb-407f-841f-1c87c0665633.png)

```js
import { GeovistoBarLayerTool } from 'geovisto-layer-bar';
import 'geovisto-layer-bar/dist/index.css';


// create instance of map with given props
const map = Geovisto.createMap({
  // ...
  tools?: Geovisto.createMapToolsManager([
    // instances of Geovisto tools (extensions) which will be directly used in the map
    // ...
    GeovistoBarLayerTool.createTool({
      id: "geovisto-tool-layer-bar"
    }),
  ])
});

// rendering of the map
map.draw(Geovisto.getMapConfigManagerFactory().default({
  // initial settings of the map can be overriden by the map config - JSON structure providing user settings
  // ...
  tools?: [
    // config of Geovisto tools (extensions) used in the map
    // ...
    {
      "type": "geovisto-tool-layer-bar",
      "id": "geovisto-tool-layer-bar",
      "enabled": true,
      "layerName": "Bar layer",
      // mapping of data domains to data dimensions
      "data": {
        "locationName": "district",
        "latitude": "latitude", // latitude in degrees
        "longitude": "longitude", // longitude in degrees
        "primaryCategory": "data.country", // primary category dimension
        "secondaryCategory": "data.subdata.ageRange", // secondary category dimension
        "value": "data.subdata.count", // value dimension
        "aggregation": "sum", // [sum, count]
        "chartColor": "#4682B4", // color of bars
        "chartSize": 0 // size of the chart
      }
    },
    // ...
  ]
}));
```

## Instalation

`npm install --save geovisto-layer-bar`

Peer dependencies:

`npm install --save geovisto leaflet`

## Authors and Contributors

Author: [Petr Kašpar](https://github.com/xkaspa40), [Petr Čermák](https://github.com/483005), [Vladimír Korenčik](https://github.com/froztt)

Contributors: [Jiři Hynek](https://github.com/jirka)

## License

[MIT](https://github.com/geovisto/geovisto-layer-bar/blob/master/LICENSE)

### Keywords

[gis](https://www.npmjs.com/search?q=keywords:gis) [map](https://www.npmjs.com/search?q=keywords:map) [geovisto](https://www.npmjs.com/search?q=keywords:geovisto) [leaflet](https://www.npmjs.com/search?q=keywords:leaflet) [spatial-data](https://www.npmjs.com/search?q=keywords:spatial-data) [visualization](https://www.npmjs.com/search?q=keywords:visualization) [bar](https://www.npmjs.com/search?q=keywords:bar)
