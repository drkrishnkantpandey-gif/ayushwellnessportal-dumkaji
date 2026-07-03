// Shared axios instance — base URL from env, credentials included for httpOnly cookies
import axios from "axios";
import API from "./api";

const instance = axios.create({
  baseURL: API,
  withCredentials: true,  // send httpOnly cookie on every request
});

export default instance;
export { API };
