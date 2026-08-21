/* =========================================================
   DENIS GODSON BUSINESS HUB
   VERSION 5.2
   AI CHAT + CALCULATOR + CHAT HISTORY
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const chatMessages =
    document.getElementById("chatMessages");

const chatInput =
    document.getElementById("chatInput");

const sendButton =
    document.getElementById("sendButton");

const typingIndicator =
    document.getElementById("typingIndicator");

const aiModal =
    document.getElementById("aiModal");

const revenueInput =
    document.getElementById("revenueInput");

const expenseInput =
    document.getElementById("expenseInput");

const profitResult =
    document.getElementById("profitResult");


/* =========================================================
   CHAT STORAGE
========================================================= */

const CHAT_STORAGE_KEY =
    "dg_business_hub_chat_v51";


/* =========================================================
   AI MODAL
========================================================= */

function openAI() {

    if (!aiModal) return;

    aiModal.classList.add("active");

    setTimeout(() => {

        if (chatInput) {
            chatInput.focus();
        }

    }, 250);

}


function closeAI() {

    if (!aiModal) return;

    aiModal.classList.remove("active");

}


if (aiModal) {

    aiModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === aiModal
            ) {

                closeAI();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            closeAI();

        }

    }
);


/* =========================================================
   SAFE HTML ESCAPE
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


/* =========================================================
   FORMAT AI RESPONSE
========================================================= */

function formatAIText(text) {

    let safe =
        escapeHTML(text);


    /*
       CODE BLOCKS
       ```code```
    */

    safe =
        safe.replace(
            /```([\s\S]*?)```/g,
            '<pre class="ai-code-block"><code>$1</code></pre>'
        );


    /*
       INLINE CODE
       `code`
    */

    safe =
        safe.replace(
            /`([^`]+)`/g,
            '<code class="ai-inline-code">$1</code>'
        );


    /*
       BOLD
       **text**
    */

    safe =
        safe.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /*
       HEADINGS
    */

    safe =
        safe.replace(
            /^### (.*?)$/gm,
            '<h4 class="ai-heading">$1</h4>'
        );


    safe =
        safe.replace(
            /^## (.*?)$/gm,
            '<h3 class="ai-heading">$1</h3>'
        );


    safe =
        safe.replace(
            /^# (.*?)$/gm,
            '<h2 class="ai-heading">$1</h2>'
        );


    /*
       NUMBERED LISTS
    */

    safe =
        safe.replace(
            /^(\d+)\.\s+(.*?)$/gm,
            '<div class="ai-list-item"><span class="ai-number">$1.</span><span>$2</span></div>'
        );


    /*
       BULLET LISTS
    */

    safe =
        safe.replace(
            /^[•*-]\s+(.*?)$/gm,
            '<div class="ai-list-item"><span class="ai-bullet">•</span><span>$1</span></div>'
        );


    /*
       Remaining new lines
    */

    safe =
        safe.replace(
            /\n/g,
            "<br>"
        );


    return safe;

}


/* =========================================================
   SAVE CHAT
========================================================= */

function saveChat() {

    if (!chatMessages) return;

    try {

        localStorage.setItem(
            CHAT_STORAGE_KEY,
            chatMessages.innerHTML
        );

    } catch (error) {

        console.error(
            "Could not save chat:",
            error
        );

    }

}


/* =========================================================
   LOAD CHAT
========================================================= */

function loadChat() {

    if (!chatMessages) return;

    try {

        const saved =
            localStorage.getItem(
                CHAT_STORAGE_KEY
            );


        if (saved) {

            chatMessages.innerHTML =
                saved;

            addCopyButtonsToExistingMessages();

            scrollChatToBottom();

        }

    } catch (error) {

        console.error(
            "Could not load chat:",
            error
        );

    }

}


/* =========================================================
   CLEAR CHAT
========================================================= */

function clearChat() {

    if (!chatMessages) return;


    const confirmed =
        confirm(
            "Clear your DG AI chat history?"
        );


    if (!confirmed) {
        return;
    }


    chatMessages.innerHTML = "";


    localStorage.removeItem(
        CHAT_STORAGE_KEY
    );


    addAIMessage(
        "Hello! 👋 I'm DG AI. How can I help you today?"
    );

}


/* =========================================================
   ADD USER MESSAGE
========================================================= */

function addUserMessage(message) {

    if (!chatMessages) return;


    const messageBox =
        document.createElement("div");

    messageBox.className =
        "chat-message user-message";


    const label =
        document.createElement("span");

    label.className =
        "message-label";

    label.textContent =
        "YOU";


    const text =
        document.createElement("p");

    text.textContent =
        message;


    messageBox.appendChild(
        label
    );

    messageBox.appendChild(
        text
    );


    chatMessages.appendChild(
        messageBox
    );


    scrollChatToBottom();

    saveChat();

}


/* =========================================================
   ADD AI MESSAGE
========================================================= */

function addAIMessage(message) {

    if (!chatMessages) return;


    const messageBox =
        document.createElement("div");

    messageBox.className =
        "chat-message ai-message";


    const label =
        document.createElement("span");

    label.className =
        "message-label";

    label.textContent =
        "DG AI";


    const text =
        document.createElement("p");

    text.innerHTML =
        formatAIText(message);


    messageBox.appendChild(
        label
    );

    messageBox.appendChild(
        text
    );


    /*
       Copy button
    */

    const copyButton =
        document.createElement("button");

    copyButton.className =
        "copy-ai-button";

    copyButton.type =
        "button";

    copyButton.textContent =
        "📋 Copy";


    copyButton.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    message
                );

                copyButton.textContent =
                    "✓ Copied";


                setTimeout(() => {

                    copyButton.textContent =
                        "📋 Copy";

                }, 1500);


            } catch (error) {

                console.error(
                    "Copy failed:",
                    error
                );

                copyButton.textContent =
                    "Copy failed";

            }

        }
    );


    messageBox.appendChild(
        copyButton
    );


    chatMessages.appendChild(
        messageBox
    );


    scrollChatToBottom();

    saveChat();

}


/* =========================================================
   COPY BUTTONS FOR SAVED MESSAGES
========================================================= */

function addCopyButtonsToExistingMessages() {

    if (!chatMessages) return;


    const aiMessages =
        chatMessages.querySelectorAll(
            ".ai-message"
        );


    aiMessages.forEach(
        (messageBox) => {

            if (
                messageBox.querySelector(
                    ".copy-ai-button"
                )
            ) {

                return;

            }


            const textElement =
                messageBox.querySelector(
                    "p"
                );


            if (!textElement) {
                return;
            }


            const copyButton =
                document.createElement("button");


            copyButton.className =
                "copy-ai-button";


            copyButton.type =
                "button";


            copyButton.textContent =
                "📋 Copy";


            copyButton.addEventListener(
                "click",
                async () => {

                    try {

                        await navigator.clipboard.writeText(
                            textElement.innerText
                        );


                        copyButton.textContent =
                            "✓ Copied";


                        setTimeout(() => {

                            copyButton.textContent =
                                "📋 Copy";

                        }, 1500);


                    } catch (error) {

                        console.error(
                            "Copy failed:",
                            error
                        );

                    }

                }
            );


            messageBox.appendChild(
                copyButton
            );

        }
    );

}


/* =========================================================
   SCROLL CHAT
========================================================= */

function scrollChatToBottom() {

    if (!chatMessages) return;


    setTimeout(() => {

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    }, 50);

}


/* =========================================================
   TYPING INDICATOR
========================================================= */

function showTyping() {

    if (!typingIndicator) return;

    typingIndicator.classList.add(
        "active"
    );

    scrollChatToBottom();

}


function hideTyping() {

    if (!typingIndicator) return;

    typingIndicator.classList.remove(
        "active"
    );

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (!chatInput) return;


    const message =
        chatInput.value.trim();


    if (!message) {
        return;
    }


    if (
        sendButton &&
        sendButton.disabled
    ) {

        return;

    }


    /*
       Add user message
    */

    addUserMessage(
        message
    );


    /*
       Clear input
    */

    chatInput.value = "";

    chatInput.style.height =
        "auto";


    /*
       Disable button
    */

    if (sendButton) {

        sendButton.disabled =
            true;

    }


    /*
       Show typing
    */

    showTyping();


    try {

        console.log(
            "🤖 Sending message to DG AI..."
        );


        /*
           IMPORTANT:
           Your server.js uses POST /ask
           and expects { question: message }
        */

        const response =
            await fetch(
                "/ask",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question:
                            message
                    })

                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (error) {

            console.error(
                "Invalid server response:",
                error
            );

        }


        hideTyping();


        /*
           Server error
        */

        if (!response.ok) {

            const errorMessage =
                data?.error ||
                "The AI server returned an error.";


            addAIMessage(
                "⚠️ " +
                errorMessage
            );


            return;

        }


        /*
           Your server returns:
           { answer: "..." }
        */

        const reply =
            data?.answer;


        if (
            typeof reply !== "string" ||
            !reply.trim()
        ) {

            addAIMessage(
                "⚠️ The AI returned an empty response. Please try again."
            );


            return;

        }


        /*
           Display AI answer
        */

        addAIMessage(
            reply.trim()
        );


    } catch (error) {

        console.error(
            "AI connection error:",
            error
        );


        hideTyping();


        addAIMessage(
            "⚠️ I couldn't connect to the AI right now. Please check your internet connection and try again."
        );


    } finally {

        if (sendButton) {

            sendButton.disabled =
                false;

        }


        if (chatInput) {

            chatInput.focus();

        }

    }

}


/* =========================================================
   SEND BUTTON
========================================================= */

if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendMessage
    );

}


/* =========================================================
   ENTER TO SEND
========================================================= */

if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    chatInput.addEventListener(
        "input",
        () => {

            chatInput.style.height =
                "auto";


            chatInput.style.height =
                Math.min(
                    chatInput.scrollHeight,
                    150
                ) + "px";

        }
    );

}


/* =========================================================
   SUGGESTIONS
========================================================= */

function useSuggestion(prompt) {

    if (!chatInput) return;


    chatInput.value =
        prompt;


    chatInput.focus();


    sendMessage();

}


/* =========================================================
   OPEN AI WITH PROMPT
========================================================= */

function openAIWithPrompt(prompt) {

    openAI();


    setTimeout(() => {

        if (!chatInput) return;


        chatInput.value =
            prompt;


        chatInput.focus();

    }, 300);

}


/* =========================================================
   BUSINESS TOOLS
========================================================= */

function scrollToTools() {

    const tools =
        document.getElementById(
            "tools"
        );


    if (tools) {

        tools.scrollIntoView({
            behavior: "smooth"
        });

    }

}


function showCalculator() {

    const calculator =
        document.getElementById(
            "calculator"
        );


    if (calculator) {

        calculator.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}


/* =========================================================
   PROFIT CALCULATOR
========================================================= */

function calculateProfit() {

    const revenueElement =
        document.getElementById(
            "revenueInput"
        ) ||
        document.getElementById(
            "revenue"
        );


    const expenseElement =
        document.getElementById(
            "expenseInput"
        ) ||
        document.getElementById(
            "expenses"
        );


    const resultElement =
        document.getElementById(
            "profitResult"
        );


    if (
        !revenueElement ||
        !expenseElement ||
        !resultElement
    ) {

        console.error(
            "Calculator elements not found."
        );

        return;

    }


    const revenue =
        Number(
            revenueElement.value
        );


    const expenses =
        Number(
            expenseElement.value
        );


    if (
        !Number.isFinite(revenue) ||
        !Number.isFinite(expenses)
    ) {

        resultElement.textContent =
            "Please enter valid numbers.";

        return;

    }


    if (
        revenue < 0 ||
        expenses < 0
    ) {

        resultElement.textContent =
            "Please enter positive numbers.";

        return;

    }


    const profit =
        revenue - expenses;


    const formattedAmount =
        new Intl.NumberFormat(
            "en-NG",
            {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(
            Math.abs(profit)
        );


    if (profit > 0) {

        resultElement.textContent =
            "Your estimated profit is " +
            formattedAmount;

    }

    else if (profit < 0) {

        resultElement.textContent =
            "Your estimated loss is " +
            formattedAmount;

    }

    else {

        resultElement.textContent =
            "Your business is breaking even at " +
            formattedAmount;

    }


    resultElement.classList.add(
        "show"
    );

}


/* =========================================================
   CALCULATOR ENTER KEY
========================================================= */

if (revenueInput) {

    revenueInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                calculateProfit();

            }

        }
    );

}


if (expenseInput) {

    expenseInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                calculateProfit();

            }

        }
    );

}


/* =========================================================
   LOAD SAVED CHAT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadChat();

    }
);


/* =========================================================
   PAGE READY
========================================================= */

window.addEventListener(
    "load",
    () => {

        console.log(
            "================================="
        );

        console.log(
            "🚀 DENIS GODSON BUSINESS HUB V5.2"
        );

        console.log(
            "🤖 DG AI ready"
        );

        console.log(
            "💾 Chat history ready"
        );

        console.log(
            "📋 Copy system ready"
        );

        console.log(
            "🧮 Calculator ready"
        );

        console.log(
            "================================="
        );

    }
);