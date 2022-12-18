SELECT properties.*, avg(property_reviews.rating) as average_rating
FROM properties
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE city LIKE '%Vancouver%' AND cost_per_night >= 1 AND cost_per_night <= 50000 
GROUP BY properties.id
HAVING avg(property_reviews.rating) >= 4 
ORDER BY cost_per_night
LIMIT 10;