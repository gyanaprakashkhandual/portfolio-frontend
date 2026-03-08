# Installing Express & Setup

This guide walks you through setting up a production-ready Express.js project from scratch — covering Node.js prerequisites, package initialization, Express installation, and essential tooling like nodemon and environment variables.

---

## Prerequisites

### Node.js

Express requires Node.js. Always use the **LTS (Long-Term Support)** version for production projects.

```bash
# Check if Node.js is installed
node --version    # Should be v18.x or higher
npm --version     # Should be v9.x or higher
```

**Installing Node.js:**

- [Official Download](https://nodejs.org) — Download the LTS installer directly
- **nvm (recommended)** — Node Version Manager lets you switch between Node versions easily

```bash
# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use the latest LTS
nvm install --lts
nvm use --lts
```

---

## Step 1: Initialize Your Project

Create a new project directory and initialize a `package.json`:

```bash
mkdir my-express-app
cd my-express-app
npm init -y
```

The `-y` flag accepts all defaults. Your `package.json` will look like this:

```json
{
  "name": "my-express-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

---

## Step 2: Install Express

```bash
npm install express
```

This installs Express as a **production dependency** and adds it to your `package.json`:

```json
"dependencies": {
  "express": "^4.18.2"
}
```

> **Express v5** (currently in release candidate): `npm install express@5`

---

## Step 3: Essential Development Tools

### nodemon — Auto-restart on file changes

Without nodemon, you'd have to manually stop and restart your server every time you change code.

```bash
npm install --save-dev nodemon
```

Update `package.json` scripts:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

Now run `npm run dev` during development — your server restarts automatically on every save.

### dotenv — Environment Variables

Never hardcode secrets, ports, or database URLs. Use environment variables.

```bash
npm install dotenv
```

Create a `.env` file in your project root:

```
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/mydb
JWT_SECRET=your-super-secret-key
```

Load it at the very top of your entry file:

```javascript
require('dotenv').config();

const PORT = process.env.PORT || 3000;
```

> **Important:** Always add `.env` to `.gitignore`. Never commit secrets to version control.

---

## Step 4: Create Your Entry File

Create `index.js` (or `app.js` / `server.js` — all are common conventions):

```javascript
require('dotenv').config();
const express = require('express');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
```

---

## Step 5: .gitignore

Create a `.gitignore` file to exclude unnecessary files from version control:

```
node_modules/
.env
.env.local
dist/
*.log
```

---

## Recommended Project Structure (Minimal)

```
my-express-app/
├── node_modules/
├── src/
│   ├── routes/
│   ├── middleware/
│   └── controllers/
├── .env
├── .env.example      ← Committed version with placeholder values
├── .gitignore
├── index.js
├── package.json
└── package-lock.json
```

> `.env.example` is a best practice — it shows other developers what environment variables are required, without exposing actual values.

---

## Complete `package.json` Example

```json
{
  "name": "my-express-app",
  "version": "1.0.0",
  "description": "An Express.js REST API",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "dotenv": "^16.0.3",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## Verifying the Installation

```bash
npm run dev
```

Open your browser or use `curl` / Postman / Thunder Client:

```bash
curl http://localhost:3000/
# {"message":"Server is running!"}
```

---

## Common Installation Issues

**`node_modules` not found after cloning a repo**

```bash
npm install   # Always run after cloning
```

**Port already in use**

```bash
# Find what's using port 3000
lsof -i :3000       # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill it, or just use a different port in .env
PORT=4000
```

**`require is not defined` error**

Your project may be set to ES Modules. Either use `import/export` syntax or remove `"type": "module"` from `package.json`.

---

## Optional: TypeScript Setup

If you prefer TypeScript:

```bash
npm install --save-dev typescript ts-node @types/node @types/express

# Initialize tsconfig
npx tsc --init
```

Update your dev script:

```json
"dev": "nodemon --exec ts-node src/index.ts"
```

---

*A clean, well-structured setup from day one saves significant refactoring pain later. Take the time to set up your environment variables, `.gitignore`, and scripts properly before writing any application logic.*