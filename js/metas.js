document.addEventListener('DOMContentLoaded', () => {

    // --- PÁGINA "METAS" ---
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
