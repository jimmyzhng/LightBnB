const { query } = require('express');
const { Pool } = require('pg');
const pool = new Pool({
  user: 'labber',
  password: '3313',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = function(email) {
  return pool.query(`SELECT * 
  FROM users 
  WHERE email = $1;`, [email])
    .then(res => {
      if (!res.rows) {
        return null;
      }
      return res.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool.query(`SELECT * 
  FROM users 
  WHERE id = $1;`, [id])
    .then(res => {
      if (!res.rows) {
        return null;
      }
      return res.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  return pool.query(`INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;`, [user.name, user.email, user.password])
    .then(res => {
      return res.rows[0];
    });
};


exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */

const getAllReservations = function(guest_id, limit = 10) {
  // return getAllProperties(null, 2);

  return pool.query(`SELECT reservations.id, properties.*,
  reservations.start_date, reservations.end_date,
  avg(property_reviews.rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON property_reviews.property_id = properties.id
  WHERE reservations.guest_id = $1
  GROUP BY reservations.id, properties.id
  ORDER BY reservations.start_date
  LIMIT $2;`, [guest_id, limit])
    .then(res => {
      return res.rows;
    });
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = (options, limit = 10) => {

  const queryParams = [];

  let queryString = `SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_reviews.property_id
  `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length}`;

  }

  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`);

    if (options.city) {
      queryString += ` AND cost_per_night >= $${queryParams.length}`;
    } else {
      queryString += ` WHERE cost_per_night >= $${queryParams.length}`;
    }

  }

  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night}`);

    if (options.city || options.minimum_price_per_night) {
      queryString += ` AND cost_per_night <= $${queryParams.length}`;
    } else {
      queryString += ` WHERE cost_per_night <= $${queryParams.length}`;
    }

  }

  queryString += ` GROUP BY properties.id`;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += ` HAVING avg(property_reviews.rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);

  queryString += `
ORDER BY cost_per_night
LIMIT $${queryParams.length};
`;

  console.log(queryString, queryParams);

  return pool.query(queryString, queryParams)
    .then(res => res.rows);


};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;;
