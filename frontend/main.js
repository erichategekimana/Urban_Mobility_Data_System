const API_BASE_URL = 'http://localhost:5000/api';

// --- Navigation Logic ---
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('d-none'));
    document.getElementById(`${sectionId}-section`).classList.remove('d-none');
    
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
        if(link.innerText.toLowerCase().includes(sectionId.substring(0,3))) link.classList.add('active');
    });

    if(sectionId === 'home') setTimeout(() => map.invalidateSize(), 200);
}

// 1. Initialize Map
const map = L.map('map').setView([40.7128, -74.0060], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// 2. Summary
async function updateSummary() {
    const res = await fetch(`${API_BASE_URL}/summary`);
    const data = await res.json();
    document.getElementById('total-trips').innerText = data.total_trips.toLocaleString();
    document.getElementById('avg-fare').innerText = `$${data.avg_fare}`;
    document.getElementById('avg-speed').innerText = `${data.avg_speed} mph`;
    document.getElementById('avg-distance').innerText = `${data.avg_distance} mi`;
}

// 4. Top 10 Busiest
async function updateTopLocations() {
    const res = await fetch(`${API_BASE_URL}/top-locations`);
    const data = await res.json();
    const list = document.getElementById('top-locations-list');
    list.innerHTML = data.map(loc => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><strong>${loc.zone}</strong> <small>(${loc.borough})</small></span>
            <span class="badge bg-primary rounded-pill">${(loc.count || 0).toLocaleString()}</span>
        </li>
    `).join('');
}

// 5. Hourly Heartbeat - Added logging to check name error
async function updateHourlyChart() {
    const res = await fetch(`${API_BASE_URL}/hourly-stats`);
    const data = await res.json();
    console.log("Hourly Data:", data); // CHECK YOUR F12 CONSOLE FOR KEYS

    const ctx = document.getElementById('hourlyChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            // If labels are empty, your key is likely not 'hour'
            labels: data.map(d => `${d.hour || d.pickup_hour || 0}:00`),
            datasets: [{
                label: 'Trips',
                data: data.map(d => d.trip_count || d.count || 0),
                borderColor: '#4e73df',
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// 6. Borough Performance - Added speed filter & key check
async function updateBoroughChart() {
    const res = await fetch(`${API_BASE_URL}/borough-stats`);
    let data = await res.json();
    console.log("Borough Data:", data); // CHECK YOUR F12 CONSOLE FOR KEYS

    // FILTER OUT THE 700mph EWR BUG
    data = data.filter(d => (d.average_speed || 0) < 100);

    const ctx = document.getElementById('boroughChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.borough),
            datasets: [
                {
                    label: 'Speed (MPH)',
                    data: data.map(d => d.average_speed || d.avg_speed || 0),
                    backgroundColor: '#1cc88a'
                },
                {
                    label: 'Tip (%)',
                    data: data.map(d => d.average_tip_percent || d.avg_tip_pct || 0),
                    backgroundColor: '#f6c23e'
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { beginAtZero: true } }
        }
    });
}

window.onload = () => {
    updateSummary();
    updateTopLocations();
    updateHourlyChart();
    updateBoroughChart();
    showSection('home');
};
