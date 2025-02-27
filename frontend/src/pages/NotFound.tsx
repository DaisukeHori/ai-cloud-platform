import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Heading,
  Text,
  Container,
  VStack,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { FiHome, FiAlertTriangle } from 'react-icons/fi'

const NotFound: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Box
        py={{ base: '8', sm: '16' }}
        px={{ base: '4', sm: '10' }}
        bg={bgColor}
        boxShadow={{ base: 'none', sm: 'md' }}
        borderRadius={{ base: 'none', sm: 'xl' }}
        borderWidth="1px"
        borderColor={borderColor}
        textAlign="center"
      >
        <VStack spacing={8}>
          <Icon as={FiAlertTriangle} boxSize="16" color="orange.500" />
          <Heading size="xl">404</Heading>
          <Text fontSize="xl">ページが見つかりません</Text>
          <Text color="gray.500">
            お探しのページは存在しないか、移動した可能性があります。
          </Text>
          <Button
            as={RouterLink}
            to="/"
            colorScheme="brand"
            leftIcon={<FiHome />}
            size="lg"
          >
            ホームに戻る
          </Button>
        </VStack>
      </Box>
    </Container>
  )
}

export default NotFound