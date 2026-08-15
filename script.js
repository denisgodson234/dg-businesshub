/* =========================================================
   DENIS GODSON BUSINESS HUB
   VERSION 5 — SCRIPT.JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       AI CHAT ELEMENTS
    ========================= */

    const chatMessages = document.getElementById("chatMessages");
    const chatInput = document.getElementById("chatInput");
    const sendButton = document.getElementById("sendButton");
    const typingIndicator = document.getElementById("typingIndicator");

    const aiModal = document.getElementById("aiModal");
    const closeAi = document.getElementById("closeAi");


    /* =========================
       CHAT FUNCTIONS
    ========================= */

    function scrollChatToBottom() {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }


    function escapeHTML(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }


    function formatAIResponse(text) {

        let safeText = escapeHTML(text);

        safeText = safeText.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );

        safeText = safeText.replace(
            /\n/g,
            "<br>"
        );

        return safeText;
    }


    function addUserMessage(message) {

        if (!chatMessages) return;

        const messageContainer =
            document.createElement("div");

        messageContainer.className =
            "chat-message user";

        messageContainer.innerHTML = `
            <div class="message-bubble">
                <span class="message-role">YOU</span>
                <div>
                    ${escapeHTML(message).replace(/\n/g, "<br>")}
                </div>
            </div>
        `;

        chatMessages.appendChild(messageContainer);

        scrollChatToBottom();
    }


    function addAIMessage(message) {

        if (!chatMessages) return;

        const messageContainer =
            document.createElement("div");

        messageContainer.className =
            "chat-message ai";

        messageContainer.innerHTML = `
            <div class="message-bubble">
                <span class="message-role">DG AI</span>
                <div>
                    ${formatAIResponse(message)}
                </div>
            </div>
        `;

        chatMessages.appendChild(messageContainer);

        scrollChatToBottom();
    }


    function showTyping() {

        if (typingIndicator) {
            typingIndicator.classList.add("active");
        }

        scrollChatToBottom();
    }


    function hideTyping() {

        if (typingIndicator) {
            typingIndicator.classList.remove("active");
        }
    }


    /* =========================
       ASK AI
    ========================= */

    async function askAI(question) {

        if (!question || !question.trim()) {
            return;
        }

        const cleanQuestion = question.trim();

        addUserMessage(cleanQuestion);

        if (chatInput) {
            chatInput.value = "";
            chatInput.style.height = "46px";
        }

        if (sendButton) {
            sendButton.disabled = true;
        }

        showTyping();

        try {

            const response = await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        message: cleanQuestion
                    })
                }
            );


            let data;

            try {

                data = await response.json();

            } catch (error) {

                throw new Error(
                    "Invalid server response."
                );

            }


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "AI server error."
                );

            }


            hideTyping();


            const aiReply =
                data.reply ||
                data.response ||
                data.message ||
                data.content;


            if (aiReply) {

                addAIMessage(aiReply);

            } else {

                addAIMessage(
                    "Sorry, I received an empty response. Please try again."
                );

            }


        } catch (error) {

            console.error(
                "AI Error:",
                error
            );

            hideTyping();

            addAIMessage(
                "Sorry, I couldn't connect to the AI right now. Please try again."
            );

        } finally {

            if (sendButton) {
                sendButton.disabled = false;
            }

            if (chatInput) {
                chatInput.focus();
            }

        }
    }


    /* =========================
       SEND BUTTON
    ========================= */

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            () => {

                if (!chatInput) return;

                const question =
                    chatInput.value.trim();

                if (question) {
                    askAI(question);
                }

            }
        );

    }


    /* =========================
       ENTER TO SEND
    ========================= */

    if (chatInput) {

        chatInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    const question =
                        chatInput.value.trim();

                    if (
                        question &&
                        sendButton &&
                        !sendButton.disabled
                    ) {

                        askAI(question);

                    }

                }

            }
        );


        chatInput.addEventListener(
            "input",
            () => {

                chatInput.style.height =
                    "auto";

                const height =
                    Math.min(
                        chatInput.scrollHeight,
                        130
                    );

                chatInput.style.height =
                    height + "px";

            }
        );

    }


    /* =========================
       SUGGESTION BUTTONS
    ========================= */

    const suggestions =
        document.querySelectorAll(
            ".suggestion-list button"
        );


    suggestions.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const question =
                    button.getAttribute(
                        "data-question"
                    ) ||
                    button.textContent.trim();

                if (!question) return;

                if (chatInput) {

                    chatInput.value =
                        question;

                    chatInput.dispatchEvent(
                        new Event("input")
                    );

                    chatInput.focus();

                }

                askAI(question);

            }
        );

    });


    /* =========================
       AI MODAL
    ========================= */

    function openAIModal() {

        if (!aiModal) return;

        aiModal.classList.add("active");

        document.body.style.overflow =
            "hidden";

    }


    function closeAIModal() {

        if (!aiModal) return;

        aiModal.classList.remove("active");

        document.body.style.overflow =
            "";

    }


    if (closeAi) {

        closeAi.addEventListener(
            "click",
            closeAIModal
        );

    }


    if (aiModal) {

        aiModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === aiModal
                ) {

                    closeAIModal();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {
                closeAIModal();
            }

        }
    );


    /* =========================
       OPEN AI BUTTONS
    ========================= */

    const aiButtons =
        document.querySelectorAll(
            '[data-open-ai], .open-ai, .ai-button'
        );


    aiButtons.forEach(button => {

        button.addEventListener(
            "click",
            (event) => {

                const href =
                    button.getAttribute(
                        "href"
                    );

                if (
                    !href ||
                    href === "#ai"
                ) {

                    event.preventDefault();

                    openAIModal();

                    setTimeout(
                        () => {

                            if (chatInput) {
                                chatInput.focus();
                            }

                        },
                        200
                    );

                }

            }
        );

    });


    /* =========================
       SMOOTH SCROLL
    ========================= */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const id =
                    link.getAttribute(
                        "href"
                    );

                if (
                    !id ||
                    id === "#"
                ) {
                    return;
                }

                const target =
                    document.querySelector(id);

                if (target) {

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    });


    /* =====================================================
       🔴 BUSINESS PROFIT CALCULATOR
       REVENUE - EXPENSES
    ===================================================== */

    const revenueInput =
        document.getElementById(
            "revenue"
        );


    const expensesInput =
        document.getElementById(
            "expenses"
        );


    const calculateButton =
        document.getElementById(
            "calculateProfit"
        );


    const profitResult =
        document.getElementById(
            "profitResult"
        );


    function formatNaira(number) {

        return new Intl.NumberFormat(
            "en-NG",
            {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2
            }
        ).format(number);

    }


    function calculateProfit() {

        if (
            !revenueInput ||
            !expensesInput ||
            !profitResult
        ) {

            console.error(
                "Calculator elements not found."
            );

            return;
        }


        const revenue =
            parseFloat(
                revenueInput.value
            );


        const expenses =
            parseFloat(
                expensesInput.value
            );


        if (
            Number.isNaN(revenue) ||
            Number.isNaN(expenses)
        ) {

            profitResult.classList.remove(
                "success"
            );

            profitResult.textContent =
                "Please enter valid revenue and expenses.";

            return;
        }


        const profit =
            revenue - expenses;


        if (profit > 0) {

            profitResult.classList.add(
                "success"
            );

            profitResult.innerHTML = `
                <strong>Estimated Profit:</strong>
                ${formatNaira(profit)}
                <br><br>
                Revenue:
                ${formatNaira(revenue)}
                <br>
                Expenses:
                ${formatNaira(expenses)}
            `;

        }

        else if (profit === 0) {

            profitResult.classList.remove(
                "success"
            );

            profitResult.innerHTML = `
                <strong>Break-even:</strong>
                Your revenue and expenses are equal.
                <br><br>
                Total:
                ${formatNaira(revenue)}
            `;

        }

        else {

            profitResult.classList.remove(
                "success"
            );

            profitResult.innerHTML = `
                <strong>Estimated Loss:</strong>
                ${formatNaira(Math.abs(profit))}
                <br><br>
                Revenue:
                ${formatNaira(revenue)}
                <br>
                Expenses:
                ${formatNaira(expenses)}
            `;

        }

    }


    /* =========================
       CALCULATE BUTTON
    ========================= */

    if (calculateButton) {

        calculateButton.addEventListener(
            "click",
            calculateProfit
        );

    }


    /* =========================
       CALCULATE WITH ENTER
    ========================= */

    [revenueInput, expensesInput]
        .filter(Boolean)
        .forEach(input => {

            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        calculateProfit();

                    }

                }
            );

        });


    /* =========================
       FEATURE BUTTONS
    ========================= */

    const toolButtons =
        document.querySelectorAll(
            ".tool-button"
        );


    toolButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const tool =
                    button.getAttribute(
                        "data-tool"
                    );


                if (tool === "ai") {

                    const aiSection =
                        document.getElementById(
                            "ai"
                        );

                    if (aiSection) {

                        aiSection.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                    setTimeout(
                        () => {

                            if (chatInput) {
                                chatInput.focus();
                            }

                        },
                        600
                    );

                }


                if (
                    tool === "calculator"
                ) {

                    const calculator =
                        document.getElementById(
                            "calculator"
                        );

                    if (calculator) {

                        calculator.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                }

            }
        );

    });


    /* =========================
       ACTIVE NAVIGATION
    ========================= */

    const sections =
        document.querySelectorAll(
            "section[id]"
        );


    const navLinks =
        document.querySelectorAll(
            ".nav-links a"
        );


    function updateActiveNav() {

        let currentSection = "";


        sections.forEach(section => {

            const top =
                section.offsetTop - 160;


            if (
                window.scrollY >= top
            ) {

                currentSection =
                    section.getAttribute(
                        "id"
                    );

            }

        });


        navLinks.forEach(link => {

            link.classList.remove(
                "active"
            );


            const href =
                link.getAttribute(
                    "href"
                );


            if (
                href ===
                "#" + currentSection
            ) {

                link.classList.add(
                    "active"
                );

            }

        });

    }


    window.addEventListener(
        "scroll",
        updateActiveNav
    );


    updateActiveNav();


    /* =========================
       STARTUP MESSAGE
    ========================= */

    console.log(
        "DENIS GODSON BUSINESS HUB V5 loaded successfully."
    );

    console.log(
        "Profit calculator initialized."
    );

});