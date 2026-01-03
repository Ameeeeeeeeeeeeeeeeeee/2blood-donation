import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { donationAPI, hospitalAPI } from '../services/api';
import './Donate.css';

const Donate = () => {
  const { isDonor } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    scheduled_date: '',
    scheduled_time: '',
    donation_type: 'station',
    preferred_hospital_id: '',
  });
  const [hospitals, setHospitals] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  useEffect(() => {
    if (!isDonor) {
      navigate('/');
      return;
    }
    fetchSchedules();
    fetchHospitals();
  }, [isDonor, navigate]);

  const fetchSchedules = async () => {
    try {
      const response = await donationAPI.getSchedules();
      setSchedules(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await hospitalAPI.getAll();
      setHospitals(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.scheduled_date || !formData.scheduled_time) {
      setError('Please select both date and time');
      setLoading(false);
      return;
    }

    if (formData.donation_type === 'station' && !formData.preferred_hospital_id) {
      setError('Please select a hospital');
      setLoading(false);
      return;
    }

    const scheduledDateTime = `${formData.scheduled_date}T${formData.scheduled_time}:00`;

    try {
      await donationAPI.schedule({
        scheduled_date: scheduledDateTime,
        donation_type: formData.donation_type,
        preferred_hospital_id: formData.preferred_hospital_id ? parseInt(formData.preferred_hospital_id) : null,
      });
      setSuccess('Donation scheduled successfully!');
      setFormData({
        scheduled_date: '',
        scheduled_time: '',
        donation_type: 'station',
        preferred_hospital_id: '',
      });
      fetchSchedules();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.scheduled_date?.[0] ||
        'Failed to schedule donation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return '#28a745';
      case 'canceled':
        return '#dc3545';
      default:
        return '#ffc107';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <Navbar />
      <div className="donate-container">
        <div className="donate-header">
          <h1>Schedule a Donation</h1>
          <p>Choose a convenient date and location for your blood donation</p>
        </div>

        <div className="donate-content">
          <div className="schedule-form-section">
            <h2>New Donation Schedule</h2>
            <div className="info-message">
              <strong>📋 Important:</strong> You can only donate blood once every 3 months. If you've donated recently, please wait before scheduling another donation.
            </div>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={handleSubmit} className="donate-form">
              <div className="form-group">
                <label>Donation Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="donation_type"
                      value="station"
                      checked={formData.donation_type === 'station'}
                      onChange={handleChange}
                    />
                    <span>🏥 Come to Station</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="donation_type"
                      value="home"
                      checked={formData.donation_type === 'home'}
                      onChange={handleChange}
                    />
                    <span>🏠 Come to Me</span>
                  </label>
                </div>
              </div>

              {formData.donation_type === 'station' && (
                <div className="form-group">
                  <label>Choose Hospital <span className="required">*</span></label>
                  <select
                    name="preferred_hospital_id"
                    value={formData.preferred_hospital_id}
                    onChange={handleChange}
                    className="hospital-select"
                    required
                  >
                    <option value="">Select a hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name} - {hospital.location}
                      </option>
                    ))}
                  </select>
                  {hospitals.length === 0 && (
                    <p className="no-hospitals-msg">No hospitals available. Please contact admin.</p>
                  )}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Date <span className="required">*</span></label>
                  <input
                    type="date"
                    name="scheduled_date"
                    value={formData.scheduled_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time <span className="required">*</span></label>
                  <input
                    type="time"
                    name="scheduled_time"
                    value={formData.scheduled_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? 'Scheduling...' : 'Schedule Donation'}
              </button>
            </form>
          </div>

          <div className="schedules-section">
            <h2>Your Schedules</h2>
            {loadingSchedules ? (
              <div className="loading">Loading schedules...</div>
            ) : schedules.length === 0 ? (
              <div className="no-schedules">
                No scheduled donations yet. Schedule your first donation above!
              </div>
            ) : (
              <div className="schedules-list">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="schedule-card">
                    <div className="schedule-header">
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(schedule.status),
                        }}
                      >
                        {schedule.status.toUpperCase()}
                      </span>
                      <span className="donation-type">
                        {schedule.donation_type === 'station'
                          ? '🏥 At Station'
                          : '🏠 Home Visit'}
                      </span>
                    </div>
                    <div className="schedule-details">
                      <p>
                        <strong>Date & Time:</strong>{' '}
                        {formatDate(schedule.scheduled_date)}
                      </p>
                      {schedule.preferred_hospital && (
                        <p>
                          <strong>Hospital:</strong>{' '}
                          {schedule.preferred_hospital.name}
                        </p>
                      )}
                      <p>
                        <strong>Created:</strong>{' '}
                        {formatDate(schedule.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
