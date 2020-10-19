const canvas = document.getElementById('map');
const map = new harp.MapView({
    canvas,
    theme: "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_base.json",
    //For tile cache optimization:
    maxVisibleDataSourceTiles: 40,
    tileCacheSize: 100
});

// HERE Credentials

// Setting the center
let center = new harp.GeoCoordinates(40.07631667, 116.32803333);  // picked point from trajectory data
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
    baseUrl: "https://vector.hereapi.com/v2/vectortiles/base/mc",
    apiFormat: harp.APIFormat.XYZOMV,
    styleSetName: "tilezen",
    authenticationCode: 'YOUR_XYZ_TOKEN', // YOUR API Code
});
map.addDataSource(omvDataSource);


// wait for data from Promise, add to map and style it using a data driven style
fetch("data/output_trajectories_117.geojson")
    .then(res => res.json()).then(data => {

    const geoJsonDataProvider = new harp.GeoJsonDataProvider("trajectory", data);
    const geoJsonDataSource = new harp.OmvDataSource({
        dataProvider: geoJsonDataProvider,
        name: "trajectory"
    });


    map.addDataSource(geoJsonDataSource).then(() => {
        const colors = [ // style for id 0-3
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

