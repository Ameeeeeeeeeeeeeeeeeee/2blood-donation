import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { hospitalAPI } from '../services/api';
import './Hospitals.css';

const Hospitals = () => {
  const { isAuthenticated } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchHospitals();
  }, [isAuthenticated]);

  const fetchHospitals = async () => {
    try {
      const response = await hospitalAPI.getAll();
      setHospitals(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load hospitals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="hospitals-container">
        <div className="hospitals-header">
          <h1>Our Partner Hospitals</h1>
          <p>View statistics from hospitals we work with in Woliso</p>
        </div>

        {loading ? (
          <div className="loading">Loading hospitals...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : hospitals.length === 0 ? (
          <div className="no-hospitals">
            No hospitals found. Please check back later.
          </div>
        ) : (
          <div className="hospitals-grid">
            {hospitals.map((hospital) => (
              <div key={hospital.id} className="hospital-card">
                <div className="hospital-icon">🏥</div>
                <h2>{hospital.name}</h2>
                <p className="hospital-location">{hospital.location}</p>
                <div className="hospital-stats">
                  <div className="stat-item">
                    <div className="stat-value">{hospital.total_blood_received}</div>
                    <div className="stat-label">Blood Units Received</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{hospital.total_lives_saved}</div>
                    <div className="stat-label">Lives Saved</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hospitals;

