# APTO CARE - Decentralized Medical Record Management System

Apto Care is a decentralized healthcare record management system that leverages the **Aptos blockchain** and **IPFS** to securely store, manage, and verify medical records in a hybrid architecture. It ensures **data privacy, integrity, and access control** while delivering a seamless user experience.

![Built on Aptos](https://img.shields.io/badge/Built%20on-Aptos-blueviolet)


---

## 🚀 Mission

To empower individuals to fully control and manage their medical records with privacy, portability, and permanence through decentralized technologies.

## 🌍 Vision

To become the leading global platform for secure, interoperable, and user-owned medical data accessible from anywhere, anytime.

---

## 🧠 SWOT Analysis

### Strengths

* Decentralized architecture (Aptos + IPFS)
* Immutable, tamper-proof records on blockchain
* File versioning and multi-format support
* Wallet-based access control without centralized logins

### Weaknesses

* Learning curve for non-crypto users
* Reliance on external services like Pinata
* Scalability and performance under large file loads

### Opportunities

* Cross-border healthcare needs and remote consultation growth
* Integration with AI health assistants and analytics platforms
* Partnerships with labs, hospitals, and insurers
* Government/NGO health tech initiatives

### Threats

* Regulatory hurdles around on-chain health data (GDPR, HIPAA)
* Competing healthtech giants exploring blockchain integration
* Service interruptions in IPFS gateways or blockchain network issues

---

## 📌 Features

### 🔗 On-Chain Components (Aptos Blockchain)
- **Smart Contracts (Move language)**:
  - `client` contract: Manages individual medical records
  - `manager` contract: Handles system-wide configuration and control
- **Functionality**:
  - Record creation and management
  - Secure access control
  - Data integrity using cryptographic hash verification

### 🔐 Wallet Integration
- Supports **Petra Wallet** for Aptos
- Handles:
  - Wallet connection/disconnection
  - Transaction signing and submission

---

## 🖥️ Off-Chain Components

### 🌐 Frontend
- **Tech Stack**: React
- **Features**:
  - Medical record dashboard
  - File upload interface
  - Real-time wallet connection status

### 🧠 Backend Services
- **File Handling**: Accepts and processes medical records
- **IPFS Integration**: Stores files off-chain
- **API Endpoints**: Bridges between frontend and blockchain

---

## 📦 Data Storage Architecture

- **On-Chain**:
  - File hashes
  - Access control metadata
- **Off-Chain**:
  - Actual medical files (stored on IPFS)
- **Benefits**:
  - ✅ Data integrity (hashes on-chain)
  - ✅ Efficiency (large files off-chain)
  - ✅ Security (access control on-chain)
  - ✅ Privacy (no raw data on-chain)

---

## 🚀 Tech Stack
| Layer         | Tools/Tech                  |
| ------------- | --------------------------- |
| Blockchain    | Aptos + Move                |
| Wallet        | Petra Wallet                |
| Frontend      | React                       |
| Backend       | Node.js                     |
| File Storage  | IPFS                        |
| Communication | REST APIs                   |

---

## ⚙️ Setup Instructions

### Prerequisites

* Node.js 16+
* Aptos wallet (Petra, Martian, etc.)
* Pinata API keys (for IPFS uploads)

### Backend Setup (Required for File Uploads)

1. **Get Pinata API Keys**:

   * Sign up at [https://app.pinata.cloud/](https://app.pinata.cloud/)
   * Go to API Keys section
   * Create new API key

2. **Configure Backend**:

   ```bash
   cd apto-care/backend
   npm install
   ```

3. **Create Environment File**:
   Create `.env` file in `apto-care/backend/`:

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
cd apto-care/frontend
npm install
npm run dev
```

---

## 🧭 Usage

1. **Connect Wallet**: Use a compatible Aptos wallet (Petra, Martian, etc.)
2. **Start Backend**: Make sure backend is running on port 3001
3. **Upload Records**: Go to Upload page and add medical records with files
4. **View Records**: Navigate to Records page to see all uploaded records
5. **Download Files**:

   * Click the green download button in the table
   * Or click view and download from the modal
6. **Preview Files**: Click view to see file preview and details

---

## 🛠️ Troubleshooting

### "Backend server is not running"

* Make sure backend is started: `cd apto-care/backend && npm start`
* Check if port 3001 is available
* Verify `.env` file exists with Pinata API keys

### "Failed to upload to IPFS"

* Check your Pinata API keys in `.env` file
* Verify Pinata account is active
* Check network connection

### "File not found on IPFS"

* This happens with old records that used SHA-256 hashes instead of IPFS hashes
* New uploads will work correctly with real IPFS hashes
* Old records cannot be downloaded (this is fixed for new uploads)

### Download Issues

* Check browser console for detailed error logs
* Try different IPFS gateways (app tries multiple automatically)
* Verify file was uploaded correctly to IPFS

---

## 🔐 Security Notes

* Files are stored on IPFS (public but content-addressed)
* File hashes are stored on blockchain (immutable)
* Consider encryption for sensitive medical data
* Access control is managed through wallet ownership
* Backend API keys should be kept secure

---

## Acknowledgement

Built at CosmoHack by Team AstraX
