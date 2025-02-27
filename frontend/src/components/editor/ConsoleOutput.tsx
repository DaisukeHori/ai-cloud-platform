import React, { useEffect, useRef } from 'react'
import {
  Box,
  Text,
  useColorModeValue,
  IconButton,
  Flex,
  Tooltip,
} from '@chakra-ui/react'
import { FiTrash2, FiCopy } from 'react-icons/fi'

interface ConsoleOutputProps {
  output: string[]
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ output }) => {
  const consoleRef = useRef<HTMLDivElement>(null)
  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const errorColor = useColorModeValue('red.600', 'red.300')
  const warningColor = useColorModeValue('orange.600', 'orange.300')
  const infoColor = useColorModeValue('blue.600', 'blue.300')
  const successColor = useColorModeValue('green.600', 'green.300')
  
  // 新しい出力が追加されたら自動スクロール
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [output])
  
  // 出力をクリップボードにコピー
  const copyOutput = () => {
    const text = output.join('\n')
    navigator.clipboard.writeText(text)
  }
  
  // 出力の種類に応じた色を返す
  const getLineColor = (line: string) => {
    const lowerLine = line.toLowerCase()
    
    if (lowerLine.includes('error') || lowerLine.includes('exception') || lowerLine.includes('fail')) {
      return errorColor
    } else if (lowerLine.includes('warn')) {
      return warningColor
    } else if (lowerLine.includes('info')) {
      return infoColor
    } else if (lowerLine.includes('success')) {
      return successColor
    }
    
    return textColor
  }
  
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Flex justifyContent="flex-end" mb={2}>
        <Tooltip label="コンソール出力をクリア">
          <IconButton
            aria-label="Clear console"
            icon={<FiTrash2 />}
            size="sm"
            variant="ghost"
            mr={2}
          />
        </Tooltip>
        <Tooltip label="コンソール出力をコピー">
          <IconButton
            aria-label="Copy console output"
            icon={<FiCopy />}
            size="sm"
            variant="ghost"
            onClick={copyOutput}
          />
        </Tooltip>
      </Flex>
      
      <Box
        ref={consoleRef}
        flex="1"
        bg={bgColor}
        p={3}
        borderRadius="md"
        overflowY="auto"
        fontFamily="monospace"
        fontSize="sm"
      >
        {output.length === 0 ? (
          <Text color="gray.500" fontStyle="italic">
            コンソール出力はまだありません
          </Text>
        ) : (
          output.map((line, index) => (
            <Text
              key={index}
              color={getLineColor(line)}
              whiteSpace="pre-wrap"
              wordBreak="break-all"
              mb={1}
            >
              {line}
            </Text>
          ))
        )}
      </Box>
    </Box>
  )
}

export default ConsoleOutput