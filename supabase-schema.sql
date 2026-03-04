-- ============================================================
-- ParikshaSetu — Complete Supabase SQL Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE (extends Supabase Auth)
-- ============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LANGUAGES
-- ============================================================
CREATE TABLE public.languages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE -- 'en', 'gu', 'hi'
);

INSERT INTO public.languages (name, code) VALUES
  ('English', 'en'),
  ('ગુજરાતી', 'gu'),
  ('हिंदी', 'hi');

-- ============================================================
-- EXAMS
-- ============================================================
CREATE TABLE public.exams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_gu TEXT, -- Gujarati name
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- emoji or icon name
  category TEXT NOT NULL DEFAULT 'gujarat' CHECK (category IN ('gujarat', 'central', 'banking', 'railway', 'other')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.exams (name, name_gu, slug, category, icon, description) VALUES
  ('GPSC Class 1-2', 'જીપીએસસી ક્લાસ 1-2', 'gpsc-class-1-2', 'gujarat', '🏛️', 'Gujarat Public Service Commission Class 1-2'),
  ('GPSC Class 3', 'જીપીએસસી ક્લાસ 3', 'gpsc-class-3', 'gujarat', '🏛️', 'Gujarat Public Service Commission Class 3'),
  ('Talati cum Mantri', 'તલાટી કમ મંત્રી', 'talati', 'gujarat', '📋', 'Village Panchayat Talati'),
  ('Revenue Talati', 'રેવન્યુ તલાટી', 'revenue-talati', 'gujarat', '📋', 'Revenue Department Talati'),
  ('Bin Sachivalay Clerk', 'બિન સચિવાલય ક્લાર્ક', 'bin-sachivalay', 'gujarat', '📝', 'Non-Secretariat Clerk'),
  ('GSSSB', 'જીએસએસએસબી', 'gsssb', 'gujarat', '🏢', 'Gujarat Subordinate Service Selection Board'),
  ('Gujarat Police Constable', 'ગુજરાત પોલીસ', 'gujarat-police', 'gujarat', '👮', 'Police Constable Bharti'),
  ('SSC CGL', 'એસએસસી સીજીએલ', 'ssc-cgl', 'central', '📚', 'Staff Selection Commission CGL'),
  ('SSC CHSL', 'એસએસસી સીએચએસએલ', 'ssc-chsl', 'central', '📚', 'Staff Selection Commission CHSL'),
  ('Railway RRB', 'રેલ્વે આરઆરબી', 'railway-rrb', 'railway', '🚂', 'Railway Recruitment Board'),
  ('IBPS PO', 'આઈબીપીએસ પીઓ', 'ibps-po', 'banking', '🏦', 'Institute of Banking Personnel Selection PO'),
  ('SBI Clerk', 'એસબીઆઈ ક્લાર્ક', 'sbi-clerk', 'banking', '🏦', 'State Bank of India Clerk');

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('mock_test', 'previous_year', 'topic_wise', 'daily_quiz', 'full_test', 'mini_test')),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO public.categories (name, slug, type, description) VALUES
  ('Mock Test', 'mock-test', 'mock_test', 'Full length practice tests'),
  ('Previous Year Papers', 'previous-year', 'previous_year', 'Actual exam papers from past years'),
  ('Topic Wise Test', 'topic-wise', 'topic_wise', 'Practice specific topics'),
  ('Daily Quiz', 'daily-quiz', 'daily_quiz', 'Daily 10-question free quiz'),
  ('Full Length Test', 'full-test', 'full_test', 'Complete exam simulation'),
  ('Mini Test', 'mini-test', 'mini_test', 'Quick 20-30 question tests');

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE public.subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_gu TEXT,
  exam_id INTEGER REFERENCES public.exams(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.subjects (name, name_gu) VALUES
  ('Gujarati Grammar', 'ગુજરાતી વ્યાકરણ'),
  ('General Knowledge', 'સામાન્ય જ્ઞાન'),
  ('Current Affairs', 'ચાલુ ઘટના'),
  ('Mathematics', 'ગણિત'),
  ('Reasoning', 'તર્કશક્તિ'),
  ('English Grammar', 'અંગ્રેજી વ્યાકરણ'),
  ('Gujarat History', 'ગુજરાત ઇતિહાસ'),
  ('Gujarat Geography', 'ગુજરાત ભૂગોળ'),
  ('Indian Constitution', 'ભારતીય બંધારણ'),
  ('Science & Technology', 'વિજ્ઞાન અને ટેક્નોલોજી'),
  ('Computer Knowledge', 'કમ્પ્યુટર જ્ઞાન'),
  ('Indian History', 'ભારતીય ઇતિહાસ'),
  ('Indian Geography', 'ભારતીય ભૂગોળ'),
  ('Economics', 'અર્થશાસ્ત્ર');

-- ============================================================
-- TOPICS
-- ============================================================
CREATE TABLE public.topics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_gu TEXT,
  subject_id INTEGER REFERENCES public.subjects(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- TESTS
-- ============================================================
CREATE TABLE public.tests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_gu TEXT,
  description TEXT,
  exam_id INTEGER REFERENCES public.exams(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  subject_id INTEGER REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id INTEGER REFERENCES public.topics(id) ON DELETE SET NULL,
  language_id INTEGER REFERENCES public.languages(id) ON DELETE SET NULL,
  timer_minutes INTEGER NOT NULL DEFAULT 60,
  total_marks INTEGER NOT NULL DEFAULT 100,
  marks_per_question DECIMAL(5,2) DEFAULT 1.00,
  negative_marking DECIMAL(5,2) DEFAULT 0.00,
  passing_marks INTEGER,
  is_free BOOLEAN DEFAULT TRUE,
  price DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  year INTEGER, -- for previous year papers
  total_questions INTEGER DEFAULT 0,
  attempt_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QUESTIONS
-- ============================================================
CREATE TABLE public.questions (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES public.tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  subject_id INTEGER REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id INTEGER REFERENCES public.topics(id) ON DELETE SET NULL,
  language_id INTEGER REFERENCES public.languages(id) ON DELETE SET NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  marks DECIMAL(5,2) DEFAULT 1.00,
  question_order INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESULTS
-- ============================================================
CREATE TABLE public.results (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  test_id INTEGER REFERENCES public.tests(id) ON DELETE CASCADE,
  score DECIMAL(10,2) DEFAULT 0,
  max_score DECIMAL(10,2) DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  time_taken_seconds INTEGER DEFAULT 0,
  rank INTEGER,
  percentile DECIMAL(5,2),
  is_completed BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESULT DETAILS (per question)
-- ============================================================
CREATE TABLE public.result_details (
  id SERIAL PRIMARY KEY,
  result_id INTEGER REFERENCES public.results(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D') OR selected_option IS NULL),
  is_correct BOOLEAN DEFAULT FALSE,
  is_skipped BOOLEAN DEFAULT TRUE,
  is_marked_review BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  marks_earned DECIMAL(5,2) DEFAULT 0
);

-- ============================================================
-- BOOKMARKS
-- ============================================================
CREATE TABLE public.bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES public.questions(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- ============================================================
-- DAILY QUIZ TRACKER
-- ============================================================
CREATE TABLE public.daily_quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_date DATE NOT NULL DEFAULT CURRENT_DATE,
  test_id INTEGER REFERENCES public.tests(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, quiz_date)
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX idx_questions_test_id ON public.questions(test_id);
CREATE INDEX idx_questions_subject_id ON public.questions(subject_id);
CREATE INDEX idx_results_user_id ON public.results(user_id);
CREATE INDEX idx_results_test_id ON public.results(test_id);
CREATE INDEX idx_result_details_result_id ON public.result_details(result_id);
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX idx_tests_exam_id ON public.tests(exam_id);
CREATE INDEX idx_tests_category_id ON public.tests(category_id);
CREATE INDEX idx_tests_is_active ON public.tests(is_active);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

-- Users: read own profile, admin reads all
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Public read for exams, categories, subjects, topics, languages
CREATE POLICY "public_read_exams" ON public.exams FOR SELECT USING (TRUE);
CREATE POLICY "public_read_categories" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "public_read_subjects" ON public.subjects FOR SELECT USING (TRUE);
CREATE POLICY "public_read_topics" ON public.topics FOR SELECT USING (TRUE);
CREATE POLICY "public_read_languages" ON public.languages FOR SELECT USING (TRUE);

-- Tests: public read active tests, admin full access
CREATE POLICY "public_read_active_tests" ON public.tests FOR SELECT USING (is_active = TRUE AND is_archived = FALSE);
CREATE POLICY "admin_all_tests" ON public.tests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Questions: authenticated read for active tests
CREATE POLICY "auth_read_questions" ON public.questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_questions" ON public.questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Results: user reads own, admin reads all
CREATE POLICY "user_read_own_results" ON public.results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_insert_own_results" ON public.results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_update_own_results" ON public.results FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_read_own_result_details" ON public.result_details FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.results WHERE id = result_id AND user_id = auth.uid())
);
CREATE POLICY "user_insert_result_details" ON public.result_details FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.results WHERE id = result_id AND user_id = auth.uid())
);

-- Bookmarks: user owns
CREATE POLICY "user_bookmark_own" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

-- Daily quiz: user owns
CREATE POLICY "user_daily_quiz_own" ON public.daily_quiz_attempts FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: Auto-update total_questions count on tests
-- ============================================================
CREATE OR REPLACE FUNCTION update_test_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tests SET total_questions = total_questions + 1 WHERE id = NEW.test_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tests SET total_questions = total_questions - 1 WHERE id = OLD.test_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_count
AFTER INSERT OR DELETE ON public.questions
FOR EACH ROW EXECUTE FUNCTION update_test_question_count();

-- ============================================================
-- TRIGGER: Auto-create user profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FUNCTION: Calculate and update rank after result submission
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_rank(p_result_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_test_id INTEGER;
  v_score DECIMAL;
  v_rank INTEGER;
  v_total INTEGER;
BEGIN
  SELECT test_id, score INTO v_test_id, v_score FROM public.results WHERE id = p_result_id;
  
  SELECT COUNT(*) + 1 INTO v_rank
  FROM public.results
  WHERE test_id = v_test_id AND score > v_score AND is_completed = TRUE;
  
  SELECT COUNT(*) INTO v_total FROM public.results WHERE test_id = v_test_id AND is_completed = TRUE;
  
  UPDATE public.results 
  SET rank = v_rank, percentile = ROUND(((v_total - v_rank) * 100.0 / NULLIF(v_total, 0))::DECIMAL, 2)
  WHERE id = p_result_id;
  
  RETURN v_rank;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- DONE! Schema created successfully.
-- Next steps:
-- 1. Go to Supabase Dashboard > Authentication > Settings
-- 2. Enable Email/Password auth
-- 3. Set your admin user role manually:
--    UPDATE public.users SET role = 'admin' WHERE email = 'your-admin@email.com';
-- ============================================================
