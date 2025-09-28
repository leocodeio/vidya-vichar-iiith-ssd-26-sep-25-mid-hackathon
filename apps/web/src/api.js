import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
const QUESTIONS = `${API_BASE}/questions`;
const AUTH = `${API_BASE}/auth`;
const ROOMS = `${API_BASE}/rooms`;

// Configure axios to send cookies
axios.defaults.withCredentials = true;

export const fetchQuestions = (roomId) =>
  axios
    .get(QUESTIONS, { params: roomId ? { roomId } : {} })
    .then((r) => r.data);

export const postQuestion = (payload) =>
  axios.post(QUESTIONS, payload).then((r) => r.data);

export const updateQuestion = (id, payload) =>
  axios.patch(`${QUESTIONS}/${id}`, payload).then((r) => r.data);

export const deleteQuestion = (id) =>
  axios.delete(`${QUESTIONS}/${id}`).then((r) => r.data);

export const clearQuestions = (onlyAnswered = false) =>
  axios.delete(QUESTIONS, { params: { onlyAnswered } }).then((r) => r.data);

export async function addAnswer(id, answer) {
  const res = await fetch(`${API_BASE}/questions/${id}/answer`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer }),
  });
  if (!res.ok) throw new Error("Failed to add answer");
  return res.json();
}

// Auth functions
export const signup = (data) =>
  axios.post(`${AUTH}/signup`, data).then((r) => r.data);
export const login = (data) =>
  axios.post(`${AUTH}/login`, data).then((r) => r.data);
export const logout = () => axios.post(`${AUTH}/logout`).then((r) => r.data);
export const getMe = () => axios.get(`${AUTH}/me`).then((r) => r.data);

// Room functions
export const createRoom = (data) =>
  axios.post(`${ROOMS}/create`, data).then((r) => r.data);
export const joinRoom = (data) =>
  axios.post(`${ROOMS}/join?roomId=${data.roomId}`, data).then((r) => r.data);
export const showRoom = (roomId) =>
  axios.get(`${ROOMS}/show`, { params: { roomId } }).then((r) => r.data);
