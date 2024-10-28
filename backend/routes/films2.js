import express from "express";


import { getFilms, searchFilmByQuery, getFilmDetails } from "../controllers/filmPageController.js";
const router = express.Router();

router.get("/", getFilms);
router.get("/search", searchFilmByQuery);
router.get("/:id", getFilmDetails);


export default router;