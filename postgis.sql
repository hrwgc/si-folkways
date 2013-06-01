CREATE TABLE si_folk (
    catalog_no VARCHAR,
    source_labelarchive VARCHAR,
    year_of_release SMALLINT,
    album_title VARCHAR,
    album_artists VARCHAR,
    countrys VARCHAR,
    geolongitude DOUBLE PRECISION,
    geolatitude DOUBLE PRECISION,
    geoaccuracy VARCHAR,
    culture_groups VARCHAR,
    genres VARCHAR,
    instruments VARCHAR,
    languages VARCHAR,
    keywords VARCHAR,
    link VARCHAR,
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
  (catalog_no, source_labelarchive, year_of_release, album_title, album_artists, countrys, geolongitude, geolatitude, geoaccuracy, culture_groups, genres, instruments, languages, keywords, link)
  FROM 'sfw_collection_report url - Albums.csv' DELIMITER ',' CSV HEADER;


-- geocode unique countries
ALTER TABLE si_folk DROP COLUMN geoaccuracy;
ALTER TABLE si_folk DROP COLUMN geolongitude;
ALTER TABLE si_folk DROP COLUMN geolatitude;
ALTER TABLE si_folk ADD COLUMN single_country TEXT;

UPDATE si_folk SET single_country = regexp_replace(countrys,'([^;]+);.*','\1');
-- use distinct values from single_country column for geocoding in google doc. output is country_lat_lons.csv, which has lat/lons. 

CREATE TABLE geocoder (
  country TEXT,
  geolongitude DOUBLE PRECISION,
  geolatitude DOUBLE PRECISION,
  wkb_geometry GEOMETRY,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(wkb_geometry) = 2),
  CONSTRAINT enforce_geotype_geom CHECK (geometrytype(wkb_geometry) = 'POINT'::text OR wkb_geometry IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(wkb_geometry) = 4326)
  );

COPY geocoder
  (country,geolongitude,geolatitude)
   FROM 
        'country_lat_lons.csv' DELIMITER ';' CSV HEADER;

UPDATE geocoder
  SET wkb_geometry =
    ST_GeomFromText('POINT(' || geolongitude || ' ' || geolatitude  || ')', 4326);


UPDATE si_folk
    SET wkb_geometry = a.wkb_geometry
    FROM
        (SELECT wkb_geometry AS wkb_geometry,  country  FROM geocoder) AS a
    WHERE a.country = TRIM(BOTH ' ' FROM single_country);
    
ANALYZE si_folk;
