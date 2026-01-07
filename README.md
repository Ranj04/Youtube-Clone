# YouTube Clone

A full-stack video sharing web application built with Node.js and Express.

## Features

- **User Authentication** - Register, login, and session management
- **Video Posts** - Share videos with titles and descriptions
- **Comments** - Engage with content through comments
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

**Backend**
- Node.js
- Express.js
- MySQL
- Handlebars (templating)

**Frontend**
- HTML5 / CSS3
- Vanilla JavaScript
- Responsive grid layouts

## Getting Started

### Prerequisites
- Node.js (v20+)
- MySQL (v8.0+)

### Installation

```bash
# Clone the repository
git clone https://github.com/Ranj04/Youtube-Clone.git
cd Youtube-Clone/application

# Install dependencies
npm install

# Set up the database
npm run builddb

# Start the server
npm start
```

The app runs at `http://localhost:3000`

### Database Configuration

Configure your database using environment variables. Copy the example file:
```bash
cp application/.env.example application/.env
```

Edit `.env` with your MySQL credentials:
```
MYSQLHOST=localhost
MYSQLUSER=root
MYSQLPASSWORD=your_password
MYSQLDATABASE=youtube_clone
MYSQLPORT=3306
```

## Project Structure

```
├── application/
│   ├── app.js              # Express app configuration
│   ├── bin/
│   │   ├── www             # Server entry point
│   │   └── dbloader        # Database initialization
│   ├── routes/
│   │   ├── index.js        # Home routes
│   │   ├── users.js        # Auth routes
│   │   └── posts.js        # Video & comment routes
│   ├── views/              # Handlebars templates
│   ├── helpers/            # Database & error utilities
│   └── public/             # Static assets (CSS, JS)
├── index.html              # Static landing page
└── styles.css              # Main stylesheet
```

## Deploy to Railway

### One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/youtube-clone)

### Manual Deployment

1. **Create a Railway Account**
   - Go to [railway.app](https://railway.app) and sign up

2. **Create New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Connect your GitHub account and select this repository

3. **Add MySQL Database**
   - In your project, click "New" → "Database" → "Add MySQL"
   - Railway automatically sets up the database and environment variables

4. **Configure Environment Variables**
   Railway auto-configures most variables. Add these if needed:
   ```
   NODE_ENV=production
   ```

5. **Deploy**
   - Railway will automatically build and deploy your app
   - The database tables are created automatically on first start

6. **Get Your URL**
   - Go to Settings → Domains → Generate Domain
   - Your app is now live!

### Environment Variables (Auto-configured by Railway)

| Variable | Description |
|----------|-------------|
| `MYSQLHOST` | MySQL host address |
| `MYSQLUSER` | MySQL username |
| `MYSQLPASSWORD` | MySQL password |
| `MYSQLDATABASE` | Database name |
| `MYSQLPORT` | MySQL port |
| `PORT` | Web server port |

## Screenshots

The application features a clean, modern UI with:
- Gradient headers and navigation
- Card-based video grid layout
- Smooth hover animations
- Mobile-responsive design

## License

MIT
