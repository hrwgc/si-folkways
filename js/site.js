var map = L.mapbox.map('map', 'hackcfch.map-v8zfgot1', {
    zoomAnimation: false
  });
var southWest = new L.LatLng(-85.0, -180),
  northEast = new L.LatLng(85, 180),
  bounds = new L.LatLngBounds(southWest, northEast);

map.setMaxBounds(bounds);

var genreFilters = ["World", "Jazz", "Blues", "American Folk", "Latin", "Sacred", "Islamica", "Struggle & Protest", "Spoken", "Bluegrass", "Classical", "Childrens", "Celtic", "Carribean", "Judaica", "Gospel", "African", "African American", "American Indian", "Compilation", "Musicals", "Sound"];
var labelFilters = ["ARCE", "Collector Records", "Cook Records", "Dyer-Bennet Records", "Fast Folk Musical Magazine", "Folkways Records", "Mickey Hart Collection", "ILAM", "Monitor Records", "MORE", "Paredon Records", "Smithsonian Folkways Recordings", "UNESCO"];
var decadeFilters = ["1940", "1950", "1960", "1970", "1980", "1990", "2000", "2010"];
var yearFilters = [1938, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
var languageFilters = ["English", "Spanish", "Arabic", "Hebrew", "French", "Xhosa", "Sotho, Southern", "Hindi"];
var cultureFilters = ["Celtic", "African American", "Spanish", "African", "European", "Latin American", "American Indian", "East Indian", "Arabic", "South Asian", "Mexican", "Jewish", "Cajun", "South American", "European American"];




function buildFilterUi(array, name) {
  $('#map-ui').append('<div class="btn-group dropup"><button class="btn dropdown-toggle" data-toggle="dropdown">' + name + '<i class="icon-filter"></i></button><ul class="dropdown-menu" id="' + name + '"></ul></div>');
  for (var i = 0; i < array.length; i++) {
    $('#' + name).append('<li><a href="#" data-control="' + array[i] + '">' + array[i] + '</a></li>');
  }
}

function showAll() {
  map.eachLayer(function (l) {
      if (typeof (l._tilejson) == 'undefined') {
        map.removeLayer(l);
      }
    })
  map.addLayer(markers)
}

function filterMarkers(key, value) {
  map.removeLayer(markers)
  map.eachLayer(function (l) {
      if (typeof (l._tilejson) == 'undefined') {
        map.removeLayer(l);
      }
    })

  var filteredMarkers = L.mapbox.markerLayer(geoJson);
  filteredMarkers.setFilter(function (f) {
      return f.properties[key] === value;
    }).addTo(map).eachLayer(function (layer) {
      layer.unbindPopup();
      layer.on('click', function (e) {
          document.getElementById('info').innerHTML = e.target.feature.properties.popupContent;
          document.getElementById('info').className = "";
          var coords = e.latlng;
          map.panTo([coords.lat, coords.lng]);
           $("img").error(function () {
              $(this).hide();
          });
        })
    });
  map.fitBounds(filteredMarkers.getBounds())
  return false;
};

map.on('click', function (e) {
    document.getElementById('info').innerHTML = '';
    document.getElementById('info').className = "hide";
  });

function filterYears(key, minY, maxY) {
  map.removeLayer(markers)
  map.eachLayer(function (l) {
      if (typeof (l._tilejson) == 'undefined') {
        map.removeLayer(l);
      }
    })

  var filteredMarkers = L.mapbox.markerLayer(geoJson);
  if (maxY) {
    filteredMarkers.setFilter(function (f) {
        return parseInt(f.properties[key]) > minY && parseInt(f.properties[key]) < maxY;
      }).addTo(map).eachLayer(function (layer) {
        layer.unbindPopup();
        layer.on('click', function (e) {
            document.getElementById('info').innerHTML = e.target.feature.properties.popupContent;
            document.getElementById('info').className = "";
            var coords = e.latlng;
            map.panTo([coords.lat, coords.lng]);
            $("img").error(function () {
                $(this).hide();
              });

          })
      });
  } else {

  }

  map.fitBounds(filteredMarkers.getBounds())
  return false;
};

map.on('click', function (e) {
    document.getElementById('info').innerHTML = '';
    document.getElementById('info').className = "hide";
  });



buildFilterUi(decadeFilters, 'decades')
buildFilterUi(labelFilters, 'label')
buildFilterUi(languageFilters, 'language')
buildFilterUi(cultureFilters, 'culture')

var markers = new L.MarkerClusterGroup({
    maxClusterRadius: 80,
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: true,
    disableClusteringAtZoom: 7,
    zoomToBoundsOnClick: true,
    removeOutsideVisibleBounds: true
  });

for (var i = 0; i < geoJson.length; i++) {
  var feature = geoJson[i],
    coords = feature.geometry.coordinates;

  var marker = new L.marker(new L.LatLng(coords[1], coords[0]), {
      icon: L.mapbox.marker.icon({
          'marker-symbol': feature.properties['marker-symbol'],
          'marker-color': feature.properties['marker-color'],
          "marker-size": 'medium'
        }),
      popupContent: feature.properties.popupContent
    })
  marker.on('click', function (e) {
      document.getElementById('info').innerHTML = e.target.options.popupContent;
      document.getElementById('info').className = "";
      var coords = e.latlng;
      map.panTo([coords.lat, coords.lng]);
      $("img").error(function () {
          $(this).hide();
        });

    })
  markers.addLayer(marker);

}
map.on('click', function (e) {
    document.getElementById('info').innerHTML = '';
    document.getElementById('info').className = "hide";
  });

map.addLayer(markers)


var folk = document.getElementById('filter-folk');

var years = $('#years li a');
var decades = $('#decades li a');
var label = $('#label li a');
var language = $('#language li a');
var culture = $('#culture li a');
var all = $('#show-all');


all.bind('click', function () {
    $('#map-ui .active').each(function () {
        $(this).removeClass('active')
      });
    $(this).removeClass('active')
    $(this).addClass('active');
    showAll();
  })
decades.each(function () {
    $(this).bind('click', function () {
        $('#decades .active').removeClass('active');
        $('#map-ui .active').each(function () {
            $(this).removeClass('active')
          });
        this.className = 'active';
        $(this).parent().parent().siblings('button').addClass('active activefilter')
        var $decade = $('#decades .active').attr('data-control');
        filterYears('year_of_release', $decade, parseInt($decade) + 10)
      })
  });

language.each(function () {
    $(this).bind('click', function () {
        $('#language .active').removeClass('active');
        $('#map-ui .active').each(function () {
            $(this).removeClass('active')
          });
        this.className = 'active';
        $(this).parent().parent().siblings('button').addClass('active activefilter')
        filterMarkers('languages', $('#language .active').attr('data-control'))
      })
  });

label.each(function () {
    $(this).bind('click', function () {
        $('#label .active').removeClass('active');
        $('#map-ui .active').each(function () {
            $(this).removeClass('active')
          });
        this.className = 'active';
        $(this).parent().parent().siblings('button').addClass('active activefilter')
        filterMarkers('source_labelarchive', $('#label .active').attr('data-control'))
      })
  });
culture.each(function () {
    $(this).bind('click', function () {
        $('#culture .active').removeClass('active');
        $('#map-ui .active').each(function () {
            $(this).removeClass('active')
          });
        this.className = 'active';
        $(this).parent().parent().siblings('button').addClass('active activefilter')
        filterMarkers('culture_groups', $('#culture .active').attr('data-control'))
      })
  });