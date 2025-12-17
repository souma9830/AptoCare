# MedFi - Medical Records Management App

A decentralized medical records management application built on Aptos blockchain with IPFS file storage.

## Features

### Record Management
- Upload medical records with symptoms and diagnosis
- View all uploaded records in a table format
- Delete records (with blockchain transaction)
- Version control for record modifications

### File Handling
- **File Upload**: Upload medical files (PDFs, images, documents) to IPFS via Pinata
- **File Download**: Download original files from IPFS using file hashes
- **File Preview**: Preview images directly in the app
- **File Information**: View file type, size, and IPFS hash

### Download Functionality
The app now includes comprehensive file download capabilities:

1. **Download Button**: Each record has a green download button in the actions column
2. **Modal Download**: Download files from the detailed record view modal
3. **Smart Filename Detection**: 
   - Attempts to extract original filename from IPFS metadata
   - Falls back to MIME type-based extensions
   - Generates descriptive filenames with file hash
4. **File Type Support**: Supports common medical file formats:
   - PDF documents (.pdf)
   - Images (.jpg, .png, .gif)
   - Text files (.txt)
   - Office documents (.doc, .docx, .xls, .xlsx)
   - Archives (.zip)

### Preview Features
- **Image Preview**: View images directly in the modal
- **File Information**: Display file type and size for non-image files
- **IPFS Link**: Direct link to view file on IPFS gateway

## Technical Details

### File Storage
- Files are uploaded to IPFS via Pinata service
- File hashes are stored on the Aptos blockchain
- Original files can be retrieved using IPFS gateways

### Upload Process
1. File is uploaded to backend server
2. Backend uploads file to IPFS via Pinata
3. Real IPFS hash is returned to frontend
4. IPFS hash is stored on blockchain
5. File can be downloaded using the IPFS hash

### Download Process
1. Fetch file from IPFS using multiple gateways
2. Extract filename from response headers or MIME type
3. Create blob URL for browser download
4. Trigger download with appropriate filename
5. Clean up blob URL to prevent memory leaks

### Error Handling
- Graceful handling of IPFS fetch failures
- User-friendly error messages
- Loading states for better UX
- Multi-gateway fallback for reliability

## Setup Instructions

### Prerequisites
- Node.js 16+
- Aptos wallet (Petra, Martian, etc.)
- Pinata API keys (for IPFS uploads)

### Backend Setup (Required for File Uploads)

1. **Get Pinata API Keys**:
   - Sign up at https://app.pinata.cloud/
   - Go to API Keys section
   - Create new API key

2. **Configure Backend**:
   ```bash
   cd medfi-app/backend
   npm install
   ```

3. **Create Environment File**:
   Create `.env` file in `medfi-app/backend/`:
   ```env
   PINATA_API_KEY=your_pinata_api_key_here
   PINATA_SECRET_KEY=your_pinata_secret_key_here
   PORT=3001
   ```

4. **Start Backend**:
   ```bash
   npm start
   ```

### Frontend Setup

```bash
cd medfi-app/frontend
npm install
npm run dev
```

## Usage

1. **Connect Wallet**: Use a compatible Aptos wallet (Petra, Martian, etc.)
2. **Start Backend**: Make sure backend is running on port 3001
3. **Upload Records**: Go to Upload page and add medical records with files
4. **View Records**: Navigate to Records page to see all uploaded records
5. **Download Files**: 
   - Click the green download button in the table
   - Or click view and download from the modal
6. **Preview Files**: Click view to see file preview and details

## Troubleshooting

### "Backend server is not running"
- Make sure backend is started: `cd medfi-app/backend && npm start`
- Check if port 3001 is available
- Verify `.env` file exists with Pinata API keys

### "Failed to upload to IPFS"
- Check your Pinata API keys in `.env` file
- Verify Pinata account is active
- Check network connection

### "File not found on IPFS"
- This happens with old records that used SHA-256 hashes instead of IPFS hashes
- New uploads will work correctly with real IPFS hashes
- Old records cannot be downloaded (this is fixed for new uploads)

### Download Issues
- Check browser console for detailed error logs
- Try different IPFS gateways (app tries multiple automatically)
- Verify file was uploaded correctly to IPFS

## Security Notes
- Files are stored on IPFS (public but content-addressed)
- File hashes are stored on blockchain (immutable)
- Consider encryption for sensitive medical data
- Access control is managed through wallet ownership
- Backend API keys should be kept secure 