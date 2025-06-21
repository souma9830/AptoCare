import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useWallet } from '../hooks/useWallet';

interface RecordHistoryProps {
  recordIndex: number;
}

const RecordHistory: React.FC<RecordHistoryProps> = () => {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <Box p={4} textAlign="center">
        <Text>Please connect your wallet to view record history.</Text>
      </Box>
    );
  }

  return (
    <Box p={4} textAlign="center">
      <Text>No version history available for this record.</Text>
    </Box>
  );
};

export default RecordHistory; 