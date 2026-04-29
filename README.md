# Next.js

A modern Next.js 15 application built with TypeScript and Tailwind CSS.

## 🚀 Features

- **Next.js 15** - Latest version with improved performance and features
- **React 19** - Latest React version with enhanced capabilities
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development

---

## 💻 Local Development Setup

Get the project running locally in two steps:

### 1. Clone & Install

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your values. The app will run with mock/placeholder values for most services — only `SENDGRID_API_KEY` and `CONTACT_EMAIL` are needed for the contact form to actually send emails.

### 3. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:4028](http://localhost:4028) in your browser.

> **Note:** The dev server runs on port **4028** (not 3000). This is configured in `package.json`.

### Required Environment Variables

| Variable                        | Required  | Description                                                    |
| ------------------------------- | --------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional  | GA4 Measurement ID (e.g. `G-XXXXXXXXXX`). App runs without it. |
| `SENDGRID_API_KEY`              | For email | SendGrid API key for contact form emails.                      |
| `CONTACT_EMAIL`                 | For email | Verified sender/recipient email for SendGrid.                  |
| `NEXT_PUBLIC_SUPABASE_URL`      | Optional  | Supabase project URL.                                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional  | Supabase anonymous key.                                        |

All other variables (`OPENAI_API_KEY`, `STRIPE_*`, etc.) are optional and only needed if those features are in use.

### Mock / Fallback Behaviour

- **Google Analytics** — If `NEXT_PUBLIC_GA_MEASUREMENT_ID` is missing or set to a placeholder like `G-XXXXXXXXXX`, GA simply won't fire. No errors, no crashes.
- **SendGrid** — If `SENDGRID_API_KEY` is a mock value, contact form submissions will return an API error. The UI handles this gracefully with an error state.

---

## 🛠️ Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:4028](http://localhost:4028) with your browser to see the result.

## 📁 Project Structure

```
nextjs/
├── public/             # Static assets
├── src/
│   ├── app/            # App router components
│   │   ├── layout.tsx  # Root layout component
│   │   └── page.tsx    # Main page component
│   ├── components/     # Reusable UI components
│   ├── styles/         # Global styles and Tailwind configuration
├── next.config.mjs     # Next.js configuration
├── package.json        # Project dependencies and scripts
├── postcss.config.js   # PostCSS configuration
└── tailwind.config.js  # Tailwind CSS configuration

```

## 🧩 Page Editing

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## 🎨 Styling

This project uses Tailwind CSS for styling with the following features:

- Utility-first approach for rapid development
- Custom theme configuration
- Responsive design utilities
- PostCSS and Autoprefixer integration

## 📦 Available Scripts

- `npm run dev` - Start development server on port 4028
- `npm run build` - Build the application for production
- `npm run start` - Start the development server
- `npm run serve` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## 📱 Deployment

Build the application for production:

```bash
npm run build
```

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

You can check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🙏 Acknowledgments

- Built with [Rocket.new](https://rocket.new)
- Powered by Next.js and React
- Styled with Tailwind CSS

Built with ❤️ on Rocket.new
