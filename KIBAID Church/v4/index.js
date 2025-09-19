fetch("statistik.json")
  .then(res => res.json())
  .then(stat => {
    // Isi cards
    document.getElementById("jumlahKlasis").textContent = stat.jumlah_klasis;
    document.getElementById("jumlahPelayanan").textContent = stat.jumlah_pelayanan_total;
    document.getElementById("pelayananTertua").textContent = `${stat.pelayanan_tertua.nama} (${stat.pelayanan_tertua.tahun})`;
    document.getElementById("pelayananTerbaru").textContent = `${stat.pelayanan_terbaru.nama} (${stat.pelayanan_terbaru.tahun})`;

    // === Line Chart ===
    const labels = stat.pertumbuhan_periode.map(d => d.periode);
    const jumlah = stat.pertumbuhan_periode.map(d => d.jumlah);

    new Chart(document.getElementById("pelayananChart"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Jumlah Pelayanan",
            data: jumlah,
            borderColor: "#0d6efd",
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          title: {
            display: true,
            text: "Grafik Pertumbuhan Pelayanan Gereja KIBAID",
            align: "center",
            font: {
              size: 16,
              weight: "bold"
            }
          }
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45, // maksimum 45 derajat
              minRotation: 45  // minimum 45 derajat → paksa miring
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });

    // === Pie Chart ===
    const top5 = stat.distribusi_klasis
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 5);

    const klasisLabels = top5.map(k => k.klasis);
    const klasisData = top5.map(k => k.jumlah);

    new Chart(document.getElementById("klasisPieChart"), {
      type: "pie",
      data: {
        labels: klasisLabels,
        datasets: [
          {
            data: klasisData,
            backgroundColor: [
              "#0d6efd","#198754","#dc3545","#fd7e14","#6f42c1"
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          title: {
            display: true,
            text: "Top 5 Klasis Berdasarkan Jumlah Pelayanan",
            align: "center",
            font: {
              size: 16,
              weight: "bold"
            }
          }
        }
      }
    });
  })
  .catch(err => console.error("Gagal memuat statistik.json:", err));
