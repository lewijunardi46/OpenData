/* =============================================================
   script-analisis.js  –  v2.0
   Menghitung statistik sederhana & mengisi kartu analisis
   ============================================================= */

(function () {
  const url = "data_set_history_kibaid.json";

  /* ---------- Helper ---------- */
  const getYear = (val) => {
    if (!val) return null;
    const match = val.toString().match(/(\d{4})/);
    return match ? parseInt(match[1]) : null;
  };

  const isHouseWorship = (tempat = "") => /rumah|kolong|ruko|house/i.test(templatG(tempat));
  const templatG = (t) => t?.toString().toLowerCase() || "";

  /* ---------- Fetch & process ---------- */
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data) || data.length === 0) throw new Error("Data kosong");

      /* ---- Extract year ---- */
      const enriched = data.map((g) => {
        const y = getYear(g["PERSEKUTUAN"].Tahun) ?? getYear(g["JEMAAT LOKAL"].Tahun);
        const tempat = g["PERSEKUTUAN"].Tempat || g["JEMAAT LOKAL"].Tempat || "";
        return { ...g, __year: y, __tempat: tempat };
      });

      const withYear = enriched.filter((g) => g.__year);
      withYear.sort((a, b) => a.__year - b.__year);

      const tertua  = withYear[0];
      const terbaru = withYear[withYear.length - 1];

      /* ---- Pola perkembangan (rumah → gereja) ---- */
      const houseStarts = enriched.filter((g) => isHouseWorship(g.__tempat)).length;
      const percHouse   = ((houseStarts / enriched.length) * 100).toFixed(0);

      /* ---------- Render ---------- */
      document.getElementById("gereja-tertua").textContent = tertua
        ? `${tertua["Nama Gereja"]} (${tertua.__year})`
        : "-";

      document.getElementById("perkembangan-terkini").textContent = terbaru
        ? `${terbaru["Nama Gereja"]} (${terbaru.__year})`
        : "-";

      document.getElementById("pola-perkembangan").textContent = `${percHouse}% jemaat memulai ibadah di rumah sebelum berkembang menjadi gereja lokal.`;

      document.getElementById("faktor-perkembangan").textContent =
        "Faktor kunci: dorongan spiritual, dukungan komunitas, dan pertambahan jemaat.";
    })
    .catch((err) => {
      console.error("Analisis gagal:", err);
      const fallback = "Tidak tersedia";
      ["gereja-tertua", "perkembangan-terkini", "pola-perkembangan", "faktor-perkembangan"].forEach((id) => (document.getElementById(id).textContent = fallback));
    });
})();
