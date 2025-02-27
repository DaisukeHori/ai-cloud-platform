import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Flex,
  Input,
  Button,
  Text,
  Avatar,
  Spinner,
  useColorModeValue,
  IconButton,
  Divider,
} from '@chakra-ui/react'
import { FiSend, FiCode, FiCopy } from 'react-icons/fi'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ChatInterfaceProps {
  projectId: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ projectId }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const userBgColor = useColorModeValue('blue.50', 'blue.900')
  const aiBgColor = useColorModeValue('gray.50', 'gray.700')
  
  // メッセージ履歴の取得
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/chat`)
        setMessages(response.data.messages)
      } catch (error) {
        console.error('Failed to fetch chat messages:', error)
      }
    }
    
    fetchMessages()
  }, [projectId])
  
  // 新しいメッセージが追加されたら自動スクロール
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  // メッセージ送信処理
  const handleSendMessage = async () => {
    if (!input.trim()) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }
    
    setMessages((prev) => [...prev, newMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      const response = await axios.post(`/api/projects/${projectId}/chat`, {
        message: input,
      })
      
      const aiResponse: Message = {
        id: response.data.id,
        role: 'assistant',
        content: response.data.content,
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // コードをクリップボードにコピー
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
  }
  
  // コードをプロジェクトに適用
  const applyCodeToProject = async (code: string) => {
    try {
      await axios.post(`/api/projects/${projectId}/apply-code`, {
        code,
      })
    } catch (error) {
      console.error('Failed to apply code:', error)
    }
  }
  
  // マークダウンレンダリングのカスタマイズ
  const renderers = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      const code = String(children).replace(/\n$/, '')
      
      return !inline && match ? (
        <Box position="relative" my={4}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            bg="gray.700"
            color="white"
            px={3}
            py={1}
            borderTopRadius="md"
          >
            <Text fontSize="xs">{match[1]}</Text>
            <Flex>
              <IconButton
                aria-label="Copy code"
                icon={<FiCopy />}
                size="xs"
                variant="ghost"
                onClick={() => copyToClipboard(code)}
                mr={1}
              />
              <IconButton
                aria-label="Apply code"
                icon={<FiCode />}
                size="xs"
                variant="ghost"
                colorScheme="green"
                onClick={() => applyCodeToProject(code)}
              />
            </Flex>
          </Flex>
          <SyntaxHighlighter
            language={match[1]}
            style={tomorrow}
            customStyle={{
              margin: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: '0.375rem',
              borderBottomRightRadius: '0.375rem',
            }}
          >
            {code}
          </SyntaxHighlighter>
        </Box>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
  }
  
  return (
    <Flex
      direction="column"
      height="100%"
      bg={bgColor}
      borderRadius="md"
      overflow="hidden"
    >
      {/* メッセージ表示エリア */}
      <Box
        flex="1"
        overflowY="auto"
        p={4}
        borderBottom="1px"
        borderColor={borderColor}
      >
        {messages.length === 0 ? (
          <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            textAlign="center"
            color="gray.500"
          >
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              AIアシスタントへようこそ
            </Text>
            <Text>
              プロジェクトに関する質問や、コード生成の依頼ができます。
              <br />
              例: 「ReactでTODOリストのコンポーネントを作成して」
            </Text>
          </Flex>
        ) : (
          messages.map((message) => (
            <Box
              key={message.id}
              mb={4}
              p={3}
              borderRadius="md"
              bg={message.role === 'user' ? userBgColor : aiBgColor}
              alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
              maxWidth="90%"
              marginLeft={message.role === 'user' ? 'auto' : 0}
            >
              <Flex mb={2} alignItems="center">
                <Avatar
                  size="xs"
                  name={message.role === 'user' ? 'User' : 'AI'}
                  mr={2}
                  bg={message.role === 'user' ? 'blue.500' : 'green.500'}
                />
                <Text fontWeight="bold" fontSize="sm">
                  {message.role === 'user' ? 'あなた' : 'AIアシスタント'}
                </Text>
                <Text fontSize="xs" color="gray.500" ml={2}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Text>
              </Flex>
              <Box className="markdown-body">
                <ReactMarkdown components={renderers}>
                  {message.content}
                </ReactMarkdown>
              </Box>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* 入力エリア */}
      <Flex p={4} alignItems="center">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="AIアシスタントに質問や指示を入力..."
          mr={2}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
        />
        <Button
          colorScheme="brand"
          onClick={handleSendMessage}
          isLoading={isLoading}
          leftIcon={<FiSend />}
        >
          送信
        </Button>
      </Flex>
    </Flex>
  )
}

export default ChatInterface