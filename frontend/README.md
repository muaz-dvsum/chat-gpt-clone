# ChatGPT Clone - FrontendThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A modern Next.js frontend for the ChatGPT clone application built with TypeScript, Tailwind CSS, and ShadCN UI.## Getting Started



## 🚀 FeaturesFirst, run the development server:



- **Authentication**: Supabase Auth with email/password and Google OAuth```bash

- **Real-time Chat**: Dynamic messaging with AI responsesnpm run dev

- **Modern UI**: Clean, responsive design matching Figma specifications# or

- **State Management**: Zustand for global state, React Query for server stateyarn dev

- **Protected Routes**: Authentication-based route protection# or

- **TypeScript**: Full type safety throughout the applicationpnpm dev

# or

## 🛠️ Tech Stackbun dev

```

- **Framework**: Next.js 15+ with App Router

- **Language**: TypeScriptOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **Styling**: Tailwind CSS v4

- **UI Components**: ShadCN UIYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- **State Management**: Zustand + React Query

- **Authentication**: Supabase AuthThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- **HTTP Client**: Axios

- **Icons**: Lucide React## Learn More



## 📁 Project StructureTo learn more about Next.js, take a look at the following resources:



```- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

src/- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

├── app/                    # Next.js App Router pages

│   ├── auth/              # Authentication pagesYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

│   │   ├── login/         # Login page

│   │   └── signup/        # Signup page## Deploy on Vercel

│   ├── chat/[id]/         # Individual chat page

│   ├── dashboard/         # Main dashboardThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

│   └── layout.tsx         # Root layout

├── components/            # Reusable componentsCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

│   ├── auth/              # Auth-related components
│   ├── chat/              # Chat-related components
│   ├── layout/            # Layout components
│   ├── providers/         # Context providers
│   └── ui/                # ShadCN UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── api/               # API client and functions
│   └── auth/              # Supabase configuration
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env.local`
   - Configure your Supabase project settings:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Authentication Setup

### Supabase Configuration

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the API settings
3. Configure Google OAuth in Supabase Auth settings (optional)
4. Update your `.env.local` file with the credentials

### Backend Integration

Ensure the NestJS backend is running on `http://localhost:5000` (or update `NEXT_PUBLIC_API_URL` accordingly).

## 📱 Pages & Routes

- `/` - Home page (redirects based on auth state)
- `/auth/login` - User login
- `/auth/signup` - User registration
- `/dashboard` - Main chat dashboard with sidebar
- `/chat/[id]` - Individual chat conversation

## 🎨 UI Components

The application uses ShadCN UI components for consistent design:
- Buttons, Inputs, Labels
- Avatar, Dropdown Menu
- Scroll Area, Separator
- Form components

## 🔄 State Management

### Authentication State (Zustand)
- User session management
- Authentication status
- Persistent login state

### Chat State (Zustand)
- Chat list management
- Current chat selection
- Message state
- Loading states

### Server State (React Query)
- API data fetching
- Caching and synchronization
- Optimistic updates
- Error handling

## 🚦 API Integration

The frontend communicates with the NestJS backend through:
- RESTful API endpoints
- JWT token authentication
- Automatic token refresh
- Error handling and retries

### Key API Endpoints
- `GET /chats` - Fetch user chats
- `POST /chats` - Create new chat
- `GET /chats/:id/messages` - Fetch chat messages
- `POST /chats/:id/messages` - Send message

## 🔒 Security Features

- Protected routes with authentication guards
- Automatic token management
- Secure API communication
- XSS protection through React
- CSRF protection via SameSite cookies

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (via Next.js)
- Component-based architecture

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Digital Ocean

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.