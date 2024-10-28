import React, { useEffect, useState } from 'react';

const FilmsPage = () => {
  const [films, setFilms] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [rentalStatus, setRentalStatus] = useState("");

  const fetchFilms = (pageNumber, search) => {
    const url = search
      ? `http://localhost:5000/api/films-page/search?search=${search}&page=${pageNumber}&limit=10`
      : `http://localhost:5000/api/films-page?page=${pageNumber}&limit=10`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setFilms(data.films || []);
        setTotalPages(Math.ceil(data.totalFilms / 10));
      })
      .catch((error) => console.error("Error fetching films:", error));
  };

  const fetchFilmDetails = (id) => {
    fetch(`http://localhost:5000/api/films-page/${id}`)
      .then((response) => response.json())
      .then((data) => setSelectedFilm(data))
      .catch((error) => console.error("Error fetching film details:", error));
  };

  const handleRental = () => {
    if (!selectedFilm || selectedFilm.available_inventory.length === 0) {
      setRentalStatus("No copies available for rental.");
      return;
    }

    const inventoryId = selectedFilm.available_inventory[0];

    fetch(`http://localhost:5000/api/rentals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: customerId,
        film_id: selectedFilm.film_id,
        inventory_id: inventoryId,
      })
    })
      .then((response) => {
        if (response.ok) {
          setRentalStatus("Rental successful!");
          setSelectedFilm((prevFilm) => ({
            ...prevFilm,
            available_inventory: prevFilm.available_inventory.slice(1),
          }));
        } else {
          setRentalStatus("Rental failed. Please check the customer ID.");
        }
      })
      .catch(() => setRentalStatus("An error occurred while processing the rental."));
  };

  useEffect(() => {
    fetchFilms(page, searchTerm);
  }, [page, searchTerm]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };


  const getDisplayedPages = () => {
    const pages = [];
    if (totalPages <= 5) {
     
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
  
      if (page > 3) pages.push(1, "...");
      for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...", totalPages);
    }
    return pages;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-300">Films</h1>

      <div className="mb-8">
        <input
          type="text"
          className="input input-bordered input-blue-600"
          placeholder="Search by Film Name, Actor, or Genre"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {films.map((film) => (
          <div
            key={film.film_id}
            className="card bg-blue-200 text-blue-800 shadow-lg w-full mx-auto transform transition duration-300 hover:scale-105"
          >
            <div className="card-body">
              <h2 className="card-title">{film.title}</h2>
              <p><strong>ID:</strong> {film.film_id}</p>
              <p><strong>Genre:</strong> {film.genre}</p>
              <div className="card-actions justify-end">
                <label
                  htmlFor="film_details_modal"
                  className="btn btn-outline border-black text-black"
                  onClick={() => fetchFilmDetails(film.film_id)}
                >
                  View Details
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>


      <div className="join mt-8 flex justify-center">
        <button
          className="join-item btn"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          «
        </button>
        {getDisplayedPages().map((pageNumber, index) =>
          pageNumber === "..." ? (
            <span key={index} className="join-item btn btn-disabled">...</span>
          ) : (
            <button
              key={pageNumber}
              className={`join-item btn ${page === pageNumber ? 'btn-active' : ''}`}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          )
        )}
        <button
          className="join-item btn"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          »
        </button>
      </div>

      <input type="checkbox" id="film_details_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          {selectedFilm ? (
            <>
              <h3 className="text-lg font-bold">{selectedFilm.title}</h3>
              <p><strong>Description:</strong> {selectedFilm.description || 'N/A'}</p>
              <p><strong>Release Year:</strong> {selectedFilm.release_year || 'N/A'}</p>
              <p><strong>Rental Duration:</strong> {selectedFilm.rental_duration || 'N/A'} days</p>
              <p><strong>Rental Rate:</strong> ${selectedFilm.rental_rate || 'N/A'}</p>
              <p><strong>Length:</strong> {selectedFilm.length || 'N/A'} minutes</p>
              <p><strong>Replacement Cost:</strong> ${selectedFilm.replacement_cost || 'N/A'}</p>
              <p><strong>Rating:</strong> {selectedFilm.rating || 'N/A'}</p>
              <p><strong>Special Features:</strong> {selectedFilm.special_features || 'N/A'}</p>
              <p><strong>Total Copies:</strong> {selectedFilm.inventory_count || 'N/A'}</p>
              <p><strong>Available Inventory IDs:</strong> {selectedFilm.available_inventory?.join(", ") || 'None'}</p>

              <div className="mt-4">
                <input
                  type="text"
                  className="input input-bordered w-full mb-2"
                  placeholder="Enter Customer ID to Rent"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
                <button className="btn btn-primary w-full" onClick={handleRental}>
                  Rent Movie
                </button>
                {rentalStatus && (
                  <p className="mt-2 text-center text-sm text-gray-700">{rentalStatus}</p>
                )}
              </div>
            </>
          ) : (
            <p>Loading...</p>
          )}
          <div className="modal-action">
            <label htmlFor="film_details_modal" className="btn">Close</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilmsPage;
