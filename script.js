document.addEventListener("DOMContentLoaded", () => {

    /* ================= CONFIGURAÇÕES ================= */

    // Chave única do LocalStorage
    const STORAGE_KEY = "organiwatch_dados";

    // Dados principais
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        filmes: [],
        series: [],
        animes: []
    };

    // Estados globais
    let itemSelecionado = null;
    let modoEdicao = false;
    let filtroLista = "";

    /* ================= ELEMENTOS ================= */

    const modalCadastro = document.getElementById("modalCadastro");
    const detailsModal = document.getElementById("detailsModal");

    const modalTitle = document.getElementById("modalTitle");
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

    const detailsTitle = document.getElementById("detailsTitle");
    const detailsCapa = document.getElementById("detailsCapa");
    const detailsInfo = document.getElementById("detailsInfo");
    const detailsDatas = document.getElementById("detailsDatas");

    /* ================= FUNÇÕES ================= */

    // Salva no LocalStorage
    function salvar() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    }

    // Renderiza as listas
    function renderizar() {

        ["filmes", "series", "animes"].forEach(cat => {

            const container = document.getElementById(`lista-${cat}`);
            container.innerHTML = "";

            const itens = filtroLista
                ? dados[cat].filter(i => i.lista === filtroLista)
                : dados[cat];

            itens.forEach(item => {

                const div = document.createElement("div");
                div.className = "item";

                div.innerHTML = `
                    <img src="${item.capa || ""}">
                    <strong>${item.titulo}</strong>
                    <small>👁 ${item.views || 0}</small>
                    ${item.epi !== null ? `
                        <div class="epi-control">
                            <button class="dec">-</button>
                            <span>${item.epi}</span>
                            <button class="inc">+</button>
                        </div>` : ""}
                `;

                // Abre detalhes
                div.onclick = () => abrirDetalhes(cat, item.id);

                // Incrementa episódio
                div.querySelector(".inc")?.addEventListener("click", e => {
                    e.stopPropagation();
                    item.epi++;
                    salvar();
                    renderizar();
                });

                // Decrementa episódio
                div.querySelector(".dec")?.addEventListener("click", e => {
                    e.stopPropagation();
                    if (item.epi > 0) item.epi--;
                    salvar();
                    renderizar();
                });

                container.appendChild(div);
            });
        });
    }

    // Abre modal de cadastro/edição
    function abrirCadastro(cat, editar = false) {
        categoriaAtual.value = cat;
        modalTitle.textContent = editar ? "Editar item" : "Novo item";
        modalCadastro.classList.add("active");
    }

    // Abre modal de detalhes
    function abrirDetalhes(cat, id) {

        const item = dados[cat].find(i => i.id === id);
        if (!item) return;

        itemSelecionado = item;
        categoriaAtual.value = cat;

        item.views = (item.views || 0) + 1;
        salvar();

        detailsTitle.textContent = item.titulo;
        detailsCapa.src = item.capa || "";
        detailsInfo.textContent = item.sinopse || "";

        detailsDatas.innerHTML = `
            <p>Criado em: ${new Date(item.criadoEm).toLocaleString()}</p>
            <p>Atualizado em: ${new Date(item.atualizadoEm).toLocaleString()}</p>
            <p><a href="${item.link}" target="_blank">Acessar link</a></p>
        `;

        detailsModal.classList.add("active");
        renderizar();
    }

    /* ================= EVENTOS ================= */

    // Botões adicionar
    document.querySelectorAll(".addBtn").forEach(btn => {
        btn.onclick = () => {
            modoEdicao = false;
            form.reset();
            abrirCadastro(btn.dataset.category);
        };
    });

    // Fechar modais
    document.getElementById("closeModal").onclick = () => modalCadastro.classList.remove("active");
    document.getElementById("closeDetails").onclick = () => detailsModal.classList.remove("active");

    // Editar item
    document.getElementById("editItem").onclick = () => {
        modoEdicao = true;
        abrirCadastro(categoriaAtual.value, true);

        titulo.value = itemSelecionado.titulo;
        tituloOriginal.value = itemSelecionado.tituloOriginal || "";
        capa.value = itemSelecionado.capa || "";
        epi.value = itemSelecionado.epi ?? 0;
        dublado.checked = itemSelecionado.dublado;
        legendado.checked = itemSelecionado.legendado;
        sinopse.value = itemSelecionado.sinopse || "";
        resumo.value = itemSelecionado.resumo || "";
        trailer.value = itemSelecionado.trailer || "";
        link.value = itemSelecionado.link;

        detailsModal.classList.remove("active");
    };

    // Excluir item
    document.getElementById("deleteItem").onclick = () => {
        if (!confirm("Excluir item?")) return;
        dados[categoriaAtual.value] =
            dados[categoriaAtual.value].filter(i => i.id !== itemSelecionado.id);
        salvar();
        renderizar();
        detailsModal.classList.remove("active");
    };

    // Salvar formulário
    form.onsubmit = e => {
        e.preventDefault();
        const cat = categoriaAtual.value;
        const agora = new Date().toISOString();

        if (modoEdicao) {
            Object.assign(itemSelecionado, {
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
                atualizadoEm: agora
            });
        } else {
            dados[cat].push({
                id: crypto.randomUUID(),
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
                lista: "",
                views: 0,
                criadoEm: agora,
                atualizadoEm: agora
            });
        }

        salvar();
        renderizar();
        modalCadastro.classList.remove("active");
        form.reset();
    };

    // Listas pessoais no modal
    document.querySelectorAll("#listasItem button").forEach(btn => {
        btn.onclick = () => {
            if (!itemSelecionado) return;
            itemSelecionado.lista = btn.dataset.lista;
            salvar();
            renderizar();
        };
    });

    // Filtro global
    document.querySelectorAll("#listasDropdown button").forEach(btn => {
        btn.onclick = () => {
            filtroLista = btn.dataset.lista;
            renderizar();
        };
    });

    // Abas
    document.querySelectorAll(".tab").forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(tab.dataset.tab).classList.add("active");
        };
    });

    // Inicialização
    renderizar();
});
