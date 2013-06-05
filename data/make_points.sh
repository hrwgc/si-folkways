#!/bin/bash
   ogr2ogr \
     -f GeoJSON \
     -s_srs EPSG:4326 \
     -nln si_folk \
     -nlt Point \
     si_folk_points.geojson \
     PG:"$PG_GDAL" \
     -sql 'select * from si_folk where wkb_geometry is not null'


