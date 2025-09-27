import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';
const QUESTIONS = `${API_BASE}/questions`;

export const fetchQuestions = (status) => 
  axios.get(QUESTIONS, { params: status ? { status } : {} }).then(r => r.data);

export const postQuestion = (payload) => 
  axios.post(QUESTIONS, payload).then(r => r.data);

export const updateQuestion = (id, payload) => 
  axios.patch(`${QUESTIONS}/${id}`, payload).then(r => r.data);

export const deleteQuestion = (id) => 
  axios.delete(`${QUESTIONS}/${id}`).then(r => r.data);

export const clearQuestions = (onlyAnswered = false) => 
  axios.delete(QUESTIONS, { params: { onlyAnswered } }).then(r => r.data);

export async function addAnswer(id, answer) {
  const res = await fetch(`/api/questions/${id}/answer`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer })
  });
  if (!res.ok) throw new Error("Failed to add answer");
  return res.json();
}