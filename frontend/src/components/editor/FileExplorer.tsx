import React, { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import {
  FiFolder,
  FiFile,
  FiFolderPlus,
  FiFilePlus,
  FiMoreVertical,
  FiTrash2,
  FiEdit,
  FiChevronRight,
  FiChevronDown,
} from 'react-icons/fi'
import axios from 'axios'

// ファイル型定義
interface ProjectFile {
  id: string
  name: string
  path: string
  content: string
  type: 'file' | 'directory'
  children?: ProjectFile[]
}

interface FileExplorerProps {
  files: ProjectFile[]
  currentFile: ProjectFile | null
  onFileSelect: (file: ProjectFile) => void
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  currentFile,
  onFileSelect,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState<'file' | 'directory'>('file')
  const [currentPath, setCurrentPath] = useState<string>('')
  const [editingFile, setEditingFile] = useState<ProjectFile | null>(null)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700')
  const selectedBgColor = useColorModeValue('blue.100', 'blue.700')
  const folderColor = useColorModeValue('blue.500', 'blue.300')
  const fileColor = useColorModeValue('gray.500', 'gray.400')
  
  // フォルダの展開/折りたたみ
  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }))
  }
  
  // 新規ファイル/フォルダ作成モーダルを開く
  const openNewItemModal = (path: string, type: 'file' | 'directory') => {
    setCurrentPath(path)
    setNewItemType(type)
    setNewItemName('')
    onOpen()
  }
  
  // 新規ファイル/フォルダ作成
  const handleCreateNewItem = async () => {
    if (!newItemName.trim()) return
    
    try {
      const response = await axios.post('/api/projects/files', {
        path: `${currentPath}/${newItemName}`,
        type: newItemType,
        content: newItemType === 'file' ? '' : undefined,
      })
      
      // 親フォルダを展開
      setExpandedFolders((prev) => ({
        ...prev,
        [currentPath]: true,
      }))
      
      onClose()
    } catch (error) {
      console.error('Failed to create new item:', error)
    }
  }
  
  // ファイル/フォルダの削除
  const handleDeleteItem = async (file: ProjectFile) => {
    try {
      await axios.delete(`/api/projects/files/${file.id}`)
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }
  
  // ファイル/フォルダ名の変更
  const handleRenameItem = async (file: ProjectFile, newName: string) => {
    try {
      await axios.put(`/api/projects/files/${file.id}`, {
        name: newName,
      })
      
      setEditingFile(null)
    } catch (error) {
      console.error('Failed to rename item:', error)
    }
  }
  
  // ファイル拡張子からアイコンの色を決定
  const getFileIconColor = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'yellow.500'
      case 'ts':
      case 'tsx':
        return 'blue.500'
      case 'html':
        return 'orange.500'
      case 'css':
        return 'pink.500'
      case 'json':
        return 'green.500'
      case 'md':
        return 'purple.500'
      default:
        return fileColor
    }
  }
  
  // ファイルツリーの再帰的レンダリング
  const renderFileTree = (items: ProjectFile[], level = 0) => {
    return items.map((item) => {
      const isFolder = item.type === 'directory'
      const isExpanded = expandedFolders[item.path] || false
      const isSelected = currentFile?.id === item.id
      const paddingLeft = level * 16 + 8
      
      return (
        <Box key={item.id}>
          <Flex
            py={1}
            px={2}
            pl={`${paddingLeft}px`}
            alignItems="center"
            cursor="pointer"
            bg={isSelected ? selectedBgColor : 'transparent'}
            _hover={{ bg: isSelected ? selectedBgColor : hoverBgColor }}
            borderRadius="md"
            onClick={() => {
              if (isFolder) {
                toggleFolder(item.path)
              } else {
                onFileSelect(item)
              }
            }}
          >
            {isFolder && (
              <Icon
                as={isExpanded ? FiChevronDown : FiChevronRight}
                mr={1}
                fontSize="sm"
              />
            )}
            <Icon
              as={isFolder ? FiFolder : FiFile}
              mr={2}
              color={isFolder ? folderColor : getFileIconColor(item.name)}
            />
            {editingFile?.id === item.id ? (
              <Input
                size="xs"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onBlur={() => {
                  if (newItemName.trim() && newItemName !== editingFile.name) {
                    handleRenameItem(editingFile, newItemName)
                  } else {
                    setEditingFile(null)
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    if (newItemName.trim() && newItemName !== editingFile.name) {
                      handleRenameItem(editingFile, newItemName)
                    } else {
                      setEditingFile(null)
                    }
                  }
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Text fontSize="sm" flex="1" isTruncated>
                {item.name}
              </Text>
            )}
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="xs"
                onClick={(e) => e.stopPropagation()}
                opacity={0}
                _groupHover={{ opacity: 1 }}
              />
              <MenuList fontSize="sm">
                <MenuItem
                  icon={<FiEdit />}
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingFile(item)
                    setNewItemName(item.name)
                  }}
                >
                  名前変更
                </MenuItem>
                <MenuItem
                  icon={<FiTrash2 />}
                  color="red.500"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteItem(item)
                  }}
                >
                  削除
                </MenuItem>
                {isFolder && (
                  <>
                    <MenuItem
                      icon={<FiFilePlus />}
                      onClick={(e) => {
                        e.stopPropagation()
                        openNewItemModal(item.path, 'file')
                      }}
                    >
                      新規ファイル
                    </MenuItem>
                    <MenuItem
                      icon={<FiFolderPlus />}
                      onClick={(e) => {
                        e.stopPropagation()
                        openNewItemModal(item.path, 'directory')
                      }}
                    >
                      新規フォルダ
                    </MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
          </Flex>
          
          {isFolder && isExpanded && item.children && (
            <Box>
              {renderFileTree(item.children, level + 1)}
            </Box>
          )}
        </Box>
      )
    })
  }
  
  return (
    <Box height="100%" overflowY="auto" p={2} bg={bgColor}>
      <Flex justifyContent="space-between" alignItems="center" mb={2} px={2}>
        <Text fontWeight="bold" fontSize="sm">
          ファイルエクスプローラー
        </Text>
        <Flex>
          <IconButton
            aria-label="New File"
            icon={<FiFilePlus />}
            size="xs"
            variant="ghost"
            onClick={() => openNewItemModal('', 'file')}
          />
          <IconButton
            aria-label="New Folder"
            icon={<FiFolderPlus />}
            size="xs"
            variant="ghost"
            onClick={() => openNewItemModal('', 'directory')}
          />
        </Flex>
      </Flex>
      
      <Box>{renderFileTree(files)}</Box>
      
      {/* 新規ファイル/フォルダ作成モーダル */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {newItemType === 'file' ? '新規ファイル' : '新規フォルダ'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>
                {newItemType === 'file' ? 'ファイル名' : 'フォルダ名'}
              </FormLabel>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={
                  newItemType === 'file'
                    ? 'example.js'
                    : 'フォルダ名を入力'
                }
                autoFocus
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              キャンセル
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleCreateNewItem}
              isDisabled={!newItemName.trim()}
            >
              作成
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default FileExplorer