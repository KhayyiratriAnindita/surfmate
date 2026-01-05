/**
 * Wave Monitor Module
 * Real-time wave monitoring dengan data dari BMKG API
 * Source: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
 */

class WaveMonitor {
    constructor() {
        this.apiUrl = '/app/api/wave_data.php';
        this.waveData = null;
        this.currentData = null;
        this.updateInterval = null;
        this.chart = null;
        this.refreshRate = 3600000; // Update setiap 1 jam (API BMKG update ~hourly)
    }

    // Initialize wave monitor
    async init() {
        try {
            await this.fetchWaveData();
            this.renderUI();
            this.initChart();
            this.startMonitoring();
        } catch (error) {
            this.showError(error.message);
            console.error('Wave Monitor Error:', error);
        }
    }

    // Fetch wave data dari API PHP
    async fetchWaveData() {
        const response = await fetch(this.apiUrl);
        
        if (!response.ok) {
            throw new Error('Gagal mengambil data ombak dari server');
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Data tidak valid');
        }
        
        this.waveData = data;
        this.currentData = data.current;
    }

    // Render UI dengan data
    renderUI() {
        // Hide loading, show content
        this.hideElement('wave-loading');
        this.showElement('wave-cards-container');
        this.showElement('wave-status');
        this.showElement('wave-chart-section');
        
        // Update location
        const location = this.waveData.location;
        document.getElementById('wave-location').textContent = 
            `${location.name}, ${location.province}`;
        
        // Update timestamp
        const timestamp = new Date(this.waveData.timestamp);
        document.getElementById('wave-timestamp').textContent = 
            `Update: ${this.formatDateTime(timestamp)}`;
        
        // Update wave height card
        document.getElementById('wave-height').textContent = 
            `${this.currentData.waveHeight}m`;
        document.getElementById('wave-height-advice').textContent = 
            this.currentData.waveCondition.advice;
        
        // Update wind speed card
        document.getElementById('wind-speed').textContent = 
            `${this.currentData.windSpeed} km/h`;
        
        // Update temperature card
        document.getElementById('water-temp').textContent = 
            `${this.currentData.temperature}°C`;
        document.getElementById('water-temp-desc').textContent = 
            this.getTempDescription(this.currentData.temperature);
        
        // Update weather card
        document.getElementById('weather-desc').textContent = 
            this.currentData.weatherDesc;
        document.getElementById('humidity-info').textContent = 
            `Kelembapan: ${this.currentData.humidity}%`;
        
        // Update wave status
        this.updateWaveStatus(this.currentData.waveCondition);
    }

    // Update wave status indicator
    updateWaveStatus(condition) {
        const statusElement = document.getElementById('wave-status');
        const statusText = document.getElementById('status-text');
        const statusIcon = statusElement.querySelector('i');
        
        statusElement.classList.remove('safe', 'fair', 'good', 'excellent', 'warning');
        
        let iconClass = 'fas fa-check-circle';
        
        switch (condition.level) {
            case 'poor':
                statusElement.classList.add('safe');
                iconClass = 'fas fa-times-circle';
                break;
            case 'fair':
                statusElement.classList.add('fair');
                iconClass = 'fas fa-exclamation-circle';
                break;
            case 'good':
                statusElement.classList.add('good');
                iconClass = 'fas fa-check-circle';
                break;
            case 'excellent':
                statusElement.classList.add('excellent');
                iconClass = 'fas fa-star';
                break;
            case 'warning':
                statusElement.classList.add('warning');
                iconClass = 'fas fa-exclamation-triangle';
                break;
        }
        
        statusIcon.className = iconClass;
        statusText.textContent = `${condition.status} - ${condition.advice}`;
    }

    // Get temperature description
    getTempDescription(temp) {
        if (temp < 24) return 'Dingin';
        if (temp < 26) return 'Sejuk';
        if (temp < 28) return 'Nyaman';
        if (temp < 30) return 'Hangat';
        return 'Sangat hangat';
    }

    // Initialize Chart.js
    initChart() {
        const ctx = document.getElementById('waveChart');
        if (!ctx) return;
        
        const forecast = this.waveData.forecast;
        
        this.chart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: forecast.hours,
                datasets: [
                    {
                        label: 'Ketinggian Ombak (m)',
                        data: forecast.waveHeights,
                        borderColor: '#0077be',
                        backgroundColor: 'rgba(0, 119, 190, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y',
                        pointRadius: 3,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Kecepatan Angin (km/h)',
                        data: forecast.windSpeeds,
                        borderColor: '#00a8cc',
                        backgroundColor: 'rgba(0, 168, 204, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1',
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 5
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Ketinggian Ombak (m)'
                        },
                        beginAtZero: true,
                        max: 4,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Kecepatan Angin (km/h)'
                        },
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false,
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }

    // Start monitoring dengan interval
    startMonitoring() {
        this.updateInterval = setInterval(async () => {
            try {
                await this.fetchWaveData();
                this.renderUI();
                if (this.chart) {
                    this.updateChart();
                }
            } catch (error) {
                console.error('Update error:', error);
            }
        }, this.refreshRate);
    }

    // Update chart dengan data baru
    updateChart() {
        if (!this.chart) return;
        
        const forecast = this.waveData.forecast;
        this.chart.data.labels = forecast.hours;
        this.chart.data.datasets[0].data = forecast.waveHeights;
        this.chart.data.datasets[1].data = forecast.windSpeeds;
        
        this.chart.update('none');
    }

    // Stop monitoring
    stopMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    // Show error message
    showError(message) {
        this.hideElement('wave-loading');
        this.hideElement('wave-cards-container');
        this.hideElement('wave-status');
        this.hideElement('wave-chart-section');
        
        const errorDiv = document.getElementById('wave-error');
        document.getElementById('error-message').textContent = message;
        this.showElement('wave-error');
    }

    // Show element
    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.style.display = '';
    }

    // Hide element
    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.style.display = 'none';
    }

    // Format date time untuk display
    formatDateTime(date) {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
        };
        return new Intl.DateTimeFormat('id-ID', options).format(date);
    }
}

export default WaveMonitor;

