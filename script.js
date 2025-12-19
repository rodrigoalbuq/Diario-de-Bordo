// Diário de Bordo PWA
(function () {
    const STORAGE_KEY = 'diario_de_bordo_entries';
    const form = document.getElementById('entryForm');
    const entriesList = document.getElementById('entriesList');
    const emptyState = document.getElementById('emptyState');
    const installBtn = document.getElementById('installBtn');
    const screenshotSection = document.getElementById('screenshotSection');
    const screenshotImg = document.getElementById('screenshotImg');
    const downloadScreenshot = document.getElementById('downloadScreenshot');

    let deferredPrompt = null;

    // Utils
    function loadEntries() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }
    function saveEntries(entries) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
    function formatDate(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    }

    // Render
    function render() {
        const entries = loadEntries();
        entriesList.innerHTML = '';
        if (!entries.length) {
            emptyState.hidden = false;
            return;
        }
        emptyState.hidden = true;
        entries.forEach((entry, idx) => {
            const li = document.createElement('li');
            li.className = 'entry-item';
            li.innerHTML = `
        <div class="entry-header">
          <div class="entry-title">${escapeHtml(entry.title)}</div>
          <div class="entry-date">${formatDate(entry.date)}</div>
        </div>
        <div class="entry-desc">${escapeHtml(entry.description)}</div>
        <div class="entry-actions">
          <button class="delete" data-index="${idx}">Remover</button>
        </div>
      `;
            entriesList.appendChild(li);
        });
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Handlers
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = form.title.value.trim();
        const description = form.description.value.trim();
        const date = form.date.value || new Date().toISOString().slice(0, 10);
        if (!title || !description) return;
        const entries = loadEntries();
        entries.unshift({ title, description, date });
        saveEntries(entries);
        form.reset();
        render();
    });

    entriesList.addEventListener('click', (e) => {
        const btn = e.target.closest('button.delete');
        if (!btn) return;
        const idx = Number(btn.dataset.index);
        const entries = loadEntries();
        entries.splice(idx, 1);
        saveEntries(entries);
        render();
    });

    // Install prompt (PWA)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.hidden = false;
    });
    installBtn.addEventListener('click', async () => {
        // Primeiro: acionar o prompt de instalação rapidamente (gesto de usuário)
        if (deferredPrompt) {
            installBtn.hidden = true;
            try {
                if (typeof deferredPrompt.prompt === 'function') {
                    await deferredPrompt.prompt();
                }
                if (deferredPrompt.userChoice) {
                    await deferredPrompt.userChoice; // compatibilidade entre navegadores
                }
            } catch (err) {
                console.warn('Falha ao exibir prompt de instalação:', err);
            } finally {
                deferredPrompt = null;
            }
        }

        // Depois: gerar a captura sem bloquear o gesto
        try {
            if (window.html2canvas) {
                const canvas = await window.html2canvas(document.body, { useCORS: true, backgroundColor: '#f5f7fa' });
                const dataURL = canvas.toDataURL('image/png');
                if (screenshotImg && screenshotSection) {
                    screenshotImg.src = dataURL;
                    if (downloadScreenshot) downloadScreenshot.href = dataURL;
                    screenshotSection.hidden = false;
                    screenshotSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        } catch (err) {
            console.error('Falha ao gerar captura:', err);
        }
    });

    // Register Service Worker + atualização automática
    if ('serviceWorker' in navigator) {
        function reloadOnce() {
            try {
                if (sessionStorage.getItem('swUpdateReloaded') === '1') return;
                sessionStorage.setItem('swUpdateReloaded', '1');
            } catch { }
            window.location.reload();
        }

        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then((reg) => {
                    // Se há uma nova versão aguardando, recarregar
                    if (reg.waiting) {
                        reloadOnce();
                    }
                    reg.addEventListener('updatefound', () => {
                        const newSW = reg.installing;
                        if (!newSW) return;
                        newSW.addEventListener('statechange', () => {
                            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                                reloadOnce();
                            }
                        });
                    });
                })
                .catch(console.error);

            // Mensagens do SW informando nova versão ativa
            navigator.serviceWorker.addEventListener('message', (event) => {
                const data = event.data || {};
                if (data.type === 'SW_UPDATE_READY') {
                    reloadOnce();
                }
            });

            // Quando o controlador muda, a nova versão está ativa
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                reloadOnce();
            });
        });
    }

    // Init
    (function init() {
        // Default date = today
        const today = new Date().toISOString().slice(0, 10);
        if (!form.date.value) form.date.value = today;
        render();
    })();
})();
