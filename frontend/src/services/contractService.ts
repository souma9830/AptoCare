import { aptos } from '../config/aptos';
import { CLIENT_CONTRACT } from '../config/contracts';
import { Record } from '../types/record';

// Fix global Window.aptos type declaration to match useWallet.ts
// Remove any duplicate/conflicting declarations

export const initializeManager = async (
  signAndSubmitTransaction: (txn: any) => Promise<any>
): Promise<void> => {
  try {
    // First check if the manager already exists
    const resource = await aptos.getAccountResource({
      accountAddress: CLIENT_CONTRACT,
      resourceType: `${CLIENT_CONTRACT}::client::RecManager`
    });

    if (resource) {
      console.log('RecManager already exists for address:', CLIENT_CONTRACT);
      return;
    }
  } catch (error) {
    // If we get a 404, the resource doesn't exist and we need to create it
    if (error instanceof Error && error.message.includes('404')) {
      console.log('Initializing RecManager for address:', CLIENT_CONTRACT);
      
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
        return;
      } else {
        throw new Error('Initialization failed');
      }
    }
    throw error;
  }
};

export const addRecord = async (
  symptoms: string,
  diagnosis: string,
  fileHash: string,
  signAndSubmitTransaction: (txn: any) => Promise<any>
): Promise<void> => {
  try {
    const currentDate = new Date().toISOString();
    const payload = {
      payload: {
        function: `${CLIENT_CONTRACT}::client::add_record`,
        type_arguments: [],
        arguments: [
          currentDate, // date
          symptoms, // symptoms
          diagnosis, // diagnosis
          fileHash // treatment (file hash)
        ]
      }
    };

    const response = await signAndSubmitTransaction(payload);
    console.log('Transaction submitted:', response);

    // Wait for transaction confirmation
    const txn = await aptos.waitForTransaction({ transactionHash: response.hash });
    console.log('Transaction confirmed:', txn);

    if (!txn.success) {
      throw new Error('Transaction failed');
    }
  } catch (error) {
    console.error('Error adding record:', error);
    throw error;
  }
};

export const getRecords = async (address: string): Promise<Record[]> => {
  if (!address) {
    throw new Error('Wallet not connected');
  }

  try {
    console.log('Fetching RecManager resource for address:', CLIENT_CONTRACT);
    const resource = await aptos.getAccountResource({
      accountAddress: CLIENT_CONTRACT,
      resourceType: `${CLIENT_CONTRACT}::client::RecManager`
    });

    console.log('Resource response:', resource);

    if (!resource) {
      console.log('No RecManager resource found for address:', CLIENT_CONTRACT);
      return [];
    }

    // Records are directly in the resource object
    if (!('records' in resource)) {
      console.log('Resource does not contain records:', resource);
      return [];
    }

    const records = Array.isArray(resource.records) ? resource.records : [];
    console.log('Found records:', records);
    
    return records;
  } catch (error) {
    console.error('Error getting records:', error);
    if (error instanceof Error && error.message.includes('404')) {
      console.log('No RecManager resource found for address:', CLIENT_CONTRACT);
      return [];
    }
    throw error;
  }
};

export const getAccountStats = async (address: string): Promise<{ totalRecords: number; lastUploadDate: string | null }> => {
  if (!address) {
    throw new Error('Wallet not connected');
  }

  try {
    console.log('Fetching RecManager resource for address:', CLIENT_CONTRACT);
    const resource = await aptos.getAccountResource({
      accountAddress: CLIENT_CONTRACT,
      resourceType: `${CLIENT_CONTRACT}::client::RecManager`
    });

    console.log('Resource response:', resource);

    if (!resource) {
      console.log('No RecManager resource found for address:', CLIENT_CONTRACT);
      return { totalRecords: 0, lastUploadDate: null };
    }

    // Records are directly in the resource object
    if (!('records' in resource)) {
      console.log('Resource does not contain records:', resource);
      return { totalRecords: 0, lastUploadDate: null };
    }

    const records = Array.isArray(resource.records) ? resource.records : [];
    console.log('Found records:', records);
    
    return {
      totalRecords: records.length,
      lastUploadDate: records.length > 0 ? records[records.length - 1].date : null
    };
  } catch (error) {
    console.error('Error getting account stats:', error);
    if (error instanceof Error && error.message.includes('404')) {
      console.log('No RecManager resource found for address:', CLIENT_CONTRACT);
      return { totalRecords: 0, lastUploadDate: null };
    }
    throw error;
  }
};

export const getStats = async (address: string): Promise<{ totalRecords: number; totalAccounts: number }> => {
  if (!address) {
    throw new Error('Wallet not connected');
  }

  try {
    console.log('Fetching RecManager resource for address:', CLIENT_CONTRACT);
    const resource = await aptos.getAccountResource({
      accountAddress: CLIENT_CONTRACT,
      resourceType: `${CLIENT_CONTRACT}::client::RecManager`
    });

    console.log('Resource response:', resource);

    if (!resource) {
      console.log('No RecManager resource found for address:', CLIENT_CONTRACT);
      return { totalRecords: 0, totalAccounts: 0 };
    }

    // Records are directly in the resource object
    if (!('records' in resource)) {
      console.log('Resource does not contain records:', resource);
      return { totalRecords: 0, totalAccounts: 0 };
    }

    const records = Array.isArray(resource.records) ? resource.records : [];
    console.log('Found records:', records);
    
    // Count unique client IDs
    const uniqueClients = new Set(records.map((record: Record) => record.client_id));
    
    return {
      totalRecords: records.length,
      totalAccounts: uniqueClients.size
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    if (error instanceof Error && error.message.includes('404')) {
      console.log('No RecManager resource found for address:', CLIENT_CONTRACT);
      return { totalRecords: 0, totalAccounts: 0 };
    }
    throw error;
  }
};

export const deleteRecord = async (index: number): Promise<void> => {
  if (!window.aptos) {
    throw new Error('Wallet not connected');
  }

  try {
    const payload = {
      payload: {
        function: `${CLIENT_CONTRACT}::client::delete_record`,
        type_arguments: [],
        arguments: [index]
      }
    };

    const response = await window.aptos.signAndSubmitTransaction(payload);
    console.log('Delete transaction submitted:', response);

    // Wait for transaction confirmation
    const txn = await aptos.waitForTransaction({ transactionHash: response.hash });
    console.log('Delete transaction confirmed:', txn);

    if (!txn.success) {
      throw new Error('Delete transaction failed');
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
};

export const downloadFile = async (fileHash: string, fileName?: string): Promise<void> => {
  try {
    console.log('Starting download for file hash:', fileHash);
    
    // Try multiple IPFS gateways in case one fails
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${fileHash}`,
      `https://ipfs.io/ipfs/${fileHash}`,
      `https://cloudflare-ipfs.com/ipfs/${fileHash}`,
      `https://dweb.link/ipfs/${fileHash}`
    ];
    
    let response: Response | null = null;
    
    // Try each gateway until one works
    for (const gateway of gateways) {
      try {
        console.log('Trying gateway:', gateway);
        response = await fetch(gateway, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          },
        });
        
        if (response.ok) {
          console.log('Successfully fetched from gateway:', gateway);
          break;
        } else {
          console.log(`Gateway ${gateway} failed with status:`, response.status);
        }
      } catch (gatewayError) {
        console.log(`Gateway ${gateway} failed with error:`, gatewayError);
        continue;
      }
    }
    
    if (!response || !response.ok) {
      throw new Error(`Failed to fetch file from all IPFS gateways. Last status: ${response?.status || 'No response'}`);
    }
    
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Get the file blob
    const blob = await response.blob();
    console.log('Blob created:', {
      size: blob.size,
      type: blob.type
    });
    
    // Try to get filename from response headers or use provided name
    let downloadFileName = fileName;
    
    if (!downloadFileName) {
      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition');
      console.log('Content-Disposition header:', contentDisposition);
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFileName = filenameMatch[1].replace(/['"]/g, '');
          console.log('Extracted filename from header:', downloadFileName);
        }
      }
      
      // If still no filename, try to get it from the blob type
      if (!downloadFileName) {
        const extension = blob.type ? getExtensionFromMimeType(blob.type) : '';
        downloadFileName = `medical_record_${fileHash.substring(0, 8)}${extension}`;
        console.log('Generated filename from MIME type:', downloadFileName);
      }
    }
    
    console.log('Final download filename:', downloadFileName);
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFileName;
    
    // Add some styling to make it invisible
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Download completed successfully');
  } catch (error) {
    console.error('Error downloading file:', error);
    console.error('File hash:', fileHash);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

// Helper function to get file extension from MIME type
const getExtensionFromMimeType = (mimeType: string): string => {
  const mimeToExt: { [key: string]: string } = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'text/plain': '.txt',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/zip': '.zip',
    'application/x-zip-compressed': '.zip',
  };
  
  return mimeToExt[mimeType] || '.bin';
};

export const getFilePreview = async (fileHash: string): Promise<{ blob: Blob; type: string; url: string }> => {
  try {
    console.log('Starting file preview for hash:', fileHash);
    
    // Try multiple IPFS gateways in case one fails
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${fileHash}`,
      `https://ipfs.io/ipfs/${fileHash}`,
      `https://cloudflare-ipfs.com/ipfs/${fileHash}`,
      `https://dweb.link/ipfs/${fileHash}`
    ];
    
    let response: Response | null = null;
    
    // Try each gateway until one works
    for (const gateway of gateways) {
      try {
        console.log('Trying gateway for preview:', gateway);
        response = await fetch(gateway, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          },
        });
        
        if (response.ok) {
          console.log('Successfully fetched preview from gateway:', gateway);
          break;
        } else {
          console.log(`Gateway ${gateway} failed with status:`, response.status);
        }
      } catch (gatewayError) {
        console.log(`Gateway ${gateway} failed with error:`, gatewayError);
        continue;
      }
    }
    
    if (!response || !response.ok) {
      throw new Error(`Failed to fetch file preview from all IPFS gateways. Last status: ${response?.status || 'No response'}`);
    }
    
    // Get the file blob
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    console.log('Preview created:', {
      size: blob.size,
      type: blob.type,
      url: url.substring(0, 50) + '...'
    });
    
    return {
      blob,
      type: blob.type,
      url
    };
  } catch (error) {
    console.error('Error getting file preview:', error);
    console.error('File hash:', fileHash);
    throw error;
  }
};

// Function to check if a hash is a valid IPFS hash
export const isIPFSHash = (hash: string): boolean => {
  // IPFS hashes typically start with Qm (CIDv0) or bafy (CIDv1)
  // SHA-256 hashes are 64 characters long and don't start with these prefixes
  return hash.startsWith('Qm') || hash.startsWith('bafy') || hash.startsWith('bafk');
};

// Function to detect old SHA-256 hashes and provide helpful error
export const validateAndExplainHash = (hash: string): {
  isValid: boolean;
  isOldFormat: boolean;
  error?: string;
  explanation?: string;
} => {
  if (!isIPFSHash(hash)) {
    return {
      isValid: false,
      isOldFormat: true,
      error: 'Old file format detected',
      explanation: 'This record was created with the old upload system that only stored file content hashes, not actual IPFS files. These files cannot be downloaded. New uploads will work correctly with real IPFS storage.'
    };
  }
  
  return {
    isValid: true,
    isOldFormat: false
  };
};

// Utility function to validate file hash and test IPFS connectivity
export const validateFileHash = async (fileHash: string): Promise<{
  isValid: boolean;
  error?: string;
  gateways: { [key: string]: { status: number; error?: string } };
  isOldFormat?: boolean;
  explanation?: string;
}> => {
  // First check if it's an old SHA-256 hash
  const hashCheck = validateAndExplainHash(fileHash);
  if (hashCheck.isOldFormat) {
    return {
      isValid: false,
      error: hashCheck.error,
      gateways: {},
      isOldFormat: true,
      explanation: hashCheck.explanation
    };
  }

  const gateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/'
  ];
  
  const results: { [key: string]: { status: number; error?: string } } = {};
  
  for (const gateway of gateways) {
    const url = gateway + fileHash;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      results[gateway] = { status: response.status };
    } catch (error) {
      results[gateway] = { 
        status: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  const hasWorkingGateway = Object.values(results).some(result => result.status === 200);
  
  return {
    isValid: hasWorkingGateway,
    error: hasWorkingGateway ? undefined : 'No working IPFS gateway found',
    gateways: results
  };
};

// Function to upload file to IPFS via backend
export const uploadFileToIPFS = async (file: File): Promise<{ ipfsHash: string; fileName: string }> => {
  try {
    console.log('Uploading file to IPFS:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 0 || response.status === 500) {
        throw new Error('Backend server is not running. Please start the backend server first.');
      }
      
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`IPFS upload failed: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('File uploaded to IPFS successfully:', result);
    
    return {
      ipfsHash: result.ipfsHash,
      fileName: result.fileName
    };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to backend server. Please make sure the backend is running on http://localhost:3001');
      }
      if (error.message.includes('Backend server is not running')) {
        throw new Error('Backend server is not running. Please start the backend server first.');
      }
    }
    
    throw error;
  }
};