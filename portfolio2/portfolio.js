/**
 * portfolio.js — Système partagé de thème et de langue
 * À inclure sur TOUTES les pages du portfolio via <script src="../portfolio.js"> ou <script src="portfolio.js">.
 *
 * CHAQUE page doit définir window.PAGE_TRANSLATIONS AVANT ce script :
 *
 *   <script>
 *   window.PAGE_TRANSLATIONS = {
 *     fr: { "Ma_Cle": "Valeur FR" },
 *     en: { "Ma_Cle": "Valeur EN" },
 *     ...
 *   };
 *   </script>
 *   <script src="../portfolio.js"></script>
 *
 * Clés localStorage utilisées (unifiées sur toutes les pages) :
 *   - 'portfolio_theme'  → 'light' | 'dark'
 *   - 'portfolio_lang'   → 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'
 */

// ─── Traductions communes à toutes les pages (navbar) ─────────────────────────
const COMMON_TRANSLATIONS = {
    fr: { 'Accueil':'Accueil', 'À propos':'À propos', 'Bilan Personnel':'Bilan Personnel', 'Projets':'Projets', 'Contacts':'Contacts', 'Contact':'Contact' },
    en: { 'Accueil':'Home', 'À propos':'About', 'Bilan Personnel':'Personal Review', 'Projets':'Projects', 'Contacts':'Contacts', 'Contact':'Contact' },
    es: { 'Accueil':'Inicio', 'À propos':'Acerca de', 'Bilan Personnel':'Evaluación Personal', 'Projets':'Proyectos', 'Contacts':'Contactos', 'Contact':'Contacto' },
    de: { 'Accueil':'Startseite', 'À propos':'Über mich', 'Bilan Personnel':'Persönliche Bilanz', 'Projets':'Projekte', 'Contacts':'Kontakte', 'Contact':'Kontakt' },
    it: { 'Accueil':'Home', 'À propos':'Chi sono', 'Bilan Personnel':'Bilancio Personale', 'Projets':'Progetti', 'Contacts':'Contatti', 'Contact':'Contatto' },
    pt: { 'Accueil':'Início', 'À propos':'Sobre', 'Bilan Personnel':'Avaliação Pessoal', 'Projets':'Projetos', 'Contacts':'Contatos', 'Contact':'Contato' },
};

const SUPPORTED_LANGS = ['fr','en','es','de','it','pt'];
const LANG_LABELS = { fr:'🇫🇷 Français', en:'🇬🇧 English', es:'🇪🇸 Español', de:'🇩🇪 Deutsch', it:'🇮🇹 Italiano', pt:'🇵🇹 Português' };

let _translations = {};

function _buildTranslations() {
    const page = window.PAGE_TRANSLATIONS || {};
    const merged = {};
    SUPPORTED_LANGS.forEach(lang => {
        merged[lang] = Object.assign({}, COMMON_TRANSLATIONS[lang] || {}, page[lang] || {});
    });
    return merged;
}

// ─── Thème ────────────────────────────────────────────────────────────────────
function _applyTheme(theme) {
    const btn = document.getElementById('theme-toggle');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        if (btn) btn.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        if (btn) btn.textContent = '🌙';
    }
}

function _initTheme() {
    // Application immédiate (avant DOMContentLoaded) pour éviter le flash
    _applyTheme(localStorage.getItem('portfolio_theme') || 'light');

    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const next = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
            localStorage.setItem('portfolio_theme', next);
            _applyTheme(next);
        });
    }
}

// ─── Langue ───────────────────────────────────────────────────────────────────
function _translatePage(lang) {
    if (!_translations[lang]) return;
    localStorage.setItem('portfolio_lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        const val = _translations[lang][key];
        if (val === undefined) return;
        // Les <ul> des modales contiennent du HTML (<li>...</li>)
        if (el.tagName === 'UL') {
            el.innerHTML = val;
        } else {
            el.textContent = val;
        }
    });

    const selector = document.getElementById('language-selector');
    if (selector) selector.value = lang;
}

function _detectAndApplyLanguage() {
    const saved = localStorage.getItem('portfolio_lang');
    if (saved && _translations[saved]) { _translatePage(saved); return; }

    const browserLang = (navigator.language || navigator.userLanguage || 'fr').split('-')[0].toLowerCase();
    if (_translations[browserLang]) {
        _translatePage(browserLang);
    } else if (browserLang !== 'fr') {
        _translatePage('en');
    }
    // Si fr et pas de sauvegarde : le HTML est déjà en français, rien à faire
}

function _createLanguageSelector() {
    const container = document.getElementById('language_selector_container');
    if (!container) return;

    const select = document.createElement('select');
    select.className = 'language-selector';
    select.id = 'language-selector';

    SUPPORTED_LANGS.forEach(code => {
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = LANG_LABELS[code];
        select.appendChild(opt);
    });

    select.addEventListener('change', e => _translatePage(e.target.value));
    container.appendChild(select);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
// Thème appliqué immédiatement (script en bas de body, donc body existe déjà)
_applyTheme(localStorage.getItem('portfolio_theme') || 'light');

window.addEventListener('DOMContentLoaded', () => {
    _translations = _buildTranslations();
    _initTheme();
    _createLanguageSelector();
    _detectAndApplyLanguage();
});

window.addEventListener('languagechange', () => {
    if (Object.keys(_translations).length) _detectAndApplyLanguage();
});
