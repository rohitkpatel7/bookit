import axios from "axios";

// fallback to localhost:4000 if env missing
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({ baseURL });
