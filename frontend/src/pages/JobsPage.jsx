import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { translateJobs } from "../utils/translateJobs";
import "./JobsPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PAGE_SIZE = 9;

const JobsPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, jobViewMode, toggleJobViewMode } =
    useAuthContext();
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [otherJobs, setOtherJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("public");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const [pages, setPages] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  const [applicationStatusByJobId, setApplicationStatusByJobId] = useState({});

  const lang = (i18n.language || "en").split("-")[0];

  const refreshMyApplications = async () => {
    const role = String(currentUser?.role || "seeker").toLowerCase();
    if (!isAuthenticated || role !== "seeker") {
      setApplicationStatusByJobId({});
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/applications/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return;

      const map = {};
      for (const app of data.applications || []) {
        const jobId = app?.job?._id;
        if (jobId) map[jobId] = app.status;
      }
      setApplicationStatusByJobId(map);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshMyApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUser?.role]);

  const handleApply = async (jobId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const role = String(currentUser?.role || "seeker").toLowerCase();
    if (role !== "seeker") {
      alert("Only job seekers can apply to jobs.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing");

      const res = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to apply");
      }

      setApplicationStatusByJobId((prev) => ({ ...prev, [jobId]: "applied" }));

      alert("Applied successfully!");
    } catch (e) {
      alert(e.message || "Failed to apply");
    }
  };

  const handleUnapply = async (jobId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const role = String(currentUser?.role || "seeker").toLowerCase();
    if (role !== "seeker") {
      alert("Only job seekers can unapply.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing");

      const res = await fetch(`${API_URL}/api/applications/job/${jobId}/withdraw`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to unapply");

      setApplicationStatusByJobId((prev) => {
        const next = { ...prev };
        next[jobId] = "withdrawn";
        return next;
      });

      alert("Unapplied successfully!");
    } catch (e) {
      alert(e.message || "Failed to unapply");
    }
  };

  // Fetch jobs based on authentication and mode
  const fetchJobs = async ({ forceRefresh = false, nextPage = false } = {}) => {
    if (nextPage) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    const excludeParam = nextPage
      ? pages
          .flatMap((p) => [
            ...(p.recommendedJobs || []),
            ...(p.otherJobs || []),
            ...(p.allJobs || []),
          ])
          .map((j) => j?._id)
          .filter(Boolean)
          .join(",")
      : "";

    if (!nextPage) {
      setPages([]);
      setPageIndex(0);
      setAllJobs([]);
      setRecommendedJobs([]);
      setOtherJobs([]);
      setHasMore(false);
      setLastUpdated(null);
    }

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
            limit: PAGE_SIZE,
            exclude: excludeParam,
          },
        });

        const page = {
          mode: "public",
          allJobs: response.data.jobs || [],
          recommendedJobs: [],
          otherJobs: [],
          hasMore: Boolean(response.data.hasMore),
        };

        setPages((prev) => (nextPage ? [...prev, page] : [page]));

        setAllJobs(page.allJobs);
        setRecommendedJobs([]);
        setOtherJobs([]);
        setMode("public");
        setHasMore(page.hasMore);

        return page;
      } else {
        // LOGGED IN USER
        const hasProfile = currentUser?.profileCompleted === true;

        if (hasProfile && jobViewMode === "recommended") {
          // ✅ Profile exists → Get recommended jobs (separated)
          response = await axios.get(`${API_URL}/api/jobs/recommended`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { forceRefresh, limit: PAGE_SIZE, exclude: excludeParam },
          });

          const recommended = response.data.recommendedJobs || [];
          const others = response.data.otherJobs || [];

          const page = {
            mode: "recommended",
            allJobs: [],
            recommendedJobs: recommended,
            otherJobs: others,
            hasMore: Boolean(response.data.hasMore),
            lastUpdated: response.data.lastUpdated,
          };

          setPages((prev) => (nextPage ? [...prev, page] : [page]));

          setRecommendedJobs(page.recommendedJobs);
          setOtherJobs(page.otherJobs);
          setAllJobs([]);
          setLastUpdated(response.data.lastUpdated);
          setMode("recommended");
          setHasMore(page.hasMore);

          return page;
        } else if (hasProfile && jobViewMode === "nearby") {
          // ✅ Profile exists + nearby mode selected
          response = await axios.get(`${API_URL}/api/jobs/nearby`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: PAGE_SIZE, exclude: excludeParam },
          });

          const page = {
            mode: "nearby",
            allJobs: response.data.jobs || [],
            recommendedJobs: [],
            otherJobs: [],
            hasMore: Boolean(response.data.hasMore),
          };

          setPages((prev) => (nextPage ? [...prev, page] : [page]));

          setAllJobs(page.allJobs);
          setRecommendedJobs([]);
          setOtherJobs([]);
          setMode("nearby");
          setHasMore(page.hasMore);

          return page;
        } else {
          // ✅ No profile → public jobs
          const position = await getCurrentPosition();

          response = await axios.get(`${API_URL}/api/jobs/public`, {
            params: {
              lat: position?.latitude,
              lon: position?.longitude,
              limit: PAGE_SIZE,
              exclude: excludeParam,
            },
          });

          const page = {
            mode: "public",
            allJobs: response.data.jobs || [],
            recommendedJobs: [],
            otherJobs: [],
            hasMore: Boolean(response.data.hasMore),
          };

          setPages((prev) => (nextPage ? [...prev, page] : [page]));

          setAllJobs(page.allJobs);
          setRecommendedJobs([]);
          setOtherJobs([]);
          setMode("public");
          setHasMore(page.hasMore);

          return page;
        }
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again.");
      return null;
    } finally {
      setLoading(false);
      setLoadingMore(false);
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

  // Translate ONLY the currently visible page when language changes.
  useEffect(() => {
    const cur = pages[pageIndex];
    if (!cur) return;

    let cancelled = false;
    (async () => {
      if (cur.mode === "recommended") {
        const [trRecommended, trOthers] = await Promise.all([
          translateJobs(API_URL, cur.recommendedJobs || [], lang),
          translateJobs(API_URL, cur.otherJobs || [], lang),
        ]);
        if (cancelled) return;
        setRecommendedJobs(trRecommended);
        setOtherJobs(trOthers);
        setAllJobs([]);
      } else {
        const trAll = await translateJobs(API_URL, cur.allJobs || [], lang);
        if (cancelled) return;
        setAllJobs(trAll);
        setRecommendedJobs([]);
        setOtherJobs([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, pages, pageIndex]);

  // Handle mode toggle
  const handleToggleMode = async () => {
    const newMode = jobViewMode === "recommended" ? "nearby" : "recommended";
    await toggleJobViewMode(newMode);
  };

  const syncPageToView = (newIndex) => {
    const p = pages[newIndex];
    if (!p) return;
    setMode(p.mode);
    setHasMore(Boolean(p.hasMore));
    if (p.mode === "recommended") {
      setRecommendedJobs(p.recommendedJobs || []);
      setOtherJobs(p.otherJobs || []);
      setAllJobs([]);
      if (p.lastUpdated) setLastUpdated(p.lastUpdated);
    } else {
      setAllJobs(p.allJobs || []);
      setRecommendedJobs([]);
      setOtherJobs([]);
    }
  };

  const applyPageToView = (p) => {
    if (!p) return;
    setMode(p.mode);
    setHasMore(Boolean(p.hasMore));
    if (p.mode === "recommended") {
      setRecommendedJobs(p.recommendedJobs || []);
      setOtherJobs(p.otherJobs || []);
      setAllJobs([]);
      if (p.lastUpdated) setLastUpdated(p.lastUpdated);
    } else {
      setAllJobs(p.allJobs || []);
      setRecommendedJobs([]);
      setOtherJobs([]);
    }
  };

  const handlePrevPage = () => {
    if (pageIndex <= 0) return;
    const newIndex = pageIndex - 1;
    setPageIndex(newIndex);
    syncPageToView(newIndex);
  };

  const handleNextPage = async () => {
    // If next page already exists in memory, just move
    if (pageIndex < pages.length - 1) {
      const newIndex = pageIndex + 1;
      setPageIndex(newIndex);
      syncPageToView(newIndex);
      return;
    }

    // Otherwise fetch next page from API
    if (!hasMore) return;

    const fetched = await fetchJobs({ nextPage: true });
    if (!fetched) return;
    const newIndex = pageIndex + 1;
    setPageIndex(newIndex);
    // Important: setPages(...) is async; render from fetched page immediately.
    applyPageToView(fetched);
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
      {(() => {
        const status = applicationStatusByJobId[job._id];
        const applied = Boolean(status && status !== "withdrawn");
        const isSeeker = String(currentUser?.role || "seeker").toLowerCase() === "seeker";

        if (isAuthenticated && isSeeker && applied) {
          return (
            <button className="apply-btn" onClick={() => handleUnapply(job._id)}>
              Unapply
            </button>
          );
        }

        return (
          <button className="apply-btn" onClick={() => handleApply(job._id)}>
            Apply Now
          </button>
        );
      })()}
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
                  <button className="refresh-btn" onClick={() => fetchJobs({ forceRefresh: true })}>
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

          {/* Pagination controls: show only 1 page (9 jobs) at a time */}
          {(mode === "public" || mode === "nearby" || mode === "recommended") && pages.length > 0 && (
            <div className="jobs-controls" style={{ justifyContent: "center", marginTop: 16 }}>

              <button
                className="toggle-mode-btn"
                onClick={handlePrevPage}
                disabled={loadingMore || pageIndex === 0}
              >
                Prev
              </button>

              <button
                className="toggle-mode-btn"
                onClick={handleNextPage}
                disabled={loadingMore || (!hasMore && pageIndex === pages.length - 1)}

                style={{ marginLeft: 12 }}
              >
                {loadingMore ? "Loading..." : "Next"}
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobsPage;