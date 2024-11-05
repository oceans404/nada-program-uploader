import React, { useState, useRef, useEffect } from 'react';
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
  Link,
} from '@chakra-ui/react';
import CollapsibleCode from './CollapsibleCode';

const StoreProgramApp = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [userSeed, setUserSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [hideAlert, setHideAlert] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);
  const fileInputRef = useRef(null);

  const baseUrl = 'https://store-nada-program.onrender.com';

  const getNetworkInfo = async () => {
    const response = await fetch(`${baseUrl}/check-nillion-version`);
    return response.json();
  };

  useEffect(() => {
    const fetchTestnetInfo = async () => {
      const info = await getNetworkInfo();
      setNetworkInfo(info);
    };

    fetchTestnetInfo();
  }, []);

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
      const url = `${baseUrl}/store-program/${
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
              top={0}
              width="full"
              position="sticky"
              opacity={100}
              zIndex={1000}
            >
              <HStack justify="space-between" width="full">
                <AlertDescription>
                  <Text>
                    {error ? (
                      error
                    ) : (
                      <>
                        Successfully stored your {fileName} Nada program on the
                        Nillion Testnet
                        <Button
                          marginLeft={4}
                          colorScheme="gray"
                          onClick={() =>
                            navigator.clipboard.writeText(result.program_id)
                          }
                        >
                          Copy Program ID
                        </Button>
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
        <Heading size="xl">Nada Program Uploader</Heading>
        <Heading size="md" my={4}>
          Store a Nada Program on the Nillion Testnet
        </Heading>
        {networkInfo && (
          <CollapsibleCode
            title={`Nillion Testnet Network Info`}
            fileContent={JSON.stringify(networkInfo, null, 2)}
            language="json"
            copyText="Copy Network Info"
          />
        )}
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel my={2} fontWeight="bold">
              User Seed
            </FormLabel>
            <Text my={2} size="sm">
              Optional - if no user seed is provided, the program will be stored
              with a random user seed
            </Text>
            <Input
              value={userSeed}
              onChange={(e) => setUserSeed(e.target.value)}
              placeholder="Enter user seed"
            />
          </FormControl>
          <FormControl>
            <FormLabel my={2} fontWeight="bold">
              Nada Program File
            </FormLabel>
            <Text my={2}>
              Need some inspiration? Check out the Nada program examples in{' '}
              <Link
                href="https://docs.nillion.com/nada-by-example"
                target="_blank"
                rel="noopener noreferrer"
                color="blue.600"
                fontWeight="bold"
              >
                Nada by Example
              </Link>
            </Text>
            <Input
              type="file"
              accept=".py"
              onChange={handleFileChange}
              padding={1}
              ref={fileInputRef}
            />
          </FormControl>

          {fileContent && (
            <CollapsibleCode
              title={`Nada Program: ${fileName}.py`}
              fileContent={fileContent}
              language="python"
              startIsOpen
            />
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
              <HStack spacing={2} justify="space-between">
                <Heading size="lg" marginBottom={4}>
                  Stored Nada Program
                </Heading>
                <Button
                  colorScheme="blue"
                  onClick={() =>
                    navigator.clipboard.writeText(result.program_id)
                  }
                  minWidth={200}
                >
                  Copy Program ID
                </Button>
              </HStack>

              <Text
                fontWeight="bold"
                color="blue.600"
                overflowWrap="break-word"
              >
                Nillion Testnet Program ID: {result.program_id}
              </Text>

              <CollapsibleCode
                title="JSON Content"
                fileContent={JSON.stringify(result.json_content, null, 2)}
                language="json"
              />
            </Box>
          )}
        </VStack>
      </div>
    </>
  );
};

export default StoreProgramApp;
