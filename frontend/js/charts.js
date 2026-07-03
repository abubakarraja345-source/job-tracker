/* ============================================================
   4JobTracker — Chart.js helpers
   ============================================================ */

const ChartsHelper = {
  palette: {
    forest: '#24543D',
    gold: '#D69A3C',
    coral: '#C1543A',
    blue: '#35578A',
    grey: '#9AA79F'
  },

  renderMonthChart(canvasId, byMonth) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const labels = byMonth.map(r => r.month);
    const data = byMonth.map(r => r.count);

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Applications',
          data,
          borderColor: this.palette.forest,
          backgroundColor: 'rgba(36, 84, 61, 0.1)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: this.palette.forest,
          pointRadius: 4
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#EAEFE9' } },
          x: { grid: { display: false } }
        }
      }
    });
  },

  renderStatusChart(canvasId, byStatus) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const colorMap = {
      Applied: this.palette.blue,
      Interviewing: this.palette.gold,
      Offer: this.palette.forest,
      Rejected: this.palette.coral,
      Withdrawn: this.palette.grey
    };
    const labels = byStatus.map(r => r.status);
    const data = byStatus.map(r => r.count);
    const colors = labels.map(l => colorMap[l] || this.palette.grey);

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 0 }]
      },
      options: {
        cutout: '65%',
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 14 } } }
      }
    });
  }
};
