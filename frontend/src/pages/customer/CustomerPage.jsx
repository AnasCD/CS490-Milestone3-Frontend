import React, { useEffect, useState } from 'react';


const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', email: '' });
  const [addStatus, setAddStatus] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);


  const fetchCustomers = (pageNumber, search) => {
    const url = search
      ? `http://localhost:5000/api/customers/search?search=${search}&page=${pageNumber}&limit=10`
      : `http://localhost:5000/api/customers?page=${pageNumber}&limit=10`;


    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCustomers(data.customers || []);
        setTotalPages(Math.ceil(data.totalCustomers / 10));
      })
      .catch((error) => console.error('Error fetching customers:', error));
  };


  const addCustomer = () => {
    fetch('http://localhost:5000/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    })
      .then((response) => {
        if (response.ok) {
          setAddStatus("Customer added successfully!");
          setIsModalOpen(false);
          fetchCustomers(page, searchTerm);
        } else {
          setAddStatus("Failed to add customer. Try again.");
        }
      })
      .catch(() => setAddStatus("An error occurred. Try again."));
  };


  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setNewCustomer({ firstName: customer.first_name, lastName: customer.last_name, email: customer.email });
    setIsModalOpen(true);
  };


  const updateCustomer = () => {
    fetch(`http://localhost:5000/api/customers/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: selectedCustomer.customer_id,
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        email: newCustomer.email,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          setCustomers((prev) =>
            prev.map((cust) =>
              cust.customer_id === selectedCustomer.customer_id
                ? { ...cust, first_name: newCustomer.firstName, last_name: newCustomer.lastName, email: newCustomer.email }
                : cust
            )
          );
          setIsModalOpen(false);
          setEditStatus("Customer updated successfully!");
        } else {
          setEditStatus("Failed to update customer.");
        }
      })
      .catch(() => setEditStatus("An error occurred while updating the customer."));
  };


  const confirmDeleteCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteConfirmOpen(true);
  };


  const deleteCustomer = () => {
    fetch(`http://localhost:5000/api/customers/${selectedCustomer.customer_id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          setEditStatus("Failed to delete customer, likely due to existing dependencies.");
          throw new Error("Deletion failed");
        }
        return response.json();
      })
      .then((data) => {
        if (data.message) {
          setCustomers((prev) => prev.filter((cust) => cust.customer_id !== selectedCustomer.customer_id));
          setIsDeleteConfirmOpen(false);
          setSelectedCustomer(null);
        } else {
          setEditStatus("Failed to delete customer.");
        }
      })
      .catch(() => setEditStatus("An error occurred while deleting the customer."));
  };


  const fetchCustomerDetails = (customerId) => {
    fetch(`http://localhost:5000/api/customers/${customerId}/details`)
      .then((response) => response.json())
      .then((data) => {
        setCustomerDetails(data);
        setIsDetailsModalOpen(true);
      })
      .catch((error) => console.error("Error fetching customer details:", error));
  };


  useEffect(() => {
    fetchCustomers(page, searchTerm);
  }, [page, searchTerm]);


  const handlePageChange = (newPage) => setPage(newPage);


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
      <h1 className="text-3xl font-bold mb-6 text-blue-300">Customers</h1>


      <div className="mb-8">
        <input
          type="text"
          className="input input-bordered input-blue-600"
          placeholder="Search by ID, First Name, Last Name"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="btn btn-primary ml-4" onClick={() => setIsModalOpen(true)}>Add New Customer</button>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {customers.map((customer) => (
          <div
            key={customer.customer_id}
            className="card bg-blue-200 text-blue-800 shadow-lg w-full mx-auto transform transition duration-300 hover:scale-105"
          >
            <div className="card-body">
              <h2 className="card-title">{customer.first_name} {customer.last_name}</h2>
              <p><strong>Customer ID:</strong> {customer.customer_id}</p>
              <p><strong>Email:</strong> {customer.email}</p>
              <div className="card-actions justify-end">
                <button className="btn btn-outline border-black text-black" onClick={() => handleEditCustomer(customer)}>
                  Edit
                </button>
                <button className="btn btn-outline border-black text-black ml-2" onClick={() => confirmDeleteCustomer(customer)}>
                  Delete
                </button>
                <button className="btn btn-outline border-black text-black ml-2" onClick={() => fetchCustomerDetails(customer.customer_id)}>
                  View Details
                </button>
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



      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">{selectedCustomer ? "Edit Customer" : "Add New Customer"}</h3>
            <input
              type="text"
              placeholder="First Name"
              className="input input-bordered w-full mb-2"
              value={newCustomer.firstName}
              onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="input input-bordered w-full mb-2"
              value={newCustomer.lastName}
              onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full mb-2"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            />
            {selectedCustomer ? (
              <button className="btn btn-primary mt-2" onClick={updateCustomer}>Save Changes</button>
            ) : (
              <button className="btn btn-primary mt-2" onClick={addCustomer}>Submit</button>
            )}
            <button className="btn mt-2" onClick={() => setIsModalOpen(false)}>Close</button>
            {addStatus && <p className="mt-2 text-center text-sm text-gray-700">{addStatus}</p>}
          </div>
        </div>
      )}



      {isDeleteConfirmOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold text-red-600">Confirm Deletion</h3>
            <p>Are you sure you want to delete this customer?</p>
            <div className="modal-action">
              <button onClick={deleteCustomer} className="btn btn-danger">Yes, Delete</button>
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}



      {isDetailsModalOpen && customerDetails && (
        <div className="modal modal-open">
          <div className="modal-box overflow-y-auto max-h-96">
            <h3 className="text-lg font-bold">Customer Details</h3>
            <p><strong>Customer ID:</strong> {customerDetails.customer.customer_id}</p>
            <p><strong>First Name:</strong> {customerDetails.customer.first_name}</p>
            <p><strong>Last Name:</strong> {customerDetails.customer.last_name}</p>
            <p><strong>Email:</strong> {customerDetails.customer.email}</p>
            <p><strong>Member Since:</strong> {new Date(customerDetails.customer.member_since).toLocaleDateString()}</p>


            <h4 className="font-bold mt-4">Rental History</h4>
            {customerDetails.rentals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Rental ID</th>
                      <th className="border px-4 py-2">Film Title</th>
                      <th className="border px-4 py-2">Rented On</th>
                      <th className="border px-4 py-2">Returned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerDetails.rentals.map((rental) => (
                      <tr key={rental.rental_id}>
                        <td className="border px-4 py-2">{rental.rental_id}</td>
                        <td className="border px-4 py-2">{rental.film_title}</td>
                        <td className="border px-4 py-2">{new Date(rental.rental_date).toLocaleDateString()}</td>
                        <td className="border px-4 py-2">{rental.return_date ? new Date(rental.return_date).toLocaleDateString() : "Not returned yet"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No rental history available.</p>
            )}
            <button onClick={() => setIsDetailsModalOpen(false)} className="btn mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};


export default CustomerPage;



