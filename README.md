# JobNest 🏢

A modern job application tracker with AI-powered cover letter generation. Built with React, Node.js, and PostgreSQL.

## ✨ Features

- **Job Management**: Track job applications with status updates (wishlist, applied, interview, offer, rejected)
- **AI Cover Letter Generation**: Generate personalized cover letters using Claude AI
- **Resume Manager**: Store and manage your global resume
- **Smart Filtering**: Filter jobs by status and search functionality
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Real-time Updates**: Instant updates across all components

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Anthropic API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jobnest
   ```

2. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

3. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Set up the database**
   ```bash
   # Create your PostgreSQL database
   createdb jobnest_db
   
   # Run migrations (if available)
   cd ../server
   npm run migrate
   
   # Seed the database (optional)
   npm run seed
   ```

5. **Start the development servers**
   ```bash
   # Start the backend server (from server directory)
   npm run dev
   
   # Start the frontend (from client directory, in a new terminal)
   cd ../client
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` to access the application.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/jobnest_db

# AI Services
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Server
PORT=3001
NODE_ENV=development
```

### Database Setup

The application uses PostgreSQL. Make sure you have:

1. PostgreSQL installed and running
2. A database created for the application
3. Proper connection string in your `.env` file

## 📁 Project Structure

```
jobnest/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # App entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── db/                 # Database configuration
│   ├── migrations/         # Database migrations
│   ├── server.js           # Express server
│   └── package.json
├── README.md
└── .env.example
```

## 🛠 Development

### Available Scripts

**Server (from server directory):**
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
```

**Client (from client directory):**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Tailwind CSS** for styling

Run `npm run lint` to check for code style issues.

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Backend Deployment

1. Set up your production database
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment

1. Build the production version: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request