    var map = L.mapbox.map('map', 'hackcfch.map-v8zfgot1');

function buildFilterUi(array,name){
    $('#map-ui').append('<div class="btn-group dropup"><button class="btn">' + name + '</button><button class="btn dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button><ul class="dropdown-menu" id="' + name + '"></ul></div>');
    for ( var i = 0; i < array.length; i++ ){
        $('#' + name).append('<li><a href="#' + array[i] + '" data-control="' + array[i] + '">' + array[i] + '</a></li>');
    }
}

buildFilterUi(yearFilters,'years')
buildFilterUi(labelFilters,'label')
buildFilterUi(languageFilters,'language')
buildFilterUi(cultureFilters,'culture')

var markers = new L.MarkerClusterGroup({ 
 maxClusterRadius: 80, 
 spiderfyOnMaxZoom: false, 
 showCoverageOnHover: true, 
 disableClusteringAtZoom: 7,
 zoomToBoundsOnClick: true 
});

for ( var i = 0; i < geoJson.length; i++ ){
    var feature = geoJson[i],
    coords = feature.geometry.coordinates;
    var marker = L.marker([coords[1], coords[0]], {
        id: feature.properties.catalog_no,
        icon: L.divIcon({
           className: 'simarker',
           html: '<img src="http://api.tiles.mapbox.com/v3/marker/pin-m-marker+41a30d.png" />',
           iconSize: new L.Point(0, 0),
           popupAnchor: new L.Point(2,-15)
           })
    });
        
     var popupContent = '<div class="popup"><a href="' + feature.properties.link + '" target="_blank"><h4>' + feature.properties.album_title 
     + '</h4></a>'
     + '<ul><li><span class="int-label">Artist </span>' + feature.properties.album_artist +'</li>'
     + '<li><span class="int-label">Year </span>' + feature.properties.year_of_release +'</li>'
          + '<li><span class="int-label">Country </span>' + feature.properties.countrys +'</li>'
          + '<li><span class="int-label">Genre </span>' + feature.properties.genres +'</li>'
          + '<li><span class="int-label">Label </span>' + feature.properties.source_labelarchive +'</li>'

    + '</ul></div>'


 markers.addLayer(marker.bindPopup(popupContent, {
        closeButton: false,
        minWidth: 280
    }));
}
map.addLayer(markers);


function filterMarkers(key,value){
    map.removeLayer(markers);
    map.markerLayer.setGeoJSON(geoJson);
    map.markerLayer.setFilter(function(f) {
            return f.properties[key] === value;
        });
        return false;
    map.markerLayer.on('click',function(e) {
        e.layer.unbindPopup();

        var feature = e.layer.feature;
        var info =  '<div class="popup"><a href="' + feature.properties.link  + '" target="_blank"><h4>' + feature.properties.album_title 
     + '</h4></a>'
     + '<ul><li><span class="int-label">Artist </span>' + feature.properties.album_artist +'</li>'
     + '<li><span class="int-label">Year </span>' + feature.properties.year_of_release +'</li>'
          + '<li><span class="int-label">Country </span>' + feature.properties.countrys +'</li>'
          + '<li><span class="int-label">Genre </span>' + feature.properties.genres +'</li>'
          + '<li><span class="int-label">Label </span>' + feature.properties.source_labelarchive +'</li>'

    + '</ul></div>'

        document.getElementById('info').innerHTML = info;
    });

    // Clear the tooltip when map is clicked
    map.on('click',function(e){
        document.getElementById('info').innerHTML = '';
    });
    map.addLayer(markerLayer);



markerLayer.on('click', function(e){
    var coords = e.layer._latlng;
    map.panTo([coords.lat, coords.lng]);
});
// var markerLayer = L.mapbox.markerLayer(geoJson)
// .setFilter(function() { return false; })
//     .addTo(map);

}

    var folk = document.getElementById('filter-folk');

    var years = $('#years li a');

    var label = $('#label li a');
    var language = $('#language li a');
    var culture = $('#culture li a');



    years.each(function(){
        $(this).bind( 'click', function() {
        $('#years .active').removeClass('active');
        this.className = 'active';
        console.log($(this))
        filterMarkers('year_of_release',$('#years .active').attr('data-control'))
    })});

    language.each(function(){
        $(this).bind( 'click', function() {
            $('#language .active').removeClass('active');
        this.className = 'active';
        filterMarkers('languages',$('#language .active').attr('data-control'))
    })});

    label.each(function(){
        $(this).bind( 'click', function() {
            $('#label .active').removeClass('active');
        this.className = 'active';
        filterMarkers('source_labelarchive',$('#label .active').attr('data-control'))
    })});
    culture.each(function(){
        $(this).bind( 'click', function() {
            $('#culture .active').removeClass('active');
        this.className = 'active';
        filterMarkers('culture_groups',$('#culture .active').attr('data-control'))
    })});