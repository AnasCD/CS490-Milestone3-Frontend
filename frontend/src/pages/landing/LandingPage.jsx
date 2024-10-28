import React, { useEffect, useState } from 'react';

function LandingPage() {
  const [top5Films, setTop5Films] = useState([]);
  const [top5Actors, setTop5Actors] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api')
      .then((response) => response.json())
      .then((data) => {
        setTop5Films(data.top5Films);
        setTop5Actors(data.top5Actors);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const fetchFilmDetails = (id) => {
    fetch(`http://localhost:5000/api/films/${id}`)
      .then((response) => response.json())
      .then((data) => setSelectedFilm(data))
      .catch((error) => console.error('Error fetching film details:', error));
  };

  const fetchActorDetails = (id) => {
    fetch(`http://localhost:5000/api/actors/${id}`)
      .then((response) => response.json())
      .then((data) => setSelectedActor(data))
      .catch((error) => console.error('Error fetching actor details:', error));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-300">Top 5 Rented Films</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {top5Films.map((film) => (
          <div
            key={film.film_id}
            className="card bg-blue-200 text-blue-800 shadow-lg w-full mx-auto transform transition duration-300 hover:scale-105"
          >
            <div className="card-body">
              <h2 className="card-title">{film.title}</h2>
              <p><strong>Rental Count:</strong> {film.rented}</p>
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

      <h1 className="text-3xl font-bold mt-8 mb-6 text-blue-300">Top 5 Actors</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {top5Actors.map((actor) => (
          <div
            key={actor.actor_id}
            className="card bg-blue-200 text-blue-800 shadow-lg w-full mx-auto transform transition duration-300 hover:scale-105"
          >
            <div className="card-body">
              <h2 className="card-title">{actor.first_name} {actor.last_name}</h2>
              <p><strong>Movie Count:</strong> {actor.movie_count}</p>
              <div className="card-actions justify-end">
                <label
                  htmlFor="actor_details_modal"
                  className="btn btn-outline border-black text-black"
                  onClick={() => fetchActorDetails(actor.actor_id)}
                >
                  View Details
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Film Details */}
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
            </>
          ) : (
            <p>Loading...</p>
          )}
          <div className="modal-action">
            <label htmlFor="film_details_modal" className="btn">Close</label>
          </div>
        </div>
      </div>

      {/* Modal for Actor Details */}
      <input type="checkbox" id="actor_details_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          {selectedActor ? (
            <>
              <h3 className="text-lg font-bold">{selectedActor.actorDetails.first_name} {selectedActor.actorDetails.last_name}</h3>
              <h3 className="font-bold">Top 5 Movies:</h3>
              <ul className="list-disc pl-6">
                {selectedActor.topMovies.map((movie) => (
                  <li key={movie.film_id}>
                    {movie.title} (Rentals: {movie.rentals})
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>Loading...</p>
          )}
          <div className="modal-action">
            <label htmlFor="actor_details_modal" className="btn">Close</label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
