import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { Container } from 'react-bootstrap';
import NavBar from './shared/NavBar';
import './App.css';

const HomePage = lazy(() => import("./pages/home/HomePage"));
const QuizCreationPage = lazy(() => import("./pages/quiz/QuizCreatePage"));
const LoginPage = lazy(() => import("./auth/LoginPage"));
const QuizTakingPage = lazy(() => import("./pages/quiz/QuizTakingPage"));
const UserCreationPage = lazy(() => import("./pages/user/UserCreationPage"));
const QuizList = lazy(() => import("./pages/quiz/QuizList"));

const App: React.FC = () => {
  return (
    <Router>
      <NavBar />
      <Suspense fallback={<div>Loading...</div>}>
        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/LoginPage" element={<LoginPage />} />
            <Route path="/HomePage" element={<HomePage />} />
            <Route path="/QuizList" element={<QuizList />} />
            <Route path="/QuizTakingPage/:quizId" element={<QuizTakingPage />} />
            <Route path="/quizcreate" element={<QuizCreationPage />} />
            <Route path="/CreateUser" element={<UserCreationPage />} />
            <Route path="*" element={<div>404 - Side ikke funnet</div>} />
          </Routes>
        </Container>
      </Suspense>
    </Router>
  );
};

export default App;
