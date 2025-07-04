fetch('data_set_history_kibaid.json')
  .then(res => res.json())
  .then(data => {
    const denganTahun = data.filter(g => g["PERSEKUTUAN"].Tahun || g["JEMAAT LOKAL"].Tahun);
    const tertua = denganTahun.sort((a, b) =>
      parseInt((a["PERSEKUTUAN"].Tahun || a["JEMAAT LOKAL"].Tahun || "9999")) -
      parseInt((b["PERSEKUTUAN"].Tahun || b["JEMAAT LOKAL"].Tahun || "9999"))
    )[0];

    const terbaru = denganTahun.sort((a, b) =>
      parseInt((b["PERSEKUTUAN"].Tahun || b["JEMAAT LOKAL"].Tahun || "0")) -
      parseInt((a["PERSEKUTUAN"].Tahun || a["JEMAAT LOKAL"].Tahun || "0"))
    )[0];

    document.getElementById("gereja-tertua").textContent = tertua?.["Nama Gereja"] || "-";
    document.getElementById("perkembangan-terkini").textContent = terbaru?.["Nama Gereja"] || "-";
    document.getElementById("pola-perkembangan").textContent = "Mayoritas dimulai dari ibadah rumah lalu berkembang menjadi gereja lokal.";
    document.getElementById("faktor-perkembangan").textContent = "Dorongan spiritual, akses terbatas, dan pertambahan jumlah jemaat.";
  });
