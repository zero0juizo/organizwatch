// ========================== script.js ==========================
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= ESTADO ================= */
let dados = { filmes: [], series: [], animes: [] };
let itemSelecionado = null;
let modoEdicao = false;
let filtroAtivo = "";

/* ================= ELEMENTOS ================= */
const modal = document.getElementById("modal");
const detailsModal = document.getElementById("detailsModal");
const form = document.getElementById("itemForm");

/* ================= INPUTS ================= */
const categoriaAtual = document.getElementById("categoriaAtual");
const idAtual = document.getElementById("idAtual");
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

    dados[cat]
      .filter(item => {
        if (!filtroAtivo) return true;
        if (filtroAtivo === "dublado") return item.dublado;
        if (filtroAtivo === "legendado") return item.legendado;
        return item.listas?.[filtroAtivo];
      })
      .forEach(item => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `<img src="${item.capa || ""}"><strong>${item.titulo}</strong>`;
        div.onclick = () => abrirDetalhes(cat, item.id);
        lista.appendChild(div);
      });
  });
}

/* ================= DETALHES ================= */
function abrirDetalhes(cat, id) {
  itemSelecionado = dados[cat].find(i => i.id === id);
  itemSelecionado.categoria = cat;
  itemSelecionado.listas ??= {};

  detailsTitle.textContent = itemSelecionado.titulo;
  detailsCapa.src = itemSelecionado.capa || "";
  detailsInfo.textContent = itemSelecionado.sinopse || "";
  detailsAssistir.href = itemSelecionado.link;
  detailsDatas.textContent = `Criado em: ${new Date(itemSelecionado.criadoEm).toLocaleString()}`;

  if (itemSelecionado.epi !== null) {
    detailsEpi.style.display = "flex";
    detailsEpiValue.textContent = itemSelecionado.epi;
  } else {
    detailsEpi.style.display = "none";
  }

  document.querySelectorAll("[data-flag]").forEach(cb => {
    cb.checked = !!itemSelecionado.listas[cb.dataset.flag];
    cb.onchange = async () => {
      itemSelecionado.listas[cb.dataset.flag] = cb.checked;
      await updateDoc(doc(db, cat, itemSelecionado.id), { listas: itemSelecionado.listas });
      renderizar();
    };
  });

  detailsModal.classList.add("active");
}

/* ================= EPISÓDIOS (ATUALIZA EM TEMPO REAL) ================= */
document.getElementById("detailsInc").onclick = async () => {
  if (itemSelecionado.epi === null) return;
  itemSelecionado.epi++;
  detailsEpiValue.textContent = itemSelecionado.epi;
  await updateDoc(doc(db, itemSelecionado.categoria, itemSelecionado.id), {
    epi: itemSelecionado.epi,
    atualizadoEm: new Date().toISOString()
  });
};

document.getElementById("detailsDec").onclick = async () => {
  if (itemSelecionado.epi === null || itemSelecionado.epi <= 0) return;
  itemSelecionado.epi--;
  detailsEpiValue.textContent = itemSelecionado.epi;
  await updateDoc(doc(db, itemSelecionado.categoria, itemSelecionado.id), {
    epi: itemSelecionado.epi,
    atualizadoEm: new Date().toISOString()
  });
};

/* ================= FORM ================= */
form.onsubmit = async e => {
  e.preventDefault();
  const cat
