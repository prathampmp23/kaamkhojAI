import React from "react";
import "./JobListings.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const JobListings = ({ title, showCount = 6 }) => {
  const { t } = useTranslation();
  const samples = t("jobList.samples", { returnObjects: true });

  // Sample job data
  const jobs = Array.isArray(samples) ? samples : [];

  // Show only the requested number of jobs
  const displayedJobs = jobs.slice(0, showCount);

  return (
    <section className="job-listings-section">
      <div className="container">
        <h2 className="section-title">{title}</h2>

        <div className="job-cards-container">
          {displayedJobs.map((job, idx) => (
            <div className="job-card" key={job.id || idx}>
              <div className="job-icon">
                <i className={`fas fa-${job.icon}`}></i>
              </div>
              <div className="job-details">
                <h3 className="job-title">{job.title}</h3>
                <div className="job-company">{job.company}</div>
                <div className="job-location">
                  <i className="fas fa-map-marker-alt"></i>{" "}
                  {job.location}
                </div>
              </div>
              <button className="job-apply-btn">
                {t("jobList.applyNow")}
              </button>
            </div>
          ))}
        </div>

        <div className="view-all-container">
          {/* <button className="view-all-btn"></button> */}
          <Link to="/jobs" className="view-all-btn">
            {t("jobList.viewAll")} {" "}
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JobListings;
