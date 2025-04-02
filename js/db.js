// Database Initialization and Helper Functions
let db;
const DB_NAME = "BarberShopDB";
const DB_VERSION = 1;
const STORE_NAME = "appointments";

// Open or create the IndexedDB database
function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = function(event) {
            db = event.target.result;
            
            // Create an object store for appointments if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
                store.createIndex("dateTime", "dateTime", { unique: false });
                store.createIndex("date", "date", { unique: false });
            }
        };
        
        request.onsuccess = function(event) {
            db = event.target.result;
            console.log("Database opened successfully");
            resolve(db);
        };
        
        request.onerror = function(event) {
            console.error("Database error:", event.target.error);
            reject(event.target.error);
        };
    });
}

// Check if a time slot is already booked
function isSlotBooked(dateTime) {
    return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index("dateTime");
        const request = index.get(dateTime);
        
        request.onsuccess = function() {
            resolve(request.result !== undefined);
        };
        
        request.onerror = function() {
            console.error("Error checking slot availability");
            resolve(false);
        };
    });
}

// Get all booked appointments for a specific date
function getBookedSlots(date) {
    return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index("date");
        const request = index.getAll(date);
        
        request.onsuccess = function() {
            const bookedSlots = request.result.map(appointment => appointment.time);
            resolve(bookedSlots);
        };
        
        request.onerror = function() {
            console.error("Error fetching booked slots");
            resolve([]);
        };
    });
}

// Save a new appointment
function saveAppointment(appointmentData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(appointmentData);
        
        request.onsuccess = function(event) {
            resolve(event.target.result); // Returns the ID of the new appointment
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Get all appointments
function getAllAppointments() {
    return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = function() {
            resolve(request.result);
        };
        
        request.onerror = function() {
            console.error("Error fetching appointments");
            resolve([]);
        };
    });
}

// Delete an appointment
function deleteAppointment(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = function() {
            resolve(true);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Export database functions
window.BarberDB = {
    init: initDatabase,
    isSlotBooked,
    getBookedSlots,
    saveAppointment,
    getAllAppointments,
    deleteAppointment
};