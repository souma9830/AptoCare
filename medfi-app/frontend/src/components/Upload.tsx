import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Heading,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { useWallet } from '../hooks/useWallet';
import { addRecord } from '../services/contractService';

const Upload = () => {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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

    if (!symptoms || !diagnosis || !file) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields and select a file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const fileHash = await calculateFileHash(file);
      await addRecord(symptoms, diagnosis, fileHash, signAndSubmitTransaction);

      console.log('Transaction response:', signAndSubmitTransaction);

      // Trigger refresh in other components
      window.localStorage.setItem('lastUpload', new Date().toISOString());
      window.dispatchEvent(new Event('storage'));

      setSuccess(true);
      setSymptoms('');
      setDiagnosis('');
      setFile(null);

      toast({
        title: 'Success',
        description: 'Record uploaded successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading record:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload record');
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
  }, [connected, account, symptoms, diagnosis, file, signAndSubmitTransaction, toast]);

  const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  if (!connected) {
    return (
      <Box p={8} textAlign="center">
        <Heading size="lg" mb={4}>Upload Medical Record</Heading>
        <Text>Please connect your wallet to upload records.</Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading size="lg" mb={8}>Upload Medical Record</Heading>
      <Box
        as="form"
        onSubmit={handleSubmit}
        p={6}
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
        maxW="600px"
        mx="auto"
      >
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Symptoms</FormLabel>
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Enter patient symptoms"
              isDisabled={loading}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Diagnosis</FormLabel>
            <Textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis"
              isDisabled={loading}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Medical Record File</FormLabel>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              isDisabled={loading}
            />
          </FormControl>

          {error && (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          )}

          {success && (
            <Text color="green.500" fontSize="sm">
              Record uploaded successfully!
            </Text>
          )}

          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText="Uploading..."
            width="full"
            isDisabled={!connected || loading}
          >
            Upload Record
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default Upload; 