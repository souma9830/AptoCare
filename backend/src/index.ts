import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pinataSDK from '@pinata/sdk';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Initialize Pinata client
const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to IPFS via Pinata
    const stream = fs.createReadStream(req.file.path);
    const options = {
      pinataMetadata: {
        name: req.file.originalname,
      },
    };

    const result = await pinata.pinFileToIPFS(stream, options);

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);

    // Return the IPFS hash
    res.json({
      ipfsHash: result.IpfsHash,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    res.status(500).json({ error: 'Failed to upload to IPFS' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 