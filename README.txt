AGRISENSE PH - QUICK SETUP GUIDE
==================================

FOLDER STRUCTURE:
agrisense-final/
├── auth.html          ← Login/Register (SIMULA DITO)
├── index.html         ← Farmer app
├── admin.html         ← Admin dashboard
├── da-dashboard.html  ← DA Officer dashboard
├── analytics.html     ← Farmer analytics
├── database-setup.sql ← I-run ito sa Supabase SQL Editor
├── libs/              ← I-download ang 2 files dito
│   ├── tf.min.js
│   └── teachablemachine-image.min.js
└── models/
    └── rice/          ← Ilagay ang model files dito
        ├── model.json
        ├── weights.bin
        └── metadata.json

STEPS:
1. I-run ang database-setup.sql sa Supabase Console → SQL Editor
2. I-download ang libs (tf.min.js at teachablemachine-image.min.js)
3. Ilagay ang rice model files sa models/rice/
4. I-upload lahat sa GitHub
5. Buksan ang auth.html para mag-register

ACCESS CODES:
- Admin:      AGRI-ADMIN-2025
- DA Officer: DA-OFFICER-2025

LINKS:
- Auth:    auth.html
- Farmer:  index.html
- Admin:   admin.html
- DA:      da-dashboard.html
