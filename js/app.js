// Main Application Logic
document.addEventListener("DOMContentLoaded", function() {
    // Initialize the database first
    window.BarberDB.init().then(() => {
        console.log("Database initialized, loading app...");
        initApp();
    }).catch(error => {
        console.error("Failed to initialize database:", error);
        alert("There was an error loading the application. Please refresh the page and try again.");
    });
});

function initApp() {
    // DOM elements
    const appointmentDateInput = document.getElementById("appointment-date");
    const timeSlotsContainer = document.getElementById("time-slots");
    const appointmentForm = document.getElementById("appointment-form");
    const selectedSlotElement = document.getElementById("selected-slot");
    const appointmentsTable = document.getElementById("appointments-table").getElementsByTagName("tbody")[0];
    const noAppointmentsDiv = document.getElementById("no-appointments");
    const bookNowBtn = document.getElementById("book-now-btn");
    const bookAppointmentBtn = document.getElementById("book-appointment-btn");

    // Set minimum date to today
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    appointmentDateInput.min = formattedDate;
    appointmentDateInput.value = formattedDate;
    
    // Time slots - adjusted to barber shop hours
    const timeSlots = [
        "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
        "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
        "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
        "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
        "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM",
        "7:00 PM", "7:30 PM"
    ];
    
    // Generate time slots based on selected date
    async function generateTimeSlots() {
        timeSlotsContainer.innerHTML = "";
        const selectedDate = appointmentDateInput.value;
        
        // Get all booked slots for this date
        const bookedSlots = await window.BarberDB.getBookedSlots(selectedDate);
        
        // Create the time slot elements
        timeSlots.forEach(time => {
            const slot = document.createElement("div");
            slot.className = "time-slot";
            slot.textContent = time;
            
            // Check if slot is already booked
            if (bookedSlots.includes(time)) {
                slot.classList.add("booked");
            } else {
                slot.addEventListener("click", () => selectTimeSlot(slot, time));
            }
            
            timeSlotsContainer.appendChild(slot);
        });
    }
    
    // Select time slot
    function selectTimeSlot(slotElement, time) {
        // Remove selected class from all slots
        document.querySelectorAll(".time-slot.selected").forEach(slot => {
            slot.classList.remove("selected");
        });
        
        // Add selected class to clicked slot
        slotElement.classList.add("selected");
        
        // Update selected slot display
        const selectedDate = appointmentDateInput.value;
        const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        selectedSlotElement.textContent = `${formattedDate} at ${time}`;
    }
    
    // Book appointment
    appointmentForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const selectedSlot = document.querySelector(".time-slot.selected");
        if (!selectedSlot) {
            alert("Please select a time slot");
            return;
        }
        
        const appointmentData = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            service: document.getElementById("service").value,
            barber: document.getElementById("barber").value || "Any Available",
            notes: document.getElementById("notes").value,
            date: appointmentDateInput.value,
            time: selectedSlot.textContent,
            dateTime: `${appointmentDateInput.value} ${selectedSlot.textContent}`
        };
        
        try {
            await window.BarberDB.saveAppointment(appointmentData);
            
            // Show success message
            const successMessage = document.createElement("div");
            successMessage.className = "alert success";
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <p>Your appointment has been booked successfully!</p>
            `;
            appointmentForm.prepend(successMessage);
            
            // Reset form after 2 seconds
            setTimeout(() => {
                appointmentForm.reset();
                selectedSlotElement.textContent = "None selected";
                successMessage.remove();
                
                // Re-generate time slots and reload appointments
                generateTimeSlots();
                loadAppointments();
            }, 2000);
            
        } catch (error) {
            console.error("Error saving appointment:", error);
            alert("There was an error booking your appointment. Please try again.");
        }
    });
    
    // Load appointments
    async function loadAppointments() {
        appointmentsTable.innerHTML = "";
        
        try {
            const appointments = await window.BarberDB.getAllAppointments();
            
            if (appointments.length === 0) {
                // Show the "no appointments" message
                noAppointmentsDiv.classList.remove("hidden");
                appointmentsTable.parentElement.classList.add("hidden");
            } else {
                // Hide the "no appointments" message
                noAppointmentsDiv.classList.add("hidden");
                appointmentsTable.parentElement.classList.remove("hidden");
                
                // Sort appointments by date and time
                appointments.sort((a, b) => {
                    return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);
                });
                
                // Add each appointment to the table
                appointments.forEach(appointment => {
                    const row = appointmentsTable.insertRow();
                    
                    // Format date
                    const formattedDate = new Date(appointment.date).toLocaleDateString();
                    
                    // Create cells for each column
                    const nameCell = row.insertCell(0);
                    const dateCell = row.insertCell(1);
                    const timeCell = row.insertCell(2);
                    const serviceCell = row.insertCell(3);
                    const barberCell = row.insertCell(4);
                    const actionsCell = row.insertCell(5);
                    
                    // Populate cells
                    nameCell.textContent = appointment.name;
                    dateCell.textContent = formattedDate;
                    timeCell.textContent = appointment.time;
                    
                    // Format service name
                    let serviceName = "";
                    switch (appointment.service) {
                        case "haircut":
                            serviceName = "Haircut";
                            break;
                        case "haircut-beard":
                            serviceName = "Haircut & Beard Trim";
                            break;
                        case "beard-trim":
                            serviceName = "Beard Trim";
                            break;
                        case "shave":
                            serviceName = "Classic Shave";
                            break;
                        case "color":
                            serviceName = "Hair Color";
                            break;
                        default:
                            serviceName = appointment.service;
                    }
                    serviceCell.textContent = serviceName;
                    barberCell.textContent = appointment.barber;
                    
                    // Create cancel button
                    const cancelBtn = document.createElement("button");
                    cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
                    cancelBtn.onclick = function() {
                        cancelAppointment(appointment.id);
                    };
                    
                    actionsCell.appendChild(cancelBtn);
                });
            }
        } catch (error) {
            console.error("Error loading appointments:", error);
        }
    }
    
    // Cancel appointment
    async function cancelAppointment(id) {
        if (confirm("Are you sure you want to cancel this appointment?")) {
            try {
                await window.BarberDB.deleteAppointment(id);
                alert("Appointment cancelled successfully!");
                loadAppointments();
                generateTimeSlots(); // Refresh time slots
            } catch (error) {
                console.error("Error cancelling appointment:", error);
                alert("There was an error cancelling your appointment. Please try again.");
            }
        }
    }
    
    // Scroll to booking section when "Book Now" button is clicked
    bookNowBtn.addEventListener("click", function() {
        document.getElementById("booking-section").scrollIntoView({ behavior: "smooth" });
    });
    
    // Book appointment button in "no appointments" div
    bookAppointmentBtn.addEventListener("click", function() {
        document.getElementById("booking-section").scrollIntoView({ behavior: "smooth" });
    });
    
    // Event listeners
    appointmentDateInput.addEventListener("change", generateTimeSlots);
    
    // Initial loading
    generateTimeSlots();
    loadAppointments();
}