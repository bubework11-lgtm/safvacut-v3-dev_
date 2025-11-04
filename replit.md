# Safvacut Wallet - Replit Project

## Overview
Safvacut is a cryptocurrency wallet and trading platform landing page. This is a static HTML/CSS/JavaScript website that showcases features of a crypto wallet service.

## Project Structure
- **Frontend**: Static HTML files in the `public/` directory
- **Server**: Node.js HTTP server (`server.js`) to serve static files
- **Port**: 5000 (required for Replit webview)
- **Host**: 0.0.0.0 (required for Replit proxy)

## Pages
- `index.html` - Landing page
- `login.html` - Login page
- `signup.html` - Signup page
- `dashboard.html` - User dashboard
- `dashboard1.html` - Alternative dashboard view
- `settings.html` - Settings page
- `individual-wallet.html` - Wallet details page

## Technologies
- HTML5
- Tailwind CSS (via CDN)
- JavaScript (vanilla)
- Font Awesome icons
- SweetAlert2 for alerts
- AOS (Animate on Scroll)
- Chart.js for dashboard charts

## Setup
This project was imported from GitHub and configured to run on Replit:
- Created a simple Node.js HTTP server to serve static files
- Configured to run on port 5000 with 0.0.0.0 host
- Added cache control headers to prevent caching issues
- Set up workflow for automatic server restart

## Recent Changes
- **2025-11-04**: Initial Replit setup
  - Created Node.js server for static file serving
  - Configured workflow on port 5000
  - Added .gitignore for Node.js
  - Set up deployment configuration
