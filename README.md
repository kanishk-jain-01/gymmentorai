# GymMentor

GymMentor is a fitness tracking application that helps users log and analyze their workouts. The app uses AI to provide personalized insights and recommendations based on workout history.

## Features

- **Workout Logging**: Easily log your workouts with natural language input
- **Workout Analysis**: Get AI-powered insights about your fitness progress
- **Workout Visualization**: View charts and graphs of your workout data
- **User Authentication**: Secure login with Google OAuth

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: Flexible LLM integration supporting OpenAI, Anthropic Claude, Google Gemini, or custom API endpoints

## Development Workflow

This project follows a structured development workflow using Git branches and Vercel deployments.

### Environments

- **Production**: The live application, deployed from the `main` branch
- **Development**: The staging environment, deployed from the `development` branch
- **Feature Previews**: Temporary environments for testing new features, deployed from feature branches

### Branch Structure

- `main`: Production-ready code
- `development`: Integration branch for development work
- `feature/*`: Feature branches for new development

### Development Process

1. **Create a feature branch** from `development`:
   ```bash
   git checkout development
   git pull
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** and commit them:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. **Push changes** and create a pull request:
   ```bash
   git push -u origin feature/your-feature-name
   # Create PR on GitHub from feature/your-feature-name to development
   ```

4. **Review and test** in the Vercel preview environment
5. **Merge to development** once approved
6. **Test in development environment**
7. **Create PR from development to main** when ready for production
8. **Merge to main** to deploy to production

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database 
- LLM API key (OpenAI, Anthropic, Google AI, or custom provider)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/gymmentorai.git
   cd gymmentorai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required variables

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

This project uses PostgreSQL for all environments:

1. **Local Development Database**
   - Install PostgreSQL: `brew install postgresql@15`
   - Start PostgreSQL: `brew services start postgresql@15`
   - Create a database: `createdb gymmentor_dev`
   - The connection string should be: `postgresql://username@localhost:5432/gymmentor_dev`

2. **Environment Setup**
   - Copy `.env.example` to `.env.local` for local development
   - Update the `DATABASE_URL` in both `.env` and `.env.local`
   - Run migrations: `npx prisma migrate dev`

### Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: URL of your application (http://localhost:3000 for local development)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- LLM API configuration (see .env.example for options)

## Deployment

This project is deployed on Vercel. Each push to the repository triggers a new deployment:

- Pushes to `main` deploy to production
- Pushes to `development` deploy to the development environment
- Pushes to other branches create preview deployments

### Database Configuration for Vercel

For Vercel deployments, separate databases should be used for different environments:

1. **Preview Environment (development branch)**
   - Create a separate PostgreSQL database (e.g., on Neon, Supabase, or Railway)
   - Add the connection string as `DATABASE_URL` in Vercel environment variables for Preview

2. **Production Environment (main branch)**
   - Create a separate PostgreSQL database for production
   - Add the connection string as `DATABASE_URL` in Vercel environment variables for Production

### Setting Up Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Set up branch deployments in project settings

## Contributing

1. Fork the repository
2. Create a feature branch from `development`
3. Make your changes
4. Create a pull request to the `development` branch

## License

[MIT License](LICENSE)
