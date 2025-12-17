import { useState, useEffect, useCallback } from 'react';

// Add type declarations for Petra wallet
declare global {
  interface Window {
    aptos: {
      connect: () => Promise<{ address: string }>;
      disconnect: () => Promise<void>;
      isConnected: () => Promise<boolean>;
      account: () => Promise<{ address: string }>;
      signAndSubmitTransaction: (payload: {
        payload: {
          function: string;
          type_arguments: string[];
          arguments: any[];
        };
        options?: {
          max_gas_amount?: string;
          gas_unit_price?: string;
        };
      }) => Promise<{ hash: string }>;
      onAccountChange: (callback: (account: { address: string }) => void) => void;
      onNetworkChange: (callback: (network: { name: string }) => void) => void;
    };
  }
}

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkConnection = useCallback(async () => {
    try {
      if (!window.aptos) {
        console.log('Petra wallet not found');
        setConnected(false);
        setAccount(null);
        return;
      }

      const isConnected = await window.aptos.isConnected();
      console.log('Wallet connection status:', isConnected);
      
      if (isConnected) {
        const { address } = await window.aptos.account();
        console.log('Connected account:', address);
        setAccount(address);
        setConnected(true);
      } else {
        setAccount(null);
        setConnected(false);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setConnected(false);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      if (!window.aptos) {
        throw new Error('Petra wallet not found');
      }

      setLoading(true);
      const { address } = await window.aptos.connect();
      console.log('Connected to wallet:', address);
      setAccount(address);
      setConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnected(false);
      setAccount(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (!window.aptos) {
        throw new Error('Petra wallet not found');
      }

      setLoading(true);
      await window.aptos.disconnect();
      console.log('Disconnected from wallet');
      setAccount(null);
      setConnected(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signAndSubmitTransaction = useCallback(async (payload: {
    payload: {
      function: string;
      type_arguments: string[];
      arguments: any[];
    };
    options?: {
      max_gas_amount?: string;
      gas_unit_price?: string;
    };
  }) => {
    if (!window.aptos) {
      throw new Error('Petra wallet not found');
    }

    if (!connected || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      const response = await window.aptos.signAndSubmitTransaction(payload);
      console.log('Transaction submitted:', response);
      
      // Don't wait for transaction confirmation here
      // Let the caller handle the transaction hash
      return response;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }, [connected, account]);

  useEffect(() => {
    checkConnection();

    // Set up periodic connection check
    const intervalId = setInterval(checkConnection, 5000);

    // Set up event listeners
    if (window.aptos) {
      window.aptos.onAccountChange((newAccount) => {
        console.log('Account changed:', newAccount);
        setAccount(newAccount.address);
        setConnected(true);
      });

      window.aptos.onNetworkChange((network) => {
        console.log('Network changed:', network);
        checkConnection();
      });
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [checkConnection]);

  return {
    account,
    connected,
    loading,
    connect,
    disconnect,
    signAndSubmitTransaction
  };
}; 