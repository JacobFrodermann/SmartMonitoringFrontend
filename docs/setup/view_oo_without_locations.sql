-- Creates a view that identifies observedobjects without locations
CREATE VIEW view_oo_without_locations AS
WITH RECURSIVE hierarchy AS (
    -- Basisschicht: Abfrage der obersten Elternobjekte (d.h. solche, die keine Eltern haben)
    SELECT 
        o.*,
        o.id AS root_id,
        0 AS depth,
        CAST(LPAD(o.id::text, 10, '0') AS VARCHAR) AS path
    FROM 
        tbl_observedobject o
    WHERE 
        o.parent_id IS NULL
    
    UNION ALL
    
    -- Rekursive Schicht: Abfrage der Kinderobjekte auf Basis der vorherigen Ergebnismenge
    SELECT 
        o.*,
        h.root_id,
        h.depth + 1 AS depth,
        CONCAT(h.path, '>', LPAD(o.id::text, 10, '0')) AS path
    FROM 
        tbl_observedobject o
    INNER JOIN 
        hierarchy h ON o.parent_id = h.id
)

SELECT
    h.*
FROM hierarchy h
LEFT JOIN 
    tbl_location_join_oo ljo ON h.id = ljo.oo_id
WHERE 
    ljo.oo_id IS NULL
ORDER BY 
    h.root_id, h.path;