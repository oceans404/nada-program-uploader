import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertDescription,
  VStack,
  Text,
  HStack,
} from '@chakra-ui/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';

const StoreProgramApp = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [userSeed, setUserSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [hideAlert, setHideAlert] = useState(false);
  const fileInputRef = useRef(null);
  const [isBoxOpen, setIsBoxOpen] = useState(false);

  const handleFileChange = (event) => {
    setError(null);
    setResult(null);
    setHideAlert(false);
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.py')) {
      setFile(selectedFile);
      setFileName(selectedFile.name.replace(/\.py$/, ''));
      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result);
      };
      reader.readAsText(selectedFile);
    } else {
      setError('Please select a Python (.py) file');
      setFile(null);
      setFileName('');
      setFileContent('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setHideAlert(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const url = `https://nillion-store-program-api-1.onrender.com/store-program/${
        userSeed ? `?user_seed=${userSeed}` : ''
      }`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      if (!data.success) {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileName('');
    setUserSeed('');
    setLoading(false);
    setResult(null);
    setError(null);
    setFileContent('');
    setHideAlert(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <>
      {!hideAlert && (
        <>
          {result && (
            <Alert
              status={error ? 'error' : 'success'}
              // position="absolute"
              top={0}
              width="full"
            >
              <HStack justify="space-between" width="full">
                <AlertDescription>
                  <Text>
                    {error ? (
                      error
                    ) : (
                      <>
                        Success! Stored your {fileName} Nada program on the
                        Nillion Testnet
                      </>
                    )}
                  </Text>
                </AlertDescription>

                <Button onClick={() => setHideAlert(true)} aria-label="Close">
                  X
                </Button>
              </HStack>
            </Alert>
          )}
        </>
      )}

      <div
        style={{
          maxWidth: 'lg',
          padding: '20px 100px',
          margin: '0 auto',
        }}
      >
        <Heading size="xl">Store Nada Program on the Nillion Testnet</Heading>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel my={2}>
              User Seed (optional - if no user seed is provided, the program
              will be stored with a random user seed)
            </FormLabel>
            <Input
              value={userSeed}
              onChange={(e) => setUserSeed(e.target.value)}
              placeholder="Enter user seed"
            />
          </FormControl>
          <FormControl>
            <FormLabel my={2}>Nada Program File</FormLabel>
            <Input
              type="file"
              accept=".py"
              onChange={handleFileChange}
              padding={1}
              ref={fileInputRef}
            />
          </FormControl>

          {fileContent && (
            <Box mt={4} p={4} borderWidth={1} borderRadius="md" bg="gray.50">
              <HStack
                justify="space-between"
                onClick={() => setIsBoxOpen(!isBoxOpen)}
                style={{ cursor: 'pointer' }}
              >
                <Text fontWeight="bold">Nada Program: {fileName}.py</Text>
                <Button size="sm">{isBoxOpen ? 'Collapse' : 'Expand'}</Button>
              </HStack>
              {isBoxOpen && (
                <SyntaxHighlighter
                  language="python"
                  style={okaidia}
                  showLineNumbers
                >
                  {fileContent}
                </SyntaxHighlighter>
              )}
            </Box>
          )}

          <HStack spacing={4} width="full">
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              isDisabled={!file}
              width="full"
              onClick={handleSubmit}
            >
              Upload {fileName} program to Nillion Testnet
            </Button>

            <Button colorScheme="gray" onClick={handleReset} isDisabled={!file}>
              Reset
            </Button>
          </HStack>

          {result && !error && (
            <Box mt={4} p={4} borderWidth={1} borderRadius="md" bg="gray.100">
              <Heading size="lg" marginBottom={4}>
                Stored Nada Program
              </Heading>
              <HStack spacing={2} justify="space-between">
                <Text fontWeight="bold" color="blue.600">
                  Nillion Testnet Program ID: {result.program_id}
                </Text>
                <Button
                  colorScheme="blue"
                  onClick={() =>
                    navigator.clipboard.writeText(result.program_id)
                  }
                >
                  Copy Program ID
                </Button>
              </HStack>
            </Box>
          )}
        </VStack>
      </div>
    </>
  );
};

export default StoreProgramApp;
