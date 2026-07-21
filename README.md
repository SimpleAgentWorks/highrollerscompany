# High Rollers Company Website

A carnival-fun, cinematic website for High Rollers Company event services.

## Features

- ✨ Carnival-themed gradient design (pink, purple, cyan, yellow, orange)
- 🎭 Hero section with animated background
- 📋 Three service offerings (Cotton Candy, Trivia, DJ)
- 📱 Booking form with SMS integration
- 🔗 Call-to-action to SimpleAgentWorks
- 📱 Mobile responsive
- ⭐ Social proof & reviews section

## Services & Pricing

- **Cotton Candy Package**: $750 (2 hours, up to 100 candies)
- **Onsite Trivia Night**: $250 (no contract)
- **DJ Services**: $150/hour

## Deployment

### Option 1: Vercel (Recommended)

```bash
npm install
npm run build
# Deploy to Vercel via: https://vercel.com/import
```

### Option 2: Self-hosted

```bash
npm install
npm run build
npm start
```

Server runs on `http://localhost:3000`

### Option 3: Export as Static Site

```bash
npm run export
# Upload `out/` folder to any static host (Netlify, GitHub Pages, etc.)
```

## SMS Integration

The booking form currently logs submissions to console. To integrate SMS:

1. **Sign up for Twilio** (https://www.twilio.com)
2. **Add environment variables**:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   BOOKING_PHONE_NUMBER=+1630456XXXX (destination for texts)
   ```

3. **Uncomment SMS logic in `pages/api/booking.js`** (when created)

## Photo Updates

To swap in your custom Roku customer photos:

1. Export photos from Roku
2. Place in `public/images/`
3. Update `pages/index.jsx` to reference new image paths
4. Redeploy

## Contact

- Phone: (630) 456-0567
- Email: info@highrollerscompany.com
- Instagram: @highrollerscompany1
- Facebook: HighRollersCompany

---

**Built by SimpleAgentWorks** | AI-driven operations & optimization
