import { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  useColorModeValue,
  Text,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Container,
  Heading,
  useToast,
  Card,
  CardBody,
  Flex
} from '@chakra-ui/react';
import { useWallet } from '../hooks/useWallet';
import { getAccountStats, getStats } from '../services/contractService';
import { ViewIcon, StarIcon } from '@chakra-ui/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface Stats {
  totalRecords: number;
  lastUploadDate: string | null;
}

interface GlobalStats {
  totalRecords: number;
  totalAccounts: number;
}

const Dashboard = () => {
  const { account, connected, loading: walletLoading } = useWallet();
  const [stats, setStats] = useState<Stats>({ totalRecords: 0, lastUploadDate: null });
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ totalRecords: 0, totalAccounts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchData = async () => {
    if (!connected || !account) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [accountStats, globalStatsData] = await Promise.all([
        getAccountStats(account),
        getStats(account)
      ]);
      setStats(accountStats);
      setGlobalStats(globalStatsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      toast({
        title: 'Error',
        description: 'Failed to fetch stats. Please try refreshing the page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [connected, account]);

  if (!connected) {
    return (
      <Box maxW="container.xl" mx="auto" p={4}>
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>Wallet Not Connected</AlertTitle>
          <AlertDescription>
            Please connect your wallet to view your dashboard.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  if (loading || walletLoading) {
    return (
      <Center h="200px">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Box maxW="container.xl" mx="auto" p={4}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={8} size="xl" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>
        Medical Records Dashboard
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        <Card bg={useColorModeValue('white', 'gray.700')} shadow="md" borderRadius="lg">
          <CardBody>
            <Flex align="center" mb={2}>
              <ViewIcon boxSize={6} color="blue.500" mr={2} />
              <Text fontSize="lg" fontWeight="medium">Your Records</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold">{stats.totalRecords}</Text>
            <Text fontSize="sm" color="gray.500">
              Last Upload: {stats.lastUploadDate ? new Date(stats.lastUploadDate).toLocaleString() : 'Never'}
            </Text>
          </CardBody>
        </Card>

        <Card bg={useColorModeValue('white', 'gray.700')} shadow="md" borderRadius="lg">
          <CardBody>
            <Flex align="center" mb={2}>
              <ViewIcon boxSize={6} color="green.500" mr={2} />
              <Text fontSize="lg" fontWeight="medium">Total Records</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold">{globalStats.totalRecords}</Text>
            <Text fontSize="sm" color="gray.500">Across all accounts</Text>
          </CardBody>
        </Card>

        <Card bg={useColorModeValue('white', 'gray.700')} shadow="md" borderRadius="lg">
          <CardBody>
            <Flex align="center" mb={2}>
              <StarIcon boxSize={6} color="purple.500" mr={2} />
              <Text fontSize="lg" fontWeight="medium">Total Accounts</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold">{globalStats.totalAccounts}</Text>
            <Text fontSize="sm" color="gray.500">Registered users</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Health Trends Chart */}
      <Card bg={useColorModeValue('white', 'gray.700')} shadow="md" borderRadius="lg" mb={8}>
        <CardBody>
          <Text fontSize="lg" fontWeight="medium" mb={4}>Health Trends</Text>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { date: 'Jan', score: 75 },
                  { date: 'Feb', score: 78 },
                  { date: 'Mar', score: 82 },
                  { date: 'Apr', score: 80 },
                  { date: 'May', score: 85 },
                  { date: 'Jun', score: 85 }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8884d8" name="Health Score" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card bg={useColorModeValue('white', 'gray.700')} shadow="md" borderRadius="lg">
        <CardBody>
          <Text fontSize="lg" fontWeight="medium" mb={4}>Recent Activity</Text>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { month: 'Jan', records: 2 },
                  { month: 'Feb', records: 3 },
                  { month: 'Mar', records: 1 },
                  { month: 'Apr', records: 4 },
                  { month: 'May', records: 2 },
                  { month: 'Jun', records: 3 }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="records" fill="#82ca9d" name="Records Added" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Dashboard;