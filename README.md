# Plotting trajectories using harp.gl

This tutorial plots trajectories as line from a local geojson file using harp.gl.

harp.gl is a beta product and we are always looking to improve it with your feedback. For any comments,
suggestions, or bug reports, we encourage you to create an issue on the harp.gl GitHub repository

### Setup

If you do already have a HERE developer account you will need to create one.
Follow the instructions at [Getting Credentials](https://developer.here.com/tutorials/harpgl/#acquire-credentials).

### Simple html setup

In your command line, create a new directory and navigate into it:
```
mkdir harp.gl-tutorial
cd harp.gl-tutorial
```
Create two files: index.html and index.js:
```
touch index.js
touch index.html
```
Copy and paste the following code into each of the files.

index.html
```html
<html>
   <head>
      <style>
         body, html { border: 0; margin: 0; padding: 0}
         #map { height: 100vh; width: 100vw; }
      </style>
      <script src="https://unpkg.com/three/build/three.min.js"></script>
      <script src="https://unpkg.com/@here/harp.gl/dist/harp.js"></script>
   </head>
   <body>
      <canvas id="map"></canvas>
      <script src="index.js"></script>
   </body>
</html>
```
index.js:

```javascript
const canvas = document.getElementById('map');
const map = new harp.MapView({
   canvas,
   theme: "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_base.json",
   //For tile cache optimization:
   maxVisibleDataSourceTiles: 40,
   tileCacheSize: 100
});

// Setting the center will use this for both isoline and Places
// in this case we will choose Beijing, which is where the Geolife trajectory data is from
let center = new harp.GeoCoordinates(40.07631667, 116.32803333); 
map.setCameraGeolocationAndZoom(
   center,
   15
);

const mapControls = new harp.MapControls(map);
const ui = new harp.MapControlsUI(mapControls);
canvas.parentElement.appendChild(ui.domElement);

mapControls.maxPitchAngle = 75;
map.resize(window.innerWidth, window.innerHeight);
window.onresize = () => map.resize(window.innerWidth, window.innerHeight);

const omvDataSource = new harp.OmvDataSource({
   baseUrl: "https://xyz.api.here.com/tiles/herebase.02",
   apiFormat: harp.APIFormat.XYZOMV,
   styleSetName: "tilezen",
   authenticationCode: 'YOUR_XYZ_TOKEN', // YOUR HERE XYZ API Code
});
map.addDataSource(omvDataSource);

 // Trajectory Section
 //////////////////////////////////////////
 // Insert trajectory code from below here
 //////////////////////////////////////////
```

NOTE: be sure to swap out YOUR-XYZ-TOKEN-HERE for the token you obtained from the XYZ Token Manager.

You can just run it with a simple server, for example in Python 2.x:
```
python -m SimpleHTTPServer 8888
```
and in Python 3.x
```
python -m http.server 8888
```
Then navigate to: [localhost:8888](http://localhost:8888)

If everything is correct you should see:
![alt text](img/first-map.png)

## Adding trajectories

Now we want to add an a trajectory data from the *data* directory

Add the following to the *Trajectory code section* in index.js:
```javascript
// wait for data from Promise, add to map and style it using a data driven style
fetch("data/output_trajectories_117.geojson")
    .then(res => res.json()).then(data => {

    const geoJsonDataProvider = new harp.GeoJsonDataProvider("trajectory", data);
    const geoJsonDataSource = new harp.OmvDataSource({
        dataProvider: geoJsonDataProvider,
        name: "trajectory"
    });


    map.addDataSource(geoJsonDataSource).then(() => {
        const colors = [ // style for ids 0-3
            {index: 0, color: "#99ff41"},
            {index: 1, color: "#d0ff90"},
            {index: 2, color: "#ff905b"},
            {index: 3, color: "#19ffda"},
        ];

        const styles = colors.map(x => {
            return {
                "when": `$geometryType ^= 'line' && id == ${x.index}`,
                "renderOrder": 400,
                "technique": "solid-line",
                "attr": {
                    "color": x.color,
                    "transparent": true,
                    "opacity": 0.5,
                    "metricUnit": "Pixel",
                    "lineWidth": 3
                }
            }
        });

        geoJsonDataSource.setStyleSet(styles); // add to map
        map.update();

    });
});

```
