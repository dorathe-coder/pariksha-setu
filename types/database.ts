export type UserRole = 'admin' | 'student';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type CorrectOption = 'A' | 'B' | 'C' | 'D';
export type CategoryType = 'mock_test' | 'previous_year' | 'topic_wise' | 'daily_quiz' | 'full_test' | 'mini_test';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  city?: string;
  created_at: string;
}

export interface Exam {
  id: number;
  name: string;
  name_gu?: string;
  slug: string;
  description?: string;
  icon?: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  type: CategoryType;
  description?: string;
  is_active: boolean;
}

export interface Subject {
  id: number;
  name: string;
  name_gu?: string;
  exam_id?: number;
  is_active: boolean;
}

export interface Topic {
  id: number;
  name: string;
  name_gu?: string;
  subject_id: number;
  is_active: boolean;
}

export interface Language {
  id: number;
  name: string;
  code: string;
}

export interface Test {
  id: number;
  title: string;
  title_gu?: string;
  description?: string;
  exam_id?: number;
  category_id?: number;
  subject_id?: number;
  topic_id?: number;
  language_id?: number;
  timer_minutes: number;
  total_marks: number;
  marks_per_question: number;
  negative_marking: number;
  passing_marks?: number;
  is_free: boolean;
  price: number;
  is_active: boolean;
  is_archived: boolean;
  year?: number;
  total_questions: number;
  attempt_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  exam?: Exam;
  category?: Category;
  subject?: Subject;
  topic?: Topic;
  language?: Language;
}

export interface Question {
  id: number;
  test_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: CorrectOption;
  explanation?: string;
  subject_id?: number;
  topic_id?: number;
  language_id?: number;
  difficulty: Difficulty;
  marks: number;
  question_order?: number;
  is_active: boolean;
  created_at: string;
  subject?: Subject;
  topic?: Topic;
}

export interface Result {
  id: number;
  user_id: string;
  test_id: number;
  score: number;
  max_score: number;
  accuracy: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  total_questions: number;
  time_taken_seconds: number;
  rank?: number;
  percentile?: number;
  is_completed: boolean;
  submitted_at: string;
  test?: Test;
  user?: User;
}

export interface ResultDetail {
  id: number;
  result_id: number;
  question_id: number;
  selected_option?: CorrectOption;
  is_correct: boolean;
  is_skipped: boolean;
  is_marked_review: boolean;
  time_spent_seconds: number;
  marks_earned: number;
  question?: Question;
}

export interface Bookmark {
  id: number;
  user_id: string;
  question_id: number;
  note?: string;
  created_at: string;
  question?: Question;
}

export interface AnswerState {
  [questionId: number]: {
    selected?: CorrectOption;
    markedReview: boolean;
    timeSpent: number;
  };
}

export type ParsedQuestion = {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: CorrectOption;
  explanation?: string;
  difficulty?: Difficulty;
};
