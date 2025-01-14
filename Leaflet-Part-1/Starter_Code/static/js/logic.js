// Initialize the map
var map = L.map('map').setView([0, 0], 2);

// Add OSM tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// URL to earthquake GeoJSON data
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch and plot earthquake data
d3.json(url).then(function(data) {
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

    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature, layer) {
            layer.bindPopup(
                `<h3>${feature.properties.place}</h3>
                <hr><p>Magnitude: ${feature.properties.mag}</p>
                <p>Depth: ${feature.geometry.coordinates[2]} km</p>`
            );
        }
    }).addTo(map);

    // Adding legend to the map
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 30, 50, 70, 90],
            colors = ['#98EE00','#D4EE00','#EECC00','#EE9C00','#EA822C','#EA2C2C'];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += `<i style="background: ${colors[i]}"></i> ${grades[i]}${grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+'}`;
        }
        return div;
    };

    legend.addTo(map);
});
