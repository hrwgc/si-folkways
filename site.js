    var map = L.mapbox.map('map', 'hackcfch.map-v8zfgot1');



var markers = new L.MarkerClusterGroup({ 
 maxClusterRadius: 80, 
 spiderfyOnMaxZoom: true, 
 spiderfyDistanceMultiplier: 2,
 showCoverageOnHover: true, 
 zoomToBoundsOnClick: true 
});

for ( var i = 0; i < geoJson.length; i++ ){
    var feature = geoJson[i],
    coords = feature.geometry.coordinates;
    var marker = L.marker([coords[1], coords[0]], {
        id: feature.properties.catalog_no,
        icon: L.divIcon({
           className: 'simarker',
           html: '<img src="http://api.tiles.mapbox.com/v3/marker/pin-l-marker+41a30d.png" />',
           iconSize: new L.Point(0, 0),
           popupAnchor: new L.Point(2,-15)
           })
    });
        
     var popupContent = '<pre>' +  html_sanitize(JSON.stringify(feature.properties, null, 4)) + '</pre>';
 markers.addLayer(marker.bindPopup(popupContent, {
        closeButton: false,
        minWidth: 280
    }));
}
map.addLayer(markers);


function filterMarkers(key,value){
    map.removeLayer(markers);
    var filteredMarkerLayer = new L.MarkerClusterGroup({
        showCoverageOnHover: true,
        spiderfyOnMaxZoom: false,
        disableClusteringAtZoom: 15
    });
    for ( var i = 0; i < geoJson.length; i++ ){
        var feature = geoJson[i],
        coords = feature.geometry.coordinates;
        if(feature.properties.genres == value ){
            var marker = L.marker([coords[1], coords[0]], {
                id: feature.properties.catalog_no,
                icon: L.divIcon({
                   className: 'simarker',
                   html: '<img src="http://api.tiles.mapbox.com/v3/marker/pin-l-marker+41a30d.png" />',
                   iconSize: new L.Point(0, 0),
                   popupAnchor: new L.Point(2,-15)
                   })
            });
                
             var popupContent = '<pre>' +  html_sanitize(JSON.stringify(feature.properties, null, 4)) + '</pre>';
         filteredMarkerLayer.addLayer(marker.bindPopup(popupContent, {
                closeButton: false,
                minWidth: 280
            }));
        }
    }
    map.addLayer(filteredMarkerLayer);

        }


markers.on('click', function(e){
    var coords = e.layer._latlng;
    map.panTo([coords.lat, coords.lng]);
});
var markerLayer = L.mapbox.markerLayer(geoJson)
.setFilter(function() { return false; })
    .addTo(map);
    var folk = document.getElementById('filter-folk');
    var all = document.getElementById('filter-all');
    folk.onclick = function(e) {
        all.className = '';
        this.className = 'active';
        // The setFilter function takes a GeoJSON feature object
        // and returns true to show it or false to hide it.
        filterMarkers('genres','American Folk')
    };

    all.onclick = function() {
        food.className = '';
        this.className = 'active';
        map.markerLayer.setFilter(function(f) {
            // Returning true for all markers shows everything.
            return true;
        });
        return false;
    };
