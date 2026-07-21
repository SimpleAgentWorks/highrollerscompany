# High Rollers Company Website — Deployment Guide

## Quick Start (Vercel — Easiest)

### 1. Push to GitHub (optional but recommended)

```bash
cd /Users/agent01/.openclaw/workspaces/high-rollers/highrollerscompany-website
git init
git add .
git commit -m "Initial High Rollers website"
# Create a GitHub repo and push
```

### 2. Deploy to Vercel

1. Go to **https://vercel.com**
2. Sign up (or sign in)
3. Click **"New Project"**
4. Connect your GitHub repo or import from folder
5. Select the project folder: `/Users/agent01/.openclaw/workspaces/high-rollers/highrollerscompany-website`
6. Click **Deploy**

**Your site will be live in ~2 minutes** at a URL like `https://highrollerscompany.vercel.app`

### 3. Custom Domain

1. In Vercel, go to **Settings → Domains**
2. Add your domain: `highrollerscompany.com`
3. Follow DNS instructions to point domain to Vercel

## SMS Integration (Twilio)

### Setup

1. Sign up at **https://www.twilio.com** (free trial available)
2. Get your:
   - Account SID
   - Auth Token
   - Twilio phone number
3. Add to Vercel environment variables:
   - In Vercel dashboard: **Settings → Environment Variables**
   - Add:
     ```
     TWILIO_ACCOUNT_SID=your_sid
     TWILIO_AUTH_TOKEN=your_token
     TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
     BOOKING_PHONE_NUMBER=+16304560567
     ```

4. In `/pages/api/booking.js`, uncomment the Twilio code section
5. Redeploy to Vercel

### Test SMS

Fill out the booking form on your site. You should receive a text at `BOOKING_PHONE_NUMBER`.

## Alternative Deployments

### Railway (Fast)
- Go to **https://railway.app**
- Import GitHub repo
- Deploy in 1 click

### Netlify
- Connect GitHub repo to **https://netlify.app**
- Auto-deploys on every push

### Self-Hosted
```bash
npm install
npm run build
npm start
```

## File Structure

```
highrollerscompany-website/
├── pages/
│   ├── index.jsx          # Main page (all content)
│   ├── _app.jsx           # App wrapper
│   └── api/
│       └── booking.js     # SMS booking endpoint
├── styles/
│   └── globals.css        # Tailwind + custom styles
├── public/                # Static images (add Roku photos here)
├── next.config.js         # Next.js config
├── tailwind.config.js     # Tailwind config
└── package.json
```

## Customization

### Change Colors
Edit `tailwind.config.js` → `colors.carnival`

### Update Text/Copy
Edit `pages/index.jsx` → any `<p>`, `<h1>`, etc.

### Add Logo/Images
1. Put images in `public/images/`
2. Reference in `pages/index.jsx`: `<img src="/images/your-image.jpg" />`

### Update Contact Info
Edit footer section in `pages/index.jsx`:
- Phone
- Email
- Social links

## Going Live Checklist

- [ ] Domain pointing to Vercel
- [ ] SMS integration tested (Twilio)
- [ ] Contact phone number updated
- [ ] Social media links updated
- [ ] Review form validation working
- [ ] Test booking on mobile device

## Support

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

---

**Site built by SimpleAgentWorks**
