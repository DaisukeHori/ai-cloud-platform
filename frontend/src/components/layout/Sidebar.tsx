import React from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Button,
} from '@chakra-ui/react'
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiPlus,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import { useAuth } from '../../contexts/AuthContext'

interface LinkItemProps {
  name: string
  icon: IconType
  path: string
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'ダッシュボード', icon: FiHome, path: '/' },
  { name: 'プロジェクト', icon: FiTrendingUp, path: '/projects' },
  { name: 'テンプレート', icon: FiCompass, path: '/templates' },
  { name: 'お気に入り', icon: FiStar, path: '/favorites' },
  { name: '設定', icon: FiSettings, path: '/settings' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <Box>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

interface SidebarContentProps extends BoxProps {
  onClose: () => void
}

const SidebarContent = ({ onClose, ...rest }: SidebarContentProps) => {
  const location = useLocation()
  
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      pt="60px"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" mt="4" justifyContent="space-between">
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          variant="solid"
          size="md"
          width="100%"
          as={RouterLink}
          to="/projects/new"
        >
          新規プロジェクト
        </Button>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem 
          key={link.name} 
          icon={link.icon} 
          path={link.path}
          isActive={location.pathname === link.path}
        >
          {link.name}
        </NavItem>
      ))}
    </Box>
  )
}

interface NavItemProps extends FlexProps {
  icon: IconType
  path: string
  isActive?: boolean
  children: React.ReactNode
}

const NavItem = ({ icon, path, isActive, children, ...rest }: NavItemProps) => {
  return (
    <Link
      as={RouterLink}
      to={path}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'brand.500' : 'transparent'}
        color={isActive ? 'white' : 'inherit'}
        _hover={{
          bg: isActive ? 'brand.600' : 'brand.100',
          color: isActive ? 'white' : 'brand.500',
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  )
}

export default Sidebar