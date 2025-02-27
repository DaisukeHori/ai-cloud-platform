import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box, useToast } from '@chakra-ui/react'

// レイアウトコンポーネント
import Layout from './components/layout/Layout'

// ページコンポーネント
import Dashboard from './pages/Dashboard'
import ProjectEditor from './pages/ProjectEditor'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

// 認証コンテキスト
import { AuthProvider, useAuth } from './contexts/AuthContext'

// 認証が必要なルートのラッパーコンポーネント
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  const toast = useToast()
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 認証が必要なルート */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="project/:projectId" element={<ProjectEditor />} />
        </Route>
        
        {/* 404ページ */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <Box height="100vh" width="100%">
        <AppRoutes />
      </Box>
    </AuthProvider>
  )
}

export default App