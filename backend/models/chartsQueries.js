import db from '../db/connectMySql.js';
export const searchFilms = (searchQuery, limit, offset, callback) => {
    const query = `
      SELECT f.film_id, f.title, c.name AS genre
      FROM sakila.film f
      JOIN sakila.film_category fc ON f.film_id = fc.film_id
      JOIN sakila.category c ON fc.category_id = c.category_id
      WHERE f.film_id LIKE ? OR f.title LIKE ? OR c.name LIKE ?
      LIMIT ? OFFSET ?
    `;
  
    const searchTerm = `%${searchQuery}%`;
  
    db.query(query, [searchTerm, searchTerm, searchTerm, limit, offset], (err, films) => {
      if (err) {
        console.error("Error searching films:", err);
        return callback(err, null);
      }
  
      const countQuery = `
        SELECT COUNT(*) AS totalFilms
        FROM sakila.film f
        JOIN sakila.film_category fc ON f.film_id = fc.film_id
        JOIN sakila.category c ON fc.category_id = c.category_id
        WHERE f.film_id LIKE ? OR f.title LIKE ? OR c.name LIKE ?
      `;
  
      db.query(countQuery, [searchTerm, searchTerm, searchTerm], (countErr, countResult) => {
        if (countErr) {
          console.error("Error fetching total film count:", countErr);
          return callback(countErr, null);
        }
  
        callback(null, {
          films: films,
          totalFilms: countResult[0].totalFilms
        });
      });
    });
  };
  
  export const getFilmsPaginated = (page, limit, callback) => {
    const offset = (page - 1) * limit;
  
    const query = `
      SELECT f.film_id, f.title, c.name AS genre
      FROM sakila.film f
      JOIN sakila.film_category fc ON f.film_id = fc.film_id
      JOIN sakila.category c ON fc.category_id = c.category_id
      ORDER BY f.film_id ASC
      LIMIT ? OFFSET ?
    `;
  
    const countQuery = `SELECT COUNT(*) AS totalFilms FROM sakila.film`;
  
    db.query(query, [limit, offset], (err, films) => {
      if (err) {
        console.error("Error fetching films:", err);
        return callback(err, null);
      }
  
      db.query(countQuery, (countErr, countResult) => {
        if (countErr) {
          console.error("Error fetching total film count:", countErr);
          return callback(countErr, null);
        }
  
        callback(null, {
          films: films,
          totalFilms: countResult[0].totalFilms
        });
      });
    });
  };

export const searchCustomers = (searchQuery, limit, offset, callback) => {
    const query = `
      SELECT customer_id, store_id, first_name, last_name, active
      FROM sakila.customer
      WHERE customer_id LIKE ? OR first_name LIKE ? OR last_name LIKE ?
      LIMIT ? OFFSET ?
    `;
  
    const searchTerm = `%${searchQuery}%`; 
  
    db.query(query, [searchTerm, searchTerm, searchTerm, limit, offset], (err, customers) => {
      if (err) {
        console.error("Error searching customers:", err);
        return callback(err, null);
      }
  
      const countQuery = `
        SELECT COUNT(*) AS totalCustomers
        FROM sakila.customer
        WHERE customer_id LIKE ? OR first_name LIKE ? OR last_name LIKE ?
      `;
  
      db.query(countQuery, [searchTerm, searchTerm, searchTerm], (countErr, countResult) => {
        if (countErr) {
          console.error("Error fetching total customer count:", countErr);
          return callback(countErr, null);
        }
  
        callback(null, {
          customers: customers,
          totalCustomers: countResult[0].totalCustomers
        });
      });
    });
  };
  
  export const getCustomersPaginated = (page, limit, callback) => {
    const offset = (page - 1) * limit;
  
    const query = `
      SELECT customer_id, store_id, first_name, last_name, email
      FROM sakila.customer
      LIMIT ? OFFSET ?
    `;
  
    const countQuery = `SELECT COUNT(*) AS totalCustomers FROM sakila.customer`;
  
    db.query(query, [limit, offset], (err, customers) => {
      if (err) {
        console.error("Error fetching customers:", err);
        return callback(err, null);
      }
  
      db.query(countQuery, (countErr, countResult) => {
        if (countErr) {
          console.error("Error fetching total customer count:", countErr);
          return callback(countErr, null);
        }
  
        callback(null, {
          customers: customers,
          totalCustomers: countResult[0].totalCustomers,
        });
      });
    });
  };



export const getTop5RentedMovies = (callback) => {
    const query = 'SELECT * FROM top_5_rented_films';

    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
};


export const getTop5Actors = (callback) => {
  const query = `
      SELECT a.actor_id, a.first_name, a.last_name, COUNT(fa.film_id) AS movie_count
      FROM sakila.actor a
      JOIN sakila.film_actor fa ON a.actor_id = fa.actor_id
      GROUP BY a.actor_id
      ORDER BY movie_count DESC
      LIMIT 5;
  `;

  db.query(query, (err, result) => {
      if (err) {
          return callback(err, null);
      }
      callback(null, result);
  });
};

export const getMovieDetailsById = (id, callback) => {
  const query = `
    SELECT 
      f.film_id, 
      f.title,
      f.description, 
      f.release_year, 
      f.rental_duration, 
      f.rental_rate, 
      f.length, 
      f.replacement_cost, 
      f.rating, 
      f.special_features, 
      f.last_update,
      (SELECT COUNT(*) FROM sakila.inventory WHERE film_id = f.film_id) AS inventory_count,
      (SELECT JSON_ARRAYAGG(inventory_id) FROM sakila.inventory 
       WHERE film_id = f.film_id AND inventory_id NOT IN (SELECT inventory_id FROM sakila.rental WHERE return_date IS NULL)) AS available_inventory
    FROM sakila.film f
    WHERE f.film_id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result[0]);
  });
};



export const getActorDetailsById = (id, callback) => {
    const query = 'SELECT actor_id, first_name, last_name FROM sakila.actor WHERE actor_id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error fetching actor details from database:', err);
            return callback(err, null);
        }

        if (result.length === 0) {
            console.log('No actor found with that ID.');
            return callback(null, null);
        }

        callback(null, result[0]);
    });
};


export const getTop5MoviesByActor = (actorId, callback) => {
    const query = `
        SELECT f.film_id, f.title, COUNT(r.rental_id) AS rentals
        FROM sakila.film f
        JOIN sakila.film_actor fa ON f.film_id = fa.film_id
        JOIN sakila.inventory i ON f.film_id = i.film_id
        JOIN sakila.rental r ON r.inventory_id = i.inventory_id
        WHERE fa.actor_id = ?
        GROUP BY f.film_id
        ORDER BY rentals DESC
        LIMIT 5;
    `;

    db.query(query, [actorId], (err, result) => {
        if (err) {
            console.error("Error fetching top 5 movies by actor:", err);
            return callback(err, null);
        }
        callback(null, result);
    });
};
export const getFilmCopies = (filmId, callback) => {
  const query = 'SELECT copies FROM sakila.film_inventory WHERE film_id = ?';
  db.query(query, [filmId], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result[0]?.copies);
  });
};

export const updateFilmCopies = (filmId, newCopies, callback) => {
  const query = 'UPDATE sakila.film_inventory SET copies = ? WHERE film_id = ?';
  db.query(query, [newCopies, filmId], (err, result) => callback(err, result));
};

export const addCustomer = (firstName, lastName, email, storeId = 1, addressId = 1, callback) => {
  const query = `
    INSERT INTO sakila.customer (store_id, first_name, last_name, email, address_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [storeId, firstName, lastName, email, addressId], (err, result) => {
    if (err) {
      console.error("Error adding customer:", err);
      return callback(err, null);
    }

    const newCustomerId = result.insertId;
    callback(null, { customer_id: newCustomerId, first_name: firstName, last_name: lastName, email: email });
  });
};
export const updateCustomer = (customerId, firstName, lastName, email, callback) => {
  const query = `
    UPDATE sakila.customer 
    SET first_name = ?, last_name = ?, email = ? 
    WHERE customer_id = ?
  `;
  db.query(query, [firstName, lastName, email, customerId], (err, result) => {
    if (err) {
      console.error("Error updating customer:", err);
      return callback(err, null);
    }
    callback(null, result);
  });
};

export const deleteCustomerById = (customerId, callback) => {
  const query = `UPDATE sakila.customer SET active = 0 WHERE customer_id = ?`;
  db.query(query, [customerId], (err, result) => {
    if (err) {
      console.error("Error marking customer as inactive:", err);
      return callback(err);
    }
    callback(null, result);
  });
};

export const getCustomerDetailsById = (customerId, callback) => {
  const query = `
    SELECT 
      customer_id, 
      first_name, 
      last_name, 
      email, 
      create_date AS member_since
    FROM sakila.customer
    WHERE customer_id = ?
  `;

  db.query(query, [customerId], (err, customerResult) => {
    if (err) return callback(err);

    if (customerResult.length === 0) {
      return callback(new Error("Customer not found"));
    }

    const rentalQuery = `
      SELECT 
        r.rental_id,
        f.title AS film_title,
        r.rental_date, 
        r.return_date
      FROM sakila.rental r
      JOIN sakila.inventory i ON r.inventory_id = i.inventory_id
      JOIN sakila.film f ON i.film_id = f.film_id
      WHERE r.customer_id = ?
      ORDER BY r.rental_date DESC
    `;

    db.query(rentalQuery, [customerId], (rentalErr, rentalHistory) => {
      if (rentalErr) return callback(rentalErr);

      callback(null, {
        customer: customerResult[0],
        rentals: rentalHistory,
      });
    });
  });
};

export const markRentalAsReturned = (rentalId, callback) => {
  const query = `
    UPDATE sakila.rental 
    SET return_date = NOW() 
    WHERE rental_id = ? AND return_date IS NULL
  `;

  db.query(query, [rentalId], (err, result) => {
    if (err) {
      console.error("Error marking rental as returned:", err);
      return callback(err);
    }
    if (result.affectedRows === 0) {
      return callback(new Error("Rental not found or already returned"));
    }
    callback(null, result);
  });
};
