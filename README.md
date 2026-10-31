# Jerome Antonio — Personal Portfolio

A responsive React + Vite portfolio starter with a welcome intro, sticky navigation,
About section, portfolio tabs, experience, and a validated contact form.

## Run locally

1. Install Node.js (LTS).
2. Open this folder in VS Code.
3. Open the terminal in the project folder.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed by Vite (usually http://localhost:5173).

## Build for deployment

```bash
npm run build
npm run preview
```

## Personalize before publishing

- Replace `public/profile-placeholder.svg` with your own image and update `src/data/siteData.js`.
- Add project screenshots under `public/images/` and update `src/data/portfolioData.js`.
- Add certificate scans under `public/certificates/` and update the certificate entries.
- Update your email and social profile URLs in `src/data/siteData.js`.
- Add your CV as `public/Jerome-Antonio-CV.pdf` to enable the Download CV button.
- Update project URLs only when you have working live demos or repositories.

## Contact form

The form validates the fields and opens the visitor's email application with a pre-filled message.
It does not claim that a message was sent to a database. To store messages online, configure
Supabase and create a `contact_messages` table with suitable Row Level Security policies.

## Structure

```text
src/
  components/
    AboutSection.jsx
    ContactSection.jsx
    ExperienceSection.jsx
    Footer.jsx
    HeroSection.jsx
    Navbar.jsx
    PortfolioSection.jsx
    WelcomeIntro.jsx
  data/
    portfolioData.js
    siteData.js
  lib/
    supabase.js
  App.jsx
  index.css
  main.jsx
public/
  images/
  certificates/
```

This version uses custom CSS for layout and animation so it runs without a Tailwind build setup.
