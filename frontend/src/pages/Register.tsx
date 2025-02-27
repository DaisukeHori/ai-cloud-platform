import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
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
  Checkbox,
} from '@chakra-ui/react'
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

const Register: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  
  const navigate = useNavigate()
  const { register } = useAuth()
  const toast = useToast()
  
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  const validateForm = () => {
    const newErrors: {
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
    } = {}
    
    if (!name) {
      newErrors.name = '名前を入力してください'
    }
    
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
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'パスワードを再入力してください'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const success = await register(email, password, name)
      
      if (success) {
        toast({
          title: '登録成功',
          description: 'アカウントが正常に作成されました',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        navigate('/')
      }
    } catch (error) {
      toast({
        title: '登録エラー',
        description: 'アカウント作成中にエラーが発生しました',
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
          <Text color="muted">新規アカウント登録</Text>
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
                <FormControl isInvalid={!!errors.name} mb={4}>
                  <FormLabel htmlFor="name">名前</FormLabel>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && (
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  )}
                </FormControl>
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
                <FormControl isInvalid={!!errors.password} mb={4}>
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
                <FormControl isInvalid={!!errors.confirmPassword} mb={6}>
                  <FormLabel htmlFor="confirmPassword">パスワード（確認）</FormLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirmPassword && (
                    <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                  )}
                </FormControl>
                <HStack mb={6}>
                  <Checkbox defaultChecked>
                    <Text fontSize="sm">
                      <Link as="span" color="brand.500">
                        利用規約
                      </Link>
                      と
                      <Link as="span" color="brand.500">
                        プライバシーポリシー
                      </Link>
                      に同意します
                    </Text>
                  </Checkbox>
                </HStack>
                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  fontSize="md"
                  isFullWidth
                  isLoading={isSubmitting}
                >
                  アカウント作成
                </Button>
              </form>
            </Stack>
            <HStack spacing="1" justify="center">
              <Text>すでにアカウントをお持ちですか？</Text>
              <Link
                as={RouterLink}
                to="/login"
                color="brand.500"
                fontWeight="semibold"
              >
                ログイン
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
                GitHubで登録
              </Button>
              <Button
                variant="outline"
                leftIcon={<FiTwitter />}
                iconSpacing="3"
                width="full"
              >
                Twitterで登録
              </Button>
              <Button
                variant="outline"
                leftIcon={<FiMail />}
                iconSpacing="3"
                width="full"
              >
                メールで登録
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  )
}

export default Register