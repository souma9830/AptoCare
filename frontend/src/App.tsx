import { Box } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Records from './pages/Records';

function App() {
  return (
    <Box minH="100vh">
      <Navbar />
      <Box p={4}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/records" element={<Records />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App; 