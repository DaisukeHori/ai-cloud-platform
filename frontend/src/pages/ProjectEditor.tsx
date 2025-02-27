import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Spinner,
  useToast,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Badge,
  Divider,
} from '@chakra-ui/react'
import { Editor } from '@monaco-editor/react'
import { FiPlay, FiSave, FiSettings, FiTerminal, FiMessageSquare } from 'react-icons/fi'
import axios from 'axios'
import io from 'socket.io-client'
import ChatInterface from '../components/editor/ChatInterface'
import FileExplorer from '../components/editor/FileExplorer'
import ConsoleOutput from '../components/editor/ConsoleOutput'

// プロジェクト型定義
interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  status: 'active' | 'archived' | 'deploying'
  deployedUrl?: string
}

// ファイル型定義
interface ProjectFile {
  id: string
  name: string
  path: string
  content: string
  type: 'file' | 'directory'
  children?: ProjectFile[]
}

const ProjectEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const consoleDrawer = useDisclosure()
  const chatDrawer = useDisclosure()
  
  const [project, setProject] = useState<Project | null>(null)
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [currentFile, setCurrentFile] = useState<ProjectFile | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  
  const socketRef = useRef<any>(null)
  const editorRef = useRef<any>(null)
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  // プロジェクト情報の取得
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`/api/projects/${projectId}`)
        setProject(response.data.project)
        setFiles(response.data.files)
        
        // 最初のファイルを選択
        if (response.data.files.length > 0) {
          const firstFile = findFirstFile(response.data.files)
          if (firstFile) {
            setCurrentFile(firstFile)
            setFileContent(firstFile.content)
          }
        }
      } catch (error) {
        toast({
          title: 'プロジェクト取得エラー',
          description: 'プロジェクト情報の取得に失敗しました',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProject()
    
    // WebSocketの接続
    socketRef.current = io('/project-socket')
    socketRef.current.emit('join', { projectId })
    
    socketRef.current.on('console-output', (data: { output: string }) => {
      setConsoleOutput((prev) => [...prev, data.output])
    })
    
    socketRef.current.on('deployment-status', (data: { status: string, url?: string }) => {
      if (data.status === 'success') {
        setIsDeploying(false)
        setProject((prev) => prev ? { ...prev, status: 'active', deployedUrl: data.url } : null)
        toast({
          title: 'デプロイ成功',
          description: `アプリが正常にデプロイされました: ${data.url}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      } else if (data.status === 'error') {
        setIsDeploying(false)
        toast({
          title: 'デプロイ失敗',
          description: 'アプリのデプロイに失敗しました',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    })
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [projectId, navigate, toast])
  
  // 最初のファイルを見つける関数
  const findFirstFile = (files: ProjectFile[]): ProjectFile | null => {
    for (const file of files) {
      if (file.type === 'file') {
        return file
      } else if (file.children && file.children.length > 0) {
        const found = findFirstFile(file.children)
        if (found) return found
      }
    }
    return null
  }
  
  // ファイルを選択したときの処理
  const handleFileSelect = async (file: ProjectFile) => {
    if (file.type === 'directory') return
    
    try {
      // 現在のファイルの変更を保存
      if (currentFile && editorRef.current) {
        await handleSaveFile()
      }
      
      setCurrentFile(file)
      setFileContent(file.content)
    } catch (error) {
      toast({
        title: 'ファイル読み込みエラー',
        description: 'ファイルの読み込みに失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }
  
  // エディタの準備完了時の処理
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }
  
  // ファイル保存処理
  const handleSaveFile = async () => {
    if (!currentFile || !editorRef.current) return
    
    try {
      setIsSaving(true)
      const content = editorRef.current.getValue()
      
      await axios.put(`/api/projects/${projectId}/files/${currentFile.id}`, {
        content,
      })
      
      // ファイル内容を更新
      setFileContent(content)
      setCurrentFile({ ...currentFile, content })
      
      toast({
        title: 'ファイル保存',
        description: 'ファイルが正常に保存されました',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'ファイル保存エラー',
        description: 'ファイルの保存に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  // デプロイ処理
  const handleDeploy = async () => {
    try {
      setIsDeploying(true)
      setProject((prev) => prev ? { ...prev, status: 'deploying' } : null)
      
      await axios.post(`/api/projects/${projectId}/deploy`)
      
      toast({
        title: 'デプロイ開始',
        description: 'アプリのデプロイを開始しました',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
      
      // コンソール出力を表示
      consoleDrawer.onOpen()
    } catch (error) {
      setIsDeploying(false)
      setProject((prev) => prev ? { ...prev, status: 'active' } : null)
      
      toast({
        title: 'デプロイエラー',
        description: 'デプロイの開始に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }
  
  // プロジェクト設定の更新
  const handleUpdateProject = async (name: string, description: string) => {
    try {
      await axios.put(`/api/projects/${projectId}`, {
        name,
        description,
      })
      
      setProject((prev) => prev ? { ...prev, name, description } : null)
      
      toast({
        title: 'プロジェクト更新',
        description: 'プロジェクト情報が更新されました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      onClose()
    } catch (error) {
      toast({
        title: '更新エラー',
        description: 'プロジェクト情報の更新に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }
  
  // プロジェクト設定ドロワー
  const SettingsDrawer = () => {
    const [name, setName] = useState(project?.name || '')
    const [description, setDescription] = useState(project?.description || '')
    
    useEffect(() => {
      if (project) {
        setName(project.name)
        setDescription(project.description)
      }
    }, [project])
    
    return (
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>プロジェクト設定</DrawerHeader>
          <DrawerBody>
            <FormControl mb={4}>
              <FormLabel>プロジェクト名</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>説明</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </FormControl>
            <Button
              colorScheme="brand"
              onClick={() => handleUpdateProject(name, description)}
              isFullWidth
              mt={4}
            >
              更新
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    )
  }
  
  // コンソール出力ドロワー
  const ConsoleDrawer = () => {
    return (
      <Drawer
        isOpen={consoleDrawer.isOpen}
        placement="bottom"
        onClose={consoleDrawer.onClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>コンソール出力</DrawerHeader>
          <DrawerBody>
            <ConsoleOutput output={consoleOutput} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    )
  }
  
  // AIチャットドロワー
  const ChatDrawer = () => {
    return (
      <Drawer
        isOpen={chatDrawer.isOpen}
        placement="right"
        onClose={chatDrawer.onClose}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>AIアシスタント</DrawerHeader>
          <DrawerBody>
            <ChatInterface projectId={projectId || ''} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    )
  }
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100%" width="100%">
        <Spinner size="xl" />
      </Flex>
    )
  }
  
  return (
    <Box height="calc(100vh - 60px)" pt="60px">
      <Flex height="100%" width="100%">
        {/* ファイルエクスプローラー */}
        <Box
          width="250px"
          height="100%"
          borderRight="1px"
          borderColor={borderColor}
          bg={bgColor}
          overflowY="auto"
        >
          <FileExplorer
            files={files}
            currentFile={currentFile}
            onFileSelect={handleFileSelect}
          />
        </Box>
        
        {/* エディタ部分 */}
        <Box flex="1" height="100%" display="flex" flexDirection="column">
          {/* エディタヘッダー */}
          <Flex
            p={2}
            borderBottom="1px"
            borderColor={borderColor}
            justifyContent="space-between"
            alignItems="center"
          >
            <Flex alignItems="center">
              <Heading size="sm" mr={2}>
                {currentFile?.name || 'ファイルを選択してください'}
              </Heading>
              {project?.status === 'deploying' && (
                <Badge colorScheme="blue" ml={2}>
                  デプロイ中
                </Badge>
              )}
            </Flex>
            <Flex>
              <IconButton
                aria-label="Save file"
                icon={<FiSave />}
                size="sm"
                mr={2}
                onClick={handleSaveFile}
                isLoading={isSaving}
                isDisabled={!currentFile}
              />
              <IconButton
                aria-label="Deploy"
                icon={<FiPlay />}
                size="sm"
                mr={2}
                colorScheme="green"
                onClick={handleDeploy}
                isLoading={isDeploying}
                isDisabled={project?.status === 'deploying'}
              />
              <IconButton
                aria-label="Console"
                icon={<FiTerminal />}
                size="sm"
                mr={2}
                onClick={consoleDrawer.onOpen}
              />
              <IconButton
                aria-label="AI Chat"
                icon={<FiMessageSquare />}
                size="sm"
                mr={2}
                colorScheme="brand"
                onClick={chatDrawer.onOpen}
              />
              <IconButton
                aria-label="Settings"
                icon={<FiSettings />}
                size="sm"
                onClick={onOpen}
              />
            </Flex>
          </Flex>
          
          {/* エディタ本体 */}
          <Box flex="1" height="calc(100% - 50px)">
            {currentFile ? (
              <Editor
                height="100%"
                defaultLanguage={getLanguageFromFileName(currentFile.name)}
                value={fileContent}
                theme="vs-dark"
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            ) : (
              <Flex
                height="100%"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
              >
                <Text fontSize="lg" mb={4}>
                  ファイルを選択してください
                </Text>
                <Text color="gray.500">
                  左側のファイルエクスプローラーからファイルを選択してください
                </Text>
              </Flex>
            )}
          </Box>
        </Box>
      </Flex>
      
      {/* 各種ドロワー */}
      <SettingsDrawer />
      <ConsoleDrawer />
      <ChatDrawer />
    </Box>
  )
}

// ファイル名から言語を判定する関数
const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    py: 'python',
    rb: 'ruby',
    go: 'go',
    java: 'java',
    php: 'php',
    rs: 'rust',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    sh: 'shell',
  }
  
  return languageMap[extension] || 'plaintext'
}

export default ProjectEditor