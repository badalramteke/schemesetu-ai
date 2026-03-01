# SchemeSetu AI Architecture

## Directory Structure

- `app/`: Next.js App Router (v13+)
  - `(public)/`: Public routes group (Home, About, Pricing, Blog)
  - `(dashboard)/`: Protected routes group (User Dashboard, Profile, Settings)
  - `(auth)/`: Authentication routes (Login, Signup, Password Management)
  - `api/`: Backend API routes
- `components/`: Reusable React components
  - `ui/`: Primitive UI components (Button, Card, etc.)
  - `layout/`: Shared layout components (Header, Footer, Sidebar)
  - `features/`: Feature-specific components (Auth, Chat, Schemes)
  - `sections/`: Page-level sections
  - `forms/`: Form building blocks
  - `providers/`: Context providers (Auth, Theme, etc.)
- `lib/`: Business logic and core utilities
  - `schemes/`: Scheme-specific logic
  - `rag/`: RAG pipeline and AI clients (Gemini, Pinecone)
  - `services/`: External service integrations
  - `hooks/`: Custom React hooks
  - `utils/`: Helper functions and formatters
  - `config/`: Application configuration
  - `db/`: Database models, queries, and migrations
- `context/`: React Context definitions
- `public/`: Static assets (images, icons, fonts)
- `styles/`: CSS and styling modules
- `__tests__/`: Test suite (Unit, Integration, E2E)
- `scripts/`: Dev and maintenance scripts
- `.storybook/`: Storybook configuration
