import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { useWallet } from '../hooks/useWallet';
import { uploadFileToIPFS } from '../services/contractService';
import { CLIENT_CONTRACT } from '../config/contracts';
import { aptos } from '../config/aptos';

const Upload = () => {
  const { account, connected, loading: walletLoading, signAndSubmitTransaction } = useWallet();
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();

  // Reset form when wallet disconnects
  useEffect(() => {
    if (!connected) {
      setSymptoms('');
      setDiagnosis('');
      setFile(null);
      setError(null);
      setSuccess(false);
    }
  }, [connected]);

  const initializeManager = async () => {
    if (!connected || !account) return false;

    try {
      // First check if the manager already exists
      const resource = await aptos.getAccountResource({
        accountAddress: account,
        resourceType: `${CLIENT_CONTRACT}::client::RecManager`
      });

      if (resource) {
        console.log('RecManager already exists for address:', account);
        return true;
      }
    } catch (error) {
      // If we get a 404, the resource doesn't exist and we need to create it
      if (error instanceof Error && error.message.includes('404')) {
        console.log('Initializing RecManager for address:', account);
        
        const payload = {
          payload: {
            function: `${CLIENT_CONTRACT}::client::initialize`,
            type_arguments: [],
            arguments: []
          }
        };

        const response = await signAndSubmitTransaction(payload);
        console.log('Initialization transaction submitted:', response);

        // Wait for transaction confirmation
        const txn = await aptos.waitForTransaction({ transactionHash: response.hash });
        console.log('Initialization transaction confirmed:', txn);

        if (txn.success) {
          console.log('RecManager initialized successfully');
          return true;
        } else {
          throw new Error('Initialization failed');
        }
      }
      throw error;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !account) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      // Initialize manager if needed
      const initialized = await initializeManager();
      if (!initialized) {
        throw new Error('Failed to initialize manager');
      }

      // First, upload file to IPFS via backend
      console.log('Uploading file to IPFS...');
      const uploadResult = await uploadFileToIPFS(file);
      console.log('File uploaded to IPFS:', uploadResult);

      // Use the real IPFS hash
      const ipfsHash = uploadResult.ipfsHash;
      console.log('IPFS hash:', ipfsHash);

      const currentDate = new Date().toISOString();
      const payload = {
        payload: {
          function: `${CLIENT_CONTRACT}::client::add_record`,
          type_arguments: [],
          arguments: [
            account, // client_id
            currentDate, // date
            symptoms, // symptoms
            diagnosis, // diagnosis
            ipfsHash // treatment (real IPFS hash)
          ]
        }
      };

      const response = await signAndSubmitTransaction(payload);
      console.log('Transaction submitted:', response);

      // Wait for transaction confirmation
      const txn = await aptos.waitForTransaction({ transactionHash: response.hash });
      console.log('Transaction confirmed:', txn);

      if (txn.success) {
        toast({
          title: 'Success',
          description: `Record uploaded successfully! File: ${uploadResult.fileName}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Clear form
        setFile(null);
        setSymptoms('');
        setDiagnosis('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Trigger data refresh in other components
        const event = new StorageEvent('storage', {
          key: 'lastUpload',
          newValue: currentDate,
          url: window.location.href
        });
        window.dispatchEvent(event);
        
        // Also update localStorage to ensure the event is caught
        localStorage.setItem('lastUpload', currentDate);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error uploading record:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload record',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <Box maxW="container.md" mx="auto" p={4}>
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>Wallet Not Connected</AlertTitle>
          <AlertDescription>
            Please connect your wallet to upload records.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW="container.md" mx="auto" p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Upload Medical Record
      </Text>
      
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Record uploaded successfully!</AlertDescription>
        </Alert>
      )}

      <Box
        as="form"
        onSubmit={handleSubmit}
        bg={bgColor}
        p={6}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Symptoms</FormLabel>
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Enter patient symptoms"
              rows={4}
              isDisabled={loading || walletLoading}
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Diagnosis</FormLabel>
            <Textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis"
              rows={4}
              isDisabled={loading || walletLoading}
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Medical Record File</FormLabel>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              isDisabled={loading || walletLoading}
              ref={fileInputRef}
            />
          </FormControl>

          {file && (
            <Text fontSize="sm" color="gray.500">
              Selected file: {file.name}
            </Text>
          )}

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={loading || walletLoading}
            isDisabled={!account}
          >
            Upload Record
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default Upload;