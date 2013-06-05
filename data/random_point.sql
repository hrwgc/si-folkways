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

