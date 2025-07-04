let data = [];

fetch('data_set_history_kibaid.json')
  .then(res => res.json())
  .then(json => data = json);

function generateStory() {
  if (!data.length) return;
  const sample = data[Math.floor(Math.random() * data.length)];
  const tahun = sample["JEMAAT LOKAL"]?.Tahun || sample["PERSEKUTUAN"]?.Tahun || "tahun tidak diketahui";
  const tempat = sample["JEMAAT LOKAL"]?.Tempat || sample["PERSEKUTUAN"]?.Tempat || "tempat tidak disebutkan";
  const nama = sample["Nama Gereja"];
  const cerita = `Pada ${tahun}, di ${tempat}, berdirilah ${nama}. Gereja ini lahir dari kerinduan untuk bersekutu dan berkembang menjadi bagian penting dari komunitas sekitar.`;
  document.getElementById("cerita").textContent = cerita;
}
