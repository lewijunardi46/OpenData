let allData = []; // Menyimpan semua data asli
let filteredData = []; // Menyimpan data hasil filter
let currentPage = 1;
const itemsPerPage = 10; // Jumlah item per halaman

// Load data dari file JSON lokal
fetch('data_set_history_kibaid.json')
  .then(res => res.json())
  .then(json => {
    allData = json;
    filteredData = allData; // Awalnya, data filter sama dengan semua data
    renderTableAndPagination();

    document.getElementById("searchInput").addEventListener("input", function () {
      const keyword = this.value.toLowerCase().trim();
      if (keyword === "") {
        filteredData = allData;
      } else {
        filteredData = allData.filter(g => {
          const namaGereja = g["Nama Gereja"]?.toLowerCase() || "";
          const klasis = g["Klasis"]?.toLowerCase() || "";
          
          const jemaatLokalTahun = g["JEMAAT LOKAL"]?.Tahun?.toLowerCase() || "";
          const jemaatLokalTempat = g["JEMAAT LOKAL"]?.Tempat?.toLowerCase() || "";

          const persekutuanTahun = g["PERSEKUTUAN"]?.Tahun?.toLowerCase() || "";
          const persekutuanTempat = g["PERPERSEKUTUAN"]?.Tempat?.toLowerCase() || ""; // Perbaikan typo di sini

          const allYearsAndPlaces = [
            jemaatLokalTahun, jemaatLokalTempat,
            persekutuanTahun, persekutuanTempat
          ].filter(Boolean).join(" ").toLowerCase();

          return (
            namaGereja.includes(keyword) ||
            klasis.includes(keyword) ||
            allYearsAndPlaces.includes(keyword)
          );
        });
      }
      currentPage = 1; // Reset ke halaman pertama setelah filter
      renderTableAndPagination();
    });
  })
  .catch(error => {
    console.error("Error fetching data:", error);
    document.getElementById("searchTableBody").innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4 text-danger">Gagal memuat data. Silakan coba lagi.</td>
      </tr>
    `;
  });

function renderTableAndPagination() {
  renderTable(filteredData);
  renderPagination(filteredData.length);
}

function renderTable(list) {
  const tbody = document.getElementById("searchTableBody");
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedList = list.slice(start, end);

  if (paginatedList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4 text-muted">Tidak ada gereja yang cocok dengan pencarian Anda.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = paginatedList.map((g, i) => {
    const originalIndex = start + i + 1; // Nomor urut asli
    const tahun = g["JEMAAT LOKAL"]?.Tahun || g["PERSEKUTUAN"]?.Tahun || '-';
    const nama = g["Nama Gereja"] || '-';
    const klasis = g["Klasis"] || '-';
    return `
      <tr>
        <td class="ps-4">${originalIndex}</td>
        <td>${nama}</td>
        <td>${klasis}</td>
        <td>${tahun}</td>
        <td class="text-center pe-4">
          <button class="btn btn-sm btn-primary rounded-pill px-3 me-2" onclick='lihatDetail(${JSON.stringify(g).replace(/'/g, "\\'")})'>
            Detail <i class="fas fa-info-circle ms-1"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick='downloadDetail(${JSON.stringify(g).replace(/'/g, "\\'")})'>
            Download <i class="fas fa-download ms-1"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPagination(totalItems) {
  const paginationControls = document.getElementById("paginationControls");
  paginationControls.innerHTML = ''; // Bersihkan kontrol paginasi sebelumnya

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return; // Tidak perlu paginasi jika hanya ada 1 halaman atau kurang
  }

  // Tombol "Previous"
  const prevItem = document.createElement('li');
  prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevItem.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
  prevItem.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderTableAndPagination();
    }
  });
  paginationControls.appendChild(prevItem);

  // Nomor Halaman
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement('li');
    pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = i;
      renderTableAndPagination();
    });
    paginationControls.appendChild(pageItem);
  }

  // Tombol "Next"
  const nextItem = document.createElement('li');
  nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  nextItem.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
  nextItem.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderTableAndPagination();
    }
  });
  paginationControls.appendChild(nextItem);
}

function lihatDetail(gereja) {
  localStorage.setItem("selectedGereja", JSON.stringify(gereja));
  window.location.href = "cerita.html";
}

function downloadDetail(gereja) {
  let content = `Data Sejarah Gereja KIBAID\n\n`;
  content += `Nama Gereja: ${gereja["Nama Gereja"] || 'Tidak Tersedia'}\n`;
  content += `Klasis: ${gereja["Klasis"] || 'Tidak Tersedia'}\n`;

  if (gereja["JEMAAT LOKAL"]) {
    content += `\n--- JEMAAT LOKAL ---\n`;
    for (const key in gereja["JEMAAT LOKAL"]) {
      content += `${key}: ${gereja["JEMAAT LOKAL"][key] || 'Tidak Tersedia'}\n`;
    }
  }

  if (gereja["PERSEKUTUAN"]) {
    content += `\n--- PERSEKUTUAN ---\n`;
    for (const key in gereja["PERSEKUTUAN"]) {
      content += `${key}: ${gereja["PERSEKUTUAN"][key] || 'Tidak Tersedia'}\n`;
    }
  }

  // Tambahkan properti lain yang mungkin ada di root objek gereja
  for (const key in gereja) {
    if (typeof gereja[key] !== 'object' && key !== "Nama Gereja" && key !== "Klasis") {
      content += `${key}: ${gereja[key] || 'Tidak Tersedia'}\n`;
    }
  }

  const filename = `Sejarah_Gereja_${(gereja["Nama Gereja"] || "Detail").replace(/\s/g, '_')}.txt`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // Bersihkan URL objek
}