const server =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://kaamkhojaibackend.onrender.com";

export default server;