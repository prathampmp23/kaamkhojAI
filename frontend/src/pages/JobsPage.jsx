import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import { useAuthContext } from "../context/AuthContext";
import "./JobsPage.css";
import axios from "axios";
import { useTranslation } from "react-i18next";

const JobsPage = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddJobForm, setShowAddJobForm] = useState(false);
  const { currentUser, isAuthenticated } = useAuthContext();
  const [userType, setUserType] = useState(null);
  const [isRecommended, setIsRecommended] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const categories = [
    { id: "driver", icon: "car" },
    { id: "cook", icon: "utensils" },
    { id: "cleaner", icon: "broom" },
    { id: "gardener", icon: "seedling" },
    { id: "plumber", icon: "wrench" },
    { id: "electrician", icon: "bolt" },
    { id: "other", icon: "briefcase" },
  ];

  useEffect(() => {
    const state = location.state;

    if (
      state?.fromProfile &&
      Array.isArray(state.recommendedJobs) &&
      state.recommendedJobs.length > 0
    ) {
      setJobs(state.recommendedJobs);
      setIsRecommended(true);
      setLoading(false);
    } else {
      // either not from profile OR no recommended jobs -> load all jobs
      fetchJobs();
    }

    if (isAuthenticated && currentUser) {
      checkUserType();
    }
  }, [isAuthenticated, currentUser, location.state]);

  const checkUserType = () => {
    try {
      const type = localStorage.getItem("userType");
      if (type) setUserType(type);
    } catch (error) {
      console.error("Error checking user type:", error);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://kaamkhojaibackend.onrender.com/api/jobs");
      if (res.data.success) {
        setJobs(res.data.jobs || []);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
      setIsRecommended(false);
    }
  };

  const currentLang = (i18n.language || "en").split("-")[0];

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleCategoryFilter = (category) => setFilterCategory(category);

  const handleAddJob = () => {
    if (!isAuthenticated) {
      alert(t("jobs.loginToPost"));
      return;
    }

    if (!userType) {
      setShowUserTypeModal(true);
      return;
    }

    if (userType === "contractor") {
      setShowAddJobForm(true);
    } else {
      alert(t("jobs.onlyContractorsCanPost"));
    }
  };

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    const form = e.target;

    const payload = {
      jobName: form.jobTitle.value,
      company: "Individual / Contractor", // or add company field to form
      jobDescription: form.jobDescription.value,
      location: form.location.value,
      salary: form.salary.value,
      category: form.category.value,
      minAge: Number(form.minAge.value),
      availability: form.availability.value,
      skillsRequired: form.skillsRequired.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      experience: form.experience.value,
    };

    try {
      // backend POST route should accept this:
      // POST https://kaamkhojaibackend.onrender.com/api/jobs
      const res = await axios.post("https://kaamkhojaibackend.onrender.com/api/jobs", payload);
      if (res.data.success) {
        alert(t("jobs.submitSuccess"));
        form.reset();
        setShowAddJobForm(false);
        fetchJobs();
      } else {
        alert(res.data.message || t("jobs.submitError"));
      }
    } catch (err) {
      console.error("Error submitting job:", err);
      alert(t("jobs.submitError"));
    }
  };

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    localStorage.setItem("userType", type);
    setShowUserTypeModal(false);

    if (type === "contractor") {
      setShowAddJobForm(true);
    }
  };

  // Filter jobs based on search term and category
  const filteredJobs = jobs.filter((job) => {
    const titleText = (job.title && (job.title[currentLang] || job.title.en)) || job.jobName || "";
    const descriptionText =
      (job.description && (job.description[currentLang] || job.description.en)) ||
      job.jobDescription ||
      "";
    const companyText =
      typeof job.company === "object"
        ? job.company[currentLang] || job.company.en || ""
        : job.company || "";
    const locationText =
      typeof job.location === "object"
        ? job.location[currentLang] || job.location.en || ""
        : job.location || "";

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      titleText.toLowerCase().includes(search) ||
      descriptionText.toLowerCase().includes(search) ||
      companyText.toLowerCase().includes(search) ||
      locationText.toLowerCase().includes(search);

    const matchesCategory =
      filterCategory === "all" || job.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="jobs-page">
      <NavigationBar />

      <div className="jobs-content">
        <div className="container">
          <div className="jobs-header">
            <h1>
              {t("jobs.pageTitle")} {isRecommended ? t("jobs.recommendedTag") : ""}
            </h1>

            <div className="jobs-actions">
              <div className="search-container">
                <input
                  type="text"
                  placeholder={t("jobs.searchPlaceholder")}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
                <i className="fas fa-search search-icon" />
              </div>

              <button className="post-job-button" onClick={handleAddJob}>
                <i className="fas fa-plus" /> {t("jobs.addJob")}
              </button>
            </div>
          </div>

          <div className="categories-section">
            <h2>{t("jobs.categoriesTitle")}</h2>
            <div className="categories-container">
              <div
                className={`category-item ${
                  filterCategory === "all" ? "active" : ""
                }`}
                onClick={() => handleCategoryFilter("all")}
              >
                <div className="category-icon">
                  <i className="fas fa-th-large" />
                </div>
                <span>{t("jobs.all")}</span>
              </div>

              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`category-item ${
                    filterCategory === category.id ? "active" : ""
                  }`}
                  onClick={() => handleCategoryFilter(category.id)}
                >
                  <div className="category-icon">
                    <i className={`fas fa-${category.icon}`} />
                  </div>
                  <span>{t(`jobs.category.${category.id}`)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="jobs-listing">
            <h2>{t("jobs.popular")}</h2>

            {loading ? (
              <div className="loading-container">
                <p>{t("jobs.loading")}</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="jobs-grid">
                {filteredJobs.map((job) => {
                  const title =
                    (job.title && job.title[currentLang]) || job.jobName || "Job";

                  const company =
                    typeof job.company === "object"
                      ? job.company[currentLang] || job.company.en || job.company
                      : job.company || "";

                  const locationText =
                    typeof job.location === "object"
                      ? job.location[currentLang] ||
                        job.location.en ||
                        job.location
                      : job.location || "";

                  const salary = job.salary || "";
                  const availability = job.availability || "";

                  const availabilityText =
                    availability === "full-time"
                      ? t("jobs.fullTime")
                      : availability === "part-time"
                      ? t("jobs.partTime")
                      : availability === "weekends"
                      ? t("jobs.weekends")
                      : availability === "flexible"
                      ? t("jobs.flexible")
                      : availability; // e.g. day/night

                  const icon = job.icon || "briefcase";
                  const skills = job.skillsRequired || [];

                  const description =
                    (job.description &&
                      (job.description[currentLang] ||
                        job.description.en ||
                        job.description)) ||
                    job.jobDescription ||
                    "";

                  return (
                    <div className="job-card" key={job._id || job.id}>
                      <div className="job-card-header">
                        <div className="job-icon">
                          <i className={`fas fa-${icon}`} />
                        </div>
                        <h3 className="job-title">{title}</h3>
                        <div className="job-company">{company}</div>
                      </div>

                      <div className="job-card-body">
                        {description && (
                          <p className="job-description">{description}</p>
                        )}

                        <div className="job-meta">
                          <div className="job-meta-item">
                            <i className="fas fa-map-marker-alt" />
                            <span>{locationText}</span>
                          </div>

                          <div className="job-meta-item">
                            <i className="fas fa-money-bill-wave" />
                            <span>{salary}</span>
                          </div>

                          <div className="job-meta-item">
                            <i className="fas fa-clock" />
                            <span>{availabilityText}</span>
                          </div>
                        </div>

                        <div className="skills-container">
                          {skills.map((skill, index) => (
                            <span className="skill-tag" key={index}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="job-card-footer">
                        <button className="apply-button">
                          {t("jobs.applyNow")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-jobs-container">
                <p>{t("jobs.noJobs")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Job Form Modal */}
      {showAddJobForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{t("jobs.addNewJob")}</h2>
              <button
                className="close-button"
                onClick={() => setShowAddJobForm(false)}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmitJob}>
                <div className="form-group">
                  <label htmlFor="jobTitle">{t("jobs.jobTitle")}</label>
                  <input type="text" id="jobTitle" required />
                </div>

                <div className="form-group">
                  <label htmlFor="jobDescription">{t("jobs.jobDescription")}</label>
                  <textarea id="jobDescription" rows="4" required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location">{t("jobs.location")}</label>
                    <input type="text" id="location" required />
                  </div>

                  <div className="form-group">
                    <label htmlFor="salary">{t("jobs.salary")}</label>
                    <input
                      type="text"
                      id="salary"
                      placeholder="₹15,000 - ₹20,000"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">{t("jobs.category")}</label>
                    <select id="category" required>
                      <option value="driver">
                        {t("jobs.category.driver")}
                      </option>
                      <option value="cook">
                        {t("jobs.category.cook")}
                      </option>
                      <option value="cleaner">
                        {t("jobs.category.cleaner")}
                      </option>
                      <option value="gardener">
                        {t("jobs.category.gardener")}
                      </option>
                      <option value="plumber">
                        {t("jobs.category.plumber")}
                      </option>
                      <option value="electrician">
                        {t("jobs.category.electrician")}
                      </option>
                      <option value="other">
                        {t("jobs.category.other")}
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="minAge">{t("jobs.minAge")}</label>
                    <input type="number" id="minAge" min="18" required />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="availability">{t("jobs.availability")}</label>
                  <select id="availability" required>
                    <option value="full-time">
                      {t("jobs.fullTime")}
                    </option>
                    <option value="part-time">
                      {t("jobs.partTime")}
                    </option>
                    <option value="weekends">
                      {t("jobs.weekends")}
                    </option>
                    <option value="flexible">
                      {t("jobs.flexible")}
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="skillsRequired">{t("jobs.skillsRequired")}</label>
                    <input
                      type="text"
                      id="skillsRequired"
                      placeholder={t("jobs.skillsPlaceholder")}
                      required
                    />
                </div>

                <div className="form-group">
                  <label htmlFor="experience">{t("jobs.experience")}</label>
                    <input
                      type="text"
                      id="experience"
                      placeholder={t("jobs.experiencePlaceholder")}
                      required
                    />
                </div>

                <div className="form-buttons">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowAddJobForm(false)}
                  >
                    {t("jobs.cancel")}
                  </button>
                  <button type="submit" className="submit-button">
                    {t("jobs.submitJob")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Type Selection Modal */}
      {showUserTypeModal && (
        <div className="modal-overlay">
          <div className="modal-container user-type-modal">
            <div className="modal-header">
              <h2>{t("jobs.userTypeQuestion")}</h2>
              <button
                className="close-button"
                onClick={() => setShowUserTypeModal(false)}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="modal-body">
              <div className="user-type-options">
                <div
                  className="user-type-option"
                  onClick={() => handleUserTypeSelection("worker")}
                >
                  <div className="user-type-icon">
                    <i className="fas fa-hard-hat" />
                  </div>
                  <h3>{t("jobs.worker")}</h3>
                  <p>{t("jobs.workerInfo")}</p>
                </div>

                <div
                  className="user-type-option"
                  onClick={() => handleUserTypeSelection("contractor")}
                >
                  <div className="user-type-icon">
                    <i className="fas fa-building" />
                  </div>
                  <h3>{t("jobs.contractor")}</h3>
                  <p>{t("jobs.contractorInfo")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default JobsPage;
