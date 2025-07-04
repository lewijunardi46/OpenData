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
          const persekutuanTempat = g["PERSEKUTUAN"]?.Tempat?.toLowerCase() || ""; // Perbaikan typo di sini

          const allYearsAndPlaces = [
            jemaatLokalTahun, jemaatLokalTempat,
            persekutuanTahun, persekutuanTempat
          ].join(" "); // Gabungkan semua tahun dan tempat menjadi satu string

          return (
            namaGereja.includes(keyword) ||
            klasis.includes(keyword) ||
            allYearsAndPlaces.includes(keyword)
          );
        });
      }
      currentPage = 1; // Reset ke halaman 1 setiap kali filter berubah
      renderTableAndPagination();
    });
  });

function renderTableAndPagination() {
  const tableBody = document.getElementById("searchTableBody");
  const paginationControls = document.getElementById("paginationControls");
  tableBody.innerHTML = ''; // Kosongkan tabel sebelumnya
  paginationControls.innerHTML = ''; // Kosongkan kontrol pagination

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = filteredData.slice(start, end);

  if (paginatedItems.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="text-center placeholder-text">Tidak ada data ditemukan.</td></tr>`;
    return;
  }

  paginatedItems.forEach(gereja => {
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td>${gereja["Nama Gereja"] || '-'}</td>
      <td>${gereja["Klasis"] || '-'}</td>
      <td>${gereja["JEMAAT LOKAL"]?.Tahun || gereja["PERSEKUTUAN"]?.Tahun || '-'}</td>
      <td class="text-center table-action-buttons">
        <button class="btn btn-detail" onclick="viewStory(${JSON.stringify(gereja).split("'").join("&#39;")})">Lihat Kisah</button>
        <button class="btn btn-download" onclick="downloadDetail(${JSON.stringify(gereja).split("'").join("&#39;")})">Unduh Detail</button>
      </td>
    `;
  });

  // Render pagination controls
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.classList.add("page-item");
    if (i === currentPage) {
      pageItem.classList.add("active");
    }
    const pageLink = document.createElement("a");
    pageLink.classList.add("page-link");
    pageLink.href = "#";
    pageLink.textContent = i;
    pageLink.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderTableAndPagination();
    });
    pageItem.appendChild(pageLink);
    paginationControls.appendChild(pageItem);
  }

  // Tambahkan tombol prev/next jika diperlukan
  if (totalPages > 1) {
    const prevItem = document.createElement("li");
    prevItem.classList.add("page-item");
    if (currentPage === 1) prevItem.classList.add("disabled");
    const prevLink = document.createElement("a");
    prevLink.classList.add("page-link");
    prevLink.href = "#";
    prevLink.innerHTML = "&laquo;";
    prevLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        renderTableAndPagination();
      }
    });
    prevItem.appendChild(prevLink);
    paginationControls.prepend(prevItem);

    const nextItem = document.createElement("li");
    nextItem.classList.add("page-item");
    if (currentPage === totalPages) nextItem.classList.add("disabled");
    const nextLink = document.createElement("a");
    nextLink.classList.add("page-link");
    nextLink.href = "#";
    nextLink.innerHTML = "&raquo;";
    nextLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        renderTableAndPagination();
      }
    });
    nextItem.appendChild(nextLink);
    paginationControls.appendChild(nextItem);
  }
}

function viewStory(gereja) {
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

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Detail_Gereja_${gereja["Nama Gereja"]?.replace(/\s/g, '_') || 'Tidak_Diketahui'}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}