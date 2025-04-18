# GeneTrust AI Studio

A comprehensive platform for researchers and students working with CRISPR gene editing and genomic data.

## Features

- Personalized onboarding experience with AI assistant
- CRISPR prediction module
- Lab monitoring dashboard
- Blockchain verification of research data
- Multi-modal AI assistance

## Project Structure

This project consists of:

1. **Frontend**: Next.js application (React) with TypeScript
2. **Backend**: Node.js Express server with TypeScript

## Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (local or Atlas)
- [Groq API key](https://console.groq.com)

## Getting Started

### 1. Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create an environment file by copying the example:
   ```
   cp .env.example .env
   ```

4. Edit the `.env` file and add your:
   - MongoDB connection string
   - JWT secret
   - **Groq API key** (Get one from https://console.groq.com/keys)

5. Start the backend server:
   ```
   ./start_backend.sh
   ```
   or
   ```
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a local environment file:
   ```
   cp .env.example .env.local
   ```

4. Update the `.env.local` file with your backend URL (default http://localhost:8000/api)

5. Start the frontend development server:
   ```
   npm run dev
   ```

6. Access the application at http://localhost:3000

## Troubleshooting

### Groq API Issues

If you see errors related to the Groq API:

1. Verify your Groq API key is correctly set in `backend/.env`
2. Ensure the Groq API key has proper permissions
3. Check that the backend server is running and accessible
4. Check the backend logs for specific error messages

### API Connection Problems

If the frontend cannot connect to the backend:

1. Ensure the backend server is running
2. Check that CORS is properly configured
3. Verify the URL in frontend `.env.local` matches your backend URL

## Development

### Backend

The backend provides REST APIs for:
- Authentication
- User profiles
- Onboarding
- Groq AI integration
- CRISPR predictions

### Frontend

The frontend uses:
- Next.js 14 App Router
- Tailwind CSS
- shadcn/ui components
- Framer Motion animations 