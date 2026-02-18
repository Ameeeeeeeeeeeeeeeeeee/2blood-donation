import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { emergencyRequestAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './LifeLine.css';

const LifeLine = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: '',
    blood_type: '',
    hospital_name: '',
    hospital_location: '',
    contact_phone: '',
    urgency: 'normal',
    reason: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await emergencyRequestAPI.getAll();
      setRequests(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch emergency requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await emergencyRequestAPI.create(formData);
      setShowModal(false);
      setFormData({
        patient_name: '',
        blood_type: '',
        hospital_name: '',
        hospital_location: '',
        contact_phone: '',
        urgency: 'normal',
        reason: ''
      });
      fetchRequests();
    } catch (err) {
      setError('Failed to create request');
    }
  };

  const handleFulfill = async (id) => {
    if (window.confirm('Are you sure you want to mark this request as fulfilled?')) {
      try {
        await emergencyRequestAPI.fulfill(id);
        fetchRequests();
      } catch (err) {
        setError('Failed to update request');
      }
    }
  };

  const urgencyColors = {
    normal: '#4caf50',
    urgent: '#ff9800',
    emergency: '#f44336'
  };

  return (
    <div>
      <Navbar />
      <div className="lifeline-container">
        <div className="lifeline-header">
          <div className="header-text">
            <h1>Emergency LifeLine</h1>
            <p>Every second counts. Respond to urgent blood needs in your area.</p>
          </div>
          <button className="btn-request" onClick={() => setShowModal(true)}>
            Post Request
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">Checking for urgent needs...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌟</div>
            <h3>No Active Emergencies</h3>
            <p>Great news! There are currently no urgent blood requests. Continue being a regular donor to help maintain reserves.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map((request) => (
              <div key={request.id} className={`request-card ${request.urgency}`}>
                <div className="urgency-banner" style={{ backgroundColor: urgencyColors[request.urgency] }}>
                  {request.urgency.toUpperCase()}
                </div>
                <div className="request-body">
                  <div className="blood-type-big">{request.blood_type}</div>
                  <div className="request-main-info">
                    <h3>{request.patient_name}</h3>
                    <p className="hospital-info">🏠 {request.hospital_name}</p>
                    <p className="location-info">📍 {request.hospital_location}</p>
                  </div>
                </div>
                <div className="request-details">
                  <p><strong>Reason:</strong> {request.reason || 'Medical Emergency'}</p>
                  <p><strong>Contact:</strong> {request.contact_phone}</p>
                </div>
                <div className="request-footer">
                  <a href={`tel:${request.contact_phone}`} className="btn-call">Call Now</a>
                  {(request.requester === user?.id || user?.role === 'admin') && (
                    <button className="btn-fulfill" onClick={() => handleFulfill(request.id)}>
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Request Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h2>Post Emergency Request</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Patient Name</label>
                    <input type="text" name="patient_name" value={formData.patient_name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Blood Type Required</label>
                    <select name="blood_type" value={formData.blood_type} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Hospital Name</label>
                    <input type="text" name="hospital_name" value={formData.hospital_name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Hospital Location</label>
                    <input type="text" name="hospital_location" value={formData.hospital_location} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Urgency Level</label>
                    <select name="urgency" value={formData.urgency} onChange={handleChange}>
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Immediate Emergency</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Reason / Additional Info</label>
                  <textarea name="reason" value={formData.reason} onChange={handleChange} rows="3"></textarea>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-submit">Post LifeLine</button>
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LifeLine;
