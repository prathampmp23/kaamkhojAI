import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import server from '../environment';
import './DashboardPage.css';

const DashboardPage = () => {
  const { currentUser, isAuthenticated } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [myApplications, setMyApplications] = useState([]);

  const [myJobs, setMyJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState([]);

  const [postJobForm, setPostJobForm] = useState({
    jobName: '',
    company: '',
    jobDescription: '',
    location: '',
    salary: '',
    category: 'other',
    minAge: 18,
    availability: 'full-time',
    skillsRequired: '',
    experience: '',
  });

  const navigate = useNavigate();
  const server_url = `${server}`;

  const role = useMemo(() => (currentUser?.role || 'seeker').toLowerCase(), [currentUser?.role]);

  const content = {
    hi: {
      title: 'डैशबोर्ड',
      loading: 'लोड हो रहा है...',
      welcome: 'आपका स्वागत है',
      noActivity: 'कोई हाल की गतिविधि नहीं',
      jobApplications: 'नौकरी के आवेदन',
      profile: 'प्रोफाइल',
      viewProfile: 'प्रोफाइल देखें',
      editProfile: 'प्रोफाइल संपादित करें',
      name: 'नाम',
      profileIncomplete: 'अपनी प्रोफ़ाइल अभी तक पूरी नहीं है',
      browseJobs: 'नौकरियां ब्राउज़ करें',
      completeProfileWithAI: 'AI सहायक के साथ प्रोफ़ाइल पूरा करें',
      createProfileForJobs: 'व्यक्तिगत नौकरी सिफारिशें प्राप्त करने के लिए हमारे AI सहायक के साथ अपनी प्रोफ़ाइल बनाएं',
    },
    en: {
      title: 'Dashboard',
      loading: 'Loading...',
      welcome: 'Welcome',
      noActivity: 'No activity found',
      jobApplications: 'Job Applications',
      profile: 'Profile',
      viewProfile: 'View Profile',
      editProfile: 'Edit Profile',
      name: 'Name',
      profileIncomplete: 'Your profile is not complete yet',
      browseJobs: 'Browse Jobs',
      completeProfileWithAI: 'Complete Profile with AI Assistant',
      createProfileForJobs: 'Create your profile with our AI Assistant to get personalized job recommendations',
    },
    mr: {
      title: 'डॅशबोर्ड',
      loading: 'लोड होत आहे...',
      welcome: 'स्वागत आहे',
      noActivity: 'अलीकडील क्रियाकलाप नाहीत',
      jobApplications: 'नोकरी अर्ज',
      profile: 'प्रोफाइल',
      viewProfile: 'प्रोफाइल पहा',
      editProfile: 'प्रोफाइल संपादित करा',
      name: 'नाव',
      profileIncomplete: 'आपले प्रोफाइल अजून पूर्ण नाही',
      browseJobs: 'नोकऱ्या ब्राउझ करा',
      completeProfileWithAI: 'AI सहाय्यकाशी प्रोफाइल पूर्ण करा',
      createProfileForJobs: 'वैयक्तिक नोकरी शिफारसींसाठी आमच्या AI सहाय्यकाशी आपले प्रोफाइल तयार करा',
    },
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(false);
  }, [isAuthenticated, navigate, i18n]);

  useEffect(() => {
    setLanguage(i18n.language || 'en');
  }, [i18n.language]);

  useEffect(() => {
    const run = async () => {
      if (!isAuthenticated || !currentUser) return;

      const token = localStorage.getItem('token');
      if (!token) return;

      setLoadingProfile(true);
      try {
        const profileRes = await fetch(`${server_url}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        setProfile(profileRes.ok ? profileData.profile || null : null);

        if (role === 'seeker') {
          const appsRes = await fetch(`${server_url}/api/applications/mine`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const appsData = await appsRes.json();
          setMyApplications(appsRes.ok ? appsData.applications || [] : []);
        }

        if (role === 'giver') {
          const jobsRes = await fetch(`${server_url}/api/jobs/mine`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const jobsData = await jobsRes.json();
          setMyJobs(jobsRes.ok ? jobsData.jobs || [] : []);
        }
      } catch (e) {
        console.error('Dashboard load error:', e);
        setProfile(null);
        setMyApplications([]);
        setMyJobs([]);
      } finally {
        setLoadingProfile(false);
      }
    };

    run();
  }, [isAuthenticated, currentUser, role, server_url]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem('preferredLanguage', lang);
    } catch {}
    i18n.changeLanguage(lang);
  };

  const handlePostJobChange = (e) => {
    const { name, value } = e.target;
    setPostJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing');

      const res = await fetch(`${server_url}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...postJobForm,
          minAge: Number(postJobForm.minAge),
          skillsRequired: postJobForm.skillsRequired,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create job');

      const jobsRes = await fetch(`${server_url}/api/jobs/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobsData = await jobsRes.json();
      setMyJobs(jobsRes.ok ? jobsData.jobs || [] : []);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to create job');
    }
  };

  const viewApplicants = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing');

      setSelectedJobId(jobId);
      const res = await fetch(`${server_url}/api/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load applicants');
      setSelectedJobApplicants(data.applications || []);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to load applicants');
      setSelectedJobApplicants([]);
    }
  };

  const refreshMyApplications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const appsRes = await fetch(`${server_url}/api/applications/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const appsData = await appsRes.json();
    setMyApplications(appsRes.ok ? appsData.applications || [] : []);
  };

  const unapplyFromJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing');

      const res = await fetch(`${server_url}/api/applications/job/${jobId}/withdraw`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to unapply');

      await refreshMyApplications();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to unapply');
    }
  };

  const deleteJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing');

      const res = await fetch(`${server_url}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete job');

      const jobsRes = await fetch(`${server_url}/api/jobs/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobsData = await jobsRes.json();
      setMyJobs(jobsRes.ok ? jobsData.jobs || [] : []);

      if (selectedJobId === jobId) {
        setSelectedJobId(null);
        setSelectedJobApplicants([]);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete job');
    }
  };

  const setApplicantStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing');

      const res = await fetch(`${server_url}/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');

      setSelectedJobApplicants((prev) =>
        prev.map((a) => (a._id === applicationId ? { ...a, status: data.application?.status || status } : a))
      );
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <NavigationBar language={language} onLanguageChange={handleLanguageChange} />
        <div className="dashboard-container loading">
          <p>{content[language].loading}</p>
        </div>
        <Footer language={language} />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <NavigationBar language={language} onLanguageChange={handleLanguageChange} />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>{content[language].title}</h1>
          <p>
            {content[language].welcome}, {currentUser?.username || 'User'}
          </p>
          <p className="dashboard-subtitle">Role: {role}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h2>{content[language].profile}</h2>
            </div>
            <div className="card-body">
              {loadingProfile ? (
                <p>{content[language].loading}</p>
              ) : profile ? (
                <>
                  <p>
                    <strong>{content[language].name}:</strong> {profile.name || '-'}
                  </p>
                  <p>
                    <strong>Job Type:</strong> {profile.job_title || '-'}
                  </p>
                  <p>
                    <strong>Experience:</strong> {profile.experience ?? '-'}
                  </p>
                  <p>
                    <strong>Phone:</strong> {profile.phone || '-'}
                  </p>
                  <p>
                    <strong>Address:</strong> {profile.address || '-'}
                  </p>
                  <div className="action-buttons">
                    <button className="action-button primary" onClick={() => navigate('/profile')}>
                      {content[language].viewProfile}
                    </button>
                    <button className="action-button secondary" onClick={() => navigate('/assistant')}>
                      {content[language].editProfile}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="profile-incomplete">{content[language].profileIncomplete}</p>
                  <div className="action-buttons">
                    <button className="action-button primary" onClick={() => navigate('/assistant')}>
                      {content[language].completeProfileWithAI}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {role === 'seeker' ? (
            <div className="dashboard-card">
              <div className="card-header">
                <h2>{content[language].jobApplications}</h2>
                <span className="badge">{myApplications.length}</span>
              </div>
              <div className="card-body">
                {myApplications.length > 0 ? (
                  <div className="jobs-grid" style={{ gridTemplateColumns: '1fr' }}>
                    {myApplications.slice(0, 3).map((app) => (
                      <div key={app._id} className="job-card">
                        <h3>{app.job?.jobName || 'Job'}</h3>
                        <p className="job-description">{app.job?.company || ''}</p>
                        <div className="job-details">
                          <p>📍 {app.job?.location || ''}</p>
                          <p>💰 {app.job?.salary || ''}</p>
                        </div>
                        <p className="status-row">
                          <span className={`status-pill status-${app.status}`}>{app.status}</span>
                        </p>

                        {app.status !== 'withdrawn' && app.status !== 'hired' && (
                          <div className="row-actions">
                            <button
                              type="button"
                              className="action-button danger small"
                              onClick={() => unapplyFromJob(app.job?._id)}
                              disabled={!app.job?._id}
                            >
                              Withdraw
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>{content[language].noActivity}</p>
                )}
                <div className="card-actions">
                  <button className="action-button secondary" onClick={() => navigate('/jobs')}>
                    {content[language].browseJobs}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-card dashboard-card--wide">
              <div className="card-header">
                <h2>Post a Job</h2>
              </div>
              <div className="card-body">
                <form onSubmit={submitJob} className="dashboard-form">
                  <input name="jobName" placeholder="Job Name" value={postJobForm.jobName} onChange={handlePostJobChange} />
                  <input name="company" placeholder="Company" value={postJobForm.company} onChange={handlePostJobChange} />
                  <input name="location" placeholder="Location" value={postJobForm.location} onChange={handlePostJobChange} />
                  <input name="salary" placeholder="Salary" value={postJobForm.salary} onChange={handlePostJobChange} />
                  <input name="experience" placeholder="Experience (e.g. 1 year)" value={postJobForm.experience} onChange={handlePostJobChange} />
                  <textarea name="jobDescription" placeholder="Job Description" value={postJobForm.jobDescription} onChange={handlePostJobChange} />
                  <input name="skillsRequired" placeholder="Skills (comma separated)" value={postJobForm.skillsRequired} onChange={handlePostJobChange} />
                  <select name="category" value={postJobForm.category} onChange={handlePostJobChange}>
                    <option value="driver">driver</option>
                    <option value="cook">cook</option>
                    <option value="cleaner">cleaner</option>
                    <option value="gardener">gardener</option>
                    <option value="plumber">plumber</option>
                    <option value="electrician">electrician</option>
                    <option value="security">security</option>
                    <option value="factory">factory</option>
                    <option value="construction">construction</option>
                    <option value="house-help">house-help</option>
                    <option value="office-helper">office-helper</option>
                    <option value="other">other</option>
                  </select>
                  <select name="availability" value={postJobForm.availability} onChange={handlePostJobChange}>
                    <option value="day">day</option>
                    <option value="night">night</option>
                    <option value="full-time">full-time</option>
                    <option value="part-time">part-time</option>
                    <option value="weekends">weekends</option>
                    <option value="flexible">flexible</option>
                  </select>
                  <input name="minAge" type="number" min="18" value={postJobForm.minAge} onChange={handlePostJobChange} />
                  <button className="action-button primary" type="submit">Create Job</button>
                </form>
              </div>
            </div>
          )}
        </div>

        {role === 'giver' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>My Posted Jobs</h2>
            </div>

            <div className="jobs-grid">
              {myJobs.length > 0 ? (
                myJobs.map((job) => (
                  <div key={job._id} className="job-card">
                    <h3>{job.jobName}</h3>
                    <p className="job-description">{job.jobDescription}</p>
                    <div className="job-details">
                      <p>📍 {job.location}</p>
                      <p>💰 {job.salary}</p>
                    </div>
                    <div className="row-actions">
                      <button className="job-action-btn" onClick={() => viewApplicants(job._id)}>
                        View Applicants
                      </button>
                      <button className="action-button danger small" type="button" onClick={() => deleteJob(job._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-jobs-message">
                  <p>No jobs posted yet.</p>
                </div>
              )}
            </div>

            {selectedJobId && (
              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Applicants</h2>
                </div>

                {selectedJobApplicants.length > 0 ? (
                  <div className="jobs-grid single-column">
                    {selectedJobApplicants.map((app) => (
                      <div key={app._id} className="job-card">
                        <div className="row-between">
                          <h3>{app.seeker?.username || 'Applicant'}</h3>
                          <span className={`status-pill status-${app.status}`}>{app.status}</span>
                        </div>
                        <p className="job-description">{app.seeker?.email || ''}</p>

                        {app.seekerProfile && (
                          <div className="job-details">
                            <p>Name: {app.seekerProfile.name || '-'}</p>
                            <p>Phone: {app.seekerProfile.phone || '-'}</p>
                            <p>Job Type: {app.seekerProfile.job_title || '-'}</p>
                            <p>Experience: {app.seekerProfile.experience ?? '-'}</p>
                            <p>Salary Expectation: {app.seekerProfile.salary_expectation ?? '-'}</p>
                            <p>Address: {app.seekerProfile.address || '-'}</p>
                          </div>
                        )}

                        {app.status !== 'withdrawn' && (
                          <div className="row-actions">
                            <button
                              type="button"
                              className="action-button primary small"
                              onClick={() => setApplicantStatus(app._id, 'shortlisted')}
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              className="action-button danger small"
                              onClick={() => setApplicantStatus(app._id, 'rejected')}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No applicants yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer language={language} />
    </div>
  );
};

export default DashboardPage;