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

export interface ApiResponse {
  data: Question | Question[] | { message: string };
  status: number;
}

export interface FetchQuestionsResponse {
  (status?: Question["status"] | null): Promise<Question[]>;
}

export interface PostQuestionResponse {
  (payload: QuestionCreatePayload): Promise<Question>;
}

export interface UpdateQuestionResponse {
  (id: string, payload: QuestionUpdatePayload): Promise<Question>;
}

export interface DeleteQuestionResponse {
  (id: string): Promise<{ message: string }>;
}

export interface ClearQuestionsResponse {
  (onlyAnswered?: boolean): Promise<{ message: string }>;
}
