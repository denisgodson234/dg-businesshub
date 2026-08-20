/* =========================================================
   DENIS GODSON BUSINESS HUB
   VERSION 5
   MAIN JAVASCRIPT
   AI + PROFIT CALCULATOR + UI
========================================================= */


/* =========================================================
   GLOBAL ELEMENTS
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
   AI MODAL
========================================================= */

function openAI() {

    if (!aiModal) {
        return;
    }

    aiModal.classList.add("active");

    setTimeout(() => {

        if (chatInput) {
            chatInput.focus();
        }

    }, 300);
}


function closeAI() {

    if (!aiModal) {
        return;
    }

    aiModal.classList.remove("active");
}


/* Close modal when clicking outside */

if (aiModal) {

    aiModal.addEventListener("click", (event) => {

        if (event.target === aiModal) {
            closeAI();
        }

    });

}


/* Close modal with Escape */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closeAI();
    }

});


/* =========================================================
   SCROLL TO BUSINESS TOOLS
========================================================= */

function scrollToTools() {

    const tools =
        document.getElementById("tools");

    if (tools) {

        tools.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   SHOW CALCULATOR
========================================================= */

function showCalculator() {

    const calculator =
        document.getElementById("calculator");

    if (calculator) {

        calculator.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}


/* =========================================================
   OPEN AI WITH A PRE-MADE QUESTION
========================================================= */

function openAIWithPrompt(prompt) {

    openAI();

    setTimeout(() => {

        if (!chatInput) {
            return;
        }

        chatInput.value = prompt;

        chatInput.focus();

    }, 350);

}


/* =========================================================
   AI SUGGESTION BUTTONS
========================================================= */

function useSuggestion(prompt) {

    if (!chatInput) {
        return;
    }

    chatInput.value = prompt;

    chatInput.focus();

    sendMessage();

}


/* =========================================================
   ADD USER MESSAGE
========================================================= */

function addUserMessage(message) {

    if (!chatMessages) {
        return;
    }

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


    messageBox.appendChild(label);

    messageBox.appendChild(text);

    chatMessages.appendChild(messageBox);

    scrollChatToBottom();

}


/* =========================================================
   ADD AI MESSAGE
========================================================= */

function addAIMessage(message) {

    if (!chatMessages) {
        return;
    }

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


    /*
       textContent is intentionally used instead
       of innerHTML for safer AI output.
    */

    text.textContent =
        message;


    messageBox.appendChild(label);

    messageBox.appendChild(text);

    chatMessages.appendChild(messageBox);

    scrollChatToBottom();

}


/* =========================================================
   SCROLL CHAT TO BOTTOM
========================================================= */

function scrollChatToBottom() {

    if (!chatMessages) {
        return;
    }

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/* =========================================================
   SHOW TYPING INDICATOR
========================================================= */

function showTyping() {

    if (!typingIndicator) {
        return;
    }

    typingIndicator.classList.add("active");

    scrollChatToBottom();

}


/* =========================================================
   HIDE TYPING INDICATOR
========================================================= */

function hideTyping() {

    if (!typingIndicator) {
        return;
    }

    typingIndicator.classList.remove("active");

}


/* =========================================================
   SEND AI MESSAGE
========================================================= */

async function sendMessage() {

    if (!chatInput) {
        return;
    }


    const message =
        chatInput.value.trim();


    /* Don't send empty messages */

    if (!message) {
        return;
    }


    /* Prevent duplicate requests */

    if (
        sendButton &&
        sendButton.disabled
    ) {
        return;
    }


    /* Add user's message */

    addUserMessage(message);


    /* Clear input */

    chatInput.value = "";


    /* Disable button */

    if (sendButton) {
        sendButton.disabled = true;
    }


    /* Show AI thinking */

    showTyping();


    try {

        console.log(
            "Sending message to /api/chat..."
        );


        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })
                }
            );


        /*
           Try to read JSON response.
        */

        let data = null;


        try {

            data =
                await response.json();

        } catch (jsonError) {

            console.error(
                "Could not read server response:",
                jsonError
            );

        }


        /* Hide typing */

        hideTyping();


        /*
           Check HTTP response.
        */

        if (!response.ok) {

            const serverError =
                data?.error ||
                "The AI server returned an error.";

            console.error(
                "AI server error:",
                serverError
            );


            addAIMessage(
                serverError
            );


            return;
        }


        /*
           Get AI reply.
        */

        const reply =
            data?.reply;


        if (
            typeof reply !== "string" ||
            !reply.trim()
        ) {

            console.error(
                "AI returned an empty response."
            );


            addAIMessage(
                "The AI returned an empty response. Please try again."
            );


            return;
        }


        /*
           Display AI response.
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
            "Sorry, I couldn't connect to the AI right now. Please check your internet connection and try again."
        );


    } finally {

        /*
           Re-enable send button.
        */

        if (sendButton) {
            sendButton.disabled = false;
        }


        /*
           Put cursor back in input.
        */

        if (chatInput) {
            chatInput.focus();
        }

    }

}


/* =========================================================
   ENTER KEY TO SEND
========================================================= */

if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        (event) => {

            /*
               Enter sends the message.
               Shift + Enter creates a new line.
            */

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    /*
       Automatically expand textarea slightly.
    */

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
   PROFIT CALCULATOR
========================================================= */

function calculateProfit() {

    /*
       Get the calculator inputs.
    */

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


    /*
       Check calculator elements.
    */

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


    /*
       Convert input values into numbers.
    */

    const revenue =
        Number(
            revenueElement.value
        );


    const expenses =
        Number(
            expenseElement.value
        );


    /*
       Validate numbers.
    */

    if (
        !Number.isFinite(revenue) ||
        !Number.isFinite(expenses)
    ) {

        resultElement.textContent =
            "Please enter valid numbers.";

        return;
    }


    /*
       Don't allow negative values.
    */

    if (
        revenue < 0 ||
        expenses < 0
    ) {

        resultElement.textContent =
            "Please enter positive numbers.";

        return;
    }


    /*
       Calculate profit.
    */

    const profit =
        revenue - expenses;


    /*
       Format as Nigerian Naira.
    */

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


    /*
       Display result.
    */

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


    /*
       Visual feedback.
    */

    resultElement.classList.add(
        "show"
    );


    /*
       Scroll calculator result
       into view slightly.
    */

    setTimeout(() => {

        resultElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }, 100);

}


/* =========================================================
   CALCULATOR ENTER KEY SUPPORT
========================================================= */

if (revenueInput) {

    revenueInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {
                calculateProfit();
            }

        }
    );

}


if (expenseInput) {

    expenseInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {
                calculateProfit();
            }

        }
    );

}


/* =========================================================
   SCROLL ANIMATION
========================================================= */

const sections =
    document.querySelectorAll(
        "main section"
    );


if (
    "IntersectionObserver" in window
) {

    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.08
            }
        );


    sections.forEach(
        (section) => {

            observer.observe(
                section
            );

        }
    );

}


/* =========================================================
   SMOOTH NAVIGATION
========================================================= */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (target) {

                        event.preventDefault();

                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }
            );

        }
    );


/* =========================================================
   FOOTER YEAR
========================================================= */

const currentYear =
    new Date().getFullYear();


document
    .querySelectorAll(
        "footer p"
    )
    .forEach(
        (element) => {

            if (
                element.textContent.includes(
                    "2026"
                )
            ) {

                element.textContent =
                    element.textContent.replace(
                        "2026",
                        currentYear
                    );

            }

        }
    );


/* =========================================================
   PAGE LOADED
========================================================= */

window.addEventListener(
    "load",
    () => {

        console.log(
            "✅ DENIS GODSON BUSINESS HUB V5 loaded."
        );

        console.log(
            "🤖 DG AI system ready."
        );

        console.log(
            "🧮 Profit calculator ready."
        );

    }
);