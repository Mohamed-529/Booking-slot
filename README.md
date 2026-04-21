# Booking Backend (Render/Vercel)

Express.js backend for the court booking system.

## Deployment to Render

1. Push code to GitHub
2. Go to [Render](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name**: booking-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Add environment variable:
   - `PORT` = `3000` (Render sets this automatically)
7. Click "Create Web Service"

## Deployment to Vercel (Alternative)

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your repository
4. Set the **Root Directory** to `booking-backend`
5. Click "Deploy"

## Local Development

```bash
cd booking-backend
npm install
npm run dev    # Hot reload with nodemon
# or
npm start      # Standard start
```

## API Endpoints

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/slots/:date` | Get available slots for a date |
| POST | `/api/user/book` | Book a slot |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/slots/:date` | Get all slots with details |
| POST | `/api/admin/block` | Block a slot |
| POST | `/api/admin/unblock` | Unblock a slot |
| POST | `/api/admin/initialize` | Initialize slots for a month |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dates` | Get all available dates |
| POST | `/api/reset` | Reset all data |

## CORS Configuration

Edit the `allowedOrigins` array in `server.js` to add your frontend URL:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'https://your-frontend.vercel.app', // Your Vercel URL
];
```

## Important Notes

- Data is stored in-memory (resets on server restart)
- For production, consider adding a database (MongoDB, PostgreSQL)
- The server serves static files from `/public` folder
