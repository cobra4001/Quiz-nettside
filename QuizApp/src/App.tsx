import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import NavBar from './shared/NavBar';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner'
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider'

const HomePage = lazy(() => import("./pages/home/HomePage"));
const QuizCreationPage = lazy(() => import("./pages/quiz/QuizCreatePage"));
const QuizUpdatePage = lazy(() => import("./pages/quiz/QuizUpdatePage"));
const LoginPage = lazy(() => import("./auth/LoginPage"));
const QuizTakingPage = lazy(() => import("./pages/quiz/QuizTakingPage"));
const UserCreationPage = lazy(() => import("./pages/user/UserCreationPage"));
const AllQuizzes = lazy(() => import("./pages/quiz/AllQuizzes"));
const MyQuizzes = lazy(() => import("./pages/quiz/MyQuizzes"));
const UserProfile = lazy(() => import("./pages/user/UserProfile"));
const MyScores = lazy(() => import("./pages/user/MyScores"));
const UserControlPage = lazy(() => import("./pages/Admin/UserControl"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='quiz-app-theme'>
      <Router>
        <NavBar />
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/LoginPage" element={<LoginPage />} />
              <Route path="/HomePage" element={<HomePage />} />
              <Route path="/QuizList" element={<AllQuizzes />} />
              <Route path="/MyQuizzes" element={
                <ProtectedRoute>
                  <MyQuizzes />
                </ProtectedRoute>
              } />
              <Route path="/UserProfile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
              <Route path="/QuizTakingPage/:quizId" element={<QuizTakingPage />} />
              <Route path="/quizcreate" element={
                <ProtectedRoute>
                  <QuizCreationPage />
                </ProtectedRoute>
              } />
              <Route path="/CreateUser" element={<UserCreationPage />} />
              <Route path="/QuizUpdate/:quizId" element={
                <ProtectedRoute>
                  <QuizUpdatePage />
                </ProtectedRoute>
              } />
              <Route path="/MyScores" element={
                <ProtectedRoute>
                  <MyScores />
                </ProtectedRoute>
              } />
              <Route path="/UserControl" element={
                <ProtectedRoute requireAdmin={true}>
                  <UserControlPage />
                </ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
};

export default App;
