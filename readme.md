# Cut & Style Barber Shop

A web-based appointment scheduling application for a barber shop, allowing customers to book and manage appointments with their preferred barbers.

## Technologies Used
### Frontend
- **HTML5**: Semantic markup structure
- **CSS3**: Custom styling with responsive design
- **JavaScript (ES6+)**: Client-side application logic
- **Font Awesome 6.0.0**: Icon library for UI elements
- **Google Fonts**: Oswald and Poppins font families
### Storage
- **IndexedDB**: Client-side database for storing appointment information
  - Database Name: BarberShopDB
  - Object Store: appointments
  
## Features

### Current Features
- **Appointment Booking System**
  - Date selection with calendar input
  - Dynamic time slot availability display
  - Service type selection
  - Barber preference selection
  - Form validation and submission
- **Appointment Management**
  - View all upcoming appointments
  - Cancel existing appointments
  - Automatic refresh of available time slots
- **Responsive Design**
  - Mobile-friendly interface
  - Accessible on various screen sizes

## Setup Instructions

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cut-and-style-barber.git
   cd cut-and-style-barber
   ```

2. No build steps are required as this is a vanilla JavaScript application.

3. Open the project with a local server:
   ```bash
   # Using Python 3 (example)
   python -m http.server
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

4. Access the application at `http://localhost:8000` or the port provided by your local server.

### For Production Deployment
1. Upload all files to your web hosting service.
2. Ensure HTTPS is enabled for better security, as IndexedDB may have limited functionality in non-secure contexts in some browsers.

## Browser Support

The application uses modern web technologies that are supported by:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Opera 47+

### Limitations
- IndexedDB data is stored locally in the browser and will not sync across devices
- Appointment data will be lost if the browser data is cleared

## My Future Goals

1. **Server-Side Integration**
   - Backend API for persistent data storage
   - User authentication system
   - Admin dashboard for barber shop management

2. **Enhanced Features**
   - Email/SMS appointment confirmations and reminders
   - Recurring appointment scheduling
   - Online payment processing for deposits
   - Customer profiles with appointment history
   - Barber availability management
   - Service duration configuration

3. **Technical Improvements**
   - Progressive Web App (PWA) functionality for offline access
   - Calendar view for appointment visualization
   - Real-time updates with WebSockets or Server-Sent Events
   - Image upload for hairstyle preferences

## Project Structure

```
cut-and-style-barber/
├── css/
│   └── styles.css               # Main stylesheet
├── js/
│   ├── app.js                   # Main application logic
│   └── db.js                    # IndexedDB database operations
├── index.html                   # Main HTML entry point
└── README.md                    # Project documentation
```

