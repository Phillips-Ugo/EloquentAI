# Project Structure

```
EloquentAI/
├── client/                 # React frontend (Zoom-identical UI)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── server/                # Node.js backend
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── analysis/          # ML analysis modules
│   └── index.js
├── tools/                 # Utility tools
│   ├── gemini_cli.py      # Gemini CLI tools
│   ├── simple_gemini.py
│   └── README.md
├── docs/                  # Documentation
│   ├── SETUP.md
│   └── API.md
├── .gitignore
├── README.md
└── PROJECT_STRUCTURE.md
```

## Key Directories

### `/client`
- React.js frontend with Zoom-identical UI
- Tailwind CSS for styling
- Framer Motion for animations
- All components styled to match Zoom exactly

### `/server`
- Node.js/Express backend
- Real-time analysis services
- API endpoints for frontend
- Database integration

### `/tools`
- Gemini CLI tools for terminal interaction
- Utility scripts
- Development tools

## Getting Started

1. **Frontend**: `cd client && npm start`
2. **Backend**: `cd server && npm start`
3. **Tools**: See `tools/README.md` for Gemini CLI setup

## Development

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:5001
- All APIs are proxied through the frontend



