import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { donationAPI, adminAPI, hospitalAPI } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Hospital form
  // Hospital form
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [newHospital, setNewHospital] = useState({ name: '', location: '' });
  
  // LifeLine state
  const [bloodRequests, setBloodRequests] = useState([]);
  const [bloodRequestsLoading, setBloodRequestsLoading] = useState(false);

  // Modal states
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showMarkDoneModal, setShowMarkDoneModal] = useState(false);
  const [markDoneData, setMarkDoneData] = useState({
    hospital_id: '',
    blood_amount: 1.0,
  });
  const [showUpdateLivesModal, setShowUpdateLivesModal] = useState(false);
  const [updateLivesData, setUpdateLivesData] = useState({ lives_saved: 1 });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (activeTab === 'lifeline') {
      fetchBloodRequests();
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [statsRes, schedulesRes, hospitalsRes, donorsRes] = await Promise.all([
        adminAPI.getStats(),
        donationAPI.getSchedules(),
        hospitalAPI.getAll(),
        adminAPI.getDonors(),
      ]);
      setStats(statsRes.data);
      setSchedules(schedulesRes.data.results || schedulesRes.data);
      setHospitals(hospitalsRes.data.results || hospitalsRes.data);
      setDonors(donorsRes.data.results || donorsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBloodRequests = async () => {
    setBloodRequestsLoading(true);
    try {
      const response = await adminAPI.getBloodRequests();
      setBloodRequests(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load LifeLine requests');
    } finally {
      setBloodRequestsLoading(false);
    }
  };

  const handleMarkDone = async () => {
    try {
      await adminAPI.markScheduleDone(selectedSchedule.id, markDoneData);
      setSuccess('Donation marked as completed!');
      setShowMarkDoneModal(false);
      setSelectedSchedule(null);
      setMarkDoneData({ hospital_id: '', blood_amount: 1.0 });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark as done');
    }
  };

  const handleCancel = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to cancel this schedule?')) {
      return;
    }
    try {
      await adminAPI.markScheduleCanceled(scheduleId);
      setSuccess('Schedule canceled successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel schedule');
    }
  };

  const handleAddHospital = async (e) => {
    e.preventDefault();
    try {
      if (editingHospital) {
        await adminAPI.updateHospital(editingHospital.id, newHospital);
        setSuccess('Hospital updated successfully!');
      } else {
        await adminAPI.addHospital(newHospital);
        setSuccess('Hospital added successfully!');
      }
      setNewHospital({ name: '', location: '' });
      setShowAddHospital(false);
      setEditingHospital(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save hospital');
    }
  };

  const handleDeleteHospital = async (id) => {
    if (!window.confirm('Are you sure you want to remove this hospital?')) {
      return;
    }
    try {
      await adminAPI.deleteHospital(id);
      setSuccess('Hospital removed successfully!');
      fetchData();
    } catch (err) {
      setError('Failed to delete hospital. It might have donation records.');
    }
  };

  const handleDeleteLifeLine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this emergency request?')) {
      return;
    }
    try {
      await adminAPI.deleteBloodRequest(id);
      setSuccess('Request deleted successfully!');
      fetchBloodRequests();
    } catch (err) {
      setError('Failed to delete emergency request');
    }
  };

  const handleUpdateLivesSaved = async () => {
    try {
      await adminAPI.updateLivesSaved(selectedSchedule.record.id, updateLivesData);
      setSuccess('Lives saved updated successfully!');
      setShowUpdateLivesModal(false);
      setSelectedSchedule(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update lives saved');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status) => {
    const colors = {
      done: { bg: '#d4edda', text: '#155724' },
      pending: { bg: '#fff3cd', text: '#856404' },
      canceled: { bg: '#f8d7da', text: '#721c24' },
    };
    const style = colors[status] || colors.pending;
    return (
      <span className="status-badge" style={{ backgroundColor: style.bg, color: style.text }}>
        {status.toUpperCase()}
      </span>
    );
  };

  const pendingSchedules = schedules.filter((s) => s.status === 'pending');
  const doneSchedules = schedules.filter((s) => s.status === 'done');
  const canceledSchedules = schedules.filter((s) => s.status === 'canceled');

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="admin-container">
          <div className="loading">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage donations, hospitals, and donors</p>
        </div>

        {error && (
          <div className="alert alert-error" onClick={() => setError('')}>
            {error} <span className="dismiss">(click to dismiss)</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success" onClick={() => setSuccess('')}>
            {success} <span className="dismiss">(click to dismiss)</span>
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'schedules' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedules')}
          >
            Schedules
          </button>
          <button
            className={`tab-btn ${activeTab === 'hospitals' ? 'active' : ''}`}
            onClick={() => setActiveTab('hospitals')}
          >
            Hospitals
          </button>
          <button
            className={`tab-btn ${activeTab === 'donors' ? 'active' : ''}`}
            onClick={() => setActiveTab('donors')}
          >
            Donors
          </button>
          <button
            className={`tab-btn ${activeTab === 'lifeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('lifeline')}
          >
            LifeLine 🆘
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats?.total_donors || 0}</h3>
                  <p>Total Donors</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏥</div>
                <div className="stat-info">
                  <h3>{stats?.total_hospitals || 0}</h3>
                  <p>Hospitals</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🩸</div>
                <div className="stat-info">
                  <h3>{stats?.total_donations || 0}</h3>
                  <p>Total Donations</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{stats?.pending_schedules || 0}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❤️</div>
                <div className="stat-info">
                  <h3>{stats?.total_lives_saved || 0}</h3>
                  <p>Lives Saved</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💉</div>
                <div className="stat-info">
                  <h3>{stats?.total_blood_units?.toFixed(1) || 0}</h3>
                  <p>Blood Units</p>
                </div>
              </div>
            </div>

            <div className="quick-section">
              <h2>Recent Pending Schedules</h2>
              {pendingSchedules.length === 0 ? (
                <p className="no-data">No pending schedules</p>
              ) : (
                <div className="schedules-list">
                  {pendingSchedules.slice(0, 5).map((schedule) => (
                    <div key={schedule.id} className="schedule-card">
                      <div className="schedule-info">
                        <strong>{schedule.donor?.user?.first_name} {schedule.donor?.user?.last_name}</strong>
                        <span>{formatDate(schedule.scheduled_date)}</span>
                        <span className="type-badge">
                          {schedule.donation_type === 'station' ? '🏢 Station' : '🏠 Home'}
                        </span>
                      </div>
                      <div className="schedule-actions">
                        <button
                          className="btn-success btn-sm"
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setShowMarkDoneModal(true);
                          }}
                        >
                          ✓ Done
                        </button>
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => handleCancel(schedule.id)}
                        >
                          ✗ Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedules Tab */}
        {activeTab === 'schedules' && (
          <div className="tab-content">
            <div className="schedules-section">
              <h2>Pending Schedules ({pendingSchedules.length})</h2>
              <div className="schedules-list">
                {pendingSchedules.length === 0 ? (
                  <p className="no-data">No pending schedules</p>
                ) : (
                  pendingSchedules.map((schedule) => (
                    <div key={schedule.id} className="schedule-card detailed">
                      <div className="schedule-header">
                        {getStatusBadge(schedule.status)}
                        <span className="type-badge">
                          {schedule.donation_type === 'station' ? '🏢 At Station' : '🏠 Home Visit'}
                        </span>
                      </div>
                      <div className="schedule-body">
                        <p><strong>Donor:</strong> {schedule.donor?.user?.first_name} {schedule.donor?.user?.last_name}</p>
                        <p><strong>Email:</strong> {schedule.donor?.user?.email}</p>
                        <p><strong>Phone:</strong> {schedule.donor?.phone || 'N/A'}</p>
                        <p><strong>Location:</strong> {schedule.donor?.location || 'N/A'}</p>
                        <p><strong>Blood Type:</strong> {schedule.donor?.blood_type || 'N/A'}</p>
                        <p><strong>Scheduled:</strong> {formatDate(schedule.scheduled_date)}</p>
                      </div>
                      <div className="schedule-actions">
                        <button
                          className="btn-success"
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setShowMarkDoneModal(true);
                          }}
                        >
                          Mark as Done
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleCancel(schedule.id)}
                        >
                          Cancel Schedule
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="schedules-section">
              <h2>Completed Donations ({doneSchedules.length})</h2>
              <div className="schedules-list">
                {doneSchedules.length === 0 ? (
                  <p className="no-data">No completed donations</p>
                ) : (
                  doneSchedules.map((schedule) => (
                    <div key={schedule.id} className="schedule-card detailed">
                      <div className="schedule-header">
                        {getStatusBadge(schedule.status)}
                      </div>
                      <div className="schedule-body">
                        <p><strong>Donor:</strong> {schedule.donor?.user?.first_name} {schedule.donor?.user?.last_name}</p>
                        <p><strong>Date:</strong> {formatDate(schedule.scheduled_date)}</p>
                        {schedule.record && (
                          <>
                            <p><strong>Hospital:</strong> {schedule.record.hospital?.name || 'Not specified'}</p>
                            <p><strong>Blood Amount:</strong> {schedule.record.blood_amount} units</p>
                          </>
                        )}
                      </div>
                      {schedule.record && (
                        <div className="schedule-actions">
                          <button
                            className="btn-info"
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setUpdateLivesData({ lives_saved: 1 });
                              setShowUpdateLivesModal(true);
                            }}
                          >
                            Update Lives Saved
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="schedules-section">
              <h2>Canceled Schedules ({canceledSchedules.length})</h2>
              <div className="schedules-list">
                {canceledSchedules.length === 0 ? (
                  <p className="no-data">No canceled schedules</p>
                ) : (
                  canceledSchedules.map((schedule) => (
                    <div key={schedule.id} className="schedule-card detailed">
                      <div className="schedule-header">
                        {getStatusBadge(schedule.status)}
                      </div>
                      <div className="schedule-body">
                        <p><strong>Donor:</strong> {schedule.donor?.user?.first_name} {schedule.donor?.user?.last_name}</p>
                        <p><strong>Scheduled Date:</strong> {formatDate(schedule.scheduled_date)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hospitals Tab */}
        {activeTab === 'hospitals' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Hospitals ({hospitals.length})</h2>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowAddHospital(!showAddHospital);
                  setEditingHospital(null);
                  setNewHospital({ name: '', location: '' });
                }}
              >
                {showAddHospital ? 'Cancel' : '+ Add Hospital'}
              </button>
            </div>

            {showAddHospital && (
              <div className="add-form">
                <h3>{editingHospital ? 'Edit Hospital' : 'Add New Hospital'}</h3>
                <form onSubmit={handleAddHospital}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Hospital Name</label>
                      <input
                        type="text"
                        value={newHospital.name}
                        onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                        placeholder="Enter hospital name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={newHospital.location}
                        onChange={(e) => setNewHospital({ ...newHospital, location: e.target.value })}
                        placeholder="Enter location (e.g., Woliso)"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">
                    {editingHospital ? 'Update Hospital' : 'Add Hospital'}
                  </button>
                </form>
              </div>
            )}

            <div className="hospitals-grid">
              {hospitals.map((hospital) => (
                <div key={hospital.id} className="hospital-card">
                  <h3>{hospital.name}</h3>
                  <p className="location">📍 {hospital.location}</p>
                  <div className="hospital-stats">
                    <div className="h-stat">
                      <span className="h-value">{hospital.total_blood_received}</span>
                      <span className="h-label">Blood Units</span>
                    </div>
                    <div className="h-stat">
                      <span className="h-value">{hospital.total_lives_saved}</span>
                      <span className="h-label">Lives Saved</span>
                    </div>
                  </div>
                  <div className="hospital-actions">
                    <button 
                      className="btn-edit-sm"
                      onClick={() => {
                        setEditingHospital(hospital);
                        setNewHospital({ name: hospital.name, location: hospital.location });
                        setShowAddHospital(true);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn-delete-sm"
                      onClick={() => handleDeleteHospital(hospital.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donors Tab */}
        {activeTab === 'donors' && (
          <div className="tab-content">
            <h2>All Donors ({donors.length})</h2>
            <div className="donors-table-container">
              <table className="donors-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Blood Type</th>
                    <th>Donations</th>
                    <th>Lives Saved</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">No donors registered yet</td>
                    </tr>
                  ) : (
                    donors.map((donor) => (
                      <tr key={donor.id}>
                        <td>{donor.user?.first_name} {donor.user?.last_name}</td>
                        <td>{donor.user?.email}</td>
                        <td>{donor.phone || 'N/A'}</td>
                        <td>{donor.location || 'N/A'}</td>
                        <td>
                          {donor.blood_type ? (
                            <span className="blood-badge">{donor.blood_type}</span>
                          ) : 'N/A'}
                        </td>
                        <td>{donor.total_donations}</td>
                        <td>{donor.lives_saved}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LifeLine Tab */}
        {activeTab === 'lifeline' && (
          <div className="tab-content">
            <h2>Emergency Requests Management ({bloodRequests.length})</h2>
            {bloodRequestsLoading ? (
              <div className="loading">Loading requests...</div>
            ) : (
              <div className="admin-requests-list">
                {bloodRequests.length === 0 ? (
                  <p className="no-data">No emergency requests found</p>
                ) : (
                  <div className="donors-table-container">
                    <table className="donors-table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Type</th>
                          <th>Hospital</th>
                          <th>Urgency</th>
                          <th>Status</th>
                          <th>Requested By</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bloodRequests.map((req) => (
                          <tr key={req.id}>
                            <td>{req.patient_name}</td>
                            <td><span className="blood-badge">{req.blood_type}</span></td>
                            <td>{req.hospital_name}</td>
                            <td>
                              <span className={`urgency-tag ${req.urgency}`}>
                                {req.urgency}
                              </span>
                            </td>
                            <td>
                              {req.is_fulfilled ? 
                                <span className="fulfilled-tag">Resolved</span> : 
                                <span className="active-tag">Active</span>
                              }
                            </td>
                            <td>{req.requester_name}</td>
                            <td>
                              <button 
                                className="btn-delete-sm"
                                onClick={() => handleDeleteLifeLine(req.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mark Done Modal */}
        {showMarkDoneModal && selectedSchedule && (
          <div className="modal-overlay" onClick={() => setShowMarkDoneModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Complete Donation</h3>
              <p className="modal-subtitle">
                Mark donation by {selectedSchedule.donor?.user?.first_name} as completed
              </p>
              <div className="form-group">
                <label>Hospital</label>
                <select
                  value={markDoneData.hospital_id}
                  onChange={(e) => setMarkDoneData({ ...markDoneData, hospital_id: e.target.value })}
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Blood Amount (units)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="2"
                  value={markDoneData.blood_amount}
                  onChange={(e) => setMarkDoneData({ ...markDoneData, blood_amount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="modal-actions">
                <button className="btn-success" onClick={handleMarkDone}>
                  Confirm Donation
                </button>
                <button className="btn-secondary" onClick={() => setShowMarkDoneModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Lives Modal */}
        {showUpdateLivesModal && selectedSchedule?.record && (
          <div className="modal-overlay" onClick={() => setShowUpdateLivesModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Update Lives Saved</h3>
              <p className="modal-subtitle">
                Record how many lives were saved from this donation
              </p>
              <div className="form-group">
                <label>Number of Lives Saved</label>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={updateLivesData.lives_saved}
                  onChange={(e) => setUpdateLivesData({ lives_saved: parseInt(e.target.value) || 1 })}
                />
                <small>Typically 1 donation can save up to 3 lives</small>
              </div>
              <div className="modal-actions">
                <button className="btn-success" onClick={handleUpdateLivesSaved}>
                  Update
                </button>
                <button className="btn-secondary" onClick={() => setShowUpdateLivesModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
