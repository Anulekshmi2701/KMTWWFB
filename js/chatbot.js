(function () {
    function initKmtChatbot() {
        // 1. Remove any duplicate/old chatbot containers if present
        document.querySelectorAll("#kmtChatbotContainer").forEach(el => el.remove());

        // 2. Enforce highest z-index, clickability & Mic UI styles
        if (!document.getElementById("kmtChatbotFixStyle")) {
            const fixStyle = document.createElement("style");
            fixStyle.id = "kmtChatbotFixStyle";
            fixStyle.innerHTML = `
                #kmtChatbotContainer {
                    position: fixed !important;
                    bottom: 24px !important;
                    right: 24px !important;
                    z-index: 999999 !important;
                    pointer-events: auto !important;
                }
                #kmtChatToggle {
                    position: relative !important;
                    z-index: 1000000 !important;
                    pointer-events: auto !important;
                    cursor: pointer !important;
                }
                #kmtChatWindow {
                    z-index: 1000000 !important;
                }
                #kmtChatWindow.open {
                    display: flex !important;
                    flex-direction: column !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateY(0) scale(1) !important;
                }
                .kmt-mic-btn {
                    width: 34px;
                    height: 34px;
                    background-color: #eef8f0;
                    color: #124D1C;
                    border: 1.5px solid #C89211;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }
                .kmt-mic-btn:hover {
                    background-color: #124D1C;
                    color: #ffd66b;
                }
                .kmt-mic-btn.listening {
                    background-color: #dc2626 !important;
                    color: #ffffff !important;
                    border-color: #dc2626 !important;
                    animation: kmtMicPulse 1.1s infinite;
                }
                @keyframes kmtMicPulse {
                    0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.65); }
                    70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
                }
            `;
            document.head.appendChild(fixStyle);
        }

        // 3. Inject Chatbot HTML (Speaker Removed, Mic Kept)
        const chatbotHTML = `
        <div id="kmtChatbotContainer" class="notranslate">
            <button type="button" id="kmtChatToggle" class="kmt-chat-btn shadow-lg" aria-label="Open Helpdesk Chat">
                <span class="kmt-pulse-ring"></span>
                <span class="kmt-btn-icon">
                    <i class="fas fa-robot fa-lg chat-icon-open"></i>
                    <i class="fas fa-chevron-down fa-lg chat-icon-close"></i>
                </span>
                <span class="kmt-chat-label">Helpdesk</span>
            </button>

            <div id="kmtChatWindow" class="kmt-chat-window shadow-lg rounded-4 overflow-hidden">
                <div class="kmt-chat-header p-3 d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <div class="kmt-bot-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div>
                            <h6 class="mb-0 text-white fw-bold" style="font-size: 14.5px; letter-spacing: 0.3px;">KMTWWFB Assistant</h6>
                            <small class="d-flex align-items-center gap-1" style="color: #ffd66b; font-size: 11px;">
                                <span class="kmt-online-dot"></span> Online • Voice &amp; Text
                            </small>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <button type="button" id="kmtChatClear" class="btn btn-sm kmt-header-action" title="Reset Chat" aria-label="Reset Chat">
                            <i class="fas fa-redo-alt"></i>
                        </button>
                        <button type="button" id="kmtChatClose" class="btn btn-sm kmt-header-action" title="Close Chat" aria-label="Close Chat">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div id="kmtChatMessages" class="kmt-chat-body p-3">
                    <div class="bot-msg-row">
                        <div class="mini-bot-icon"><i class="fas fa-headset"></i></div>
                        <div class="bot-msg">
                            നമസ്കാരം! 🙏 <strong>KMTWWFB</strong> ഹെൽപ്പ് ഡെസ്കിലേക്ക് സ്വാഗതം. താഴെ കാണുന്ന വിഷയങ്ങളിൽ ക്ലിക്ക് ചെയ്യുകയോ <strong>മൈക്ക് (<i class="fas fa-microphone"></i>)</strong> അമർത്തി മലയാളത്തിലോ ഇംഗ്ലീഷിലോ സംസാരിക്കുകയോ ചെയ്യാം:
                        </div>
                    </div>

                    <div class="kmt-quick-replies mt-1 d-flex flex-wrap gap-2" id="kmtMainChips">
                        <button type="button" class="quick-chip" data-q="registration">
                            <i class="fas fa-id-card text-warning me-1"></i> Employee / Vehicle Registration
                        </button>
                        <button type="button" class="quick-chip" data-q="payment">
                            <i class="fas fa-credit-card text-warning me-1"></i> Online Contribution Payment
                        </button>
                        <button type="button" class="quick-chip" data-q="schemes">
                            <i class="fas fa-hand-holding-heart text-warning me-1"></i> Welfare Schemes &amp; Pension
                        </button>
                        <button type="button" class="quick-chip" data-q="hours">
                            <i class="fas fa-clock text-warning me-1"></i> Office Working Hours
                        </button>
                        <button type="button" class="quick-chip" data-q="contact">
                            <i class="fas fa-phone-alt text-warning me-1"></i> Head Office Contact
                        </button>
                        <button type="button" class="quick-chip other-options-trigger" id="btnOtherOptions">
                            <i class="fas fa-th-list me-1"></i> Other Options <i class="fas fa-chevron-right ms-1" style="font-size: 10px;"></i>
                        </button>
                    </div>
                </div>

                <!-- Voice Listening Status Bar -->
                <div id="kmtVoiceStatus" class="px-3 py-1 text-center small fw-bold" style="display: none; background-color: #fef2f2; color: #dc2626; font-size: 11.5px;">
                    <i class="fas fa-microphone-alt me-1"></i> സംസാരിക്കൂ... (Listening...)
                </div>

                <div id="kmtTypingIndicator" class="px-3 pb-2" style="display: none;">
                    <div class="typing-bubble">
                        <span></span><span></span><span></span>
                    </div>
                </div>

                <form id="kmtChatForm" class="kmt-chat-footer p-2 d-flex align-items-center gap-2 bg-white border-top">
                    <input type="text" id="kmtChatInput" class="form-control form-control-sm border-0 bg-light rounded-pill px-3 py-2" placeholder="Type or tap mic to speak..." autocomplete="off" required>
                    <button type="button" id="kmtMicBtn" class="btn btn-sm rounded-circle kmt-mic-btn" title="Speak in Malayalam or English" aria-label="Voice Search">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <button type="submit" class="btn btn-sm rounded-circle kmt-send-btn" aria-label="Send">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </div>`;

        document.body.insertAdjacentHTML("beforeend", chatbotHTML);

        const toggleBtn = document.getElementById("kmtChatToggle");
        const closeBtn = document.getElementById("kmtChatClose");
        const clearBtn = document.getElementById("kmtChatClear");
        const micBtn = document.getElementById("kmtMicBtn");
        const voiceStatus = document.getElementById("kmtVoiceStatus");
        const chatWindow = document.getElementById("kmtChatWindow");
        const chatForm = document.getElementById("kmtChatForm");
        const chatInput = document.getElementById("kmtChatInput");
        const messagesBox = document.getElementById("kmtChatMessages");
        const typingIndicator = document.getElementById("kmtTypingIndicator");

        const initialHTML = messagesBox.innerHTML;

        // 4. Speech-to-Text (Web Speech API - Fixed & Diagnostic)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition = null;
        let isListening = false;

        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            // Switch recognition language based on selected website language
            const activeLang = localStorage.getItem("kmt_site_lang") || "en";
            recognition.lang = activeLang === "ml" ? "ml-IN" : "en-IN";
            recognition.interimResults = true;
            recognition.continuous = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = function () {
                isListening = true;
                micBtn.classList.add("listening");
                voiceStatus.style.display = "block";
                voiceStatus.innerHTML = `<i class="fas fa-microphone-alt me-1"></i> സംസാരിക്കൂ... (Listening...)`;
            };

            recognition.onresult = function (event) {
                let transcript = "";
                let isFinal = false;
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                    if (event.results[i].isFinal) isFinal = true;
                }

                chatInput.value = transcript;

                if (isFinal && transcript.trim() !== "") {
                    appendUserMessage(transcript.trim());
                    chatInput.value = "";
                    appendBotMessageWithTyping(getSmartResponse(transcript.trim()));
                }
            };

            recognition.onerror = function (event) {
                isListening = false;
                micBtn.classList.remove("listening");
                let errMsg = "ശബ്ദം വ്യക്തമായില്ല, വീണ്ടും ശ്രമിക്കൂ.";
                if (window.location.protocol === "file:") {
                    errMsg = "Live Server (http://localhost) വഴി തുറന്നാൽ മാത്രമേ Mic പ്രവർത്തിക്കൂ.";
                } else if (event.error === "not-allowed") {
                    errMsg = "Browser-ൽ Microphone permission അനുവദിക്കുക (Allow).";
                } else if (event.error === "network") {
                    errMsg = "Voice recognition-ന് Internet connection ആവശ്യമാണ്.";
                } else if (event.error === "no-speech") {
                    errMsg = "ശബ്ദമൊന്നും കേട്ടില്ല, മൈക്കിലേക്ക് അടുത്ത് സംസാരിക്കൂ.";
                }
                voiceStatus.style.display = "block";
                voiceStatus.innerHTML = `<i class="fas fa-exclamation-circle me-1"></i> ${errMsg}`;
                setTimeout(() => { voiceStatus.style.display = "none"; }, 3500);
            };

            recognition.onend = function () {
                isListening = false;
                micBtn.classList.remove("listening");
                if (!voiceStatus.innerHTML.includes("fa-exclamation-circle")) {
                    voiceStatus.style.display = "none";
                }
            };

            micBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Update language dynamically before starting
                const currentLang = localStorage.getItem("kmt_site_lang") || "en";
                recognition.lang = currentLang === "ml" ? "ml-IN" : "en-IN";

                if (isListening) {
                    recognition.stop();
                } else {
                    try {
                        recognition.start();
                    } catch (err) {
                        recognition.stop();
                    }
                }
            });
        } else {
            micBtn.style.display = "none";
        }

        // 5. Chatbot Knowledge Replies (Text Only - No Speaker)
        const botReplies = {
            registration: "📝 <strong>Registration:</strong> തൊഴിലാളികൾക്കും വാഹന ഉടമകൾക്കും <a href='https://kmtwwfb.kerala.gov.in/index.php' target='_blank' class='fw-bold text-success'>Online Service Portal</a> വഴി രജിസ്റ്റർ ചെയ്യാം. ആവശ്യമായ രേഖകൾ: Driving License, RC Book, Aadhaar, Bank Passbook.",
            payment: "💳 <strong>Online Payment:</strong> പ്രതിമാസ ക്ഷേമനിധി അംശാദായം (Contribution) UPI, Debit Card, Net Banking എന്നിവ വഴി <a href='https://kmtwwfb.kerala.gov.in/index.php' target='_blank' class='fw-bold text-success'>KMTWWFB Portal</a> വഴി നേരിട്ട് അടയ്ക്കാവുന്നതാണ്.",
            schemes: "🛡️ <strong>Welfare Schemes:</strong> പെൻഷൻ, ചികിത്സാ സഹായം, വിവാഹ ധനസഹായം, പ്രസവാനുകൂല്യം, വിദ്യാഭ്യാസ സ്കോളർഷിപ്പ് എന്നിവ ലഭ്യമാണ്. കൂടുതൽ വിവരങ്ങൾക്ക് <a href='welfare.html' class='fw-bold text-success'>Welfare Benefits</a> പേജ് സന്ദർശിക്കുക.",
            marriage: "💍 <strong>വിവാഹ ധനസഹായം (Marriage Benefit):</strong> രജിസ്റ്റർ ചെയ്ത തൊഴിലാളികളുടെയോ പെൺമക്കളുടെയോ വിവാഹത്തിന് ധനസഹായം ലഭിക്കും. ആവശ്യമായ രേഖകൾ: Marriage Certificate, വിവാഹ ക്ഷണക്കത്ത്, ബാങ്ക് പാസ്ബുക്ക്, ആധാർ. വിശദാംശങ്ങൾക്ക് <a href='welfare.html?scheme=marriage' class='fw-bold text-success'>Marriage Benefit</a> കാണുക.",
            scholarship: "🎓 <strong>വിദ്യാഭ്യാസ സ്കോളർഷിപ്പ് (Educational Scholarship):</strong> തൊഴിലാളികളുടെ മക്കൾക്ക് പ്ലസ് വൺ മുതൽ ഉന്നത വിദ്യാഭ്യാസ കോഴ്സുകൾ വരെ സ്കോളർഷിപ്പ് ലഭ്യമാണ്. അപേക്ഷിക്കാൻ <a href='welfare.html?scheme=scholarship' class='fw-bold text-success'>Educational Scholarship</a> പേജ് സന്ദർശിക്കുക.",
            maternity: "🤱 <strong>പ്രസവാനുകൂല്യം (Maternity Benefit):</strong> വനിതാ തൊഴിലാളികൾക്കുള്ള പ്രസവാനുകൂല്യത്തിന് ജനന സർട്ടിഫിക്കറ്റ്, ആധാർ, ബാങ്ക് പാസ്ബുക്ക് എന്നിവ സഹിതം അപേക്ഷിക്കാം. കൂടുതൽ വിവരങ്ങൾ <a href='welfare.html?scheme=maternity' class='fw-bold text-success'>Maternity Benefit</a> പേജിൽ ലഭ്യമാണ്.",
            medical: "🏥 <strong>ചികിത്സാ സഹായം (Medical Benefit):</strong> ഗുരുതര രോഗങ്ങൾക്കും ആശുപത്രി ചികിത്സയ്ക്കും ഡോക്ടറുടെ സർട്ടിഫിക്കറ്റ്, ആശുപത്രി ബിൽ എന്നിവ സഹിതം അപേക്ഷിക്കാം. <a href='welfare.html?scheme=medical' class='fw-bold text-success'>Medical Benefit</a> സന്ദർശിക്കുക.",
            hours: "⏰ <strong>Office Working Hours:</strong><br>• Corporation / Municipality: <strong>10:15 AM – 5:15 PM</strong><br>• Panchayat Area: <strong>10:00 AM – 5:00 PM</strong><br>(ഞായറാഴ്ചയും രണ്ടാം ശനിയാഴ്ചയും അവധി).",
            contact: "📞 <strong>Head Office (Kollam):</strong><br>Jayam Building, Mundakkal West, Kollam - 691001.<br>ഫോൺ: <a href='tel:04742742818' class='fw-bold text-success'>0474-2742818</a>, <a href='tel:04742741288' class='fw-bold text-success'>0474-2741288</a>.",
            emp_reg: "👷 <strong>Employee Registration:</strong><br>മോട്ടോർ തൊഴിലാളികൾക്ക് <strong>Form 1</strong> പ്രകാരം <a href='employee.html' class='fw-bold text-success'>Employee Registration</a> വഴി അപേക്ഷിക്കാം.<br>• രേഖകൾ: Driving License / Badge, Aadhaar, Photo, Bank Passbook.",
            veh_reg: "🚌 <strong>Vehicle Registration:</strong><br>വാഹന ഉടമകൾക്ക് <strong>Form 2 &amp; Form 3</strong> പ്രകാരം <a href='vehicle.html' class='fw-bold text-success'>Vehicle Registration</a> വഴി വാഹനം രജിസ്റ്റർ ചെയ്യാം.<br>• രേഖകൾ: Vehicle RC Book, Permit, Insurance.",
            app_status: "🔍 <strong>Application Status:</strong><br>നിങ്ങളുടെ അപേക്ഷയുടെ നിലവിലെ സ്ഥിതി (Pending / Approved) അറിയാൻ <a href='status.html' class='fw-bold text-success'>Application Status</a> പേജിൽ Application Number അല്ലെങ്കിൽ Mobile Number നൽകി പരിശോധിക്കാവുന്നതാണ്.",
            pay_details: "🧾 <strong>Payment Details &amp; Receipt:</strong><br>അടച്ച അംശാദായത്തിന്റെ വിവരങ്ങളും രസീതും (Receipt) ഡൗൺലോഡ് ചെയ്യാൻ <a href='Payment.html' class='fw-bold text-success'>Payment Details</a> അല്ലെങ്കിൽ <strong>KMTWWFB Mobile App</strong> ഉപയോഗിക്കുക."
        };

        function toggleChat(forceState) {
            const isOpen = typeof forceState === "boolean" ? forceState : !chatWindow.classList.contains("open");
            chatWindow.classList.toggle("open", isOpen);
            toggleBtn.classList.toggle("is-open", isOpen);
            if (!isOpen && isListening && recognition) recognition.stop();
            if (isOpen) setTimeout(() => chatInput.focus(), 200);
        }

        toggleBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleChat();
        });

        closeBtn.addEventListener("click", function (e) {
            e.preventDefault();
            toggleChat(false);
        });

        function appendUserMessage(text) {
            const div = document.createElement("div");
            div.className = "user-msg";
            div.textContent = text;
            messagesBox.appendChild(div);
            messagesBox.scrollTop = messagesBox.scrollHeight;
        }

        function appendBotMessageWithTyping(htmlText, callback) {
            typingIndicator.style.display = "block";
            messagesBox.scrollTop = messagesBox.scrollHeight;

            setTimeout(() => {
                typingIndicator.style.display = "none";
                const row = document.createElement("div");
                row.className = "bot-msg-row";
                row.innerHTML = `<div class="mini-bot-icon"><i class="fas fa-headset"></i></div><div class="bot-msg">${htmlText}</div>`;
                messagesBox.appendChild(row);
                if (typeof callback === "function") callback();
                messagesBox.scrollTop = messagesBox.scrollHeight;
            }, 400);
        }

        function showOtherOptionsMenu() {
            const subBox = document.createElement("div");
            subBox.className = "sub-options-box mt-1";
            subBox.innerHTML = `
                <div class="small fw-bold mb-2" style="color: #124D1C;">
                    <i class="fas fa-folder-open text-warning me-1"></i> Select a Service Option:
                </div>
                <div class="d-flex flex-wrap gap-2">
                    <button type="button" class="quick-chip sub-chip" data-q="emp_reg">
                        <i class="fas fa-user-plus text-warning me-1"></i> Employee Registration
                    </button>
                    <button type="button" class="quick-chip sub-chip" data-q="veh_reg">
                        <i class="fas fa-bus text-warning me-1"></i> Vehicle Registration
                    </button>
                    <button type="button" class="quick-chip sub-chip" data-q="app_status">
                        <i class="fas fa-search-location text-warning me-1"></i> Application Status
                    </button>
                    <button type="button" class="quick-chip sub-chip" data-q="pay_details">
                        <i class="fas fa-file-invoice-dollar text-warning me-1"></i> Payment Details
                    </button>
                    <button type="button" class="quick-chip other-options-trigger back-main-chip">
                        <i class="fas fa-arrow-left me-1"></i> Back to Main Options
                    </button>
                </div>
            `;
            messagesBox.appendChild(subBox);

            subBox.querySelectorAll(".sub-chip").forEach(btn => {
                btn.addEventListener("click", function () {
                    const key = this.getAttribute("data-q");
                    appendUserMessage(this.textContent.trim());
                    appendBotMessageWithTyping(botReplies[key]);
                });
            });

            subBox.querySelector(".back-main-chip").addEventListener("click", function () {
                appendUserMessage("Back to Main Options");
                messagesBox.innerHTML = initialHTML;
                bindChips(messagesBox);
            });
        }

        function getSmartResponse(text) {
            const q = text.toLowerCase();
            if (q.includes("marriage") || q.includes("വിവാഹ")) return botReplies.marriage;
            if (q.includes("scholarship") || q.includes("education") || q.includes("സ്കോളർഷിപ്പ്") || q.includes("വിദ്യാഭ്യാസ")) return botReplies.scholarship;
            if (q.includes("maternity") || q.includes("പ്രസവ")) return botReplies.maternity;
            if (q.includes("medical") || q.includes("hospital") || q.includes("ചികിത്സ")) return botReplies.medical;
            if (q.includes("status") || q.includes("track") || q.includes("application") || q.includes("അപേക്ഷ") || q.includes("സ്റ്റാറ്റസ്")) return botReplies.app_status;
            if (q.includes("employee") || q.includes("worker") || q.includes("form 1") || q.includes("തൊഴിലാളി")) return botReplies.emp_reg;
            if (q.includes("vehicle") || q.includes("bus") || q.includes("auto") || q.includes("rc") || q.includes("വാഹനം")) return botReplies.veh_reg;
            if (q.includes("receipt") || q.includes("history") || q.includes("payment detail") || q.includes("രസീത്")) return botReplies.pay_details;
            if (q.includes("reg") || q.includes("join") || q.includes("രജിസ്റ്റർ") || q.includes("രജിസ്ട്രേഷൻ")) return botReplies.registration;
            if (q.includes("pay") || q.includes("upi") || q.includes("contribution") || q.includes("അംശാദായം") || q.includes("പണമട")) return botReplies.payment;
            if (q.includes("scheme") || q.includes("pension") || q.includes("പെൻഷൻ") || q.includes("ക്ഷേമ")) return botReplies.schemes;
            if (q.includes("time") || q.includes("hour") || q.includes("സമയം") || q.includes("ഓഫീസ്")) return botReplies.hours;
            if (q.includes("contact") || q.includes("phone") || q.includes("kollam") || q.includes("നമ്പർ") || q.includes("ഫോൺ")) return botReplies.contact;
            return "കൂടുതൽ വിവരങ്ങൾക്കായി <strong>0474-2742818</strong> എന്ന നമ്പറിൽ വിളിക്കുകയോ <strong>Other Options</strong> തിരഞ്ഞെടുക്കുകയോ ചെയ്യുക.";
        }

        function bindChips(container) {
            container.querySelectorAll(".quick-chip[data-q]").forEach(chip => {
                chip.addEventListener("click", function () {
                    const key = this.getAttribute("data-q");
                    appendUserMessage(this.textContent.trim());
                    appendBotMessageWithTyping(botReplies[key]);
                });
            });

            const otherBtn = container.querySelector("#btnOtherOptions");
            if (otherBtn) {
                otherBtn.addEventListener("click", function () {
                    appendUserMessage("Other Options");
                    appendBotMessageWithTyping("താഴെ കാണുന്ന സേവനങ്ങളിൽ ആവശ്യമുള്ളത് തിരഞ്ഞെടുക്കുക:", showOtherOptionsMenu);
                });
            }
        }

        bindChips(messagesBox);

        clearBtn.addEventListener("click", () => {
            messagesBox.innerHTML = initialHTML;
            bindChips(messagesBox);
        });

        chatForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const userText = chatInput.value.trim();
            if (!userText) return;
            appendUserMessage(userText);
            chatInput.value = "";
            appendBotMessageWithTyping(getSmartResponse(userText));
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initKmtChatbot);
    } else {
        initKmtChatbot();
    }
})();