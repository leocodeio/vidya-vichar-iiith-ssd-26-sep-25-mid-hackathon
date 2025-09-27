export interface Question {
  _id: string;
  text: string;
  author: string;
  status: "unanswered" | "answered" | "important";
  answer: string;
  createdAt: string;
}

export interface QuestionCreatePayload {
  text: string;
  author?: string;
}

export interface QuestionUpdatePayload {
  status?: "unanswered" | "answered" | "important";
  answer?: string;
}

export type NotificationType = "success" | "warning" | "error" | "info";

export interface ApiError {
  response?: {
    status: number;
    data?: {
      message: string;
    };
  };
  message?: string;
}
