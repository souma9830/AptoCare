import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { getRecords, downloadFile, getFilePreview, validateFileHash, isIPFSHash } from '../services/contractService';
import { Record } from '../types/record';
import {
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  IconButton,
  useToast,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Image,
  Spinner,
  Badge
} from '@chakra-ui/react';
import { DeleteIcon, ViewIcon, DownloadIcon } from '@chakra-ui/icons';

export default function Records() {
  const { account } = useWallet();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [filePreview, setFilePreview] = useState<{ blob: Blob; type: string; url: string } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{ [key: string]: any } | null>(null);
  const [hasHiddenRecords, setHasHiddenRecords] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isConfirmOpen, 
    onOpen: onConfirmOpen, 
    onClose: onConfirmClose 
  } = useDisclosure();
  const toast = useToast();

  const fetchRecords = async () => {
    if (!account) return;

    try {
      setLoading(true);
      const fetchedRecords = await getRecords(account);
      
      // Check if we have filtered records in localStorage
      const filteredRecordsData = localStorage.getItem('filteredRecords');
      if (filteredRecordsData) {
        const filteredRecords = JSON.parse(filteredRecordsData);
        // Only show records that are in the filtered list (i.e., new IPFS records)
        const validRecords = fetchedRecords.filter(record => 
          filteredRecords.some((filteredRecord: Record) => 
            filteredRecord.treatment === record.treatment
          )
        );
        setRecords(validRecords);
        setHasHiddenRecords(fetchedRecords.length > validRecords.length);
      } else {
        setRecords(fetchedRecords);
        setHasHiddenRecords(false);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to fetch records. Please try refreshing the page.');
      toast({
        title: 'Error',
        description: 'Failed to fetch records. Please try refreshing the page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index: number) => {
    try {
      setIsDeleting(index);
      
      // Check if this is an old format record
      const record = records[index];
      if (!isIPFSHash(record.treatment)) {
        toast({
          title: 'Cannot Delete',
          description: 'Old format records cannot be deleted from the blockchain. Use "Hide All Old Format Records" to hide them from view.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      // For now, since delete_record doesn't exist in the contract, we'll just hide it locally
      const newRecords = records.filter((_, i) => i !== index);
      setRecords(newRecords);
      
      // Update localStorage
      localStorage.setItem('filteredRecords', JSON.stringify(newRecords));
      
      toast({
        title: 'Success',
        description: 'Record hidden from view successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error hiding record:', error);
      toast({
        title: 'Error',
        description: 'Failed to hide record. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleBulkDeleteOldRecords = async () => {
    const oldRecords = records.filter((_, index) => !isIPFSHash(records[index].treatment));
    
    if (oldRecords.length === 0) {
      toast({
        title: 'No Old Records',
        description: 'No old format records found to delete.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Show confirmation dialog
    onConfirmOpen();
  };

  const confirmBulkDelete = async () => {
    const oldRecords = records.filter((_, index) => !isIPFSHash(records[index].treatment));
    
    try {
      setIsBulkDeleting(true);
      onConfirmClose();
      
      // Since delete_record function doesn't exist in the deployed contract,
      // we'll filter out old records locally and store the filtered list
      const newRecords = records.filter(record => isIPFSHash(record.treatment));
      
      // Update the local state to hide old records
      setRecords(newRecords);
      
      // Store the filtered records in localStorage for persistence
      localStorage.setItem('filteredRecords', JSON.stringify(newRecords));
      
      toast({
        title: 'Success',
        description: `Hidden ${oldRecords.length} old format record(s) from view. New uploads will work correctly.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error hiding old records:', error);
      toast({
        title: 'Error',
        description: 'Failed to hide old records. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDownload = async (record: Record, index: number) => {
    try {
      setIsDownloading(index);
      
      console.log('Starting download for record:', record);
      console.log('File hash:', record.treatment);
      
      // Check if it's an old SHA-256 hash
      if (!isIPFSHash(record.treatment)) {
        toast({
          title: 'Cannot Download',
          description: 'This record uses the old file format. Files created before the IPFS integration cannot be downloaded.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      // First validate the file hash
      const validation = await validateFileHash(record.treatment);
      console.log('File hash validation:', validation);
      
      // Store debug info
      setDebugInfo({
        fileHash: record.treatment,
        validation: validation,
        timestamp: new Date().toISOString()
      });
      
      if (!validation.isValid) {
        throw new Error(`File not found on IPFS: ${validation.error}`);
      }
      
      await downloadFile(record.treatment);
      toast({
        title: 'Success',
        description: 'File downloaded successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      
      let errorMessage = 'Failed to download file. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch file from all IPFS gateways')) {
          errorMessage = 'File not available on IPFS. It may have been removed or the hash is invalid.';
        } else if (error.message.includes('File not found on IPFS')) {
          errorMessage = 'File not found on IPFS. Please check if the file was uploaded correctly.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const handleView = async (record: Record) => {
    setSelectedRecord(record);
    setFilePreview(null);
    setIsLoadingPreview(true);
    onOpen();
    
    try {
      const preview = await getFilePreview(record.treatment);
      setFilePreview(preview);
    } catch (error) {
      console.error('Error loading file preview:', error);
      toast({
        title: 'Warning',
        description: 'Could not load file preview',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleCloseModal = () => {
    // Clean up object URL to prevent memory leaks
    if (filePreview?.url) {
      window.URL.revokeObjectURL(filePreview.url);
    }
    setFilePreview(null);
    setSelectedRecord(null);
    onClose();
  };

  const showAllRecords = async () => {
    try {
      // Clear the localStorage filter
      localStorage.removeItem('filteredRecords');
      
      // Refresh records to show all
      await fetchRecords();
      
      toast({
        title: 'Success',
        description: 'All records are now visible',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error showing all records:', error);
      toast({
        title: 'Error',
        description: 'Failed to show all records',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [account]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading records...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Your Medical Records</Heading>

      {/* Show All Records Button */}
      {hasHiddenRecords && (
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Hidden Records</AlertTitle>
            <AlertDescription>
              Some old format records are hidden from view. You can show all records or continue with the filtered view.
            </AlertDescription>
            <Button
              colorScheme="blue"
              size="sm"
              mt={3}
              onClick={showAllRecords}
            >
              Show All Records
            </Button>
          </Box>
        </Alert>
      )}

      {/* Check if there are old format records */}
      {records.some(record => !isIPFSHash(record.treatment)) && (
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>File Format Update</AlertTitle>
            <AlertDescription>
              Some of your records use the old file format and cannot be downloaded. 
              Records with the "Old Format" badge were created before IPFS integration. 
              New uploads will work correctly with real file storage and downloads.
            </AlertDescription>
            <Button
              colorScheme="red"
              size="sm"
              mt={3}
              onClick={handleBulkDeleteOldRecords}
              isLoading={isBulkDeleting}
              loadingText="Hiding..."
            >
              Hide All Old Format Records ({records.filter(record => !isIPFSHash(record.treatment)).length})
            </Button>
          </Box>
        </Alert>
      )}

      {records.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>No Records Found</AlertTitle>
          <AlertDescription>
            You haven't uploaded any medical records yet. Use the upload feature to add your first record.
          </AlertDescription>
        </Alert>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Symptoms</Th>
                <Th>Diagnosis</Th>
                <Th>File</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {records.map((record, index) => (
                <Tr key={index}>
                  <Td>{new Date(record.date).toLocaleString()}</Td>
                  <Td>{record.symptoms}</Td>
                  <Td>{record.diagnosis}</Td>
                  <Td>
                    <Box>
                      <Text fontSize="sm" color="gray.500" fontFamily="mono">
                        {record.treatment.substring(0, 12)}...
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        Click view to see file type
                      </Text>
                      {!isIPFSHash(record.treatment) && (
                        <Badge colorScheme="orange" size="sm" mt={1}>
                          Old Format
                        </Badge>
                      )}
                    </Box>
                  </Td>
                  <Td>
                    <IconButton
                      aria-label="View record"
                      icon={<ViewIcon />}
                      colorScheme="blue"
                      size="sm"
                      mr={2}
                      onClick={() => handleView(record)}
                    />
                    <IconButton
                      aria-label="Download file"
                      icon={<DownloadIcon />}
                      colorScheme="green"
                      size="sm"
                      mr={2}
                      onClick={() => handleDownload(record, index)}
                      isLoading={isDownloading === index}
                      isDisabled={!isIPFSHash(record.treatment)}
                      title={!isIPFSHash(record.treatment) ? "Cannot download - old file format" : "Download file"}
                    />
                    <IconButton
                      aria-label="Delete record"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      isLoading={isDeleting === index}
                      title={!isIPFSHash(record.treatment) ? "Cannot delete - old file format" : "Hide record from view"}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Record Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRecord && (
              <Box>
                <Text><b>Date:</b> {new Date(selectedRecord.date).toLocaleString()}</Text>
                <Text mt={2}><b>Symptoms:</b> {selectedRecord.symptoms}</Text>
                <Text mt={2}><b>Diagnosis:</b> {selectedRecord.diagnosis}</Text>
                <Text mt={2}><b>File Hash:</b> 
                  <Text as="span" fontFamily="mono" fontSize="sm" color="gray.500" ml={2}>
                    {selectedRecord.treatment}
                  </Text>
                </Text>
                <Text mt={2}><b>IPFS Link:</b> 
                  <Text as="span" fontFamily="mono" fontSize="sm" color="blue.500" ml={2}>
                    <a 
                      href={`https://gateway.pinata.cloud/ipfs/${selectedRecord.treatment}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View on IPFS
                    </a>
                  </Text>
                </Text>
                
                {/* Old Format Warning */}
                {selectedRecord && !isIPFSHash(selectedRecord.treatment) && (
                  <Alert status="warning" mt={4}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Old File Format</AlertTitle>
                      <AlertDescription>
                        This record was created with the old upload system that only stored file content hashes, not actual IPFS files. 
                        These files cannot be downloaded. New uploads will work correctly with real IPFS storage.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
                
                {/* Debug Information */}
                {debugInfo && debugInfo.fileHash === selectedRecord.treatment && (
                  <Box mt={4} p={3} bg="gray.50" borderRadius="md" fontSize="sm">
                    <Text fontWeight="bold" mb={2}>Debug Info:</Text>
                    <Text><b>File Hash:</b> {debugInfo.fileHash}</Text>
                    <Text><b>Valid:</b> {debugInfo.validation.isValid ? 'Yes' : 'No'}</Text>
                    {debugInfo.validation.error && (
                      <Text><b>Error:</b> {debugInfo.validation.error}</Text>
                    )}
                    {debugInfo.validation.explanation && (
                      <Text><b>Explanation:</b> {debugInfo.validation.explanation}</Text>
                    )}
                    <Text><b>Gateway Status:</b></Text>
                    {Object.entries(debugInfo.validation.gateways).map(([gateway, result]) => (
                      <Text key={gateway} ml={2} fontSize="xs">
                        {gateway.replace('https://', '').replace('/ipfs/', '')}: {(result as any).status} {(result as any).error ? `(${(result as any).error})` : ''}
                      </Text>
                    ))}
                  </Box>
                )}
                
                {/* File Preview Section */}
                <Box mt={4}>
                  <Text fontWeight="bold" mb={2}>File Preview:</Text>
                  {isLoadingPreview ? (
                    <Box textAlign="center" py={4}>
                      <Spinner size="lg" />
                      <Text mt={2}>Loading preview...</Text>
                    </Box>
                  ) : filePreview ? (
                    <Box>
                      {filePreview.type.startsWith('image/') ? (
                        <Image 
                          src={filePreview.url} 
                          alt="File preview" 
                          maxH="300px" 
                          objectFit="contain"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="md"
                        />
                      ) : (
                        <Box 
                          p={4} 
                          border="1px solid" 
                          borderColor="gray.200" 
                          borderRadius="md"
                          bg="gray.50"
                        >
                          <Text fontSize="sm" color="gray.600">
                            File type: {filePreview.type || 'Unknown'}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Size: {(filePreview.blob.size / 1024).toFixed(2)} KB
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Preview not available for this file type
                          </Text>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Text color="gray.500">No preview available</Text>
                  )}
                </Box>
                
                <Button
                  leftIcon={<DownloadIcon />}
                  colorScheme="green"
                  mt={4}
                  onClick={() => {
                    handleDownload(selectedRecord, -1);
                    handleCloseModal();
                  }}
                  isDisabled={!isIPFSHash(selectedRecord.treatment)}
                  title={!isIPFSHash(selectedRecord.treatment) ? "Cannot download - old file format" : "Download file"}
                >
                  Download File
                </Button>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleCloseModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Confirmation Modal for Bulk Delete */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Bulk Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to hide all {records.filter(record => !isIPFSHash(record.treatment)).length} old format record(s) from view?
            </Text>
            <Text mt={2} color="orange.500" fontSize="sm">
              Note: Since the blockchain contract doesn't support deletion, these records will be hidden from view locally. 
              New uploads will work correctly with IPFS storage.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onConfirmClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={confirmBulkDelete}
              isLoading={isBulkDeleting}
              loadingText="Hiding..."
            >
              Hide All Old Records
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}