import express from "express";
import { getCustomers } from "../controllers/customerController.js";
import { searchCustomerByQuery } from "../controllers/customerController.js";
import { addNewCustomer } from "../controllers/customerController.js";
import { updateCustomerDetails } from "../controllers/customerController.js";
import { deleteCustomer } from "../controllers/customerController.js";
import { getCustomerDetails } from "../controllers/customerController.js";
import { returnCustomerRental } from "../controllers/customerController.js";

const router = express.Router();

router.get("/", getCustomers);
router.get("/search", searchCustomerByQuery);
router.post("/", addNewCustomer);
router.put("/edit", updateCustomerDetails);
router.delete("/:customerId", deleteCustomer);
router.get("/:customerId/details", getCustomerDetails);
router.put("/:rentalId/return", returnCustomerRental);

export default router;
