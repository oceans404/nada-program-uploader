import React, { useState } from 'react';
import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CollapsibleCode = ({
  title,
  fileContent,
  language,
  copyText = 'Copy Code',
  startIsOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(startIsOpen);

  return (
    <Box mt={4} p={4} borderWidth={1} borderRadius="md" bg="gray.50">
      <HStack justify="space-between" style={{ cursor: 'pointer' }}>
        <Text fontWeight="bold">{title}</Text>
        <HStack>
          <Button
            size="sm"
            onClick={() => navigator.clipboard.writeText(fileContent)}
          >
            {copyText}
          </Button>
          <Button size="sm" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? 'Collapse' : 'Expand'}
          </Button>
        </HStack>
      </HStack>
      {isOpen && (
        <SyntaxHighlighter language={language} style={okaidia} showLineNumbers>
          {fileContent}
        </SyntaxHighlighter>
      )}
    </Box>
  );
};

export default CollapsibleCode;
