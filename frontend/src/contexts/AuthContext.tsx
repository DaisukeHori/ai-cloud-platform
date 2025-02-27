import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '@chakra-ui/react'

// ユーザー型定義
interface User {
  id: string
  email: string
  name: string
}

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 認証プロバイダーコンポーネント
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  // 認証状態の確認
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          setIsLoading(false)
          return
        }
        
        // トークンの検証
        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        setUser(response.data.user)
      } catch (error) {
        // トークンが無効な場合はローカルストレージから削除
        localStorage.removeItem('token')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  // ログイン処理
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token, user } = response.data
      
      // トークンをローカルストレージに保存
      localStorage.setItem('token', token)
      
      // ユーザー情報をステートに保存
      setUser(user)
      
      toast({
        title: 'ログイン成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      return true
    } catch (error) {
      toast({
        title: 'ログイン失敗',
        description: 'メールアドレスまたはパスワードが正しくありません',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      
      return false
    }
  }

  // 新規登録処理
  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post('/api/auth/register', { email, password, name })
      const { token, user } = response.data
      
      // トークンをローカルストレージに保存
      localStorage.setItem('token', token)
      
      // ユーザー情報をステートに保存
      setUser(user)
      
      toast({
        title: '登録成功',
        description: 'アカウントが正常に作成されました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      return true
    } catch (error) {
      toast({
        title: '登録失敗',
        description: 'アカウント作成中にエラーが発生しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      
      return false
    }
  }

  // ログアウト処理
  const logout = () => {
    // トークンをローカルストレージから削除
    localStorage.removeItem('token')
    
    // ユーザー情報をクリア
    setUser(null)
    
    toast({
      title: 'ログアウト成功',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// 認証コンテキストを使用するためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}