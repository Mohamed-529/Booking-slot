  const express = require('express');
  const cors = require('cors');
  const path = require('path');

  const app = express();
  const PORT = process.env.PORT || 3000;

  // CORS configuration for production
  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Allow localhost, Vercel, and any other frontend URLs
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:5173',
        'https://your-frontend.vercel.app', // Replace with your Vercel URL
      ];

      if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  // In-memory data store
  let slotData = {};

  // Initialize slots for a month
  function initializeMonthSlots(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2,
  '0')}-${String(day).padStart(2, '0')}`;

      if (!slotData[dateKey]) {
        slotData[dateKey] = {};

        for (let hour = 0; hour < 24; hour++) {
          const slotId = `slot-${String(hour).padStart(2,
  '0')}`;
          slotData[dateKey][slotId] = {
            id: slotId,
            hour,
            totalSubSlots: 3,
            remainingSubSlots: 3,
            blocked: false,
          };
        }
      }
    }
  }

  // Initialize current month
  const now = new Date();
  initializeMonthSlots(now.getFullYear(), now.getMonth());


  // ================= USER =================

  // Get slots (user view) - shows only green/red based on
  app.get('/api/user/slots/:date', (req, res) => {
    const { date } = req.params;

    if (!slotData[date]) {
      return res.status(404).json({ error: 'Date not found' });
    }

    const userSlots = Object.values(slotData[date]).map(slot =>
  ({
      id: slot.id,
      hour: slot.hour,
      available: slot.remainingSubSlots > 0 && !slot.blocked,
    }));

    res.json(userSlots);
  });


  // Book slot
  app.post('/api/user/book', (req, res) => {
    if (!req.body) {
      return res.status(400).json({ error: 'Request body missing' });
    }

    const { date, slotId } = req.body;

    if (!date || !slotId) {
      return res.status(400).json({ error: 'date and slotId required' });
    }

    if (!slotData[date]) {
      return res.status(404).json({ error: 'Date not found' });
    }

    const slot = slotData[date][slotId];

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (slot.blocked) {
      return res.status(400).json({ error: 'Slot is blocked by admin' });
    }

    if (slot.remainingSubSlots <= 0) {
      return res.status(400).json({ error: 'Slot is fully booked' });
    }

    // Book the slot
    slot.remainingSubSlots--;

    res.json({
      success: true,
      message: 'Slot booked successfully',
      remainingSubSlots: slot.remainingSubSlots,
    });
  });


  // ================= ADMIN =================

  // Admin view - shows full details
  app.get('/api/admin/slots/:date', (req, res) => {
    const { date } = req.params;

    if (!slotData[date]) {
      return res.status(404).json({ error: 'Date not found' });
    }

    const adminSlots = Object.values(slotData[date]).map(slot =>
   ({
      id: slot.id,
      hour: slot.hour,
      totalSubSlots: slot.totalSubSlots,
      remainingSubSlots: slot.remainingSubSlots,
      blocked: slot.blocked,
    }));

    res.json(adminSlots);
  });


  // Block slot
  app.post('/api/admin/block', (req, res) => {
    const { date, slotId } = req.body || {};

    if (!date || !slotId) {
      return res.status(400).json({ error: 'date and slotId required' });
    }

    if (!slotData[date]) {
      return res.status(404).json({ error: 'Date not found' });
    }

    const slot = slotData[date][slotId];

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    slot.blocked = true;

    res.json({ success: true, message: 'Slot blocked successfully' });
  });


  // Unblock slot - FIXED: does NOT reset remainingSubSlots
  app.post('/api/admin/unblock', (req, res) => {
    const { date, slotId } = req.body || {};

    if (!date || !slotId) {
      return res.status(400).json({ error: 'date and slotId required' });
    }

    if (!slotData[date]) {
      return res.status(404).json({ error: 'Date not found' });
    }

    const slot = slotData[date][slotId];

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    slot.blocked = false;
    // Do NOT reset remainingSubSlots - keep the current count

    res.json({
      success: true,
      message: 'Slot unblocked successfully',
      remainingSubSlots: slot.remainingSubSlots,
    });
  });


  // Initialize month
  app.post('/api/admin/initialize', (req, res) => {
    const { year, month } = req.body || {};

    if (year === undefined || month === undefined) {
      return res.status(400).json({ error: 'Year and month required' });
    }

    initializeMonthSlots(year, month);

    res.json({
      success: true,
      message: `Slots initialized for ${new Date(year,
  month).toLocaleString('default', { month: 'long', year:
  'numeric' })}`,
    });
  });


  // ================= UTILITY =================

  app.get('/api/dates', (req, res) => {
    res.json(Object.keys(slotData).sort());
  });

  app.post('/api/reset', (req, res) => {
    slotData = {};
    initializeMonthSlots(now.getFullYear(), now.getMonth());

    res.json({ success: true, message: 'Data reset successfully'
   });
  });


  // ================= FRONTEND =================

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  });

  // ================= START SERVER =================

  app.listen(PORT, () => {
    console.log(`🚀 Backend running: http://localhost:${PORT}`);
  });

