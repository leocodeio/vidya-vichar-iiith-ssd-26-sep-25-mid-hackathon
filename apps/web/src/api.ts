import axios from "axios";
import type { AxiosResponse } from "axios";
import type {
  Question,
  QuestionCreatePayload,
  QuestionUpdatePayload,
} from "./types/api";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001/api";
const QUESTIONS = `${API_BASE}/questions`;

export const fetchQuestions = (
  status?: Question["status"] | null,
): Promise<Question[]> =>
  axios
    .get(QUESTIONS, { params: status ? { status } : {} })
    .then((r: AxiosResponse<Question[]>) => r.data);

export const postQuestion = (
  payload: QuestionCreatePayload,
): Promise<Question> =>
  axios.post(QUESTIONS, payload).then((r: AxiosResponse<Question>) => r.data);

export const updateQuestion = (
  id: string,
  payload: QuestionUpdatePayload,
): Promise<Question> =>
  axios
    .patch(`${QUESTIONS}/${id}`, payload)
    .then((r: AxiosResponse<Question>) => r.data);

export const deleteQuestion = (id: string): Promise<{ message: string }> =>
  axios
    .delete(`${QUESTIONS}/${id}`)
    .then((r: AxiosResponse<{ message: string }>) => r.data);

export const clearQuestions = (
  onlyAnswered: boolean = false,
): Promise<{ message: string }> =>
  axios
    .delete(QUESTIONS, { params: { onlyAnswered } })
    .then((r: AxiosResponse<{ message: string }>) => r.data);

export async function addAnswer(id: string, answer: string): Promise<Question> {
  const res = await fetch(`/api/questions/${id}/answer`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer }),
  });
  if (!res.ok) throw new Error("Failed to add answer");
  return res.json();
}
