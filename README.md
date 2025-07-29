# Proof of Friendship - Web3 NFT Minting App

A full-stack Web3 application that allows users to mint NFTs as proof of attending social events. Built with Next.js, Solidity, and modern Web3 technologies.

## 🚀 Features

- **Smart Contract**: ERC721 NFT contract with event management
- **Event Creation**: Contract owner can create events with name, description, and image
- **One-time Minting**: Users can only mint once per event
- **Friendship Points**: Track how many unique events a user has attended
- **Modern UI**: Beautiful, responsive design with animations
- **Wallet Integration**: Seamless MetaMask and WalletConnect support
- **Mobile-First**: Optimized for all device sizes

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Wagmi** - Web3 React hooks
- **Viem** - Ethereum client
- **Lucide React** - Icons

### Smart Contract
- **Solidity ^0.8.19** - Smart contract language
- **OpenZeppelin** - ERC721 and security contracts
- **Foundry** - Development framework

## 📁 Project Structure

```
pof/
├── contracts/                 # Smart contracts
│   ├── src/
│   │   └── ProofOfFriendship.sol
│   ├── test/
│   │   └── ProofOfFriendship.t.sol
│   ├── script/
│   │   └── Deploy.s.sol
│   └── foundry.toml
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx         # Homepage
│   │   ├── events/[id]/     # Event detail pages
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   │   └── ui/             # UI components
│   ├── hooks/              # Custom hooks
│   │   └── useContract.ts  # Web3 contract hooks
│   ├── lib/                # Utilities
│   │   ├── wagmi.ts        # Wagmi configuration
│   │   ├── utils.ts        # Utility functions
│   │   └── contract-abi.json
│   └── config/             # Configuration files
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and Bun
- Foundry (for smart contract development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pof
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   bun install
   
   # Install Foundry (if not already installed)
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

3. **Install contract dependencies**
   ```bash
   cd contracts
   forge install
   ```

### Smart Contract Development

1. **Build contracts**
   ```bash
   cd contracts
   forge build
   ```

2. **Run tests**
   ```bash
   forge test
   ```

3. **Deploy to local network**
   ```bash
   # Start local node
   anvil
   
   # In another terminal, deploy
   forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
   ```

4. **Deploy to testnet**
   ```bash
   # Set your private key
   export PRIVATE_KEY=your_private_key_here
   
   # Deploy to Sepolia
   forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
   ```

### Frontend Development

1. **Update contract address**
   After deploying, update the contract address in `src/hooks/useContract.ts`:
   ```typescript
   const CONTRACT_ADDRESS = '0x...' // Your deployed contract address
   ```

2. **Start development server**
   ```bash
   bun dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## 📋 Smart Contract Functions

### Owner Functions
- `createEvent(name, description, imageURI)` - Create a new event

### User Functions
- `mintForEvent(eventId)` - Mint NFT for a specific event
- `countEventsAttended(user)` - Get user's total events attended
- `hasUserMintedForEvent(user, eventId)` - Check if user minted for event

### View Functions
- `getEvent(eventId)` - Get event details
- `getAllEvents()` - Get all events
- `totalEvents()` - Get total number of events

## 🎨 UI Components

- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion for delightful interactions
- **Modern Icons**: Lucide React icons
- **Glassmorphism**: Beautiful backdrop blur effects
- **Gradient Backgrounds**: Purple to pink gradients

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# For contract deployment
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=your_sepolia_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key

# For WalletConnect (optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Contract Configuration

Update the contract address in `src/hooks/useContract.ts` after deployment.

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
forge test
```

### Frontend Tests
```bash
bun test
```

## 🚀 Deployment

### Smart Contract
1. Deploy to your preferred network using Foundry
2. Update the contract address in the frontend
3. Verify the contract on Etherscan

### Frontend
1. Build the application:
   ```bash
   bun run build
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Foundry for excellent development tools
- Wagmi for Web3 React hooks
- Framer Motion for animations
- Unsplash for beautiful images

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.
