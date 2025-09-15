import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Container from 'react-bootstrap/Container'
import NavBar from './shared/NavBar'
import HomePage from './home/Homepage'
import QuizCreationPage from './quiz/QuizCreatePage'

function App() {
  return (
    <Router>
      <NavBar />
      <Container>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quizcreate" element={<Navigate to="/QuizCreatePage" replace />} />
          <Route path="/QuizCreatePage" element={<QuizCreationPage />} />
        </Routes>
      </Container>
    </Router>
  )
}

export default App
