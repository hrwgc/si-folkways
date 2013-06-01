-- random point in polygon function from http://sorokine.blogspot.com/2011/04/postgis-function-for-random-point.html
CREATE OR REPLACE FUNCTION RandomPoint (
  geom Geometry
 )
 RETURNS Geometry
 AS $$
DECLARE
 maxiter INTEGER := 1000;
 i INTEGER := 0;
 x0 DOUBLE PRECISION;
 dx DOUBLE PRECISION;
 y0 DOUBLE PRECISION;
 dy DOUBLE PRECISION;
 xp DOUBLE PRECISION;
 yp DOUBLE PRECISION;
 rpoint Geometry;
BEGIN
 -- find envelope
 x0 = ST_XMin(geom);
 dx = (ST_XMax(geom) - x0);
 y0 = ST_YMin(geom);
 dy = (ST_YMax(geom) - y0);
  
 WHILE i < maxiter LOOP
  i = i + 1;
  xp = x0 + dx * random();
  yp = y0 + dy * random();
  rpoint = ST_SetSRID( ST_MakePoint( xp, yp ), ST_SRID(geom) );
  EXIT WHEN ST_Within( rpoint, geom );
 END LOOP;
  
 IF i > maxiter THEN
  RAISE NOTICE 'number of interations exceeded max';
 END IF; 
  
 RETURN rpoint;
END; 
$$ LANGUAGE plpgsql;


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

--- temporary fix for country-level points. 

update si_folk set single_country = 'Bosnia & Herzegovina' where  single_country = 'Bosnia-Herzegovina';
update si_folk set single_country = 'Trinidad & Tobago' where  single_country = 'Trinidad and Tobago';
update si_folk set single_country = $$Cote d'Ivory$$ where TRIM(BOTH ' ' from single_country) = $$Cote d'Ivoire$$;
update si_folk set single_country = 'Cote d'Ivory' where  single_country = 'Cote d'Ivoire';
update si_folk set single_country = 'Montenegro' where  single_country = 'Serbia and Montenegro';
update si_folk set single_country = 'Croatia' where  single_country = 'Yugoslavia (former)';
update si_folk set single_country = 'North Korea' where  single_country = 'Korea, North';
update si_folk set single_country = 'South Korea' where  single_country = 'Korea, South';
update si_folk set single_country = 'Solomon Is.' where  single_country = 'Solomon Islands';
update si_folk set single_country = 'St. Lucia' where  single_country = 'Saint Lucia';
update si_folk set single_country = 'United Kingdom' where  single_country = 'England';
update si_folk set single_country = 'Israel' where  single_country = 'Palestinian Territory';
update si_folk set single_country = 'United Kingdom' where  single_country = 'Wales';
update si_folk set single_country = 'United Kingdom' where  single_country = 'Scotland';
update si_folk set single_country = 'The Bahamas' where  single_country = 'Bahamas';
update si_folk set single_country = 'Georgia' where  single_country = 'Georgia (Country)';
update si_folk set single_country = 'Antigua & Barbuda' where  single_country = 'Antigua and Barbuda';
update si_folk set single_country = 'The Gambia' where  single_country = 'Gambia';
update si_folk set single_country = 'Ireland' where  single_country = 'Northern Ireland';
update si_folk set single_country = 'Russia' where  single_country = 'USSR (former)';
update si_folk set single_country = 'Congo, DRC' where  single_country = 'Congo (Democratic Republic)';

-- SELECT DropGeometryColumn ('public','si_folk','wkb_geometry');
-- SELECT AddGeometryColumn ('public','si_folk','wkb_geometry',4326,'POINT',2, false);



  UPDATE si_folk
    SET wkb_geometry = RandomPoint(a.wkb_geometry)
    FROM
        (SELECT wkb_geometry AS wkb_geometry,  cntry_name  FROM world_admin) AS a
    WHERE a.cntry_name = TRIM(BOTH ' ' FROM single_country);




    