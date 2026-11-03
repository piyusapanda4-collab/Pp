# Deploying PulseFlow on Vercel

PulseFlow is fully configured for zero-configuration, production deployment on [Vercel](https://vercel.com).

## Automatic Vercel Configuration Included

1. **`vercel.json`**:
   - `framework: "vite"`
   - `buildCommand: "npm run build"`
   - `outputDirectory: "dist"`
   - Single Page Application (SPA) route rewrites to `/index.html` (prevents 404s on browser reloads and deep paths)
   - Cache-Control headers for immutable static assets (`/assets/*`)
2. **Optimized Asset Pipeline**:
   - High-fidelity visual assets are bundled and hashed directly via Vite into `dist/assets/`.
   - Mirrored static fallbacks in `/public/assets/` and `/public/src/assets/` ensure both live and cached client sessions render without missing image frames.
3. **TypeScript & Strict Standards**:
   - Clean compilation passes (`tsc --noEmit` and `vite build`).

---

## Deployment Options

### Option 1: Deploy with Git (Recommended)

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your repository.
4. Vercel will automatically detect **Vite** and read the configuration from `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. (Optional) In **Environment Variables**, you can set:
   - `GEMINI_API_KEY`: (If utilizing Google GenAI server features)
6. Click **Deploy**. Your app will be live within seconds with HTTPS and global edge CDN caching.

---

### Option 2: Deploy with Vercel CLI

1. Install the Vercel CLI globally (if not already installed):
   ```bash
   npm i -g vercel
   ```
2. In the project root directory, run:
   ```bash
   vercel
   ```
3. Follow the CLI prompts to link to your Vercel account and deploy.
4. For production release:
   ```bash
   vercel --prod
   ```
