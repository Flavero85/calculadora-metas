document.addEventListener('DOMContentLoaded', () => {

    // ==================================================
    // --- FUNÇÕES GLOBAIS E AJUDANTES ---
    // ==================================================
    async function copyTextToClipboard(text) {
        if (!text) return false;
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Falha ao copiar texto: ', err);
            return false;
        }
    }

    function applyVisualFeedback(element) {
        if (element.classList.contains('copied')) return;
        element.classList.add('copied');
        setTimeout(() => element.classList.remove('copied'), 400);
    }

    function getDailyMessages() {
        const h = new Date().getHours();
        if (h >= 5 && h < 12) return { greeting: 'Olá, bom dia! ☀️', farewell: 'tenha um ótimo dia! ☀️' };
        if (h >= 12 && h < 18) return { greeting: 'Olá, boa tarde! 🌤️', farewell: 'tenha uma ótima tarde! 🌤️' };
        return { greeting: 'Olá, boa noite! 🌙', farewell: 'tenha uma excelente noite! 🌙' };
    }

    function updateDynamicMessages() {
        const userName = "Flavio";
        const { greeting, farewell } = getDailyMessages();
        const initialElements = document.querySelectorAll('#mensagem-inicial');
        const finalElements = document.querySelectorAll('#mensagem-final');

        const initialMessage = `${greeting} Sou ${userName} do Suporte Técnico da Desktop e estou aqui para ajudar. Com quem estou falando e no que posso ajudar? 😊`;
        initialElements.forEach(el => {
            if (el.querySelector('span')) {
                el.querySelector('span').textContent = initialMessage;
                el.dataset.original = initialMessage;
            }
        });

        const finalMessage = `Agradecemos pelo contato! Sua opinião é importante para mim, por favor, avalie. Isso me ajuda na empresa e pessoalmente. Desde já, agradeço sua avaliação! 🌟 Estamos a disposição, por chat e no número 103-44. ${farewell} e tudo de bom!`;
        finalElements.forEach(el => {
            if (el.querySelector('span')) {
                el.querySelector('span').textContent = finalMessage;
                el.dataset.original = finalMessage;
            }
        });
    }

    // ==================================================
    // --- MODO NOTURNO (THEME) ---
    // ==================================================
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        }
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            let theme = 'light';
            if (document.body.classList.contains('dark-mode')) {
                theme = 'dark';
                themeToggle.textContent = '☀️';
            } else {
                themeToggle.textContent = '🌙';
            }
            localStorage.setItem('theme', theme);
        });
    }

    // ==================================================
    // --- SISTEMA DE FAVORITOS ---
    // ==================================================
    const favoritesContainer = document.getElementById('favorites-container');
    const favoritesSection = document.getElementById('favorites-section');
    let favorites = JSON.parse(localStorage.getItem('favoriteScripts')) || [];

    function renderFavorites() {
        if (!favoritesContainer) return;
        favoritesContainer.innerHTML = '';
        if (favorites.length === 0) {
            favoritesSection.classList.add('hidden');
            return;
        }
        favoritesSection.classList.remove('hidden');
        favorites.forEach(favText => {
            const originalScript = document.querySelector(`.script-line[data-original="${favText}"]`);
            if (originalScript) {
                const clone = originalScript.cloneNode(true);
                favoritesContainer.appendChild(clone);
            }
        });
    }

    function toggleFavorite(scriptElement) {
        const scriptText = scriptElement.dataset.original;
        if (!scriptText) return;
        const isFavorited = favorites.includes(scriptText);
        const allToggleButtons = document.querySelectorAll(`.favorite-toggle[data-original="${scriptText}"]`);

        if (isFavorited) {
            favorites = favorites.filter(fav => fav !== scriptText);
            allToggleButtons.forEach(btn => {
                btn.classList.remove('favorited');
                btn.textContent = '☆';
            });
        } else {
            favorites.push(scriptText);
            allToggleButtons.forEach(btn => {
                btn.classList.add('favorited');
                btn.textContent = '★';
            });
        }
        localStorage.setItem('favoriteScripts', JSON.stringify(favorites));
        renderFavorites();
    }
    
    function initializeFavorites() {
        document.querySelectorAll('.script-line').forEach(el => {
            const scriptText = el.dataset.original;
            if (!scriptText && el.id !== 'mensagem-inicial' && el.id !== 'mensagem-final') return;
            const toggleButton = el.querySelector('.favorite-toggle');
            if(toggleButton) {
                const textForButton = el.dataset.original || el.querySelector('span').textContent;
                toggleButton.dataset.original = textForButton;
                if (favorites.includes(textForButton)) {
                    toggleButton.classList.add('favorited');
                    toggleButton.textContent = '★';
                }
            }
        });
        renderFavorites();
    }

    // ==================================================
    // --- BUSCA GLOBAL ---
    // ==================================================
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const allSections = document.querySelectorAll('main section');
            allSections.forEach(section => {
                if (section.id === 'favorites-section') return;
                let sectionHasVisibleScripts = false;
                const allScripts = section.querySelectorAll('.script-line, .link-item');
                allScripts.forEach(script => {
                    const scriptText = script.dataset.original || script.textContent;
                    const isVisible = scriptText.toLowerCase().includes(searchTerm);
                    script.classList.toggle('hidden', !isVisible);
                    if (isVisible) sectionHasVisibleScripts = true;
                });
                section.classList.toggle('hidden', !sectionHasVisibleScripts);
            });
        });
    }

    // ==================================================
    // --- EVENTOS DE CLIQUE E INICIALIZAÇÃO ---
    // ==================================================
    document.body.addEventListener('click', async (e) => {
        const favoriteButton = e.target.closest('.favorite-toggle');
        if (favoriteButton) {
            const scriptLine = favoriteButton.closest('.script-line');
            if (scriptLine) toggleFavorite(scriptLine);
            return;
        }
        const item = e.target.closest('.script-line, .link-item');
        if (item) {
            const textToCopy = item.dataset.copyText || item.dataset.original;
            if (textToCopy && await copyTextToClipboard(textToCopy)) {
                applyVisualFeedback(item);
            }
        }
    });

    updateDynamicMessages();
    initializeFavorites();

    // ==================================================
    // --- LÓGICA DE PÁGINAS ESPECÍFICAS ---
    // ==================================================

    // --- PÁGINA "LENTIDAO" (AGENDAMENTO DINÂMICO) ---
    const agendamentoContainer = document.getElementById('data-agendamento');
    if (agendamentoContainer) {
        const dataInput = document.getElementById('data-agendamento');
        const horaInicioInput = document.getElementById('hora-inicio');
        const horaFimInput = document.getElementById('hora-fim');

        dataInput.valueAsDate = new Date();

        function updateAgendamento() {
            if (!dataInput || !horaInicioInput || !horaFimInput) return;
            
            const dataValue = dataInput.value;
            const inicioValue = horaInicioInput.value;
            const fimValue = horaFimInput.value;

            const confirmarEl = document.getElementById('confirmar-agendamento');
            const finalizarEl = document.getElementById('finalizar-agendamento');

            if (!dataValue || !inicioValue || !fimValue) {
                const initialConfirm = "Verifiquei em sistema e tenho disponível para --/-- no período das --:-- às --:--. Posso agendar? 👍";
                const initialFinalize = "Prontinho! O agendamento foi realizado para --/--...";
                if(confirmarEl) confirmarEl.querySelector('span').textContent = initialConfirm;
                if(finalizarEl) finalizarEl.querySelector('span').textContent = initialFinalize;
                if(confirmarEl) confirmarEl.dataset.original = initialConfirm;
                if(finalizarEl) finalizarEl.dataset.original = initialFinalize;
                return;
            };

            const dataSelecionada = new Date(dataValue + 'T00:00:00');
            const dataAtual = new Date();
            dataAtual.setHours(0, 0, 0, 0);
            const umDia = 1000 * 60 * 60 * 24;
            const diffDias = Math.ceil((dataSelecionada - dataAtual) / umDia);
            let dia = String(dataSelecionada.getDate()).padStart(2, '0');
            let mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
            let dataFormatada = `${dia}/${mes}`;
            let diasDaSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
            let hojeOuAmanha = '';
            if (diffDias === 0) hojeOuAmanha = `hoje (${dataFormatada})`;
            else if (diffDias === 1) hojeOuAmanha = `amanhã (${dataFormatada})`;
            else hojeOuAmanha = `${diasDaSemana[dataSelecionada.getDay()]} (${dataFormatada})`;

            const horaInicio = inicioValue;
            const horaFim = fimValue;
            const confirmarFrase = `Verifiquei em sistema e a primeira data disponível para ${hojeOuAmanha} no período das ${horaInicio} às ${horaFim}. Posso agendar? 👍`;
            const finalizarFrase = `Prontinho! O agendamento foi realizado para ${hojeOuAmanha}, no período das ${horaInicio} às ${horaFim}. Lembre-se que é necessário ter um maior de 18 anos no local para acompanhar a visita técnica, Ok? 😊`;
            
            if(confirmarEl) confirmarEl.querySelector('span').textContent = confirmarFrase;
            if(finalizarEl) finalizarEl.querySelector('span').textContent = finalizarFrase;
            if(confirmarEl) confirmarEl.dataset.original = confirmarFrase;
            if(finalizarEl) finalizarEl.dataset.original = finalizarFrase;
        }

        dataInput.addEventListener('input', updateAgendamento);
        horaInicioInput.addEventListener('input', updateAgendamento);
        horaFimInput.addEventListener('input', updateAgendamento);
        updateAgendamento();
    }

    // --- PÁGINA "ENCAIXE" (FORMULÁRIO AUTOMÁTICO) ---
    const formEncaixe = document.getElementById('form-encaixe');
    if (formEncaixe) {
        const cityData = {
            'Amparo': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Campinas' },'Campinas': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Campinas' },'Holambra': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Campinas' },'Hortolândia': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Campinas' },'Jaguariúna': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Campinas' },'Lindoia': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Campinas' },'Monte Alegre do Sul': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Campinas' },'Monte Mor': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Campinas' },'Pedreira': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Campinas' },'Santo Antônio de Posse': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Campinas' },'Serra Negra': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Campinas' },'Capivari': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Alumínio': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Angatuba': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Aracoiaba da Serra': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Bofete': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Boituva': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Campina do Monte Alegre': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Capela do Alto': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Cerquilho': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Cesario Lange': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Conchas': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Elias Fausto': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Ipero': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Itapetininga': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Itu': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Jumirim': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Laranjal Paulista': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Pereiras': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Pilar do Sul': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Porangaba': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Quadra': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'RAFARD': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Rio das Pedras': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Saltinho': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Salto': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Salto de Pirapora': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Sarapui': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Sorocaba': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Tatui': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Tiete': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },'Votorantim': { cluster: 'REGIONAL CENTRAL', territory: 'Território de Sorocaba' },
        };
        const cidadeInput = document.getElementById('cidade');
        const cidadeDatalist = document.getElementById('cidades');
        if(cidadeDatalist) {
            const todasCidades = Object.keys(cityData).sort();
            todasCidades.forEach(cidade => {
                cidadeDatalist.appendChild(Object.assign(document.createElement('option'), { value: cidade }));
            });
        }
        if(cidadeInput) {
            cidadeInput.addEventListener('input', () => {
                const territorioInput = document.getElementById('territorio');
                const clusterInput = document.getElementById('cluster');
                const data = cityData[cidadeInput.value];
                territorioInput.value = data ? data.territory : '';
                clusterInput.value = data ? data.cluster : '';
            });
        }
        document.getElementById('gerarEncaixeButton')?.addEventListener('click', () => {
            const data = {
                setor: document.getElementById('setor').value,
                protocolo: document.getElementById('protocolo').value,
                cidade: document.getElementById('cidade').value,
                territorio: document.getElementById('territorio').value,
                cluster: document.getElementById('cluster').value,
                telefone: document.getElementById('telefone').value,
                dataEncaixe: document.getElementById('dataEncaixe').value,
                periodo: document.getElementById('periodo').value,
                motivo: document.getElementById('motivo').value
            };
            if (Object.values(data).some(v => !v)) {
                alert('Preencha todos os campos antes de gerar o encaixe.');
                return;
            }
            const [ano, mes, dia] = data.dataEncaixe.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;
            const resultadoTexto = `*-- Solicitação de Encaixe  --*\nSetor: *${data.setor}*\nProtocolo / Caso: *${data.protocolo}*\nCidade: *${data.cidade}*\nTerritório: *${data.territorio}*\nCluster: *${data.cluster}*\nTelefone: *${data.telefone}*\nData do Encaixe: *${dataFormatada}*\nPeríodo: *${data.periodo}*\nMotivo:  *${data.motivo}*`;
            document.getElementById('resultado').textContent = resultadoTexto;
            document.getElementById('resultado-container').classList.remove('hidden');
        });
        document.getElementById('limparFormularioButton')?.addEventListener('click', () => {
            formEncaixe.reset();
            document.getElementById('territorio').value = '';
            document.getElementById('cluster').value = '';
            document.getElementById('resultado-container').classList.add('hidden');
        });
        document.getElementById('copiarResultadoButton')?.addEventListener('click', async (e) => {
            const texto = document.getElementById('resultado').textContent;
            if (await copyTextToClipboard(texto)) {
                const btn = e.target;
                const originalText = btn.textContent;
                btn.textContent = 'Copiado!';
                setTimeout(() => { btn.textContent = originalText; }, 1500);
            }
        });
    }

    // --- CÓDIGO DAS METAS ADICIONADO DE VOLTA ---
    const metasPageIdentifier = document.getElementById('atendimentosInput');
    if (metasPageIdentifier) {
        const atendimentosInput = document.getElementById('atendimentosInput');
        const metas = [{ id: 1, target: 550, reward: 300 }, { id: 2, target: 750, reward: 400 }, { id: 3, target: 850, reward: 500 }, { id: 4, target: 950, reward: 700 }];
        const metasContainer = document.getElementById('metas-container');
        const summaryText = document.getElementById('summary-text');
        const incrementButton = document.getElementById('incrementButton');

        function renderAtendimentoMetas() { 
            if (!metasContainer) return;
            metasContainer.innerHTML = ''; 
            metas.forEach(meta => { 
                const metaElement = document.createElement('div'); 
                metaElement.className = 'meta-item'; 
                metaElement.innerHTML = `<div class="meta-header"><span class="meta-label">Faixa ${meta.id}: ${meta.target} atendimentos (R$ ${meta.reward})</span><span class="meta-percentage" id="meta${meta.id}-percent">0%</span></div><div class="progress-bar-background"><div class="progress-bar-fill" id="meta${meta.id}-fill"></div></div>`; 
                metasContainer.appendChild(metaElement); 
            }); 
        }

        function updateAtendimentoProgress() { 
            if (!atendimentosInput || !summaryText) return;
            const currentValue = parseInt(atendimentosInput.value) || 0; 
            localStorage.setItem('atendimentosCount', currentValue); 
            let highestAchieved = null; 
            metas.forEach(meta => { 
                const percent = Math.min(100, (currentValue / meta.target) * 100); 
                const fill = document.getElementById(`meta${meta.id}-fill`); 
                const percentText = document.getElementById(`meta${meta.id}-percent`); 
                if (fill && percentText) {
                    fill.style.width = `${percent}%`; 
                    percentText.textContent = `${Math.floor(percent)}%`; 
                    if (percent >= 100) { 
                        fill.classList.add('completed'); 
                        highestAchieved = meta; 
                    } else { 
                        fill.classList.remove('completed'); 
                    }
                }
            }); 
            if (!highestAchieved) { 
                const faltam = metas[0].target - currentValue; 
                summaryText.innerHTML = `Faltam <strong>${faltam > 0 ? faltam : 0}</strong> atendimentos para a Faixa 1.`; 
                summaryText.className = 'summary-box'; 
            } else { 
                const nextMetaIndex = metas.findIndex(m => m.id === highestAchieved.id) + 1; 
                if (nextMetaIndex < metas.length) { 
                    const nextMeta = metas[nextMetaIndex]; 
                    const faltam = nextMeta.target - currentValue; 
                    summaryText.innerHTML = `Parabéns! Atingido: <strong>Faixa ${highestAchieved.id} (R$ ${highestAchieved.reward})</strong>. Faltam <strong>${faltam > 0 ? faltam : 0}</strong> para a próxima!`; 
                    summaryText.className = 'summary-box completed'; 
                } else { 
                    summaryText.innerHTML = `INCRÍVEL! 🏆 Meta máxima de <strong>R$ ${highestAchieved.reward}</strong> atingida!`; 
                    summaryText.className = 'summary-box completed'; 
                } 
            } 
        }
        
        renderAtendimentoMetas();
        const savedAtendimentos = localStorage.getItem('atendimentosCount');
        if (savedAtendimentos) { atendimentosInput.value = savedAtendimentos; }
        updateAtendimentoProgress();
        atendimentosInput.addEventListener('input', updateAtendimentoProgress);
        if (incrementButton) { 
            incrementButton.addEventListener('click', () => { 
                let currentValue = parseInt(atendimentosInput.value) || 0; 
                currentValue++; 
                atendimentosInput.value = currentValue; 
                atendimentosInput.dispatchEvent(new Event('input')); 
            }); 
        }
        
        function setupTierTracker(inputId, containerId, tiers, storageKey) {
            const input = document.getElementById(inputId);
            const container = document.getElementById(containerId);
            if (!input || !container) return;
            container.innerHTML = '';
            tiers.forEach(tier => { 
                const faixaEl = document.createElement('div'); 
                faixaEl.className = 'faixa-item'; 
                faixaEl.dataset.tierMin = tier.min; 
                faixaEl.textContent = tier.label; 
                container.appendChild(faixaEl); 
            });
            const faixas = container.querySelectorAll('.faixa-item');
            function update() {
                const value = parseFloat(input.value) || 0;
                localStorage.setItem(storageKey, value);
                let achievedTierMin = -1;
                tiers.forEach(tier => { 
                    if (value >= tier.min && value <= tier.max) { 
                        achievedTierMin = tier.min; 
                    } 
                });
                faixas.forEach(faixa => { 
                    if (parseInt(faixa.dataset.tierMin) === achievedTierMin) { 
                        faixa.classList.add('achieved'); 
                    } else { 
                        faixa.classList.remove('achieved'); 
                    } 
                });
            }
            const savedValue = localStorage.getItem(storageKey);
            if (savedValue) { input.value = savedValue; }
            update();
            input.addEventListener('input', update);
        }

        const csatTiers = [ { label: 'F1 0% (60-69%)', min: 60, max: 69.9 }, { label: 'F2 10%(70-79%)', min: 70, max: 79.9 }, { label: 'F3 20%(80-89%)', min: 80, max: 89.9 }, { label: 'F4 30%(90-100%)', min: 90, max: 100 } ];
        setupTierTracker('csatInput', 'csatFaixas', csatTiers, 'csatValue');
        const avaliadasTiers = [ { label: 'F1 0% (21-29%)', min: 21, max: 29.9 }, { label: 'F2 5%(30-39%)', min: 30, max: 39.9 }, { label: 'F3 10%(40-49%)', min: 40, max: 49.9 }, { label: 'F4 15%(+50%)', min: 50, max: Infinity } ];
        setupTierTracker('avaliadasInput', 'avaliadasFaixas', avaliadasTiers, 'avaliadasValue');
    }
});
