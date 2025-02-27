import React, { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Button,
  useColorModeValue,
  Badge,
  Icon,
  Skeleton,
  useToast,
} from '@chakra-ui/react'
import { FiPlus, FiCode, FiClock, FiServer } from 'react-icons/fi'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

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

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const toast = useToast()
  const bgCard = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // プロジェクト一覧を取得
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get('/api/projects')
        setProjects(response.data.projects)
      } catch (error) {
        toast({
          title: 'プロジェクト取得エラー',
          description: 'プロジェクト一覧の取得に失敗しました',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [toast])

  // プロジェクトカード
  const ProjectCard = ({ project }: { project: Project }) => {
    return (
      <Box
        p={5}
        shadow="md"
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        bg={bgCard}
        transition="all 0.3s"
        _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
      >
        <Flex justifyContent="space-between" alignItems="center" mb={2}>
          <Heading fontSize="xl" fontWeight="semibold">
            {project.name}
          </Heading>
          <Badge
            colorScheme={
              project.status === 'active'
                ? 'green'
                : project.status === 'deploying'
                ? 'blue'
                : 'gray'
            }
          >
            {project.status === 'active'
              ? '稼働中'
              : project.status === 'deploying'
              ? 'デプロイ中'
              : 'アーカイブ'}
          </Badge>
        </Flex>
        <Text color="gray.500" fontSize="sm" mb={4}>
          最終更新: {new Date(project.updatedAt).toLocaleString('ja-JP')}
        </Text>
        <Text noOfLines={2} mb={4}>
          {project.description || 'プロジェクトの説明はありません'}
        </Text>
        <Flex justifyContent="space-between" mt={4}>
          <Button
            as={RouterLink}
            to={`/project/${project.id}`}
            colorScheme="brand"
            size="sm"
            leftIcon={<FiCode />}
          >
            編集
          </Button>
          {project.deployedUrl && (
            <Button
              as="a"
              href={project.deployedUrl}
              target="_blank"
              rel="noopener noreferrer"
              colorScheme="green"
              size="sm"
              leftIcon={<FiServer />}
              ml={2}
            >
              アプリを開く
            </Button>
          )}
        </Flex>
      </Box>
    )
  }

  // 新規プロジェクトカード
  const NewProjectCard = () => {
    return (
      <Box
        p={5}
        shadow="md"
        borderWidth="1px"
        borderStyle="dashed"
        borderColor={borderColor}
        borderRadius="lg"
        bg={bgCard}
        transition="all 0.3s"
        _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Icon as={FiPlus} w={10} h={10} color="gray.400" mb={4} />
        <Button
          as={RouterLink}
          to="/projects/new"
          colorScheme="brand"
          size="md"
          leftIcon={<FiPlus />}
        >
          新規プロジェクト
        </Button>
      </Box>
    )
  }

  return (
    <Box pt={5} pb={10}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">マイプロジェクト</Heading>
        <Button
          as={RouterLink}
          to="/projects/new"
          colorScheme="brand"
          leftIcon={<FiPlus />}
        >
          新規プロジェクト
        </Button>
      </Flex>

      {isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {[...Array(3)].map((_, i) => (
            <Box key={i}>
              <Skeleton height="200px" borderRadius="lg" />
            </Box>
          ))}
        </SimpleGrid>
      ) : projects.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          <NewProjectCard />
        </SimpleGrid>
      ) : (
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          p={10}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgCard}
        >
          <Icon as={FiClock} w={12} h={12} color="gray.400" mb={4} />
          <Heading size="md" mb={2} textAlign="center">
            プロジェクトがありません
          </Heading>
          <Text mb={6} textAlign="center" color="gray.500">
            新しいプロジェクトを作成して、AIを使った開発を始めましょう
          </Text>
          <Button
            as={RouterLink}
            to="/projects/new"
            colorScheme="brand"
            size="lg"
            leftIcon={<FiPlus />}
          >
            新規プロジェクト作成
          </Button>
        </Flex>
      )}
    </Box>
  )
}

export default Dashboard