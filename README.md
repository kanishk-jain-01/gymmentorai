# GymMentor - AI-Powered Workout Tracking

GymMentor is an AI-powered workout tracking application that allows users to log their workouts using natural language and visualize their progress over time.

## Features

- **Natural Language Input**: Describe your workout in plain English, and our AI will understand and organize it
- **Progress Tracking**: Visualize your workout progress with charts and graphs
- **AI Analysis**: Get personalized insights and recommendations based on your workout history
- **Text Message Support** (Coming Soon): Text your workouts directly to GymMentor, just like texting a personal trainer

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js
- **AI**: OpenAI API
- **Visualization**: Chart.js

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/health-mentor-2.git
   cd health-mentor-2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env` to `.env.local`
   - Update the values in `.env.local` with your own API keys and secrets

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The application can be deployed to Vercel:

```bash
npm run build
npm run start
```

## Future Enhancements

- Twilio integration for text message workout logging
- Advanced analytics and goal setting
- Social features for sharing workouts
- Mobile app with offline support
- Subscription model for premium features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenAI for providing the AI capabilities
- Next.js team for the amazing framework
- Tailwind CSS for the styling utilities
