import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { donorAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { isDonor } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    phone: '',
    location: '',
    health_info: '',
    profile_image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isDonor) {
      navigate('/');
      return;
    }
    fetchProfile();
  }, [isDonor, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await donorAPI.getProfile();
      const donorData = response.data;
      setProfile(donorData);
      setFormData({
        age: donorData.age || '',
        phone: donorData.phone || '',
        location: donorData.location || '',
        health_info: donorData.health_info || '',
        profile_image: null,
      });
      if (donorData.profile_image_url) {
        setPreviewImage(donorData.profile_image_url);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    setSuccess('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setFormData({ ...formData, profile_image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const updateData = {
        age: parseInt(formData.age),
        phone: formData.phone,
        location: formData.location,
        health_info: formData.health_info,
      };

      if (formData.profile_image) {
        updateData.profile_image = formData.profile_image;
      }

      await donorAPI.updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        Object.values(err.response?.data || {}).flat().join(', ') ||
        'Failed to update profile';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="profile-container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h1>Update Profile</h1>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-form-section">
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="image-upload-section">
              <label className="image-upload-label">Profile Image</label>
              <div className="image-preview-container">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile preview"
                    className="profile-preview"
                  />
                ) : (
                  <div className="profile-placeholder-large">
                    {profile?.user?.first_name?.[0] || 'D'}
                  </div>
                )}
                <label className="file-input-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  Choose Image
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="100"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Health Information</label>
              <textarea
                name="health_info"
                value={formData.health_info}
                onChange={handleChange}
                rows="4"
                placeholder="Any relevant health information..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="submit-btn"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

