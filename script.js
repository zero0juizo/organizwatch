import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= ESTADO GLOBAL ================= */
let dados = { filmes: [], series: [], animes: [] };
let itemSelecionado = null;
let modoEdicao = false;

/* ================= ELEMENTOS ================= */
const modal = document.getElementById("modal");
const detailsModal = document.getElementById("detailsModal");
const form = document.getElementById("itemForm");

const categoriaAtual = document.getElementById("categoriaAtual");
const titulo = document.getElementById("titulo");
const tituloOriginal = document.getElementById("tituloOriginal");
const capa = document.getElementById("capa");
const epi = document.getElementById("epi");
const dublado = document.getElementById("dublado");
const legendado = document.getElementById("legendado");
const sinopse = document.getElementById("sinopse");
const resumo = document.getElementById("resumo");
const trailer = document.getElementById("trailer");
const link = document.getElementById("link");

/* ================= DETALHES ================= */
const detailsTitle = document.getElementById("detailsTitle");
const detailsCapa = document.getElementById("detailsCapa");
const detailsInfo = document.getElementById("detailsInfo");
const detailsDatas = document.getElementById("detailsDatas");
const detailsAssistir = document.getElementById("detailsAssistir");
const detailsEpi = document.getElementById("detailsEpi");
const detailsEpiValue = document.getElementById("detailsEpiValue");
const detailsInc = document.getElementById("detailsInc");
const detailsDec = document.getElementById("detailsDec");

/* ================= FIRESTORE ================= */
["filmes","series","animes"].forEach(cat => {
  onSnapshot(collection(db, cat), snap => {
    dados[cat] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderizar();
  });
});

/* ================= RENDER ================= */
function renderizar() {
  ["filmes","series","animes"].forEach(cat => {
    const lista = document.getElementById(`lista-${cat}`);
    lista.innerHTML = "";

    dados[cat].forEach(item => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <img src="${item.capa || ""}">
        <strong>${item.titulo}</strong>
      `;
      div.onclick = () => abrirDetalhes(cat, item.id);
      lista.appendChild(div);
    });
  });
}

/* ================= ABRIR DETALHES ================= */
function abrirDetalhes(categoria, id) {
  itemSelecionado = dados[categoria].find(i => i.id === id);
  itemSelecionado.categoria = categoria;

  detailsTitle.textContent = itemSelecionado.titulo;
  detailsCapa.src = itemSelecionado.capa || "";
  detailsInfo.textContent = itemSelecionado.sinopse || "Sem sinopse.";
  detailsDatas.textContent = `Criado em: ${new Date(itemSelecionado.criadoEm).toLocaleString()}`;

  detailsAssistir.href = itemSelecionado.link;
  detailsAssistir.style.display = itemSelecionado.link ? "inline-block" : "none";

  if (itemSelecionado.epi !== null) {
    detailsEpi.style.display = "flex";
    detailsEpiValue.textContent = itemSelecionado.epi;
  } else {
    detailsEpi.style.display = "none";
  }

  detailsModal.classList.add("active");
}

/* ================= EPISÓDIOS ================= */
detailsInc.onclick = async () => {
  itemSelecionado.epi++;
  await updateDoc(doc(db, itemSelecionado.categoria, itemSelecionado.id), {
    epi: itemSelecionado.epi,
    atualizadoEm: new Date().toISOString()
  });
};

detailsDec.onclick = async () => {
  if (itemSelecionado.epi <= 0) return;
  itemSelecionado.epi--;
  await updateDoc(doc(db, itemSelecionado.categoria, itemSelecionado.id), {
    epi: itemSelecionado.epi,
    atualizadoEm: new Date().toISOString()
  });
};

/* ================= FORM ================= */
form.onsubmit = async e => {
  e.preventDefault();
  const cat = categoriaAtual.value;

  const payload = {
    titulo: titulo.value,
    tituloOriginal: tituloOriginal.value,
    capa: capa.value,
    epi: cat === "filmes" ? null : Number(epi.value),
    dublado: dublado.checked,
    legendado: legendado.checked,
    sinopse: sinopse.value,
    resumo: resumo.value,
    trailer: trailer.value,
    link: link.value,
    atualizadoEm: new Date().toISOString()
  };

  if (modoEdicao) {
    await updateDoc(doc(db, cat, itemSelecionado.id), payload);
  } else {
    payload.criadoEm = payload.atualizadoEm;
    await addDoc(collection(db, cat), payload);
  }

  modal.classList.remove("active");
  form.reset();
  modoEdicao = false;
};

/* ================= BOTÕES ================= */
document.querySelectorAll(".addBtn").forEach(btn => {
  btn.onclick = () => {
    modoEdicao = false;
    categoriaAtual.value = btn.dataset.category;
    modal.classList.add("active");
  };
});

document.getElementById("closeModal").onclick = () => modal.classList.remove("active");
document.getElementById("closeDetails").onclick = () => detailsModal.classList.remove("active");

document.getElementById("deleteItem").onclick = async () => {
  await deleteDoc(doc(db, itemSelecionado.categoria, itemSelecionado.id));
  detailsModal.classList.remove("active");
};

document.getElementById("editItem").onclick = () => {
  modoEdicao = true;
  modal.classList.add("active");
  detailsModal.classList.remove("active");

  titulo.value = itemSelecionado.titulo;
  tituloOriginal.value = itemSelecionado.tituloOriginal || "";
  capa.value = itemSelecionado.capa || "";
  epi.value = itemSelecionado.epi ?? 0;
  sinopse.value = itemSelecionado.sinopse || "";
  resumo.value = itemSelecionado.resumo || "";
  trailer.value = itemSelecionado.trailer || "";
  link.value = itemSelecionado.link;
  categoriaAtual.value = itemSelecionado.categoria;
};

/* ================= ABAS ================= */
document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  };
});
