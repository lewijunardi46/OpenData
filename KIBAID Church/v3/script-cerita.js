/* =====================================================
   script-cerita.js  –  v2.0
   Menampilkan kisah gereja terpilih secara dinamis
   ===================================================== */

(function () {
  const storyTitle = document.getElementById("storyTitle");
  const ceritaEl   = document.getElementById("cerita");

  // Ambil data gereja yang dipilih dari localStorage
  const data = JSON.parse(localStorage.getItem("selectedGereja"));

  if (!data) {
    storyTitle.textContent = "Data Tidak Ditemukan";
    ceritaEl.textContent =
      "Data gereja tidak dapat ditemukan. Silakan kembali ke halaman pencarian dan pilih salah satu gereja untuk melihat kisahnya.";
    return;
  }

  /* ---------- Helper ---------- */
  function getStageInfo(key) {
    const obj = data[key] || {};
    return {
      tahun: obj["Tahun"] || "",
      tempat: obj["Tempat"] || "",
      hamba: obj["Hamba Tuhan Yang Memulai"] || "",
      orang: obj["Orang-Orang Yang Berperan"] || "",
      cara: obj["Cara Memulai"] || "",
      alasan: obj["Alasan Memulai"] || "",
    };
  }

  const nama   = data["Nama Gereja"] || "Nama Gereja Tidak Diketahui";
  const klasis = data["Klasis"] || "Klasis Tidak Tercatat";

  const stagesOrder = [
    "PERSEKUTUAN",
    "POS PI",
    "CABANG KEBAKTIAN",
    "JEMAAT LOKAL",
  ];
  const stageLabels = {
    PERSEKUTUAN: "Persekutuan Awal",
    "POS PI": "Pos PI",
    "CABANG KEBAKTIAN": "Cabang Kebaktian",
    "JEMAAT LOKAL": "Jemaat Lokal",
  };

  const paragraphs = stagesOrder.flatMap((stageKey) => {
    const s = getStageInfo(stageKey);
    if (!s.tahun && !s.tempat) return [];

    let p = `<strong>${stageLabels[stageKey]}</strong>`;
    if (s.tahun)  p += ` dimulai pada <strong>${s.tahun}</strong>`;
    if (s.tempat) p += ` di <strong>${s.tempat}</strong>`;
    p += ".";

    if (s.hamba)  p += ` Pelayan yang memulai: ${s.hamba}.`;
    if (s.orang)  p += ` Tokoh yang berperan: ${s.orang}.`;
    if (s.cara)   p += ` Cara memulai: ${s.cara}.`;
    if (s.alasan) p += ` Alasan memulai: ${s.alasan}.`;

    return `<p>${p}</p>`;
  });

  /* ---------- Render ---------- */
  storyTitle.textContent = `Kisah ${nama}`;
  ceritaEl.innerHTML = `
    <p>${nama} berada di bawah Klasis <strong>${klasis}</strong>. Berikut perjalanan pelayanannya:</p>
    ${paragraphs.join("\n")} 
  `;
})();