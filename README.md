# 🎓 Smart Class Management System

A complete classroom management solution with AI-powered headcount and biometric verification, attendance tracking, payments, and more!

---

## 📋 What You Need to Know

This system consists of:
- **Backend**: Server that handles all data and logic (runs on port 5000)
- **Frontend**: Website/dashboard that users interact with (runs on port 5173)
- **Database**: Stores all student, class, and payment information (PostgreSQL)
- **AI Engine**: Python scripts that count students and verify attendance

---

## ⚡ Quick Start (Manual Setup)

### Prerequisites
- **Node.js**: v20+ (https://nodejs.org/)
- **Python**: v3.12+ (https://www.python.org/)
- **PostgreSQL**: v15+ (https://www.postgresql.org/)
- **C++ Build Tools**: Visual Studio Build Tools (Required for AI)

Please follow the detailed instructions in `QUICK_START.md` to set up the project. (Database tables must be created manually after connecting).

---

## 🚀 Running the System

### 1. Start the Backend
Open a terminal in the `thusitha-backend` folder:
```powershell
.\venv\Scripts\activate
npm start
```

### 2. Start the Frontend (In a New Terminal)
```bash
cd thusitha-frontend
npm run dev
```

---

### Can't connect to backend from frontend
```bash
# Edit thusitha-frontend/.env
# Change VITE_API_URL from http://localhost:5000 to the backend URL
```

---

## 📁 Project Structure

```
Smart-Class-Management-System/
├── docker-compose.yml          # Main Docker configuration
├── README.md                   # This file
├── .gitignore                  # Files to ignore in Git
│
├── thusitha-backend/
│   ├── Dockerfile              # Backend Docker image
│   ├── .env.example            # Template for environment variables
│   ├── package.json            # Node dependencies
│   ├── requirements.txt         # Python dependencies
│   ├── server.js               # Main server file
│   ├── db.js                   # Database connection
│   ├── routes/                 # API endpoints
│   ├── controllers/            # Business logic
│   ├── middleware/             # Request handlers
│   ├── utils/                  # Helper functions
│   └── uploads/                # Student images, materials, promos
│
├── thusitha-frontend/
│   ├── Dockerfile              # Frontend Docker image
│   ├── .env.example            # Template for environment variables
│   ├── package.json            # React dependencies
│   ├── vite.config.js          # Build configuration
│   ├── src/
│   │   ├── App.jsx             # Main app component
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── services/           # API calls
│   │   └── context/            # State management
│   └── public/                 # Static files
```

---

## 🔐 Security Notes

⚠️ **IMPORTANT**: Before going to production:

1. **Change database password** in `.env`
   ```env
   DB_PASSWORD=Thusitha@2026
   ```

2. **Change JWT secret** in `.env`
   ```env
   JWT_SECRET=your-super-secret-key-minimum-32-characters
   ```

3. **Never commit `.env` files** to Git
   - They contain passwords and secrets
   - Use `.env.example` as template instead

4. **Enable HTTPS** in production
5. **Use strong passwords** for database and users
6. **Keep Docker images updated**

---

## 📞 Support

For issues, check the logs:
```bash
docker-compose logs -f
```

Common issues and fixes are documented in `TROUBLESHOOTING.md`.

---

## 📄 Additional Documentation

- [DATABASE.md](./DATABASE.md) - Database schema and setup
- [API.md](./API.md) - API endpoints documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - How to deploy to production

---

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Push to GitHub
4. Create a Pull Request

---

## 📝 License

This project is private. Contact the team for access.

---

**Happy teaching! 🎉**
