/* =========================================================
   DENIS GODSON BUSINESS HUB
   V5.2 SERVER
   Express + Groq AI
========================================================= */

require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();


/* =========================================================
   CONFIGURATION
========================================================= */

const PORT = process.env.PORT || 3000;

const GROQ_API_KEY =
    process.env.GROQ_API_KEY;


/* =========================================================
   BASIC MIDDLEWARE
========================================================= */

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);


/* =========================================================
   CORS
========================================================= */

app.use(
    (req, res, next) => {

        res.header(
            "Access-Control-Allow-Origin",
            "*"
        );

        res.header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        );

        res.header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );


        if (req.method === "OPTIONS") {

            return res.sendStatus(204);

        }


        next();

    }
);


/* =========================================================
   SERVE WEBSITE FILES
========================================================= */

app.use(
    express.static(
        path.join(__dirname)
    )
);


/* =========================================================
   HOME PAGE
========================================================= */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            status: "online",

            website:
                "DENIS GODSON BUSINESS HUB",

            version:
                "V5.2",

            ai:
                GROQ_API_KEY
                    ? "configured"
                    : "missing"

        });

    }
);


/* =========================================================
   SIMPLE ROOT HEALTH CHECK
========================================================= */

app.get(
    "/health",
    (req, res) => {

        res.json({

            status: "online",

            website:
                "DENIS GODSON BUSINESS HUB",

            version:
                "V5.2"

        });

    }
);


/* =========================================================
   AI ROUTE
   POST /ask
========================================================= */

app.post(
    "/ask",
    async (req, res) => {

        console.log(
            "================================="
        );

        console.log(
            "🤖 New AI request received"
        );


        try {

            /* -----------------------------------------
               CHECK API KEY
            ----------------------------------------- */

            if (!GROQ_API_KEY) {

                console.error(
                    "❌ GROQ_API_KEY is missing"
                );


                return res.status(500).json({

                    error:
                        "AI is not configured on the server. Please add GROQ_API_KEY in Render Environment Variables."

                });

            }


            /* -----------------------------------------
               GET QUESTION
            ----------------------------------------- */

            const question =
                typeof req.body?.question === "string"
                    ? req.body.question.trim()
                    : "";


            console.log(
                "Question:",
                question
            );


            /* -----------------------------------------
               VALIDATE QUESTION
            ----------------------------------------- */

            if (!question) {

                return res.status(400).json({

                    error:
                        "Please enter a question."

                });

            }


            /* -----------------------------------------
               LIMIT QUESTION SIZE
            ----------------------------------------- */

            if (question.length > 12000) {

                return res.status(400).json({

                    error:
                        "Your question is too long. Please shorten it and try again."

                });

            }


            console.log(
                "⏳ Sending request to Groq..."
            );


            /* -----------------------------------------
               GROQ API REQUEST
            ----------------------------------------- */

            const groqResponse =
                await fetch(
                    "https://api.groq.com/openai/v1/chat/completions",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${GROQ_API_KEY}`

                        },

                        body: JSON.stringify({

                            model:
                                model: "openai/gpt-oss-20b",

                            messages: [

                                {
                                    role:
                                        "system",

                                    content:
                                        `You are DG AI, the intelligent assistant inside DENIS GODSON BUSINESS HUB.

Your job is to help users with:
- Business ideas
- Entrepreneurship
- Business planning
- Marketing
- School subjects and learning
- Websites and apps
- Coding
- Technology
- Cybersecurity basics
- General questions

Give clear, useful and easy-to-understand answers.

For complicated topics, explain step by step.

Use headings, bullet points and numbered lists when useful.

Do not pretend to know something when you are unsure.

Be friendly, professional and concise.`
                                },

                                {
                                    role:
                                        "user",

                                    content:
                                        question
                                }

                            ],

                            temperature:
                                0.7,

                            max_completion_tokens:
                                2048

                        })

                    }
                );


            /* -----------------------------------------
               READ GROQ RESPONSE
            ----------------------------------------- */

            const responseText =
                await groqResponse.text();


            let groqData = null;


            try {

                groqData =
                    JSON.parse(
                        responseText
                    );

            } catch (parseError) {

                console.error(
                    "❌ Could not parse Groq response:"
                );

                console.error(
                    responseText
                );


                return res.status(502).json({

                    error:
                        "The AI service returned an invalid response."

                });

            }


            /* -----------------------------------------
               GROQ ERROR
            ----------------------------------------- */

            if (!groqResponse.ok) {

                console.error(
                    "❌ GROQ AI ERROR"
                );

                console.error(
                    "Status:",
                    groqResponse.status
                );

                console.error(
                    "Response:",
                    JSON.stringify(
                        groqData
                    )
                );


                const groqError =
                    groqData?.error?.message ||
                    "Groq AI returned an error.";


                return res.status(
                    groqResponse.status
                ).json({

                    error:
                        groqError

                });

            }


            /* -----------------------------------------
               GET AI ANSWER
            ----------------------------------------- */

            const answer =
                groqData
                    ?.choices?.[0]
                    ?.message
                    ?.content;


            if (
                typeof answer !== "string" ||
                !answer.trim()
            ) {

                console.error(
                    "❌ Groq returned no answer"
                );


                return res.status(502).json({

                    error:
                        "The AI returned an empty response."

                });

            }


            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            console.log(
                "✅ AI response received"
            );


            console.log(
                "================================="
            );


            return res.json({

                answer:
                    answer.trim()

            });

        }

        catch (error) {

            console.error(
                "================================="
            );

            console.error(
                "❌ SERVER / AI ERROR"
            );

            console.error(
                "Error name:",
                error.name
            );

            console.error(
                "Error message:",
                error.message
            );

            console.error(
                "================================="
            );


            return res.status(500).json({

                error:
                    "The AI service could not be reached right now. Please try again."

            });

        }

    }
);


/* =========================================================
   404 HANDLER
========================================================= */

app.use(
    (req, res) => {

        console.log(
            "404:",
            req.method,
            req.originalUrl
        );


        res.status(404).json({

            error:
                "Route not found."

        });

    }
);


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
    (error, req, res, next) => {

        console.error(
            "❌ Unhandled server error:",
            error
        );


        res.status(500).json({

            error:
                "Internal server error."

        });

    }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            "================================="
        );

        console.log(
            "🚀 DENIS GODSON BUSINESS HUB"
        );

        console.log(
            "📦 Version: V5.2"
        );

        console.log(
            `🌐 Server running on port ${PORT}`
        );

        console.log(
            "🤖 DG AI: Groq"
        );

        console.log(
            "🔗 AI endpoint: POST /ask"
        );

        console.log(
            "❤️ Health: GET /api/health"
        );

        console.log(
            GROQ_API_KEY
                ? "🔑 GROQ API KEY: configured"
                : "⚠️ GROQ API KEY: MISSING"
        );

        console.log(
            "================================="

        );

    }
);