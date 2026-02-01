import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { translateJobs } from "../utils/translateJobs";
import { 
  MapPin, 
  Banknote, 
  Briefcase, 
  History, 
  Star, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw 
} from "lucide-react";
import "./JobsPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PAGE_SIZE = 9;

const JobsPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, jobViewMode, toggleJobViewMode } = useAuthContext();
  
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

  // Use a Ref to track pages for the API call without triggering re-renders or dependency loops
  const pagesRef = useRef([]);
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  const lang = (i18n.language || "en").split("-")[0];

  const refreshMyApplications = useCallback(async () => {
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
    } catch { /* ignore */ }
  }, [isAuthenticated, currentUser?.role]);

  useEffect(() => {
    refreshMyApplications();
  }, [refreshMyApplications]);

  const handleApply = async (jobId) => {
    if (!isAuthenticated) { navigate("/login"); return; }
    const role = String(currentUser?.role || "seeker").toLowerCase();
    if (role !== "seeker") { alert("Only job seekers can apply."); return; }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error("Failed to apply");
      setApplicationStatusByJobId((prev) => ({ ...prev, [jobId]: "applied" }));
      alert("Applied successfully!");
    } catch (e) { alert(e.message); }
  };

  const handleUnapply = async (jobId) => {
    if (!isAuthenticated) { navigate("/login"); return; }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/applications/job/${jobId}/withdraw`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to unapply");
      setApplicationStatusByJobId((prev) => ({ ...prev, [jobId]: "withdrawn" }));
      alert("Unapplied successfully!");
    } catch (e) { alert(e.message); }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }), () => resolve(null));
      } else resolve(null);
    });
  };

  // FIXED: Removed 'pages' from dependency array to stop infinite loop
  const fetchJobs = useCallback(async ({ forceRefresh = false, nextPage = false } = {}) => {
    if (nextPage) setLoadingMore(true); else setLoading(true);
    setError(null);

    // Access pages via Ref to avoid dependency loop
    const currentPages = pagesRef.current;
    const excludeParam = nextPage ? currentPages.flatMap((p) => [...(p.recommendedJobs || []), ...(p.otherJobs || []), ...(p.allJobs || [])]).map((j) => j?._id).filter(Boolean).join(",") : "";
    
    if (!nextPage) {
      setPages([]); setPageIndex(0); setAllJobs([]); setRecommendedJobs([]); setOtherJobs([]); setHasMore(false); setLastUpdated(null);
    }

    try {
      let response;
      const token = localStorage.getItem("token");
      if (!isAuthenticated) {
        const position = await getCurrentPosition();
        response = await axios.get(`${API_URL}/api/jobs/public`, { params: { lat: position?.latitude, lon: position?.longitude, limit: PAGE_SIZE, exclude: excludeParam } });
        const page = { mode: "public", allJobs: response.data.jobs || [], recommendedJobs: [], otherJobs: [], hasMore: Boolean(response.data.hasMore) };
        setPages((prev) => (nextPage ? [...prev, page] : [page]));
        setAllJobs(page.allJobs); setMode("public"); setHasMore(page.hasMore);
        return page;
      } else {
        const hasProfile = currentUser?.profileCompleted === true;
        if (hasProfile && jobViewMode === "recommended") {
          response = await axios.get(`${API_URL}/api/jobs/recommended`, { headers: { Authorization: `Bearer ${token}` }, params: { forceRefresh, limit: PAGE_SIZE, exclude: excludeParam } });
          const page = { mode: "recommended", allJobs: [], recommendedJobs: response.data.recommendedJobs || [], otherJobs: response.data.otherJobs || [], hasMore: Boolean(response.data.hasMore), lastUpdated: response.data.lastUpdated };
          setPages((prev) => (nextPage ? [...prev, page] : [page]));
          setRecommendedJobs(page.recommendedJobs); setOtherJobs(page.otherJobs); setLastUpdated(response.data.lastUpdated); setMode("recommended"); setHasMore(page.hasMore);
          return page;
        } else {
          const endpoint = (hasProfile && jobViewMode === "nearby") ? `${API_URL}/api/jobs/nearby` : `${API_URL}/api/jobs/public`;
          const position = (hasProfile && jobViewMode === "nearby") ? null : await getCurrentPosition();
          response = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` }, params: { lat: position?.latitude, lon: position?.longitude, limit: PAGE_SIZE, exclude: excludeParam } });
          const page = { mode: jobViewMode || "public", allJobs: response.data.jobs || [], recommendedJobs: [], otherJobs: [], hasMore: Boolean(response.data.hasMore) };
          setPages((prev) => (nextPage ? [...prev, page] : [page]));
          setAllJobs(page.allJobs); setMode(page.mode); setHasMore(page.hasMore);
          return page;
        }
      }
    } catch (err) { 
      setError("Failed to load jobs."); 
      return null; 
    } finally { 
      setLoading(false); 
      setLoadingMore(false); 
    }
  }, [isAuthenticated, jobViewMode, currentUser?.profileCompleted]); // PAGES REMOVED FROM HERE

  useEffect(() => { 
    fetchJobs(); 
  }, [fetchJobs]); 

  // Translation effect
  useEffect(() => {
    const cur = pages[pageIndex];
    if (!cur) return;
    let cancelled = false;
    (async () => {
      if (cur.mode === "recommended") {
        const [trRec, trOth] = await Promise.all([
          translateJobs(API_URL, cur.recommendedJobs || [], lang), 
          translateJobs(API_URL, cur.otherJobs || [], lang)
        ]);
        if (!cancelled) { setRecommendedJobs(trRec); setOtherJobs(trOth); }
      } else {
        const trAll = await translateJobs(API_URL, cur.allJobs || [], lang);
        if (!cancelled) setAllJobs(trAll);
      }
    })();
    return () => { cancelled = true; };
  }, [lang, pages, pageIndex]);

  const handleToggleMode = async () => {
    const newMode = jobViewMode === "recommended" ? "nearby" : "recommended";
    await toggleJobViewMode(newMode);
  };

  const handlePrevPage = () => {
    if (pageIndex <= 0) return;
    const newIdx = pageIndex - 1;
    const p = pages[newIdx];
    setPageIndex(newIdx);
    setMode(p.mode);
    setHasMore(Boolean(p.hasMore));
    if (p.mode === "recommended") {
      setRecommendedJobs(p.recommendedJobs || []); setOtherJobs(p.otherJobs || []); setAllJobs([]);
      if (p.lastUpdated) setLastUpdated(p.lastUpdated);
    } else {
      setAllJobs(p.allJobs || []); setRecommendedJobs([]); setOtherJobs([]);
    }
  };

  const handleNextPage = async () => {
    if (pageIndex < pages.length - 1) {
      const newIdx = pageIndex + 1;
      const p = pages[newIdx];
      setPageIndex(newIdx);
      setMode(p.mode);
      setHasMore(Boolean(p.hasMore));
      if (p.mode === "recommended") {
        setRecommendedJobs(p.recommendedJobs || []); setOtherJobs(p.otherJobs || []); setAllJobs([]);
        if (p.lastUpdated) setLastUpdated(p.lastUpdated);
      } else {
        setAllJobs(p.allJobs || []); setRecommendedJobs([]); setOtherJobs([]);
      }
      return;
    }
    if (!hasMore) return;
    const fetched = await fetchJobs({ nextPage: true });
    if (fetched) setPageIndex(pageIndex + 1);
  };

  const renderJobCard = (job) => {
    const status = applicationStatusByJobId[job._id];
    const applied = Boolean(status && status !== "withdrawn");
    const isSeeker = String(currentUser?.role || "seeker").toLowerCase() === "seeker";

    return (
      <div key={job._id} className="modern-job-card">
        <div className="card-header">
          <div className="job-info">
            <h3>{job.jobName}</h3>
            <p className="company-name">{job.company}</p>
          </div>
          <div className="job-badge">{job.category}</div>
        </div>
        <div className="card-body">
          <div className="job-details">
            <div className="detail-item"><MapPin size={16} /> <span>{job.location}</span></div>
            <div className="detail-item"><Banknote size={16} /> <span className="salary-tag">{job.salary}</span></div>
          </div>
          <p className="job-desc">{job.jobDescription}</p>
        </div>
        <div className="card-footer">
          <span className="exp-label">{job.experience}</span>
          {isAuthenticated && isSeeker && applied ? (
            <button className="btn-unapply" onClick={() => handleUnapply(job._id)}>Unapply</button>
          ) : (
            <button className="btn-apply" onClick={() => handleApply(job._id)}>Apply Now <ArrowRight size={16} /></button>
          )}
        </div>
      </div>
    );
  };

  if (loading && !loadingMore) {
    return <div className="jobs-loading-screen"><div className="spinner"></div><p>Searching...</p></div>;
  }

  return (
    <>
      <NavigationBar />
      <div className="jobs-page-root">
        <div className="jobs-max-width">
          <header className="jobs-hero">
            <div className="hero-content">
              <h1>{mode === "public" ? "Explore Jobs" : mode === "recommended" ? "For You" : "Near You"}</h1>
              <p>Verified opportunities updated daily.</p>
            </div>
            {isAuthenticated && currentUser?.profileCompleted && (
              <div className="hero-controls">
                <button className="control-btn" onClick={handleToggleMode}>
                  {jobViewMode === "recommended" ? <MapPin size={18} /> : <Star size={18} />}
                  {jobViewMode === "recommended" ? "Nearby" : "Recommended"}
                </button>
                {jobViewMode === "recommended" && (
                  <button className="control-btn refresh" onClick={() => fetchJobs({ forceRefresh: true })}><RefreshCw size={18} /></button>
                )}
              </div>
            )}
          </header>

          {mode === "recommended" && lastUpdated && (
            <div className="update-toast"><History size={14} /> Last refreshed: {new Date(lastUpdated).toLocaleTimeString()}</div>
          )}

          <main className="jobs-feed">
            {mode === "recommended" ? (
              <>
                {recommendedJobs.length > 0 && (
                  <section className="feed-section">
                    <h2 className="section-title"><Star size={20} className="icon-star" /> Recommendations</h2>
                    <div className="modern-grid">{recommendedJobs.map(renderJobCard)}</div>
                  </section>
                )}
                {otherJobs.length > 0 && (
                  <section className="feed-section alt-feed">
                    <h2 className="section-title">Similar Roles</h2>
                    <div className="modern-grid">{otherJobs.map(renderJobCard)}</div>
                  </section>
                )}
              </>
            ) : (
              <div className="modern-grid">{allJobs.map(renderJobCard)}</div>
            )}
          </main>

          {pages.length > 0 && (
            <footer className="pagination-bar">
              <button className="pag-btn" onClick={handlePrevPage} disabled={pageIndex === 0}><ChevronLeft size={20} /> Prev</button>
              <div className="pag-indicator">Page {pageIndex + 1}</div>
              <button className="pag-btn" onClick={handleNextPage} disabled={loadingMore || (!hasMore && pageIndex === pages.length - 1)}>{loadingMore ? "..." : "Next"}</button>
            </footer>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobsPage;