document.addEventListener("DOMContentLoaded", function () {
    const exactTerms = {
        en: {
            home: "Home",
            about: "About",
            gallery: "Gallery",
            welfare: "Welfare Benefits",
            contact: "Contact",
            login: "ADMIN LOGIN"
        },
        ml: {
            home: "ഹോം",
            about: "ഞങ്ങളെക്കുറിച്ച്",
            gallery: "ഗാലറി",
            welfare: "ക്ഷേമ പദ്ധതികൾ",
            contact: "ബന്ധപ്പെടുക",
            login: "അഡ്മിൻ ലോഗിൻ"
        }
    };

    function applyExactNavbarTerms(lang) {
        document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
            const href = (link.getAttribute("href") || "").toLowerCase();
            link.classList.add("notranslate");
            if (href.includes("index.html")) link.textContent = exactTerms[lang].home;
            else if (href.includes("about.html")) link.textContent = exactTerms[lang].about;
            else if (href.includes("gallery.html")) link.textContent = exactTerms[lang].gallery;
            else if (href.includes("welfare.html")) link.textContent = exactTerms[lang].welfare;
            else if (href.includes("contact.html")) link.textContent = exactTerms[lang].contact;
        });

        const adminBtn = document.querySelector('a[href="login.html"]');
        if (adminBtn) {
            adminBtn.classList.add("notranslate");
            adminBtn.textContent = exactTerms[lang].login;
        }
    }

    // Fallback: Inject button automatically if not already placed in HTML
    if (!document.getElementById("kmtLangToggleBtn")) {
        const navbarCollapse = document.getElementById("navbarCollapse");
        const adminLoginBtn = document.querySelector('#navbarCollapse a[href="login.html"]');

        const langBtn = document.createElement("button");
        langBtn.type = "button";
        langBtn.id = "kmtLangToggleBtn";
        langBtn.className = "btn rounded-pill py-2 px-3 ms-lg-3 mb-3 mb-md-3 mb-lg-0 fw-bold d-inline-flex align-items-center gap-2 notranslate kmt-lang-btn";
        langBtn.innerHTML = `
            <i class="fas fa-globe" style="color: #C89211;"></i>
            <span id="kmtLangBtnText">മലയാളം</span>
        `;

        if (adminLoginBtn) {
            adminLoginBtn.insertAdjacentElement("afterend", langBtn);
        } else if (navbarCollapse) {
            navbarCollapse.appendChild(langBtn);
        }
    }

    // Keep Brand & Icons unchanged
    document.querySelectorAll(".navbar-brand, .fa, .fas, .fab, .far, .bi").forEach(el => {
        el.classList.add("notranslate");
    });

    // Hidden Google Translate Element
    if (!document.getElementById("google_translate_element")) {
        const gtDiv = document.createElement("div");
        gtDiv.id = "google_translate_element";
        gtDiv.style.display = "none";
        document.body.appendChild(gtDiv);
    }

    // Zoom-on-Hover CSS & Hide Google Top Bar
    if (!document.getElementById("kmtLangStyle")) {
        const style = document.createElement("style");
        style.id = "kmtLangStyle";
        style.innerHTML = `
            .kmt-lang-btn {
                background-color: #FAF3E1 !important;
                color: #5A0E24 !important;
                border: 1.5px solid #E4B028 !important;
                font-size: 13px !important;
                cursor: pointer;
                transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease !important;
                transform: rotate(0deg) scale(1) !important;
            }
            .kmt-lang-btn:hover {
                transform: rotate(0deg) scale(1.07) !important;
                background-color: #ffffff !important;
                box-shadow: 0 4px 12px rgba(228, 176, 40, 0.35) !important;
            }
            .kmt-lang-btn::before,
            .kmt-lang-btn::after {
                display: none !important;
                animation: none !important;
            }
            .goog-te-banner-frame.skiptranslate, 
            .goog-te-balloon-frame, 
            #goog-gt-tt, 
            .goog-tooltip, 
            .skiptranslate iframe { display: none !important; }
            body { top: 0px !important; position: static !important; }
            .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
        `;
        document.head.appendChild(style);
    }

    function triggerGoogleTranslate(lang) {
        localStorage.setItem("kmt_site_lang", lang);
        document.cookie = `googtrans=/en/${lang}; path=/;`;
        applyExactNavbarTerms(lang);

        const btnText = document.getElementById("kmtLangBtnText");
        if (btnText) {
            btnText.textContent = lang === "en" ? "മലയാളം" : "English";
        }

        let attempts = 0;
        const interval = setInterval(() => {
            const combo = document.querySelector(".goog-te-combo");
            if (combo) {
                combo.value = lang;
                combo.dispatchEvent(new Event("change"));
                clearInterval(interval);
            }
            attempts++;
            if (attempts > 25) clearInterval(interval);
        }, 200);
    }

    window.googleTranslateElementInit = function () {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,ml',
            autoDisplay: false
        }, 'google_translate_element');

        const savedLang = localStorage.getItem("kmt_site_lang") || "en";
        if (savedLang === "ml") {
            triggerGoogleTranslate("ml");
        }
    };

    const gtScript = document.createElement("script");
    gtScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(gtScript);

    // Set initial state
    const initialLang = localStorage.getItem("kmt_site_lang") || "en";
    applyExactNavbarTerms(initialLang);
    const btnTextEl = document.getElementById("kmtLangBtnText");
    if (btnTextEl) {
        btnTextEl.textContent = initialLang === "en" ? "മലയാളം" : "English";
    }

    // Toggle Click Event
    document.addEventListener("click", function (e) {
        if (e.target.closest("#kmtLangToggleBtn")) {
            const current = localStorage.getItem("kmt_site_lang") || "en";
            if (current === "en") {
                triggerGoogleTranslate("ml");
            } else {
                localStorage.setItem("kmt_site_lang", "en");
                document.cookie = "googtrans=/en/en; path=/;";
                window.location.reload();
            }
        }
    });
});