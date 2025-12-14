import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // ================= ESTADO =================
  let dados = { filmes: [], series: [], animes: [] };
  let itemSelecionado = null;
  let modoEdicao = false;

  // ================= ELEMENTOS =================
  const modal = document.getElementById("modal");
  modal.addEventListener("click", (e) => {
  // Se o clique foi no fundo escuro (e não dentro do formulário)
  if (e.target === modal) {
    modal.classList.remove("active");
  }
});
  const detailsModal = document.getElementById("detailsModal");
  const form = document.getElementById("itemForm");

  // ================= FIRESTORE =================
  function escutarCategoria(cat) {
    onSnapshot(collection(db, cat), snap => {
      dados[cat] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderizar();
    });
  }

  ["filmes", "series", "animes"].forEach(escutarCategoria);

  // ================= RENDER =================
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
        div.onclick = () => abrirDetalhes(cat, item);
        lista.appendChild(div);
      });
    });
  }

  // ================= MODAIS =================
  function abrirDetalhes(categoria, id) {

    // Localiza o item correto
    itemSelecionado = dados[categoria].find(i => i.id === id);
    categoriaAtual.value = categoria;

    // ===== TÍTULO =====
    detailsTitle.textContent = itemSelecionado.titulo;

    // ===== CAPA =====
    detailsCapa.src = itemSelecionado.capa || '';

    // ===== LINK "ASSISTIR" =====
    detailsAssistir.href = itemSelecionado.link;
    detailsAssistir.style.display = itemSelecionado.link ? 'inline-block' : 'none';

    // ===== SINOPSE =====
    detailsInfo.textContent = itemSelecionado.sinopse || 'Sem sinopse.';

    // ===== DATAS =====
    detailsDatas.textContent =
        `Criado: ${new Date(itemSelecionado.criadoEm).toLocaleString()}`;

    // ===== EPISÓDIOS =====
    if (itemSelecionado.epi !== null) {
        detailsEpi.style.display = 'flex';
        detailsEpiValue.textContent = itemSelecionado.epi;
    } else {
        // Filmes não possuem episódios
        detailsEpi.style.display = 'none';
    }

    // Exibe o modal
    detailsModal.classList.add('active');
}

    // ===== ELEMENTOS DO DETALHE =====
const detailsAssistir = document.getElementById('detailsAssistir');
const detailsEpi = document.getElementById('detailsEpi');
const detailsEpiValue = document.getElementById('detailsEpiValue');
const detailsInc = document.getElementById('detailsInc');
const detailsDec = document.getElementById('detailsDec');

    document.getElementById("detailsTitle").textContent = item.titulo;
    document.getElementById("detailsCapa").src = item.capa || "";
    document.getElementById("detailsInfo").textContent = item.sinopse || "";
    document.getElementById("detailsDatas").innerHTML = `
      <p>Criado: ${new Date(item.criadoEm).toLocaleString()}</p>
      <p><a href="${item.link}" target="_blank">Abrir link</a></p>
    `;
  }

  // ================= FORM =================
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const cat = document.getElementById("categoriaAtual").value;

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
  });

  // ================= BOTÕES =================
  document.querySelectorAll(".addBtn").forEach(btn => {
    btn.onclick = () => {
      modoEdicao = false;
      document.getElementById("categoriaAtual").value = btn.dataset.category;
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
    document.getElementById("categoriaAtual").value = itemSelecionado.categoria;
  };

  // ================= ABAS =================
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {

    // Remove ativo de tudo
    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));

    // Ativa aba clicada
    tab.classList.add("active");

    // Ativa conteúdo correspondente
    const alvo = document.getElementById(tab.dataset.tab);
    if (alvo) alvo.classList.add("active");
  });
});

  // ===== BOTÃO + EPISÓDIO =====
detailsInc.addEventListener('click', () => {
    if (!itemSelecionado) return;

    itemSelecionado.epi++;
    itemSelecionado.atualizadoEm = new Date().toISOString();

    detailsEpiValue.textContent = itemSelecionado.epi;

    salvarDados();
    renderizar();
});

// ===== BOTÃO - EPISÓDIO =====
detailsDec.addEventListener('click', () => {
    if (!itemSelecionado || itemSelecionado.epi <= 0) return;

    itemSelecionado.epi--;
    itemSelecionado.atualizadoEm = new Date().toISOString();

    detailsEpiValue.textContent = itemSelecionado.epi;

    salvarDados();
    renderizar();
});

});



