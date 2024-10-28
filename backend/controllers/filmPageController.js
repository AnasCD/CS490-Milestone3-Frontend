import { getFilmsPaginated, searchFilms, getMovieDetailsById } from "../models/chartsQueries.js";

export const getFilms = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  getFilmsPaginated(page, limit, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch films" });
    }
    res.json(result);
  });
};

export const searchFilmByQuery = (req, res) => {
  const searchQuery = req.query.search || ""; 
  const page = parseInt(req.query.page) || 1; 
  const limit = parseInt(req.query.limit) || 10; 
  const offset = (page - 1) * limit;

  if (!searchQuery) {
    return res.status(400).json({ error: "Search query is required" });
  }

  searchFilms(searchQuery, limit, offset, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to search films" });
    }
    res.json(result);
  });
};

export const getFilmDetails = (req, res) => {
  const movieId = req.params.id;

  getMovieDetailsById(movieId, (err, result) =>{
    if(err) {
      return res.status(500).json({error: "Failed to fetch film details"});

    }
    res.json(result);
  });
};
