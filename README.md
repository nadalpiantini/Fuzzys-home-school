# Fuzzy's Home School 🎓

Educational platform with AI tutoring, gamified learning, and AR/QR Colonial Zone exploration.

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Production Deployment

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
npm run deploy:vercel
```

#### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy to Netlify
npm run deploy:netlify
```

#### Option 3: Manual Deploy
```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🔧 Environment Variables

Create a `.env.local` file in `apps/web/`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# DeepSeek AI Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENAI_API_KEY=your_deepseek_api_key
OPENAI_BASE_URL=https://api.deepseek.com
```

## 🗄️ Database Setup

1. Create a Supabase project
2. Run the migration in `db/migrations/001_initial_schema.sql`
3. Enable the `vector` extension for AI/RAG features
4. Update your environment variables

## 📁 Project Structure

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

## 🎯 Features

- 🧠 **AI Tutor 24/7** - DeepSeek-powered intelligent assistant
- 🎮 **20+ Game Types** - Interactive educational games
- 🗺️ **Colonial Zone Rally** - AR/QR exploration
- 🌐 **Multi-language** - Spanish/English support
- 📊 **Teacher Dashboard** - Class management and analytics
- 🏆 **Gamification** - Points, streaks, achievements

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI**: DeepSeek API for intelligent tutoring
- **AR/Maps**: AR.js, Three.js, Leaflet, OpenStreetMap
- **Games**: H5P, JClic, ClassQuiz integrations
- **Deployment**: Vercel + Supabase Cloud

## 📊 API Endpoints

- `POST /api/deepseek` - Chat with AI tutor
- `GET /api/games` - Get games
- `POST /api/games` - Submit game answers
- `POST /api/quiz/generate` - Generate quiz
- `GET /api/trpc/*` - tRPC queries/mutations

## 🚀 Deployment URLs

- **Local**: http://localhost:3000
- **Production**: [Your deployment URL]

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@fuzzyshomeschool.com or join our Discord community.