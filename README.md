# Smithsonian Folkways Catalogue Visualization
================

[![](http://i.imgur.com/PUigH6T.png)](http://hrwgc.github.io/si-folkways/)

*[View Online](http://hrwgc.github.io/si-folkways/)*

This map was created at the first annual [National Day of Civic Hacking](http://dchackforchange.eventbrite.com/) in Washington, D.C. Smithsonian Folkways Recordings partnered with three community volunteers to tackle the task of creating an engaging visualization of Smithsonian Folkways' music collection. Together, we explored various visualization platforms, customizations, search filters, and social media strategies that could display musical catalogue content. This demo provides a scalable map of the entire Smithsonian Folkways catalogue, as well as an overview of filters that may be used to micromanage the dataset to create a more customized browsing experience. 

The hacking team included Chris Herwig, Preston Rhea, Terry Scott, Sojin Kim, Atesh Sonnborn and Meredith Holmgren. Saturday, June 1, 2013. 

## Documentation

The source code for this map is openly licensed under an [Apache 2.0 License](http://opensource.org/licenses/Apache-2.0). All [code is openly accessible on Github](https://github.com/hrwgc/si-folkways), and the [live map](http://hrwgc.github.io/si-folkways/) is served from the [`gh-pages`](https://github.com/hrwgc/si-folkways/tree/gh-pages) branch.



### Map Site

The map uses a [MapBox](http://mapbox.com) basemap with live markers powered by the open source javascript libraries [mapbox.js](http://mapbox.com/mapbox.js/) and [Leaflet](https://github.com/Leaflet/Leaflet.markercluster). Right now the markers are generated from the static JSON file, but the site could easily be adapted to pull from a live feed. See the [mapbox.converters.googledocs.js](https://github.com/mapbox/mapbox.js/blob/master/extensions/mapbox.converters.googledocs.js) extension for mapbox.js which grabs your Google Doc table and parses it into a GeoJSON object ready for live mapping.

### Data

This map uses a static version of the source Smithsonian Folkways database. This was done to faciliate adding richer geographic information, as the source data contained location information down to the level of country. Rendering these as markers resulted in dense clusters (some with over 1,000 in one particular area):

![](http://i.imgur.com/p9i5cpi.png)

To get around this, I randomly distributed each record across the administrative bounds of its respective country.

![](http://i.imgur.com/yJMKuFh.jpg)


I included a CSV export of my modified table, containing the [latitude/longitude values in the repo](https://github.com/hrwgc/si-folkways/blob/gh-pages/data/si_folk_geo.csv).

I also included [PGDump](http://www.gdal.org/ogr/drv_pgdump.html) files of the [PostGIS table containing all of the folkways records](https://github.com/hrwgc/si-folkways/blob/gh-pages/data/si_folk.sql), and the [world admin polygon layer](https://github.com/hrwgc/si-folkways/blob/gh-pages/data/world_admin.sql) I joined them to in order to geocode by country. 

These are all in the [data directory of the repo](https://github.com/hrwgc/si-folkways/blob/gh-pages/data/).

#### Caveats

The markers give an illusory sense of location precision. They were randomly distributed, but many records contain more specific locations in their titles that seem to contradict their placements. 

![](http://i.imgur.com/GHEs6xb.png)

*Southeast Alaska Folk Tradition displays in Colorado Springs, CO*

Records with multiple countries of origin listed are only shown on the map once, in the first country given in the `countrys` field. 

### Processing

To turn the CSV source file into a map-ready data layer, I converted it to a [PostGIS](http://postgis.org/) spatial database. My script for doing so is [in the github repo](https://github.com/hrwgc/si-folkways/blob/gh-pages/data/postgis.sql).

#### Import Source Records

*The following script creates a table for the source spreadsheet and imports it.*
```sql
CREATE TABLE si_folk (
    catalog_no VARCHAR,
    source_labelarchive VARCHAR,
    year_of_release SMALLINT,
    album_title VARCHAR,
    album_artists VARCHAR,
    countrys VARCHAR,
    culture_groups VARCHAR,
    genres VARCHAR,
    instruments VARCHAR,
    languages VARCHAR,
    keywords VARCHAR,
    link VARCHAR,
    single_country TEXT,
    wkb_geometry GEOMETRY,
    CONSTRAINT si_folk_pkey PRIMARY KEY (catalog_no),
    CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(wkb_geometry) = 2),
    CONSTRAINT enforce_geotype_geom CHECK (geometrytype(wkb_geometry) = 'POINT'::text OR wkb_geometry IS NULL),
    CONSTRAINT enforce_srid_the_geom CHECK (st_srid(wkb_geometry) = 4326)
);

CREATE INDEX si_folk_geom_gist
    ON si_folk
    USING GIST(wkb_geometry);
COPY si_folk
    (catalog_no, source_labelarchive, year_of_release, album_title, album_artists, countrys, culture_groups, genres, instruments, languages, keywords, link)
FROM
   'sfw_collection_report url - Albums.csv' DELIMITER ',' CSV HEADER;

UPDATE si_folk
    SET single_country = regexp_replace(countrys,'([^;]+);.*','\1');
```

#### Import Admin Polygons

I then grabbed an admin polygon shapefile from [Geocommons](http://geocommons.com/overlays/33578) to use for geocoding our points. 

Using [GDAL](http://gdal.org), I converted and imported the shapefile into a new PostGIS table.

```sh
$ ogr2ogr \
   -f "PostgreSQL" \
   -s_srs EPSG:4326 \
   -nln world_admin \
   PG:"user=postgres host=localhost port=5432 dbname=postgis" \
   world_country_admin_boundary_shapefile_with_fips_codes.shp
```

I needed to modify some of the country names used in the source database to make sure there was a complete join with the admin polygon layer:

```sql
UPDATE si_folk SET single_country = 'Bosnia & Herzegovina' WHERE  single_country = 'Bosnia-Herzegovina';
UPDATE si_folk SET single_country = 'Trinidad & Tobago' WHERE  single_country = 'Trinidad and Tobago';
UPDATE si_folk SET single_country = $$Cote d'Ivory$$ where TRIM(BOTH ' ' from single_country) = $$Cote d'Ivoire$$;
UPDATE si_folk SET single_country = 'Cote d'Ivory' where  single_country = 'Cote d'Ivoire';
UPDATE si_folk SET single_country = 'Montenegro' WHERE  single_country = 'Serbia and Montenegro';
UPDATE si_folk SET single_country = 'Croatia' WHERE  single_country = 'Yugoslavia (former)';
UPDATE si_folk SET single_country = 'North Korea' WHERE  single_country = 'Korea, North';
UPDATE si_folk SET single_country = 'South Korea' WHERE  single_country = 'Korea, South';
UPDATE si_folk SET single_country = 'Solomon Is.' WHERE  single_country = 'Solomon Islands';
UPDATE si_folk SET single_country = 'St. Lucia' WHERE  single_country = 'Saint Lucia';
UPDATE si_folk SET single_country = 'United Kingdom' WHERE  single_country = 'England';
UPDATE si_folk SET single_country = 'Israel' WHERE  single_country = 'Palestinian Territory';
UPDATE si_folk SET single_country = 'United Kingdom' WHERE  single_country = 'Wales';
UPDATE si_folk SET single_country = 'United Kingdom' WHERE  single_country = 'Scotland';
UPDATE si_folk SET single_country = 'The Bahamas' WHERE  single_country = 'Bahamas';
UPDATE si_folk SET single_country = 'Georgia' WHERE  single_country = 'Georgia (Country)';
UPDATE si_folk SET single_country = 'Antigua & Barbuda' WHERE  single_country = 'Antigua and Barbuda';
UPDATE si_folk SET single_country = 'The Gambia' WHERE  single_country = 'Gambia';
UPDATE si_folk SET single_country = 'Ireland' WHERE  single_country = 'Northern Ireland';
UPDATE si_folk SET single_country = 'Russia' WHERE  single_country = 'USSR (former)';
UPDATE si_folk SET single_country = 'Congo, DRC' WHERE  single_country = 'Congo (Democratic Republic)';
```

Finally, I then populated the main table's geometry column with a randomize point from the polygon to which it belonged. Note this requires the [random point function](https://github.com/hrwgc/si-folkways/blob/gh-pages/data/random_point.sql).

```psql
UPDATE si_folk
    SET wkb_geometry = RandomPoint(a.wkb_geometry)
    FROM
        (SELECT wkb_geometry AS wkb_geometry,  cntry_name  FROM world_admin) AS a
    WHERE a.cntry_name = TRIM(BOTH ' ' FROM single_country);
```

### GeoJSON

The last step was to export the geocoded folkways records table to GeoJSON:

```sh

$  ogr2ogr \
     -f GeoJSON \
     -s_srs EPSG:4326 \
     -nln si_folk \
     -nlt Point \
     si_folk_points.geojson \
     PG:"user=postgres host=localhost port=5432 dbname=postgis" \
     -sql 'select * from si_folk where wkb_geometry is not null'
```

**Note that this map does not display any points which lack geometry information.**

The output [si_folks_points.geojson](https://github.com/hrwgc/si-folkways/blob/gh-pages/data/si_folk_points.geojson) file becomes `si_folks.js` by wrapping the contents of `{ "type": "FeatureCollection", "features": ` in a `var geoJson =`. See [si_folks_points.js](https://github.com/hrwgc/si-folkways/blob/gh-pages/data/si_folk_points.js) if this is unclear.

