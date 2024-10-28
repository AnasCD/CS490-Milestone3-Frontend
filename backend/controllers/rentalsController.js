import db from '../db/connectMySql.js';


export const rentFilm = (req, res) => {
  const { customer_id, film_id } = req.body;

  const customerQuery = 'SELECT customer_id FROM sakila.customer WHERE customer_id = ?';
  db.query(customerQuery, [customer_id], (customerErr, customerResult) => {
    if (customerErr || customerResult.length === 0) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

 
    const copiesQuery = `
      SELECT inventory_id 
      FROM sakila.inventory 
      WHERE film_id = ? AND inventory_id NOT IN (
        SELECT inventory_id FROM sakila.rental WHERE return_date IS NULL
      ) LIMIT 1
    `;
    db.query(copiesQuery, [film_id], (copiesErr, copiesResult) => {
      if (copiesErr || copiesResult.length === 0) {
        return res.status(400).json({ error: 'Not enough copies available to rent' });
      }

      const rentalQuery = `
        INSERT INTO sakila.rental (rental_date, inventory_id, customer_id, staff_id)
        VALUES (NOW(), ?, ?, 1)  -- Using staff_id = 1 as an example
      `;
      db.query(rentalQuery, [copiesResult[0].inventory_id, customer_id], (rentalErr) => {
        if (rentalErr) {
          return res.status(500).json({ error: 'Failed to process rental' });
        }
        res.status(200).json({ message: 'Rental successful!' });
      });
    });
  });
};
