# Backend Setup Guide

## Prerequisites

1. **Pinata Account**: Sign up at https://app.pinata.cloud/
2. **API Keys**: Get your API keys from Pinata dashboard

## Setup Steps

### 1. Create Environment File

Create a `.env` file in the backend directory with the following content:

```env
# Pinata API Configuration
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here

# Server Configuration
PORT=3001
```

### 2. Install Dependencies

```bash
cd medfi-app/backend
npm install
```

### 3. Start the Backend

```bash
npm start
```

The backend will run on `http://localhost:3001`

## API Endpoints

- `POST /api/upload` - Upload file to IPFS via Pinata
  - Expects: `multipart/form-data` with `file` field
  - Returns: `{ ipfsHash: string, fileName: string }`

## Troubleshooting

1. **"Failed to upload to IPFS"**: Check your Pinata API keys
2. **"No file uploaded"**: Make sure the frontend is sending the file correctly
3. **CORS errors**: The backend is configured to allow CORS from the frontend

## File Storage

- Files are temporarily stored in the `uploads/` directory
- Files are automatically deleted after being uploaded to IPFS
- Only the IPFS hash is returned to the frontend 