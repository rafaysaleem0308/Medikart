// src/config.js
const getBaseUrl = () => {
  if (process.env.NODE_ENV === "development") {
    // Use local IP if available (e.g. for mobile)
    return process.env.REACT_APP_LOCAL_IP || "http://localhost:5000";
  }
  // Use production server in production build
  return process.env.REACT_APP_PROD_API || "https://yourdomain.com";
};

export const BASE_URL = getBaseUrl();
