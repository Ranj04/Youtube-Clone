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
- Node.js (v14+)
- MySQL

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

Update credentials in `application/bin/dbloader` if needed:
```javascript
user: "root",
password: "your_password"
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

## Screenshots

The application features a clean, modern UI with:
- Gradient headers and navigation
- Card-based video grid layout
- Smooth hover animations
- Mobile-responsive design

## License

MIT
