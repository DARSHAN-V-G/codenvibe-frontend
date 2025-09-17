// Centralized API utility for admin portal
// All requests from frontend should go through this file

const BASE_URL = "http://localhost:4000"; // Change to your backend URL

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };
  const opts = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

// Admin APIs
export const addTeam = (body) =>
  request("/admin/add-team", {
    method: "POST",
    body: JSON.stringify(body),
    credentials: "include",
  });

export const getTeams = () =>
  request("/admin/teams", {
    method: "GET",
    credentials: "include",
  });

export const removeTeam = (body) =>
  request("/admin/remove-team", {
    method: "DELETE",
    body: JSON.stringify(body),
    credentials: "include",
  });

// Question APIs
export const addQuestion = (body) =>
  request("/question/add", {
    method: "POST",
    body: JSON.stringify(body),
    credentials: "include",
  });

export const updateQuestion = (id, body) =>
  request(`/question/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
    credentials: "include",
  });

export const checkQuestion = (id) =>
  request(`/question/check/${id}`, {
    method: "POST",
    credentials: "include",
  });

export default {
  addTeam,
  getTeams,
  removeTeam,
  addQuestion,
  updateQuestion,
  checkQuestion,
};
