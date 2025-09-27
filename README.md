# Fuzzy's Home School 🎓

Educational platform with AI tutoring, gamified learning, and AR/QR Colonial Zone exploration.

## Features

- 🧠 **AI Tutor 24/7** - DeepSeek-powered intelligent assistant in Spanish/English
- 🎮 **20+ Game Types** - Interactive educational games (H5P, JClic, ClassQuiz, etc.)
- 🗺️ **Colonial Zone Rally** - AR/QR exploration for family weekend activities
- 🌐 **Multi-language** - Full Spanish/English support with one-click switching
- 📊 **Teacher Dashboard** - Class management, content creation, analytics
- 🏆 **Gamification** - Points, streaks, achievements, leaderboards

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI**: DeepSeek API for intelligent tutoring
- **AR/Maps**: AR.js, Three.js, Leaflet, OpenStreetMap
- **Games**: H5P, JClic, ClassQuiz integrations
- **Deployment**: Vercel + Supabase Cloud

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Supabase account (free tier works)
- DeepSeek API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nadalpiantini/Fuzzys-home-school.git
cd Fuzzys-home-school
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `.env.local` with your credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `DEEPSEEK_API_KEY` - Your DeepSeek API key

4. Set up Supabase:
- Create a new Supabase project
- Run the migration in `db/migrations/001_initial_schema.sql`
- Enable the `vector` extension for AI/RAG features

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
fuzzys-home-school/
├── apps/
│   └── web/                 # Next.js main application
│       ├── src/
│       │   ├── app/         # App router pages
│       │   ├── components/  # React components
│       │   ├── lib/         # Utilities and configurations
│       │   └── hooks/       # Custom React hooks
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── schemas/             # Zod schemas for validation
│   └── game-engine/         # Quiz and game logic
├── services/
│   ├── ai-tutor/           # DeepSeek AI integration
│   ├── quiz-gen/           # Quiz generation service
│   └── content-rag/        # RAG for educational content
├── db/
│   └── migrations/         # Database schema migrations
└── docs/                   # Documentation
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Core Modules

### 1. Student Dashboard
- AI tutor chat interface
- Practice games and quizzes
- Progress tracking
- Daily challenges

### 2. Teacher Dashboard
- Class management
- Content creation tools
- Student analytics
- Assignment management

### 3. Colonial Zone Rally
- QR code scanning
- AR overlays for historical sites
- Team competitions
- Real-world rewards integration

### 4. Educational Games
- Multiple choice quizzes
- Drag and drop exercises
- Memory games
- Crossword puzzles
- Interactive videos
- Branching scenarios

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Open Source Repositories Used

- **H5P** - Interactive HTML5 content
- **JClic** - Educational activities
- **ClassQuiz** - Live quiz competitions
- **GeoHub** - Geographic guessing games
- **AR.js** - Augmented reality
- **And many more...**

## License

MIT License - see LICENSE file for details

## Acknowledgments

- All the open source projects that made this possible
- The educational community for feedback and support
- DeepSeek for AI capabilities
- Supabase for the backend infrastructure

---

Made with ❤️ for education