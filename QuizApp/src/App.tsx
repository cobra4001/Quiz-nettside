import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import { Container } from 'react-bootstrap';
import NavBar from './shared/NavBar';
import HomePage from './pages/home/HomePage';
import QuizCreationPage from './pages/quiz/QuizCreatePage';
import LoginPage from './auth/LoginPage';
import QuizTakingPage from './pages/quiz/QuizTakingPage';
import UserCreationPage from './pages/user/UserCreationPage';
import QuizList from './pages/quiz/QuizList';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <NavBar />
      <Container>
        <Routes>
          {/* Default route */}
          <Route path="/" element={<HomePage />} />

          {/* Andre sider */}
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/HomePage" element={<HomePage />} />
          <Route path="/QuizList" element={<QuizList />} />
          <Route path="/QuizTakingPage/:quizId" element={<QuizTakingPage />} />
          <Route path="/quizcreate" element={<QuizCreationPage />} />
          <Route path="/CreateUser" element={<UserCreationPage />} />

          {/* Fallback for ukjente ruter */}
          <Route path="*" element={<div>404 - Side ikke funnet</div>} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
