import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { donationAPI } from '../services/api';
import './Certificate.css';

const Certificate = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificateData();
  }, [recordId]);

  const fetchCertificateData = async () => {
    try {
      const response = await donationAPI.getCertificate(recordId);
      setCertData(response.data);
    } catch (err) {
      setError('Failed to load certificate data. Make sure the donation is completed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="cert-status">Generating Certificate...</div>;
  if (error) return (
    <div className="cert-status error">
      <p>{error}</p>
      <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );

  return (
    <div className="certificate-page">
      <div className="print-controls">
        <button onClick={() => navigate('/dashboard')} className="btn-back">← Back</button>
        <button onClick={handlePrint} className="btn-print">Print Certificate</button>
      </div>

      <div className="certificate-container" id="certificate">
        <div className="cert-border">
          <div className="cert-content">
            <div className="cert-header">
              <div className="cert-logo">🩸</div>
              <h1>Certificate of Appreciation</h1>
              <p className="cert-subtitle">Recognizing a Life-Saving Contribution</p>
            </div>

            <div className="cert-body">
              <p className="cert-text">This certificate is proudly awarded to</p>
              <h2 className="donor-name">{certData.donor_name}</h2>
              <p className="cert-text">
                in grateful recognition of their voluntary blood donation on
              </p>
              <h3 className="donation-date">{certData.donation_date}</h3>
              <p className="cert-text">
                at <strong>{certData.hospital_name}</strong>.
              </p>
              
              <div className="donation-details">
                <div className="detail">
                  <span className="label">Blood Type</span>
                  <span className="value">{certData.blood_type}</span>
                </div>
                <div className="detail">
                  <span className="label">Amount</span>
                  <span className="value">{certData.blood_amount}</span>
                </div>
              </div>

              <p className="cert-impact">
                "Your donation has the power to save lives. Thank you for your selfless contribution to our community."
              </p>
            </div>

            <div className="cert-footer">
              <div className="signature-area">
                <div className="signature-line"></div>
                <p>Medical Director</p>
                <p>{certData.hospital_location}</p>
              </div>
              <div className="cert-id">
                <p>Certificate ID: {certData.certificate_id}</p>
                <p>Issued on: {certData.issue_date}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
