// Initialize the map
var map = L.map('map').setView([0, 0], 2);

// Add base map layers
var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var satelliteMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
});

var grayscaleMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?filter=grayscale', {
    attribution: '© OpenStreetMap contributors'
});

// URL to earthquake data
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// URL to tectonic plates data
var tectonicPlatesURL = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_boundaries.json?raw=true";

// Fetch and plot earthquake data
d3.json(earthquakeURL).then(function(data) {
    function getColor(depth) {
        return depth > 90 ? '#EA2C2C' :
               depth > 70 ? '#EA822C' :
               depth > 50 ? '#EE9C00' :
               depth > 30 ? '#EECC00' :
               depth > 10 ? '#D4EE00' :
                            '#98EE00';
    }

    function getRadius(magnitude) {
        return magnitude * 4;
    }

    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    var earthquakes = L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature, layer) {
            layer.bindPopup(
                `<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`
            );
        }
    }).addTo(map);

    d3.json(tectonicPlatesURL).then(function(data) {
        var tectonicPlates = L.geoJSON(data, {
            style: {
                color: "orange",
                weight: 2
            }
        }).addTo(map);

        // Base maps
        var baseMaps = {
            "Street Map": streetMap,
            "Satellite Map": satelliteMap,
            "Grayscale Map": grayscaleMap
        };
        
        // Overlay maps
        var overlayMaps = {
            "Earthquakes": earthquakes,
            "Tectonic Plates": tectonicPlates
        };

        // Adding layer controls
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(map);
    });

    // Adding legend to the map
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 30, 50, 70, 90],
            colors = ['#98EE00', '#D4EE00', '#EECC00', '#EE9C00', '#EA822C', '#EA2C2C'];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += `<i style="background: ${colors[i]}; width: 18px; height: 18px; display: inline-block;"></i> ${grades[i]}${grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+'}`;
        }
        return div;
    };

    legend.addTo(map);
});
