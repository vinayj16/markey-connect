# Proposed Backend Directory Structure

```
backend/
├── config/
│   ├── db.js                  # Database connection/config
│   └── ...other config
├── controllers/
│   ├── cartController.js
│   ├── customerController.js
│   └── ...other controllers
├── middleware/
│   ├── auth.js
│   ├── errorMiddleware.js
│   └── ...other middleware
├── models/
│   ├── productModel.js
│   └── ...other models
├── routes/
│   ├── cartRoutes.js
│   ├── customerRoutes.js
│   └── ...other route files
├── utils/
│   └── helpers.js
├── migrations/
│   └── ...DB migration scripts
├── server.js                  # Main app entry
├── package.json
└── README.md
```

**Notes:**
- Migrations are consolidated under `backend/migrations/`.
- All Express routes are in `routes/`.
- Only config files in `config/`.
- Models/controllers/middleware kept separate and consistent.