import React from 'react'
import { Outlet } from 'react-router-dom'
import {
  Box,
  Flex,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  
  return (
    <Box minH="100vh" bg={bgColor}>
      <Header onOpenSidebar={onOpen} />
      <Sidebar isOpen={isOpen} onClose={onClose} />
      
      <Box ml={{ base: 0, md: 60 }} p="4">
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout