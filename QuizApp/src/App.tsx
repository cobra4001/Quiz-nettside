import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import React, { Suspense, lazy } from 'react'
import { Container } from 'react-bootstrap'
import NavBar from './shared/NavBar'
const HomePage = lazy(() => import("./pages/home/HomePage"));
const QuizCreationPage = lazy(() => import("./pages/quiz/QuizCreatePage"));
const LoginPage = lazy(() => import("./auth/LoginPage"));
const QuizTakingPage = lazy(() => import("./pages/quiz/QuizTakingPage"));
const UserCreationPage = lazy(() => import("./pages/user/UserCreationPage"));
const QuizList = lazy(() => import("./pages/quiz/QuizList"));
import './App.css'

const App: React.FC = () => {

  return (
    <>
    <NavBar />
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
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
        </Suspense>
    </Router>
    </>
  )
}

export default App
