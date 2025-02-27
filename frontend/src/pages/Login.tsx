import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  Stack,
  Text,
  useColorModeValue,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react'
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  
  const navigate = useNavigate()
  const { login } = useAuth()
  const toast = useToast()
  
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = 'メールアドレスを入力してください'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }
    
    if (!password) {
      newErrors.password = 'パスワードを入力してください'
    } else if (password.length < 6) {
      newErrors.password = 'パスワードは6文字以上である必要があります'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const success = await login(email, password)
      
      if (success) {
        navigate('/')
      }
    } catch (error) {
      toast({
        title: 'ログインエラー',
        description: 'ログイン中にエラーが発生しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Heading size="xl" fontWeight="bold">
            AIクラウド開発プラットフォーム
          </Heading>
          <Text color="muted">アカウントにログイン</Text>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={bgColor}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Stack spacing="6">
            <Stack spacing="5">
              <form onSubmit={handleSubmit}>
                <FormControl isInvalid={!!errors.email} mb={4}>
                  <FormLabel htmlFor="email">メールアドレス</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  )}
                </FormControl>
                <FormControl isInvalid={!!errors.password} mb={6}>
                  <FormLabel htmlFor="password">パスワード</FormLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && (
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  )}
                </FormControl>
                <HStack justify="space-between" mb={4}>
                  <Checkbox defaultChecked>ログイン状態を保持</Checkbox>
                  <Link
                    as={RouterLink}
                    to="/forgot-password"
                    fontSize="sm"
                    color="brand.500"
                  >
                    パスワードをお忘れですか？
                  </Link>
                </HStack>
                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  fontSize="md"
                  isFullWidth
                  isLoading={isSubmitting}
                >
                  ログイン
                </Button>
              </form>
            </Stack>
            <HStack spacing="1" justify="center">
              <Text>アカウントをお持ちでないですか？</Text>
              <Link
                as={RouterLink}
                to="/register"
                color="brand.500"
                fontWeight="semibold"
              >
                新規登録
              </Link>
            </HStack>
            <Divider />
            <Stack spacing="3">
              <Button
                variant="outline"
                leftIcon={<FiGithub />}
                iconSpacing="3"
                width="full"
              >
                GitHubでログイン
              </Button>
              <Button
                variant="outline"
                leftIcon={<FiTwitter />}
                iconSpacing="3"
                width="full"
              >
                Twitterでログイン
              </Button>
              <Button
                variant="outline"
                leftIcon={<FiMail />}
                iconSpacing="3"
                width="full"
              >
                メールでログイン
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  )
}

export default Login