import axios from "axios";

const api = axios.create({
  baseURL: "https://finrelief-ai-1-ffz7.onrender.com",
});

export default api;