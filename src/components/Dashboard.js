
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import axios from 'axios';
import TextEditor from './txtEditor';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [comments, setComments] = useState('');
  const [selectedPsOption, setSelectedPsOption] = useState('');
  const [selectedSdmOption, setSelectedSdmOption] = useState(''); // New state for SDM dropdown
  const token = localStorage.getItem("authToken");
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showCtmModal, setShowCtmModal] = useState(false);
  const [officeReport, setOfficeReport] = useState('');
  const [isSubmittingCtm, setIsSubmittingCtm] = useState(false);
  const [sdmReports, setSdmReports] = useState({});
  const [psReports, setPsReports] = useState({});
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApplications = applications.filter(app => {
    const status = (app.status || '').replace(/\s+/g, '').toLowerCase();
    const filter = (filterStatus || '').replace(/\s+/g, '').toLowerCase();

    let statusMatch = false;
    if (filter === 'all' || filter === 'selectstatus') statusMatch = true;
    else if (filter === 'pending') statusMatch = status === 'pending';
    else if (filter === 'inprogress') statusMatch = status === 'inprogress';
    else if (filter === 'returned' || filter === 'return') statusMatch = status === 'returned' || status === 'return';

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
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  useEffect(() => {
    applications.forEach(app => {
      checkSdmReport(app.id);
      checkPsReport(app.id);
    });
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
      const apps = response.data.data.map(item => ({
        ...item.application,
        documents: item.documents || []
      }));
      const sortedApps = apps.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA;
      });
      setApplications(sortedApps);
    } catch (error) {
      console.error('Error fetching applications', error);
    }
  };

  const handleAction = async (applicationId, action, option = '') => {
    let apiAction = '';
    let newStatus = '';

    if (action === 'sdm') {
      if (!option) {
        alert('Please select an SDM option.');
        return;
      }
      apiAction = `forward_to_${option.toLowerCase()}`;
      newStatus = 'In Progress';
    } else if (action === 'ps') {
      if (!option) {
        alert('Please select a PS option.');
        return;
      }
      apiAction = `forward_to_${option.toLowerCase()}`;
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
        setSelectedPsOption('');
        setSelectedSdmOption('');
      } else {
        alert('Failed to process the application.');
        setShowModal(false);
        setComments('');
        setSelectedPsOption('');
        setSelectedSdmOption('');
      }
    } catch (error) {
      console.error(`Error processing application for ${action}`, error);
      alert('An error occurred while processing the application.');
      setShowModal(false);
      setComments('');
      setSelectedPsOption('');
      setSelectedSdmOption('');
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

  const openModal = (appId) => {
    setSelectedAppId(appId);
    setShowModal(true);
    setComments('');
    setSelectedPsOption('');
    setSelectedSdmOption('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppId(null);
    setComments('');
    setSelectedPsOption('');
    setSelectedSdmOption('');
  };

  const openCtmModal = () => {
    setShowProcessModal(false);
    setShowCtmModal(true);
    setOfficeReport('');
  };

  const closeCtmModal = () => {
    setShowCtmModal(false);
    setShowModal(false);
    setOfficeReport('');
  };

  const handleCtmSubmission = async () => {
    if (!officeReport.trim()) {
      alert('Please write the office report before submitting.');
      return;
    }

    setIsSubmittingCtm(true);

    try {
      const response = await axios.post(
        'https://lampserver.uppolice.co.in/arms/forward-to-ctm',
        {
          application_id: selectedAppId,
          action: 'forward_to_ctm',
          office_report: officeReport,
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
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app.id === selectedAppId
              ? { ...app, status: 'Sent to CTM' }
              : app
          )
        );
        alert(response.data.message || 'Application sent to CTM successfully.');
        closeCtmModal();
      } else {
        alert('Failed to send application to CTM.');
      }
    } catch (error) {
      console.error('Error sending application to CTM', error);
      alert('An error occurred while sending the application to CTM.');
    } finally {
      setIsSubmittingCtm(false);
    }
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
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedApplications.map((app, index) => (
                        <tr key={app.id}>
                          <th scope="row">{(currentPage - 1) * itemsPerPage + index + 1}</th>
                          <td>{`F${String(app.id).padStart(3, '0')}`}</td>
                          <td>{app.applicant_name}</td>
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
                                onClick={() => setSelectedAppId(app.id)}
                              >
                                View
                              </button>
                            </div>
                          </td>
                          <td>
                              {/* <button
                                type="button"
                                className="btn btn-primary me-2"
                                onClick={() => openModal(app.id)}
                              >
                                Send
                              </button> */}
                                <button
                                  className="btn btn-custom-approve btn-sm me-2"
                                >
                                  <i className="fa-solid fa-check me-1"></i>
                                  Approve
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                >
                                  <i className="fa-solid fa-times me-1"></i>
                                  Reject
                                </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pro-add-new px-0 mb-0 pt-3">
                  <p>
                    {filteredApplications.length === 0
                      ? "No applications"
                      : `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredApplications.length)
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

      {showModal && !showCtmModal && (
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
              <div className="modal-footer offic-d-flex">
                <div className='d-flex gap-2 mb-2'>
                  <select
                    className="form-select"
                    value={selectedSdmOption}
                    onChange={(e) => setSelectedSdmOption(e.target.value)}
                    style={{ width: '200px' }}
                  >
                    <option value="" disabled>Select SDM</option>
                    <option value="SDM1">SDM1</option>
                    <option value="SDM2">SDM2</option>
                    <option value="SDM3">SDM3</option>
                    <option value="SDM4">SDM4</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleAction(selectedAppId, 'sdm', selectedSdmOption)}
                    disabled={!selectedSdmOption}
                  >
                    Forward to SDM
                  </button>
                </div>
                <div className='d-flex gap-2 mb-2'>
                  <select
                    className="form-select"
                    value={selectedPsOption}
                    onChange={(e) => setSelectedPsOption(e.target.value)}
                    style={{ width: '200px' }}
                  >
                    <option value="" disabled>Select PS</option>
                    <option value="PS1">PS1</option>
                    <option value="PS2">PS2</option>
                    <option value="PS3">PS3</option>
                    <option value="PS4">PS4</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleAction(selectedAppId, 'ps', selectedPsOption)}
                    disabled={!selectedPsOption}
                  >
                    Forward to PS
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleAction(selectedAppId, 'return')}
                  >
                    Return to User
                  </button>
                </div>
                <div>
                  <button type="button" className="btn btn-primary" onClick={openCtmModal}>
                    Send to CTM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCtmModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Office Report for CTM</h5>
                <button type="button" className="btn-close" onClick={closeCtmModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="officeReport" className="form-label">
                    <strong>Write Office Report:</strong>
                  </label>
                  <TextEditor
                    value={officeReport}
                    onChange={setOfficeReport}
                    placeholder="Write your detailed office report here. Use the toolbar for formatting options..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeCtmModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCtmSubmission}
                  disabled={isSubmittingCtm}
                >
                  {isSubmittingCtm ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit to CTM'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <a
                href={`/filled-pdf/${selectedAppId}`}
                className="btn btn-primary"
                rel="noopener noreferrer"
              >
                Application
              </a>
              <a
                href={`/validation-report/${selectedAppId}`}
                className="btn btn-primary"
                rel="noopener noreferrer"
              >
                SDM Report
              </a>
              <a
                href={`/ps-report/${selectedAppId}`}
                className="btn btn-primary"
                rel="noopener noreferrer"
              >
                PS Report
              </a>
              <a
                href={`/office-report/${selectedAppId}`}
                className="btn btn-primary"
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
