import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { donorAPI } from '../services/api';
import './CompleteProfile.css';

const CompleteProfile = () => {
  const { isDonor, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    phone: '',
    location: '',
    blood_type: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'None'];

  useEffect(() => {
    if (!isDonor) {
      navigate('/dashboard');
      return;
    }

    // Check if profile is already complete
    checkProfile();
  }, [isDonor, navigate]);

  const checkProfile = async () => {
    try {
      const response = await donorAPI.getProfile();
      const donor = response.data;
      
      // If profile is already complete, redirect to dashboard
      if (donor.age && donor.location && donor.blood_type) {
        navigate('/dashboard');
        return;
      }

      // Pre-fill form if some data exists
      if (donor.age) setFormData(prev => ({ ...prev, age: donor.age }));
      if (donor.weight) setFormData(prev => ({ ...prev, weight: donor.weight }));
      if (donor.phone) setFormData(prev => ({ ...prev, phone: donor.phone }));
      if (donor.location) setFormData(prev => ({ ...prev, location: donor.location }));
      if (donor.blood_type) setFormData(prev => ({ ...prev, blood_type: donor.blood_type }));
      
      setChecking(false);
    } catch (err) {
      console.error('Error checking profile:', err);
      setChecking(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.age || !formData.weight || !formData.location || !formData.blood_type) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.age < 18 || formData.age > 100) {
      setError('Age must be between 18 and 100');
      return;
    }

    // Validate weight - must be above 50kg
    const weight = parseFloat(formData.weight);
    if (isNaN(weight) || weight <= 50) {
      setError('Weight must be above 50kg to be eligible for blood donation');
      return;
    }

    setLoading(true);

    try {
      await donorAPI.updateProfile(formData);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        Object.values(err.response?.data || {}).flat().join(', ') ||
        'Failed to save profile information';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div>
        <Navbar />
        <div className="complete-profile-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="complete-profile-container">
        <div className="complete-profile-card">
          <div className="profile-header">
            <h1>Complete Your Profile</h1>
            <p>Please provide some additional information to complete your donor profile</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="complete-profile-form">
            <div className="form-group">
              <label htmlFor="age">
                Age <span className="required">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="18"
                max="100"
                required
                placeholder="Enter your age"
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">
                Weight (kg) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="50.01"
                step="0.1"
                required
                placeholder="Enter your weight in kg (must be above 50kg)"
              />
              <small className="field-hint">Weight must be above 50kg to be eligible for blood donation</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">
                Location <span className="required">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Enter your location (e.g., Woliso)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="blood_type">
                Blood Type <span className="required">*</span>
              </label>
              <select
                id="blood_type"
                name="blood_type"
                value={formData.blood_type}
                onChange={handleChange}
                required
                className="blood-type-select"
              >
                <option value="">Select your blood type</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;

