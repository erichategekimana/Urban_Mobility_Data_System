class TaxiDashboard {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.currentFilters = {};
        this.currentPage = 1;
        this.pageSize = 25;
        this.charts = {};
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.initializeCharts();
        await this.loadData();
        this.hideLoading();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Filters
        document.getElementById('apply-filters').addEventListener('click', () => this.applyFilters());
        document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());
        
        // Range sliders
        ['min-fare', 'max-fare'].forEach(id => {
            document.getElementById(id).addEventListener('input', this.updateFareDisplay.bind(this));
        });
        
        ['min-distance', 'max-distance'].forEach(id => {
            document.getElementById(id).addEventListener('input', this.updateDistanceDisplay.bind(this));
        });

        // Table controls
        document.getElementById('search-table').addEventListener('input', (e) => this.searchTable(e.target.value));
        document.getElementById('sort-table').addEventListener('change', (e) => this.sortTable(e.target.value));
        
        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => this.changePage(-1));
        document.getElementById('next-page').addEventListener('click', () => this.changePage(1));
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        
        this.loadTabData(tabName);
    }

    updateFareDisplay() {
        const min = document.getElementById('min-fare').value;
        const max = document.getElementById('max-fare').value;
        document.getElementById('fare-display').textContent = `$${min} - $${max}`;
    }

    updateDistanceDisplay() {
        const min = document.getElementById('min-distance').value;
        const max = document.getElementById('max-distance').value;
        document.getElementById('distance-display').textContent = `${min} - ${max} miles`;
    }

    async applyFilters() {
        this.showLoading();
        
        this.currentFilters = {
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value,
            borough: document.getElementById('borough-filter').value,
            minFare: document.getElementById('min-fare').value,
            maxFare: document.getElementById('max-fare').value,
            minDistance: document.getElementById('min-distance').value,
            maxDistance: document.getElementById('max-distance').value
        };

        await this.loadData();
        this.hideLoading();
    }

    resetFilters() {
        ['start-date', 'end-date', 'borough-filter'].forEach(id => {
            document.getElementById(id).value = '';
        });
        
        document.getElementById('min-fare').value = 0;
        document.getElementById('max-fare').value = 200;
        document.getElementById('min-distance').value = 0;
        document.getElementById('max-distance').value = 50;
        
        this.updateFareDisplay();
        this.updateDistanceDisplay();
        this.currentFilters = {};
        this.applyFilters();
    }

    initializeCharts() {
        Chart.defaults.font.family = 'Segoe UI';
        Chart.defaults.color = '#666';

        // Basic chart configurations
        const chartConfigs = {
            'hourly-volume-chart': this.createLineChart('Trip Volume', '#667eea'),
            'fare-distribution-chart': this.createBarChart('Frequency', '#667eea'),
            'pickup-locations-chart': this.createDoughnutChart(),
            'distance-fare-chart': this.createScatterChart('Distance vs Fare'),
            'daily-patterns-chart': this.createLineChart('Daily Trips', '#667eea'),
            'weekly-seasonality-chart': this.createBarChart('Weekly Trips', '#764ba2'),
            'monthly-trends-chart': this.createLineChart('Monthly Trends', '#f5576c'),
            'borough-chart': this.createBarChart('Borough Data', '#4facfe'),
            'revenue-analysis-chart': this.createBarChart('Revenue', '#28a745'),
            'tip-patterns-chart': this.createLineChart('Tip Patterns', '#4facfe'),
            'payment-methods-chart': this.createDoughnutChart(),
            'profitability-chart': this.createBarChart('Profitability', '#28a745')
        };

        Object.keys(chartConfigs).forEach(canvasId => {
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                this.charts[canvasId] = new Chart(canvas.getContext('2d'), chartConfigs[canvasId]);
            }
        });
    }

    createLineChart(label, color) {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: label,
                    data: [],
                    borderColor: color,
                    backgroundColor: color + '20',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        };
    }

    createBarChart(label, color) {
        return {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: label,
                    data: [],
                    backgroundColor: color + 'B3',
                    borderColor: color,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        };
    }

    createDoughnutChart() {
        return {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        };
    }

    createScatterChart(label) {
        return {
            type: 'scatter',
            data: {
                datasets: [{
                    label: label,
                    data: [],
                    backgroundColor: '#667eea80',
                    borderColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Distance (miles)' } },
                    y: { title: { display: true, text: 'Fare ($)' } }
                }
            }
        };
    }

    async loadData() {
        try {
            const [dashboardData, tableData, summaryStats] = await Promise.all([
                this.fetchData('/dashboard-data'),
                this.fetchData('/trips'),
                this.fetchData('/summary-stats')
            ]);

            this.updateCharts(dashboardData);
            this.updateTable(tableData);
            this.updateSummaryStats(summaryStats);
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load data');
        }
    }

    async loadTabData(tabName) {
        const endpoints = {
            'temporal': '/temporal-data',
            'spatial': '/spatial-data',
            'economics': '/economics-data',
            'insights': '/insights-data'
        };

        if (endpoints[tabName]) {
            try {
                const data = await this.fetchData(endpoints[tabName]);
                this.updateTabCharts(tabName, data);
            } catch (error) {
                console.error(`Error loading ${tabName} data:`, error);
            }
        }
    }

    async fetchData(endpoint) {
        const response = await fetch(`${this.apiBase}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...this.currentFilters, page: this.currentPage, pageSize: this.pageSize })
        });

        if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
        return response.json();
    }

    updateCharts(data) {
        const chartUpdates = {
            'hourly-volume-chart': { data: data.hourlyVolume },
            'fare-distribution-chart': { labels: data.fareDistribution?.labels, data: data.fareDistribution?.data },
            'pickup-locations-chart': { labels: data.pickupLocations?.labels, data: data.pickupLocations?.data },
            'distance-fare-chart': { data: data.distanceFareCorrelation }
        };

        Object.keys(chartUpdates).forEach(chartId => {
            if (this.charts[chartId] && chartUpdates[chartId]) {
                const chart = this.charts[chartId];
                const update = chartUpdates[chartId];
                
                if (update.labels) chart.data.labels = update.labels;
                if (update.data) chart.data.datasets[0].data = update.data;
                
                chart.update();
            }
        });
    }

    updateTabCharts(tabName, data) {
        // Simplified tab-specific updates
        switch(tabName) {
            case 'temporal':
                this.updateChart('daily-patterns-chart', data.dailyPatterns);
                this.updateChart('weekly-seasonality-chart', { data: data.weeklySeasonality });
                break;
            case 'economics':
                this.updateChart('revenue-analysis-chart', data.revenueAnalysis);
                this.updateChart('tip-patterns-chart', { data: data.tipPatterns });
                break;
        }
    }

    updateChart(chartId, chartData) {
        if (this.charts[chartId] && chartData) {
            const chart = this.charts[chartId];
            if (chartData.labels) chart.data.labels = chartData.labels;
            if (chartData.data) chart.data.datasets[0].data = chartData.data;
            chart.update();
        }
    }

    updateSummaryStats(stats) {
        const updates = {
            'total-trips': stats.totalTrips?.toLocaleString() || '-',
            'avg-fare': stats.avgFare ? `$${stats.avgFare.toFixed(2)}` : '-',
            'avg-distance': stats.avgDistance ? `${stats.avgDistance.toFixed(1)} mi` : '-',
            'peak-hour': stats.peakHour || '-'
        };

        Object.keys(updates).forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = updates[id];
        });
    }

    updateTable(data) {
        const tbody = document.getElementById('trips-tbody');
        if (!tbody || !data.trips) return;

        tbody.innerHTML = data.trips.map(trip => `
            <tr>
                <td>${new Date(trip.pickup_datetime).toLocaleString()}</td>
                <td>${trip.pickup_zone || 'Unknown'}</td>
                <td>${trip.dropoff_zone || 'Unknown'}</td>
                <td>${trip.trip_distance?.toFixed(1) || '-'} mi</td>
                <td>${trip.trip_duration || '-'}</td>
                <td>$${trip.fare_amount?.toFixed(2) || '0.00'}</td>
                <td>$${trip.tip_amount?.toFixed(2) || '0.00'}</td>
                <td>$${trip.total_amount?.toFixed(2) || '0.00'}</td>
            </tr>
        `).join('');

        this.updatePagination(data.totalCount);
    }

    updatePagination(totalCount) {
        const totalPages = Math.ceil(totalCount / this.pageSize);
        document.getElementById('page-info').textContent = `Page ${this.currentPage} of ${totalPages}`;
        
        document.getElementById('prev-page').disabled = this.currentPage <= 1;
        document.getElementById('next-page').disabled = this.currentPage >= totalPages;
    }

    changePage(direction) {
        this.currentPage += direction;
        this.loadData();
    }

    searchTable(query) {
        // Simple client-side search (implement server-side for better performance)
        const rows = document.querySelectorAll('#trips-tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    sortTable(column) {
        // Reload data with sort parameter
        this.currentFilters.sortBy = column;
        this.loadData();
    }

    exportData() {
        // Simple CSV export
        const data = this.getCurrentTableData();
        const csv = this.convertToCSV(data);
        this.downloadCSV(csv, 'taxi_data_export.csv');
    }

    getCurrentTableData() {
        const rows = Array.from(document.querySelectorAll('#trips-tbody tr'));
        return rows.map(row => {
            const cells = row.querySelectorAll('td');
            return Array.from(cells).map(cell => cell.textContent);
        });
    }

    convertToCSV(data) {
        const headers = ['Pickup Time', 'Pickup Zone', 'Dropoff Zone', 'Distance', 'Duration', 'Fare', 'Tip', 'Total'];
        return [headers, ...data].map(row => row.join(',')).join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showLoading() {
        document.getElementById('loading-indicator').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading-indicator').classList.remove('active');
    }

    showError(message) {
        alert(message); // Replace with better error handling
    }
}

// We call the function whenever the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaxiDashboard();
});
