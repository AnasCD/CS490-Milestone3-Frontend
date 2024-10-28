import { getCustomersPaginated, searchCustomers } from "../models/chartsQueries.js";
import { addCustomer } from "../models/chartsQueries.js";
import { updateCustomer } from "../models/chartsQueries.js";
import { deleteCustomerById } from "../models/chartsQueries.js";
import { getCustomerDetailsById } from "../models/chartsQueries.js";
import { markRentalAsReturned } from "../models/chartsQueries.js";


export const getCustomers = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  getCustomersPaginated(page, limit, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch customers" });
    }
    res.json(result);
  });
};

export const searchCustomerByQuery = (req, res) => {
  const searchQuery = req.query.search || "";
  const page = parseInt(req.query.page) || 1; 
  const limit = parseInt(req.query.limit) || 10; 
  const offset = (page - 1) * limit;

  if (!searchQuery) {
    return res.status(400).json({ error: "Search query is required" });
  }


  searchCustomers(searchQuery, limit, offset, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to search customers" });
    }
    res.json(result);
  });
};

export const addNewCustomer = (req, res) => {
  const { firstName, lastName, email, storeId = 1, addressId = 1 } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "Please fill in all fields: First Name, Last Name, and Email." });
  }

  addCustomer(firstName, lastName, email, storeId, addressId, (err, result) => {
    if (err) {
      console.error("Error adding customer:", err);
      return res.status(500).json({ error: "Failed to add customer" });
    }
    res.status(201).json({ message: "Customer added successfully!" });
  });
};

export const updateCustomerDetails = (req, res) => {
  const { customerId, firstName, lastName, email } = req.body;

  if (!customerId || !firstName || !lastName || !email) {
    return res.status(400).json({ error: "Please provide all customer details." });
  }

  updateCustomer(customerId, firstName, lastName, email, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to update customer details" });
    }
    res.json({ message: "Customer details updated successfully!" });
  });
};

export const deleteCustomer = (req, res) => {
  const customerId = req.params.customerId;

  if (!customerId) {
    return res.status(400).json({ error: "Customer ID is required" });
  }

  deleteCustomerById(customerId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete customer" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No customer found with that ID to delete" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  });
};

export const getCustomerDetails = (req, res) => {
  const customerId = req.params.customerId;

  getCustomerDetailsById(customerId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch customer details" });
    }
    res.json(result);
  });
};

export const returnCustomerRental = (req, res) => {
  const rentalId = parseInt(req.params.rentalId, 10);
  if (!rentalId) {
    return res.status(400).json({ error: "Rental ID is required" });
  }

  markRentalAsReturned(rentalId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to mark rental as returned" });
    }
    res.status(200).json({ message: "Rental marked as returned successfully" });
  });
};


