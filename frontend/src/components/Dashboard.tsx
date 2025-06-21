import { Box, Container, Heading, SimpleGrid, Stat, StatLabel, StatNumber, Text, useToast, Spinner } from '@chakra-ui/react';
import { useWallet } from '../hooks/useWallet';
import { useEffect, useState, useCallback } from 'react';
import { getAccountStats, getStats, initializeManager } from '../services/contractService';

interface Stats {
  totalRecords: number;
  lastUploadDate: string | null;
}

interface GlobalStats {
  totalRecords: number;
  totalAccounts: number;
}

const Dashboard = () => {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [stats, setStats] = useState<Stats>({ totalRecords: 0, lastUploadDate: null });
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ totalRecords: 0, totalAccounts: 0 });
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const toast = useToast();

  const initializeManagerIfNeeded = useCallback(async () => {
    if (!connected || !account || initializing) return false;

    try {
      setInitializing(true);
      await initializeManager(signAndSubmitTransaction);
      toast({
        title: 'Success',
        description: 'Manager initialized successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      return true;
    } catch (error) {
      console.error('Error initializing manager:', error);
      // If the error is EALREADY_INITIALIZED, we can proceed
      if (error instanceof Error && error.message.includes('EALREADY_INITIALIZED')) {
        console.log('Manager already exists, proceeding with stats fetch');
        return true;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to initialize manager. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return false;
      }
    } finally {
      setInitializing(false);
    }
  }, [account, connected, initializing, signAndSubmitTransaction, toast]);

  const fetchData = useCallback(async () => {
    if (!connected || !account) {
      setStats({ totalRecords: 0, lastUploadDate: null });
      setGlobalStats({ totalRecords: 0, totalAccounts: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching dashboard data for account:', account);
      const [accountStats, globalStatsData] = await Promise.all([
        getAccountStats(account),
        getStats(account)
      ]);
      console.log('Fetched stats:', { accountStats, globalStatsData });
      setStats(accountStats);
      setGlobalStats(globalStatsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data. Please try refreshing the page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [account, connected, toast]);

  // Initial data fetch and manager initialization
  useEffect(() => {
    let mounted = true;

    const initializeAndFetch = async () => {
      if (!connected || !account) return;

      try {
        const initialized = await initializeManagerIfNeeded();
        if (initialized && mounted) {
          await fetchData();
        }
      } catch (error) {
        console.error('Error in initialization process:', error);
      }
    };

    initializeAndFetch();

    return () => {
      mounted = false;
    };
  }, [account, connected, initializeManagerIfNeeded, fetchData]);

  // Listen for storage events to refresh data
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Dashboard: Storage event received:', e);
      if (e.key === 'lastUpload') {
        console.log('Dashboard: Refreshing data after upload');
        fetchData();
      }
    };

    // Also listen for custom events
    const handleCustomEvent = (e: Event) => {
      console.log('Dashboard: Custom event received:', e);
      fetchData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('lastUpload', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('lastUpload', handleCustomEvent);
    };
  }, [fetchData]);

  if (!connected) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Heading size="lg" mb={4}>Please connect your wallet to view your dashboard</Heading>
          <Text>Connect your wallet to see your medical records statistics and upload history.</Text>
        </Box>
      </Container>
    );
  }

  if (initializing) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" mb={4} />
          <Heading size="lg" mb={4}>Initializing Manager</Heading>
          <Text>Please wait while we set up your account...</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={8}>Dashboard</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        <Stat
          p={6}
          shadow="md"
          border="1px"
          borderColor="gray.200"
          borderRadius="lg"
          bg="white"
        >
          <StatLabel>Your Records</StatLabel>
          <StatNumber>{loading ? '...' : stats.totalRecords}</StatNumber>
        </Stat>
        <Stat
          p={6}
          shadow="md"
          border="1px"
          borderColor="gray.200"
          borderRadius="lg"
          bg="white"
        >
          <StatLabel>Last Upload</StatLabel>
          <StatNumber>
            {loading ? '...' : stats.lastUploadDate ? new Date(stats.lastUploadDate).toLocaleDateString() : 'Never'}
          </StatNumber>
        </Stat>
        <Stat
          p={6}
          shadow="md"
          border="1px"
          borderColor="gray.200"
          borderRadius="lg"
          bg="white"
        >
          <StatLabel>Total Records in System</StatLabel>
          <StatNumber>{loading ? '...' : globalStats.totalRecords}</StatNumber>
        </Stat>
      </SimpleGrid>
    </Container>
  );
};

export default Dashboard; 