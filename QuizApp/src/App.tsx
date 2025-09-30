import { AuthProvider } from './auth/AuthContext'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import React, {} from 'react'
import { Container } from 'react-bootstrap'
import NavBar from './shared/NavBar'
import HomePage from './pages/home/HomePage'
import QuizCreationPage from './pages/quiz/QuizCreatePage'
import LoginPage from './pages/login/LoginPage'
import QuizTakingPage from './pages/quiz/QuizTakingPage'
import UserCreationPage from './pages/user/UserCreationPage'
import QuizList from './pages/quiz/QuizList'
import './App.css'

const App: React.FC = () => {

   

  return (
    <AuthProvider>
      <NavBar />
        <Router>
          <Container>
            <Routes>
              <Route path="/LoginPage" element={<LoginPage />} />
              <Route path="/HomePage" element={<HomePage />} />
              <Route path="/QuizList" element={<QuizList />} />
              <Route path="/QuizTakingPage/:quizId" element={<QuizTakingPage />}  />
              <Route path="/quizcreate" element={<QuizCreationPage />} />
              <Route path="/CreateUser" element={<UserCreationPage />} />
            </Routes>
          </Container>
      </Router>
    </AuthProvider>
  )
}

export default App
