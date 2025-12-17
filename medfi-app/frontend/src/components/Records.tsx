import { Box, Container, Heading, Table, Thead, Tbody, Tr, Th, Td, Text, useToast } from '@chakra-ui/react';
import { useWallet } from '../hooks/useWallet';
import { useEffect, useState } from 'react';
import { getRecords } from '../services/contractService';
import { Record } from '../types/record';

const Records = () => {
  const { account, connected } = useWallet();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchRecords = async () => {
    if (!connected || !account) {
      setRecords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getRecords(account);
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch records',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRecords();
  }, [account, connected]);

  // Listen for storage events to refresh data
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastUpload') {
        fetchRecords();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!connected) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Heading size="lg" mb={4}>Please connect your wallet to view your records</Heading>
          <Text>Connect your wallet to see your medical records history.</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={8}>Your Medical Records</Heading>
      {loading ? (
        <Text>Loading records...</Text>
      ) : records.length === 0 ? (
        <Text>No records found. Upload your first medical record to get started.</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Symptoms</Th>
                <Th>Diagnosis</Th>
                <Th>Treatment</Th>
              </Tr>
            </Thead>
            <Tbody>
              {records.map((record, index) => (
                <Tr key={index}>
                  <Td>{new Date(record.date).toLocaleDateString()}</Td>
                  <Td>{record.symptoms}</Td>
                  <Td>{record.diagnosis}</Td>
                  <Td>{record.treatment}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Container>
  );
};

export default Records; 