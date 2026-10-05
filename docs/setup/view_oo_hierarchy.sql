-- Creates a view that delivers observed objects hierarchically ordered
CREATE VIEW view_oo_hierarchy as WITH RECURSIVE hierarchy AS (
    -- Basisschicht: Abfrage der obersten Elternobjekte (d.h. solche, die keine Eltern haben)
    SELECT 
        o.*,
        o.id AS root_id,
        0 AS depth,
        CAST(lpad(o.id::text, 10, '0') AS VARCHAR) AS path
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
        CONCAT(h.path, '>', lpad(o.id::text, 10, '0')) AS path
    FROM 
        tbl_observedobject o
    INNER JOIN 
        hierarchy h ON o.parent_id = h.id
)

SELECT * FROM hierarchy
ORDER BY root_id, path;