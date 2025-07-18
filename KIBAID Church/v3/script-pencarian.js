/* =============================================================
   script-pencarian.js  –  v2.2
   Fitur: Filter kolom • Pagination 5 tombol • Unduh CSV & PDF per row
   ============================================================= */

// ---------- Variabel global ----------
let allData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 10;

// Elemen DOM
const searchInput   = document.getElementById("searchInput");
const searchFilter  = document.getElementById("searchFilter");
const tableBody     = document.getElementById("searchTableBody");
const paginationUl  = document.getElementById("paginationControls");

/* =============================================================
   1. LOAD DATA JSON
   ============================================================= */
fetch("data_set_history_kibaid.json")
  .then((res) => res.json())
  .then((json) => {
    allData = json;
    filteredData = allData;
    renderTableAndPagination();
  })
  .catch((err) => {
    console.error("Gagal memuat data:", err);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Gagal memuat data.</td></tr>`;
  });

/* =============================================================
   2. EVENT LISTENER PENCARIAN
   ============================================================= */
searchInput.addEventListener("input", handleSearch);
searchFilter.addEventListener("change", handleSearch);

function handleSearch() {
  const keyword = searchInput.value.toLowerCase().trim();
  const mode    = searchFilter.value; // all | nama | klasis | tahun | lokasi

  filteredData = allData.filter((g) => {
    const nama   = (g["Nama Gereja"] || "").toLowerCase();
    const klasis = (g["Klasis"] || "").toLowerCase();
    const tahun  = (
      g["JEMAAT LOKAL"]?.Tahun ||
      g["PERSEKUTUAN"]?.Tahun  ||
      ""
    ).toString().toLowerCase();
    const lokasi = [g["JEMAAT LOKAL"]?.Tempat, g["PERSEKUTUAN"]?.Tempat]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    switch (mode) {
      case "nama":   return nama.includes(keyword);
      case "klasis": return klasis.includes(keyword);
      case "tahun":  return tahun.includes(keyword);
      case "lokasi": return lokasi.includes(keyword);
      default:
        return (
          nama.includes(keyword) ||
          klasis.includes(keyword) ||
          tahun.includes(keyword) ||
          lokasi.includes(keyword)
        );
    }
  });

  currentPage = 1;
  renderTableAndPagination();
}

/* =============================================================
   3. RENDER TABLE & PAGINATION
   ============================================================= */
function renderTableAndPagination() {
  renderTable(filteredData);
  renderPagination(filteredData.length);
}

function renderTable(list) {
  const start = (currentPage - 1) * itemsPerPage;
  const slice = list.slice(start, start + itemsPerPage);

  tableBody.innerHTML = slice.length
    ? slice
        .map((g, i) => {
          const no = start + i + 1;
          const nama   = g["Nama Gereja"] || "-";
          const klasis = g["Klasis"]      || "-";
          const tahun  = g["JEMAAT LOKAL"]?.Tahun || g["PERSEKUTUAN"]?.Tahun || "-";

          // Serialize row data safely for inline onclick
          const rowData = JSON.stringify(g).replace(/'/g, "\\'");

          return `<tr>
            <td class="ps-4">${no}</td>
            <td>${nama}</td>
            <td>${klasis}</td>
            <td>${tahun}</td>
            <td class="text-center pe-4 d-flex gap-2 justify-content-center flex-wrap">
              <button class="btn btn-sm btn-outline-info rounded-pill px-3" onclick='lihatDetail(${rowData})'>
                Detail <i class="fas fa-info-circle ms-1"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick='downloadPDF(${rowData})'>
                PDF <i class="fas fa-file-pdf ms-1"></i>
              </button>
            </td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="6" class="text-center py-4 text-muted">Tidak ada gereja yang cocok.</td></tr>`;
}

function renderPagination(totalItems) {
  const totalPages      = Math.ceil(totalItems / itemsPerPage);
  const maxVisiblePages = 5;

  if (totalPages <= 1) {
    paginationUl.innerHTML = "";
    return;
  }

  let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
  let endPage   = startPage + maxVisiblePages - 1;
  if (endPage > totalPages) {
    endPage   = totalPages;
    startPage = Math.max(endPage - maxVisiblePages + 1, 1);
  }

  let pagesHtml = [];
  if (startPage > 1) {
    pagesHtml.push(`<li class="page-item"><button class="page-link" onclick="goToPage(1)">«</button></li>`);
  }

  for (let i = startPage; i <= endPage; i++) {
    pagesHtml.push(`<li class="page-item ${i === currentPage ? 'active' : ''}">
      <button class="page-link" onclick="goToPage(${i})">${i}</button>
    </li>`);
  }

  if (endPage < totalPages) {
    pagesHtml.push(`<li class="page-item"><button class="page-link" onclick="goToPage(${totalPages})">»</button></li>`);
  }

  paginationUl.innerHTML = pagesHtml.join("");
}

function goToPage(page) {
  currentPage = page;
  renderTableAndPagination();
}

/* =============================================================
   4. DOWNLOAD CSV (HASIL FILTER)
   ============================================================= */
function downloadCSV() {
  if (filteredData.length === 0) {
    alert("Tidak ada data untuk diunduh.");
    return;
  }

  const headers = ["Nama Gereja", "Klasis", "Tahun Berdiri"];
  const rows = filteredData.map((g) => {
    const nama   = g["Nama Gereja"] || "-";
    const klasis = g["Klasis"]      || "-";
    const tahun  = g["JEMAAT LOKAL"]?.Tahun || g["PERSEKUTUAN"]?.Tahun || "-";
    return [nama, klasis, tahun].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "data-gereja-kibaid.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* =============================================================
   5. DETAIL & PDF ACTION
   ============================================================= */
function lihatDetail(data) {
  localStorage.setItem("selectedGereja", JSON.stringify(data));
  window.location.href = "cerita.html";
}

// downloadPDF didefinisikan di file HTML (inline) agar punya akses window.print()
// Fungsi ini tetap dipanggil dari renderTable.

// Ekspor ke global
window.downloadCSV = downloadCSV;