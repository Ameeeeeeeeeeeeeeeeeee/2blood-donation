import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { hospitalAPI } from '../services/api';
import './Hospitals.css';

const Hospitals = () => {
  const { isAuthenticated } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMapUrl, setSelectedMapUrl] = useState('');
  const [showMap, setShowMap] = useState(false);

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

  const handleViewMap = (hospital) => {
    const query = encodeURIComponent(`${hospital.name} ${hospital.location}`);
    // Using the embed API format which is more reliable
    setSelectedMapUrl(`https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`);
    setShowMap(true);
  };

  const filteredHospitals = hospitals.filter(hospital => 
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div className="hospitals-container">
        <div className="hospitals-header">
          <h1>Our Partner Hospitals</h1>
          <p>Find nearby hospitals and support their life-saving missions</p>
          
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by hospital name or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Locating partner hospitals...</p>
          </div>
        ) : error ? (
          <div className="error-box">
            <p>Oops! {error}</p>
            <button onClick={fetchHospitals}>Retry</button>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="no-hospitals">
            <div className="no-result-icon">🗺️</div>
            <h3>No hospitals found</h3>
            <p>We couldn't find any hospitals matching "{searchTerm}".</p>
          </div>
        ) : (
          <div className="hospitals-grid">
            {filteredHospitals.map((hospital) => (
              <div key={hospital.id} className="hospital-card">
                <div className="hospital-premium-badge">Partner</div>
                <div className="hospital-card-content">
                  <div className="hospital-icon-circle">🏥</div>
                  <h2>{hospital.name}</h2>
                  <p className="hospital-location">
                    <span className="location-pin">📍</span> {hospital.location}
                  </p>
                  
                  <div className="hospital-stats-modern">
                    <div className="modern-stat">
                      <span className="stat-num">{hospital.total_blood_received}</span>
                      <span className="stat-text">Units</span>
                    </div>
                    <div className="modern-stat">
                      <span className="stat-num">{hospital.total_lives_saved}</span>
                      <span className="stat-text">Saved</span>
                    </div>
                  </div>

                  <button 
                    className="btn-map"
                    onClick={() => handleViewMap(hospital)}
                  >
                    🗺️ View on Map
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Google Maps Modal */}
        {showMap && (
          <div className="map-modal-overlay" onClick={() => setShowMap(false)}>
            <div className="map-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Hospital Location</h3>
                <button className="close-btn" onClick={() => setShowMap(false)}>&times;</button>
              </div>
              <div className="map-frame-container">
                <iframe 
                  title="Hospital Map"
                  width="100%" 
                  height="450" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight="0" 
                  marginWidth="0" 
                  src={selectedMapUrl}
                ></iframe>
              </div>
              <div className="modal-footer">
                <p>Location data provided by Google Maps</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hospitals;

