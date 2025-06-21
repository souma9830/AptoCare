import { useCallback } from 'react';
import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Stack,
  useColorMode,
  IconButton,
  Heading,
  useToast,
  Image
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useWallet } from '../hooks/useWallet';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { account, connected, loading, connect, disconnect } = useWallet();
  const location = useLocation();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const isActive = (path: string) => location.pathname === path;

  const handleWalletAction = useCallback(async () => {
    try {
      console.log('Wallet action triggered. Connected:', connected);
      if (connected) {
        await disconnect();
        toast({
          title: 'Wallet disconnected',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await connect();
        toast({
          title: 'Wallet connected',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error handling wallet action:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [connected, connect, disconnect, toast]);

  const formatAddress = (address: string) => {
    if (!address) return 'Connect Wallet';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Box 
      bg={bgColor} 
      px={4}
      borderBottom="1px" 
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <Heading size="md" mr={8}>
            <RouterLink to="/">
              <Image 
                src="/AptoCare logo.png" 
                alt="Aptoo care logo" 
                h="50px"
                objectFit="contain"
              />
            </RouterLink>
          </Heading>
          <Stack direction="row" spacing={4}>
            <Button
              as={RouterLink}
              to="/dashboard"
              variant={isActive('/dashboard') ? 'solid' : 'ghost'}
              colorScheme="blue"
            >
              Dashboard
            </Button>
            <Button
              as={RouterLink}
              to="/upload"
              variant={isActive('/upload') ? 'solid' : 'ghost'}
              colorScheme="blue"
            >
              Upload
            </Button>
            <Button
              as={RouterLink}
              to="/records"
              variant={isActive('/records') ? 'solid' : 'ghost'}
              colorScheme="blue"
            >
              Records
            </Button>
          </Stack>
        </Flex>

        <Flex alignItems="center">
          <Stack direction="row" spacing={4}>
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
            />
            <Button
              onClick={handleWalletAction}
              colorScheme="blue"
              variant={connected ? 'outline' : 'solid'}
              isLoading={loading}
              loadingText="Connecting..."
            >
              {formatAddress(account || '')}
            </Button>
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 