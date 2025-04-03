document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const appointmentsBody = document.getElementById('appointments-body');
    const filterDate = document.getElementById('filter-date');
    const filterStatus = document.getElementById('filter-status');
    const refreshBtn = document.getElementById('refresh-btn');
    const detailModal = document.getElementById('detail-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelAppointmentBtn = document.getElementById('cancel-appointment-btn');
    const saveChangesBtn = document.getElementById('save-changes-btn');
    const todayCount = document.getElementById('today-count');
    const upcomingCount = document.getElementById('upcoming-count');
    const cancelledCount = document.getElementById('cancelled-count');
    
    let currentAppointmentId = null;
    
    // Set today's date as default filter
    filterDate.valueAsDate = new Date();
    
    // Load initial data
    loadAppointments();
    loadStats();
    
    // Event listeners
    filterDate.addEventListener('change', loadAppointments);
    filterStatus.addEventListener('change', loadAppointments);
    refreshBtn.addEventListener('click', function() {
        loadAppointments();
        loadStats();
    });
    
    closeModal.addEventListener('click', function() {
        detailModal.style.display = 'none';
    });
    
    cancelAppointmentBtn.addEventListener('click', cancelAppointment);
    saveChangesBtn.addEventListener('click', saveAppointmentChanges);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === detailModal) {
            detailModal.style.display = 'none';
        }
    });
    
    // Load appointments from API
    function loadAppointments() {
        const date = filterDate.value;
        const status = filterStatus.value === 'all' ? '' : filterStatus.value;
        
        let url = '/api/appointments?';
        if (date) url += `date=${date}`;
        if (status) url += `&status=${status}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                renderAppointments(data);
            })
            .catch(error => {
                console.error('Error loading appointments:', error);
                alert('Failed to load appointments');
            });
    }
    
    // Render appointments in the table
    function renderAppointments(appointments) {
        appointmentsBody.innerHTML = '';
        
        if (appointments.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="8" class="no-appointments">No appointments found</td>`;
            appointmentsBody.appendChild(row);
            return;
        }
        
        appointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.id.substring(8)}</td>
                <td>${appointment.name}</td>
                <td>${formatServiceName(appointment.service)}</td>
                <td>${appointment.barber}</td>
                <td>${formatDate(appointment.date)} at ${appointment.time}</td>
                <td>
                    <div>${appointment.phone}</div>
                    <div>${appointment.email}</div>
                </td>
                <td><span class="status-badge status-${appointment.status}">${appointment.status}</span></td>
                <td>
                    <button class="action-btn view-btn" data-id="${appointment.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${appointment.status === 'confirmed' ? `
                    <button class="action-btn edit-btn" data-id="${appointment.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn cancel-btn" data-id="${appointment.id}">
                        <i class="fas fa-times"></i>
                    </button>
                    ` : ''}
                </td>
            `;
            appointmentsBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                viewAppointment(this.dataset.id);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                editAppointment(this.dataset.id);
            });
        });
        
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Are you sure you want to cancel this appointment?')) {
                    cancelAppointment(this.dataset.id);
                }
            });
        });
    }
    
    // Load statistics
    function loadStats() {
        const today = new Date().toISOString().split('T')[0];
        
        // Today's appointments
        fetch(`/api/appointments?date=${today}`)
            .then(response => response.json())
            .then(data => {
                todayCount.textContent = data.length;
            });
        
        // Upcoming appointments
        fetch('/api/appointments')
            .then(response => response.json())
            .then(data => {
                const upcoming = data.filter(a => a.status === 'confirmed' && a.date >= today);
                upcomingCount.textContent = upcoming.length;
            });
        
        // Cancelled appointments
        fetch('/api/appointments?status=cancelled')
            .then(response => response.json())
            .then(data => {
                cancelledCount.textContent = data.length;
            });
    }
    
    // View appointment details
    function viewAppointment(id) {
        fetch(`/api/appointments/${id}`)
            .then(response => response.json())
            .then(appointment => {
                currentAppointmentId = appointment.id;
                
                const detailsHtml = `
                    <div class="detail-row">
                        <div class="detail-label">ID:</div>
                        <div class="detail-value">${appointment.id}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Name:</div>
                        <div class="detail-value">${appointment.name}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Email:</div>
                        <div class="detail-value">${appointment.email}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Phone:</div>
                        <div class="detail-value">${appointment.phone}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Service:</div>
                        <div class="detail-value">${formatServiceName(appointment.service)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Barber:</div>
                        <div class="detail-value">${appointment.barber}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Date & Time:</div>
                        <div class="detail-value">${formatDate(appointment.date)} at ${appointment.time}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Status:</div>
                        <div class="detail-value">
                            <span class="status-badge status-${appointment.status}">${appointment.status}</span>
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Notes:</div>
                        <div class="detail-value">${appointment.notes || 'None'}</div>
                    </div>
                `;
                
                document.getElementById('appointment-details').innerHTML = detailsHtml;
                
                // Show appropriate buttons based on status
                cancelAppointmentBtn.style.display = appointment.status === 'confirmed' ? 'block' : 'none';
                saveChangesBtn.style.display = 'none';
                
                detailModal.style.display = 'flex';
            });
    }
    
    // Edit appointment
    function editAppointment(id) {
        fetch(`/api/appointments/${id}`)
            .then(response => response.json())
            .then(appointment => {
                currentAppointmentId = appointment.id;
                
                const detailsHtml = `
                    <form id="edit-form">
                        <div class="detail-row">
                            <div class="detail-label">ID:</div>
                            <div class="detail-value">${appointment.id}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Name:</div>
                            <div class="detail-value">
                                <input type="text" name="name" value="${appointment.name}" required>
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Email:</div>
                            <div class="detail-value">
                                <input type="email" name="email" value="${appointment.email}" required>
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Phone:</div>
                            <div class="detail-value">
                                <input type="tel" name="phone" value="${appointment.phone}" required>
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Service:</div>
                            <div class="detail-value">
                                <select name="service" required>
                                    <option value="haircut" ${appointment.service === 'haircut' ? 'selected' : ''}>Haircut</option>
                                    <option value="haircut-beard" ${appointment.service === 'haircut-beard' ? 'selected' : ''}>Haircut & Beard</option>
                                    <option value="beard-trim" ${appointment.service === 'beard-trim' ? 'selected' : ''}>Beard Trim</option>
                                    <option value="shave" ${appointment.service === 'shave' ? 'selected' : ''}>Shave</option>
                                    <option value="color" ${appointment.service === 'color' ? 'selected' : ''}>Hair Color</option>
                                </select>
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Barber:</div>
                            <div class="detail-value">
                                <select name="barber">
                                    <option value="Any Available" ${appointment.barber === 'Any Available' ? 'selected' : ''}>Any Available</option>
                                    <option value="James" ${appointment.barber === 'James' ? 'selected' : ''}>James</option>
                                    <option value="Michael" ${appointment.barber === 'Michael' ? 'selected' : ''}>Michael</option>
                                    <option value="David" ${appointment.barber === 'David' ? 'selected' : ''}>David</option>
                                    <option value="Robert" ${appointment.barber === 'Robert' ? 'selected' : ''}>Robert</option>
                                </select>
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Date:</div>
                            <div class="detail-value">
                                <input type="date" name="date" value="${appointment.date}" required>
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Time:</div>
                            <div class="detail-value">
                                <input type="time" name="time" value="${appointment.time}" required>
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Status:</div>
                            <div class="detail-value">
                                <select name="status">
                                    <option value="confirmed" ${appointment.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                    <option value="cancelled" ${appointment.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Notes:</div>
                            <div class="detail-value">
                                <textarea name="notes">${appointment.notes || ''}</textarea>
                            </div>
                        </div>
                    </form>
                `;
                
                document.getElementById('appointment-details').innerHTML = detailsHtml;
                
                // Show save button and hide cancel button in edit mode
                cancelAppointmentBtn.style.display = 'none';
                saveChangesBtn.style.display = 'block';
                
                detailModal.style.display = 'flex';
            });
    }
    
    // Cancel appointment
    function cancelAppointment(id = null) {
        const appointmentId = id || currentAppointmentId;
        
        fetch(`/api/appointments/${appointmentId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Appointment cancelled successfully');
                detailModal.style.display = 'none';
                loadAppointments();
                loadStats();
            } else {
                alert('Failed to cancel appointment');
            }
        })
        .catch(error => {
            console.error('Error cancelling appointment:', error);
            alert('Failed to cancel appointment');
        });
    }
    
    // Save appointment changes
    function saveAppointmentChanges() {
        const form = document.getElementById('edit-form');
        const formData = new FormData(form);
        const appointmentData = Object.fromEntries(formData.entries());
        
        fetch(`/api/appointments/${currentAppointmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Appointment updated successfully');
                detailModal.style.display = 'none';
                loadAppointments();
                loadStats();
            } else {
                alert('Failed to update appointment');
            }
        })
        .catch(error => {
            console.error('Error updating appointment:', error);
            alert('Failed to update appointment');
        });
    }
    
    // Helper functions
    function formatServiceName(service) {
        const serviceNames = {
            'haircut': 'Haircut',
            'haircut-beard': 'Haircut & Beard',
            'beard-trim': 'Beard Trim',
            'shave': 'Shave',
            'color': 'Hair Color'
        };
        return serviceNames[service] || service;
    }
    
    function formatDate(dateString) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
});