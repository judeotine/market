# Shift Market

A modern, marketplace platform built with Next.js 15+, featuring real-time updates, secure authentication and a beautiful UI powered by Radix UI and Tailwind CSS.

## 🚀 Features

- 🔐 Secure authentication with Supabase
- 💳 Integrated payment processing
- 🎨 Modern and responsive UI
- 🔍 Real-time search and filtering
- 📱 Mobile-first design
- 🌐 Offline support
- 🔄 Real-time updates
- 🎯 SEO optimized

## 🛠️ Tech Stack

- **Framework:** Next.js 13+ (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Authentication:** Supabase Auth
- **Database:** Supabase
- **State Management:** React Context + Hooks
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **Icons:** Lucide Icons

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/Hussseinkizz/shift-market.git
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
pnpm dev
```

## 🏗️ Project Structure

```
shift-market/
├── app/                    # App router pages
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── shop/            # Shop-specific components
├── lib/                  # Utility functions
├── types/               # TypeScript types
├── public/              # Static assets
└── styles/             # Global styles
```

## 🔑 Environment Variables

The following environment variables are required:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Development

- Run development server:
```bash
pnpm dev
```

- Build for production:
```bash
pnpm build
```

- Start production server:
```bash
pnpm start
```

- Run linting:
```bash
pnpm lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Commit using conventional commits
5. Push to your fork: `git push origin feature/your-feature`
6. Open a Pull Request

## 📝 Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Test updates
- `chore:` Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Hussein Kizz ([@Hussseinkizz](https://github.com/Hussseinkizz))
- Ocen Jude Otine ([@judeotine](https://github.com/judeotine))

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
