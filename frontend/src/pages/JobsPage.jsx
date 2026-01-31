import React, { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import axios from "axios";
import "./JobsPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const JobsPage = () => {
  const { currentUser, isAuthenticated, jobViewMode, toggleJobViewMode } =
    useAuthContext();
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [otherJobs, setOtherJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("public");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch jobs based on authentication and mode
  const fetchJobs = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      const token = localStorage.getItem("token");

      if (!isAuthenticated) {
        // NOT LOGGED IN - Show random + nearby jobs
        const position = await getCurrentPosition();

        response = await axios.get(`${API_URL}/api/jobs/public`, {
          params: {
            lat: position?.latitude,
            lon: position?.longitude,
            limit: 20,
          },
        });

        setAllJobs(response.data.jobs);
        setRecommendedJobs([]);
        setOtherJobs([]);
        setMode("public");
      } else {
        // LOGGED IN USER
        const hasProfile = currentUser?.profileCompleted === true;

        if (hasProfile && jobViewMode === "recommended") {
          // ✅ Profile exists → Get recommended jobs (separated)
          response = await axios.get(`${API_URL}/api/jobs/recommended`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { forceRefresh },
          });

          // Split jobs into recommended (exact matches) and others
          const allJobsData = response.data.jobs || [];
          const recommended = response.data.recommendedJobs || [];
          const others = response.data.otherJobs || [];

          setRecommendedJobs(recommended);
          setOtherJobs(others);
          setAllJobs([]);
          setLastUpdated(response.data.lastUpdated);
          setMode("recommended");
        } else if (hasProfile && jobViewMode === "nearby") {
          // ✅ Profile exists + nearby mode selected
          response = await axios.get(`${API_URL}/api/jobs/nearby`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setAllJobs(response.data.jobs);
          setRecommendedJobs([]);
          setOtherJobs([]);
          setMode("nearby");
        } else {
          // ✅ No profile → public jobs
          const position = await getCurrentPosition();

          response = await axios.get(`${API_URL}/api/jobs/public`, {
            params: {
              lat: position?.latitude,
              lon: position?.longitude,
              limit: 20,
            },
          });

          setAllJobs(response.data.jobs);
          setRecommendedJobs([]);
          setOtherJobs([]);
          setMode("public");
        }
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get user's current position (with permission)
  const getCurrentPosition = () => {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => resolve(null), // Fallback if denied
        );
      } else {
        resolve(null);
      }
    });
  };

  // Fetch jobs on component mount and when auth/mode changes
  useEffect(() => {
    fetchJobs();
  }, [isAuthenticated, jobViewMode]);

  // Handle mode toggle
  const handleToggleMode = async () => {
    const newMode = jobViewMode === "recommended" ? "nearby" : "recommended";
    await toggleJobViewMode(newMode);
  };

  if (loading) {
    return (
      <>
        <NavigationBar />
        <div className="jobs-page-wrapper">
          <div className="jobs-container">
            <div className="loading">Loading jobs...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavigationBar />
        <div className="jobs-page-wrapper">
          <div className="jobs-container">
            <div className="error">{error}</div>
            <button onClick={() => fetchJobs()}>Retry</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Render function for job cards
  const renderJobCard = (job) => (
    <div key={job._id} className="job-card">
      <h3>{job.jobName}</h3>
      <p className="company">{job.company}</p>
      <p className="location">📍 {job.location}</p>
      <p className="salary">💰 {job.salary}</p>
      <p className="description">{job.jobDescription}</p>
      {job.distance && (
        <p className="distance">📏 {job.distance.toFixed(1)} km away</p>
      )}
      <div className="job-meta">
        <span className="category-badge">{job.category}</span>
        <span className="experience-badge">{job.experience}</span>
      </div>
      <button className="apply-btn">Apply Now</button>
    </div>
  );

  return (
    <>
      <NavigationBar />
      <div className="jobs-page-wrapper">
        <div className="jobs-container">
          <div className="jobs-header">
            <h2>
              {mode === "public" && "Available Jobs"}
              {mode === "recommended" && "Jobs For You"}
              {mode === "nearby" && "Jobs Near You"}
            </h2>

            {isAuthenticated && currentUser?.profileCompleted && (
              <div className="jobs-controls">
                <button className="toggle-mode-btn" onClick={handleToggleMode}>
                  {jobViewMode === "recommended"
                    ? "📍 Show Nearby Jobs"
                    : "⭐ Show Recommended Jobs"}
                </button>

                {jobViewMode === "recommended" && (
                  <button className="refresh-btn" onClick={() => fetchJobs(true)}>
                    🔄 Refresh Recommendations
                  </button>
                )}
              </div>
            )}
          </div>

          {mode === "recommended" && lastUpdated && (
            <div className="last-updated">
              Recommendations last updated: {new Date(lastUpdated).toLocaleString()}
            </div>
          )}

          {/* RECOMMENDED JOBS SECTION - Only exact matches */}
          {mode === "recommended" && (
            <>
              {recommendedJobs.length > 0 && (
                <div className="job-section">
                  <h3 className="section-title">
                    <span className="star-icon">⭐</span> Recommended Jobs Based on Your Profile
                  </h3>
                  <div className="jobs-grid">
                    {recommendedJobs.map(renderJobCard)}
                  </div>
                </div>
              )}

              {/* OTHER JOBS SECTION - Related/alternative jobs */}
              {otherJobs.length > 0 && (
                <div className="job-section other-jobs-section">
                  <h3 className="section-title">
                    <span className="lightbulb-icon">💡</span> Other Jobs You Might Be Interested In
                  </h3>
                  <div className="jobs-grid">
                    {otherJobs.map(renderJobCard)}
                  </div>
                </div>
              )}

              {/* NO JOBS FOUND */}
              {recommendedJobs.length === 0 && otherJobs.length === 0 && (
                <div className="no-jobs">
                  <p>No matching jobs found for your profile.</p>
                  <p>Try updating your profile or switch to nearby jobs.</p>
                  <button className="toggle-mode-btn" onClick={handleToggleMode}>
                    📍 View Nearby Jobs
                  </button>
                </div>
              )}
            </>
          )}

          {/* PUBLIC/NEARBY JOBS - Single list */}
          {(mode === "public" || mode === "nearby") && (
            <>
              {allJobs.length === 0 ? (
                <div className="no-jobs">
                  <p>No jobs available at the moment.</p>
                  <p>Please check back later.</p>
                </div>
              ) : (
                <div className="jobs-grid">
                  {allJobs.map(renderJobCard)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobsPage;