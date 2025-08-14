import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import axios from 'axios';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [comments, setComments] = useState('');
  const token = localStorage.getItem("authToken");

  const [sdmReports, setSdmReports] = useState({});
  const [psReports, setPsReports] = useState({});
  const [filterStatus, setFilterStatus] = useState('All');
   const [searchTerm, setSearchTerm] = useState('');

 const filteredApplications = applications.filter(app => {
    const status = (app.status || '').replace(/\s+/g, '').toLowerCase();
    const filter = (filterStatus || '').replace(/\s+/g, '').toLowerCase();

    // Status filter
    let statusMatch = false;
    if (filter === 'all' || filter === 'selectstatus') statusMatch = true;
    else if (filter === 'pending') statusMatch = status === 'pending';
    else if (filter === 'inprogress') statusMatch = status === 'inprogress';
    else if (filter === 'returned' || filter === 'return') statusMatch = status === 'returned' || status === 'return';

    // Search filter
    const term = searchTerm.trim().toLowerCase();
    let searchMatch = true;
    if (term) {
      searchMatch =
        (app.applicant_name || '').toLowerCase().includes(term) ||
        (app.mobile_number || '').toLowerCase().includes(term) ||
        (`F${String(app.id).padStart(3, '0')}`).toLowerCase().includes(term);
    }

    return statusMatch && searchMatch;
  });

  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10; // Change as needed

// Calculate total pages
const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

// Get applications for current page
const paginatedApplications = filteredApplications.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);


  // ...existing useEffect and fetchApplications...

  // Fetch SDM report for a given application id
  const checkSdmReport = async (id) => {
    try {
      const response = await axios.get(
        `https://lampserver.uppolice.co.in/validation-report/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data && response.data.status) {
        setSdmReports(prev => ({ ...prev, [id]: true }));
      } else {
        setSdmReports(prev => ({ ...prev, [id]: false }));
      }
    } catch {
      setSdmReports(prev => ({ ...prev, [id]: false }));
    }
  };

  // Fetch PS report for a given application id
  const checkPsReport = async (id) => {
    try {
      const response = await axios.get(
        `https://lampserver.uppolice.co.in/validation-report/ps/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data && response.data.status) {
        setPsReports(prev => ({ ...prev, [id]: true }));
      } else {
        setPsReports(prev => ({ ...prev, [id]: false }));
      }
    } catch {
      setPsReports(prev => ({ ...prev, [id]: false }));
    }
  };

  // Check reports for all applications after fetching
  useEffect(() => {
    applications.forEach(app => {
      checkSdmReport(app.id);
      checkPsReport(app.id);
    });
    // eslint-disable-next-line
  }, [applications]);


  useEffect(() => {
    if (!token) {
      console.error("Token not found. Redirecting to login.");
    } else {
      fetchApplications(token);
    }
  }, []);

  const fetchApplications = async (token) => {
    try {
      const response = await axios.get('https://lampserver.uppolice.co.in/arms/get-application', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Map API response to extract application objects
      const apps = response.data.data.map(item => ({
        ...item.application,
        documents: item.documents || []
      }));
      
      // Sort applications in descending order by created_at date (newest first)
      const sortedApps = apps.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA; // Descending order (newest first)
      });
      
      setApplications(sortedApps);
    } catch (error) {
      console.error('Error fetching applications', error);
    }
  };
  const handleAction = async (applicationId, action) => {
    // Map UI action to API action value
    let apiAction = '';
    let newStatus = '';
    
    if (action === 'sdm') {
      apiAction = 'forward_to_sdm';
      newStatus = 'In Progress';
    } else if (action === 'ps') {
      apiAction = 'forward_to_ps';
      newStatus = 'In Progress';
    } else if (action === 'return') {
      apiAction = 'return_to_user';
      newStatus = 'Returned';
    }
  
    try {
      const response = await axios.post(
        'https://lampserver.uppolice.co.in/arms/forward-to-sdm-ps',
        {
          application_id: applicationId,
          action: apiAction,
          comments: comments,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.data.status) {
        // Update local state immediately
        setApplications(prevApplications => 
          prevApplications.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        );
        
        alert(response.data.message || 'Action completed successfully.');
        setShowModal(false);
        setComments('');
      } else {
        alert('Failed to process the application.');
        setShowModal(false);
        setComments('');
      }
    } catch (error) {
      console.error(`Error processing application for ${action}`, error);
      alert('An error occurred while processing the application.');
      setShowModal(false);
      setComments('');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this application?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://lampserver.uppolice.co.in/arms/application/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplications((prev) => prev.filter((app) => app.id !== id));
      alert("Application deleted successfully!");
    } catch (error) {
      console.error("Failed to delete application", error);
      alert("Failed to delete application");
    }
  };

  // Function to open modal and set the selected application ID
  const openModal = (appId) => {
    setSelectedAppId(appId);
    setShowModal(true);
    setComments(''); // Reset comments when opening modal
  };

  // Function to close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedAppId(null);
    setComments('');
  };

  return (
    <div>
      <Sidebar />
      <div className="asside">
        <div className="about-first">
          <div className="row">
            <div className="col-12 mb-24">
              <div className="bg-box">
                <div className="pro-add-new px-0">
                  <p>
                     List Of Application <span>{filteredApplications.length}</span>
                  </p>
                  <div className="status-search">
                    <div>
                      <select
                        name="entryType"
                        className="form-control"
                        id="entryType"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                      >
                        <option value="Select Status">Select Status</option>
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Inprogress">In Progress</option>
                        <option value="Return">Returned</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="search"
                        className="form-control me-2"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>  
                  </div>
                </div>
                <div className="table-responsive dashboard-table">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Sr No</th>
                        <th scope="col">File No</th>
                        <th scope="col">Name</th>
                        <th scope="col">Mobile Number</th>
                        <th scope="col">Service Name</th>
                        <th scope="col">Application Date</th>
                        <th scope="col">Status</th>
                        <th scope="col">View</th>
                        <th scope="col">Action</th>
                        {/* <th scope="col">SDM Report</th>
                        <th scope="col">PS Report</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedApplications.map((app, index) => (
                        <tr key={app.id}>
                          <th scope="row">{(currentPage - 1) * itemsPerPage + index + 1}</th>
                          <td>{`F${String(app.id).padStart(3, '0')}`}</td>
                          <td>{app.applicant_name }</td>
                          <td>{app.mobile_number}</td>
                          <td>{app.service}</td>
                          <td>{app.created_at?.slice(0, 10).split("-").reverse().join("/")}</td>
                          <td>
                            <span
                              className={`badge ${app.status === 'Pending'
                                  ? 'bg-warning text-dark'
                                  : app.status === 'In Progress'
                                    ? 'bg-info text-dark'
                                    : app.status === 'Returned'
                                      ? 'bg-danger text-white'
                                      : 'bg-success'
                                }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td>
                            <div className="icon-up-del">
                              <button
                                type="button"
                                className="btn btn-primary me-2" 
                                data-bs-toggle="modal" 
                                data-bs-target="#exampleModal"
                                onClick={() => {
                                  setSelectedAppId(app.id);
                                
                                }}
                              >
                                View
                              </button>
                            </div>
                            {/* <Link to={`/filled-pdf/${app.id}`}>
                              <i className="fa-solid fa-eye text-success"></i>
                            </Link> */}
                          </td>
                          <td>
                            <div className="icon-up-del">
                              <button
                                type="button"
                                className="btn btn-primary me-2"
                                onClick={() => openModal(app.id)}
                              >
                                Send
                              </button>
                            </div>
                          </td>
                         {/* <td>
                        {sdmReports[app.id] ? (
                          <Link to={`/validation-report/${app.id}`} target='_blank'>
                            <i className="fa-solid fa-eye text-success"></i>
                          </Link>
                        ) : (
                          <span>NA</span>
                        )}
                      </td>
                      <td>
                        {psReports[app.id] ? (
                          <Link to={`/ps-report/${app.id}`} target='_blank'>
                            <i className="fa-solid fa-eye text-success"></i>
                          </Link>
                        ) : (
                          <span>NA</span>
                        )}
                      </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pro-add-new px-0 mb-0 pt-3">
                  <p>
                    {filteredApplications.length === 0
                      ? "No applications"
                      : `${(currentPage - 1) * itemsPerPage + 1} - ${
                          Math.min(currentPage * itemsPerPage, filteredApplications.length)
                        } of ${filteredApplications.length}`}
                  </p>
                  <nav aria-label="...">
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                          Previous
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item${currentPage === i + 1 ? " active" : ""}`}>
                          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item${currentPage === totalPages ? " disabled" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {/* Bootstrap Modal */}
      <div
        className={`modal fade ${showModal ? 'show d-block' : ''}`}
        tabIndex="-1"
        style={{ display: showModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Process Application</h5>
              <button type="button" className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="modal-body">
              <p>Please provide comments for the action:</p>
              <textarea
                className="form-control"
                rows="4"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter your comments here..."
              ></textarea>
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAction(selectedAppId, 'sdm')}
              >
                Forward to SDM
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAction(selectedAppId, 'ps')}
              >
                Forward to PS
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleAction(selectedAppId, 'return')}
              >
                Return to User
              </button>
              <Link to={'/OfficeReport'}
                type="button"
                className="btn btn-primary"
                // onClick={() => handleAction(selectedAppId, 'return')}
              >
                Send to CTM
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTM Report  */}
      <div class="modal fade" id="exampleModalToggle2" aria-hidden="true" aria-labelledby="exampleModalToggleLabel2" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalToggleLabel2">Modal 2</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              Hide this modal and show the first with the button below.
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary">Submit</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap Modal */}
      <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <a
                  href={`/filled-pdf/${selectedAppId}`}
                  className="btn btn-primary"
                  // target="_blank"
                  rel="noopener noreferrer"
                >
                  Application
                </a>
                            {/* <Link to={`/filled-pdf/${app.id}`}>
                              <i className="fa-solid fa-eye text-success"></i>
                            </Link> */}
              <a
                  href={`/validation-report/${selectedAppId}`}
                  className="btn btn-primary"
                  // target="_blank"
                  rel="noopener noreferrer"
                >
                 SDM Report
                </a>
              <a
                  href={`/ps-report/${selectedAppId}`}
                  className="btn btn-primary"
                  // target="_blank"
                  rel="noopener noreferrer"
                >
                  PS Report
                </a>
                 <a
                  href={`/office-report/${selectedAppId}`}
                  className="btn btn-primary"
                  // target="_blank"
                  rel="noopener noreferrer"
                >
                  Office Report
                </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;