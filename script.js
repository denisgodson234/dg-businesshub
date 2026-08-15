/* =========================================================
   DENIS GODSON BUSINESS HUB
   VERSION 5 — SCRIPT.JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       BASIC ELEMENTS
    ========================= */

    const chatMessages = document.getElementById("chatMessages");
    const chatInput = document.getElementById("chatInput");
    const sendButton = document.getElementById("sendButton");
    const typingIndicator = document.getElementById("typingIndicator");

    const aiModal = document.getElementById("aiModal");
    const closeAi = document.getElementById("closeAi");

    /* =========================
       AI CHAT
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

        safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        safeText = safeText.replace(/\n/g, "<br>");

        return safeText;
    }

    function addUserMessage(message) {
        if (!chatMessages) return;

        const messageContainer = document.createElement("div");
        messageContainer.className = "chat-message user";

        messageContainer.innerHTML = `
            <div class="message-bubble">
                <span class="message-role">YOU</span>
                <div>${escapeHTML(message).replace(/\n/g, "<br>")}</div>
            </div>
        `;

        chatMessages.appendChild(messageContainer);
        scrollChatToBottom();
    }

    function addAIMessage(message) {
        if (!chatMessages) return;

        const messageContainer = document.createElement("div");
        messageContainer.className = "chat-message ai";

        messageContainer.innerHTML = `
            <div class="message-bubble">
                <span class="message-role">DG AI</span>
                <div>${formatAIResponse(message)}</div>
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

    async function askAI(question) {

        if (!question || !question.trim()) return;

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

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: cleanQuestion
                })
            });

            let data;

            try {
                data = await response.json();
            } catch (jsonError) {
                throw new Error("The server returned an invalid response.");
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "The AI server returned an error."
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

            console.error("AI Error:", error);

            hideTyping();

            addAIMessage(
                "Sorry, I couldn't connect to the AI right now. Please check that your server is running and try again."
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

        sendButton.addEventListener("click", () => {

            if (!chatInput) return;

            const question = chatInput.value.trim();

            if (question) {
                askAI(question);
            }

        });
    }

    /* =========================
       ENTER TO SEND
    ========================= */

    if (chatInput) {

        chatInput.addEventListener("keydown", (event) => {

            if (event.key === "Enter" && !event.shiftKey) {

                event.preventDefault();

                const question = chatInput.value.trim();

                if (question && sendButton && !sendButton.disabled) {
                    askAI(question);
                }
            }

        });

        /* Auto resize textarea */

        chatInput.addEventListener("input", () => {

            chatInput.style.height = "auto";

            const newHeight = Math.min(
                chatInput.scrollHeight,
                130
            );

            chatInput.style.height = newHeight + "px";
        });
    }

    /* =========================
       AI SUGGESTIONS
    ========================= */

    const suggestionButtons =
        document.querySelectorAll(".suggestion-list button");

    suggestionButtons.forEach(button => {

        button.addEventListener("click", () => {

            const question =
                button.getAttribute("data-question") ||
                button.textContent.trim();

            if (!question) return;

            if (chatInput) {
                chatInput.value = question;
                chatInput.focus();

                chatInput.dispatchEvent(
                    new Event("input")
                );
            }

            askAI(question);
        });

    });

    /* =========================
       AI MODAL
    ========================= */

    function openAIModal() {

        if (aiModal) {
            aiModal.classList.add("active");
            document.body.style.overflow = "hidden";
        }

    }

    function closeAIModal() {

        if (aiModal) {
            aiModal.classList.remove("active");
            document.body.style.overflow = "";
        }

    }

    if (closeAi) {
        closeAi.addEventListener("click", closeAIModal);
    }

    if (aiModal) {

        aiModal.addEventListener("click", (event) => {

            if (event.target === aiModal) {
                closeAIModal();
            }

        });
    }

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {
            closeAIModal();
        }

    });

    /* =========================
       BUTTONS THAT OPEN AI
    ========================= */

    const aiOpenButtons = document.querySelectorAll(
        '[data-open-ai], .open-ai, .ai-button'
    );

    aiOpenButtons.forEach(button => {

        button.addEventListener("click", event => {

            const target =
                button.getAttribute("href");

            if (!target || target === "#ai") {
                event.preventDefault();
                openAIModal();

                setTimeout(() => {
                    if (chatInput) {
                        chatInput.focus();
                    }
                }, 200);
            }

        });

    });

    /* =========================
       SMOOTH NAVIGATION
    ========================= */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId =
                link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });

    /* =========================
       PROFIT CALCULATOR
    ========================= */

    const costInput =
        document.getElementById("costPrice");

    const sellingInput =
        document.getElementById("sellingPrice");

    const quantityInput =
        document.getElementById("quantity");

    const calculateButton =
        document.getElementById("calculateProfit");

    const profitResult =
        document.getElementById("profitResult");

    function calculateProfit() {

        if (
            !costInput ||
            !sellingInput ||
            !quantityInput ||
            !profitResult
        ) {
            return;
        }

        const cost =
            parseFloat(costInput.value);

        const selling =
            parseFloat(sellingInput.value);

        const quantity =
            parseInt(quantityInput.value);

        if (
            Number.isNaN(cost) ||
            Number.isNaN(selling) ||
            Number.isNaN(quantity) ||
            quantity <= 0
        ) {

            profitResult.classList.remove("success");

            profitResult.textContent =
                "Enter valid numbers to calculate your profit.";

            return;
        }

        const profitPerItem =
            selling - cost;

        const totalProfit =
            profitPerItem * quantity;

        const totalCost =
            cost * quantity;

        const totalRevenue =
            selling * quantity;

        profitResult.classList.add("success");

        if (totalProfit > 0) {

            profitResult.innerHTML = `
                <strong>Estimated Profit:</strong>
                ${formatMoney(totalProfit)}
                <br><br>
                Total Cost:
                ${formatMoney(totalCost)}
                <br>
                Total Revenue:
                ${formatMoney(totalRevenue)}
                <br>
                Profit Per Item:
                ${formatMoney(profitPerItem)}
            `;

        } else if (totalProfit === 0) {

            profitResult.classList.remove("success");

            profitResult.innerHTML = `
                <strong>Break-even:</strong>
                Your total revenue equals your total cost.
            `;

        } else {

            profitResult.classList.remove("success");

            profitResult.innerHTML = `
                <strong>Estimated Loss:</strong>
                ${formatMoney(Math.abs(totalProfit))}
                <br><br>
                Total Cost:
                ${formatMoney(totalCost)}
                <br>
                Total Revenue:
                ${formatMoney(totalRevenue)}
            `;

        }
    }

    function formatMoney(number) {

        return new Intl.NumberFormat(
            "en-NG",
            {
                style: "currency",
                currency: "NGN",
                maximumFractionDigits: 2
            }
        ).format(number);

    }

    if (calculateButton) {

        calculateButton.addEventListener(
            "click",
            calculateProfit
        );

    }

    [costInput, sellingInput, quantityInput]
        .filter(Boolean)
        .forEach(input => {

            input.addEventListener(
                "input",
                calculateProfit
            );

        });

    /* =========================
       FEATURE TOOL BUTTONS
    ========================= */

    const toolButtons =
        document.querySelectorAll(".tool-button");

    toolButtons.forEach(button => {

        button.addEventListener("click", () => {

            const tool =
                button.getAttribute("data-tool");

            if (tool === "ai") {

                const aiSection =
                    document.getElementById("ai");

                if (aiSection) {
                    aiSection.scrollIntoView({
                        behavior: "smooth"
                    });
                }

                setTimeout(() => {

                    if (chatInput) {
                        chatInput.focus();
                    }

                }, 600);

            }

            if (tool === "calculator") {

                const calculator =
                    document.getElementById("calculator");

                if (calculator) {
                    calculator.scrollIntoView({
                        behavior: "smooth"
                    });
                }

            }

        });

    });

    /* =========================
       ACTIVE NAVIGATION
    ========================= */

    const sections =
        document.querySelectorAll("section[id]");

    const navLinks =
        document.querySelectorAll(".nav-links a");

    function updateActiveNav() {

        let currentSection = "";

        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 160;

            if (
                window.scrollY >= sectionTop
            ) {
                currentSection =
                    section.getAttribute("id");
            }

        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            const href =
                link.getAttribute("href");

            if (
                href === "#" + currentSection
            ) {
                link.classList.add("active");
            }

        });

    }

    window.addEventListener(
        "scroll",
        updateActiveNav
    );

    updateActiveNav();

    /* =========================
       BUTTON RIPPLE EFFECT
    ========================= */

    document.querySelectorAll(
        ".primary-button, .send-button, .nav-button"
    ).forEach(button => {

        button.addEventListener("click", function(event) {

            const ripple =
                document.createElement("span");

            ripple.style.position = "absolute";
            ripple.style.width = "10px";
            ripple.style.height = "10px";
            ripple.style.borderRadius = "50%";
            ripple.style.background = "rgba(255,255,255,.35)";
            ripple.style.transform = "translate(-50%,-50%)";
            ripple.style.pointerEvents = "none";
            ripple.style.left =
                event.offsetX + "px";
            ripple.style.top =
                event.offsetY + "px";

            this.style.position = "relative";
            this.appendChild(ripple);

            ripple.animate(
                [
                    {
                        width: "10px",
                        height: "10px",
                        opacity: 1
                    },
                    {
                        width: "300px",
                        height: "300px",
                        opacity: 0
                    }
                ],
                {
                    duration: 550,
                    easing: "ease-out"
                }
            );

            setTimeout(() => {
                ripple.remove();
            }, 600);

        });

    });

    /* =========================
       PAGE READY
    ========================= */

    console.log(
        "DENIS GODSON BUSINESS HUB V5 loaded successfully."
    );

});