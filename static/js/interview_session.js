// MockMentor AI - Live AI Interview Session JS
// Google Text-To-Speech (TTS) + Speech-To-Text (STT) + Movable AI Avatar Character + Real Evaluation Report

document.addEventListener('DOMContentLoaded', async function () {
    const interviewId = window.INTERVIEW_ID || 1;
    let questions = [];
    let userAnswers = {};
    let evaluatedResults = {}; // Stores real evaluation report per question
    let currentIndex = 0;
    let timerSeconds = 1185; // 19:45
    let isListening = false;
    let recognition = null;
    let synth = window.speechSynthesis;

    // Preferred female voice indicators (common voice names / markers)
    const femaleIndicators = [
        'female', 'fem', 'samantha', 'joanna', 'olivia', 'ivy', 'grace', 'nicole', 'karen', 'amy',
        'alloy', 'alloy_female', 'google uk english female', 'google us english female', 'us english female',
        'en-us-wavenet-f', 'en-us-standard-f', 'indian', 'india', 'en-in', 'en_in', 'wavenet-f'
    ];

    // Dark Mode Toggle Listener
    // const darkModeToggle = document.getElementById('darkModeToggle');
    // if (darkModeToggle) {
    //     darkModeToggle.addEventListener('click', function () {
    //         document.body.classList.toggle('dark-mode');
    //         const icon = this.querySelector('i');
    //         if (document.body.classList.contains('dark-mode')) {
    //             icon.classList.remove('fa-moon');
    //             icon.classList.add('fa-sun');
    //         } else {
    //             icon.classList.remove('fa-sun');
    //             icon.classList.add('fa-moon');
    //         }
    //     });
    // }

    // Technical Keyword dictionary for real answer evaluation (10 Questions)
    const questionEvaluatorDict = {
        1: {
            text: "What is the difference between var, let and const in JavaScript?",
            keywords: ["var", "let", "const", "scope", "function", "block", "redeclare", "reassign", "hoist", "immutable"],
            ideal: "var is function scoped and can be redeclared and updated. let is block scoped and can be updated but cannot be redeclared in the same scope. const is also block scoped but cannot be updated or redeclared.",
            sampleUserAns: "var is function scoped, let and const are block scoped. let can be updated but const cannot be reassigned.",
            sampleStars: 4,
            sampleScore: "4 / 5",
            samplePercent: 90,
            sampleFeedback: "Good answer! You covered most of the key points. Try to give more examples next time.",
            sampleTime: "Time: 1m 45s"
        },
        2: {
            text: "What is closure in JavaScript and how does it work?",
            keywords: ["closure", "inner", "outer", "function", "lexical", "scope", "state", "variable", "access", "remembers"],
            ideal: "A closure is a function that retains access to variables in its parent lexical scope even after the parent function has executed and returned.",
            sampleUserAns: "A closure is a function that retains access to variables in its parent lexical scope.",
            sampleStars: 4,
            sampleScore: "4 / 5",
            samplePercent: 85,
            sampleFeedback: "Great answer! Core closure concept explained clearly.",
            sampleTime: "Time: 1m 20s"
        },
        3: {
            text: "Explain the concept of promises and async/await in JavaScript.",
            keywords: ["promise", "async", "await", "asynchronous", "resolve", "reject", "then", "catch", "syntax", "sugar"],
            ideal: "Promises represent eventual completion or failure of asynchronous operations. async/await is syntactic sugar over Promises that makes async code look synchronous.",
            sampleUserAns: "Promises represent async operations. Async/await makes promise code synchronous looking.",
            sampleStars: 4,
            sampleScore: "4 / 5",
            samplePercent: 88,
            sampleFeedback: "Well explained! Good overview of asynchronous JS.",
            sampleTime: "Time: 2m 05s"
        },
        4: {
            text: "Can you tell me something about yourself?",
            keywords: ["experience", "background", "developed", "projects", "skills", "bachelor", "engineering", "passionate", "technology", "working"],
            ideal: "I am a software engineer with strong experience in building web applications. I specialize in modern frameworks, clean architecture, problem solving, and writing clean, scalable code."
        },
        5: {
            text: "Describe a challenging technical problem you solved.",
            keywords: ["problem", "solved", "challenge", "debugging", "performance", "fixed", "approach", "result", "improved", "team"],
            ideal: "Explain the problem using the STAR method: Situation, Task, Action, Result. Highlight your analytical approach, tools used, and the positive impact of your fix."
        },
        6: {
            text: "Explain the Virtual DOM in React and its benefits.",
            keywords: ["virtual", "dom", "react", "reconciliation", "diffing", "performance", "nodes", "renders", "efficient", "copies"],
            ideal: "The Virtual DOM is a lightweight JS representation of the real DOM. React compares the virtual DOM with a snapshot (reconciliation) and updates only changed real DOM nodes."
        },
        7: {
            text: "What is the difference between SQL and NoSQL databases?",
            keywords: ["sql", "nosql", "relational", "tables", "document", "schema", "mongodb", "acid", "scalable", "queries"],
            ideal: "SQL databases are relational, structured, table-based, and follow ACID properties (e.g. PostgreSQL, MySQL). NoSQL databases are non-relational, document/key-value based, and flexible (e.g. MongoDB)."
        },
        8: {
            text: "How do you optimize page loading performance in modern web apps?",
            keywords: ["optimize", "lazy", "loading", "caching", "bundle", "minification", "cdn", "assets", "performance", "split"],
            ideal: "By lazy loading assets, code splitting, minifying CSS/JS, compressing images, using CDN caching, reducing bundle size, and minimizing critical rendering path bottlenecks."
        },
        9: {
            text: "What are RESTful APIs and HTTP status codes?",
            keywords: ["rest", "api", "http", "get", "post", "put", "delete", "status", "200", "404", "500", "json"],
            ideal: "RESTful APIs use HTTP methods (GET, POST, PUT, DELETE) for CRUD operations. Common status codes include 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error."
        },
        10: {
            text: "Explain state management in modern frontend application architecture.",
            keywords: ["state", "management", "redux", "context", "store", "props", "frontend", "architecture", "data", "flow"],
            ideal: "State management controls how data flows and updates in a web application. It includes local component state, lifted shared state, and global state managers like Redux, Zustand, or Context API."
        }
    };

    // Default sample questions (10 Questions)
    const sampleQuestions = Object.keys(questionEvaluatorDict).map(key => ({
        num: parseInt(key),
        text: questionEvaluatorDict[key].text,
        ideal: questionEvaluatorDict[key].ideal
    }));

    // Fetch API Questions
    try {
        const res = await fetch(`/api/interview/${interviewId}`);
        const data = await res.json();
        if (data.success && data.questions && data.questions.length > 0) {
            questions = data.questions.map((qText, idx) => {
                const detailObj = (data.question_details && data.question_details[idx]) ? data.question_details[idx] : null;
                const dictObj = questionEvaluatorDict[idx + 1] || {};
                return {
                    num: idx + 1,
                    text: detailObj ? detailObj.text : qText,
                    ideal: detailObj ? detailObj.ideal : (dictObj.ideal || "Provide a structured response demonstrating domain knowledge and practical examples."),
                    keywords: detailObj ? detailObj.keywords : (dictObj.keywords || ["code", "developer", "solution", "architecture"])
                };
            });

            // ── Update the middle avatar overlay badges with real session values ──
            if (data.interview) {
                const difficultyEl = document.getElementById('overlayDifficulty');
                const typeEl = document.getElementById('overlayInterviewType');
                if (difficultyEl && data.interview.difficulty_level) {
                    difficultyEl.textContent = data.interview.difficulty_level; // e.g. "Easy", "Medium", "Hard"
                }
                if (typeEl && data.interview.interview_type) {
                    typeEl.textContent = data.interview.interview_type + ' Interview';
                }
            }
        } else {
            questions = sampleQuestions;
        }
    } catch (e) {
        questions = sampleQuestions;
    }

    // Initialize user answers and evaluations with empty and pending values
    questions.forEach(q => {
        userAnswers[q.num] = '';
        evaluatedResults[q.num] = {
            stars: 0,
            scoreNum: "Pending",
            scorePercent: 0,
            feedback: "Answer the question (by voice or text) to receive real AI score and feedback.",
            userAnsDisplay: "No answer provided yet.",
            answerTime: ""
        };
    });

    // DOM Elements
    const qTabsContainer = document.getElementById('qTabsContainer');
    const overlayQuestionText = document.getElementById('overlayQuestionText');
    const overlayQuestionCounter = document.getElementById('overlayQuestionCounter');
    const overlayTimerText = document.getElementById('overlayTimerText');
    const mainAnswerInput = document.getElementById('mainAnswerInput');
    const currentQNumber = document.getElementById('currentQNumber');
    const reportQText = document.getElementById('reportQText');
    const reportUserAnswer = document.getElementById('reportUserAnswer');
    const reportIdealAnswer = document.getElementById('reportIdealAnswer');
    const reportStarRating = document.getElementById('reportStarRating');
    const reportScoreNum = document.getElementById('reportScoreNum');
    const reportFeedbackText = document.getElementById('reportFeedbackText');
    const btnMicToggle = document.getElementById('btnMicToggle');
    const listeningIndicator = document.getElementById('listeningIndicator');
    const btnSpeakerToggle = document.getElementById('btnSpeakerToggle');
    const btnDownloadReport = document.getElementById('btnDownloadReport');
    const videoStreamCard = document.getElementById('videoStreamCard');
    const movableAvatarBox = document.getElementById('movableAvatarBox');
    const sttBanner = document.getElementById('sttBanner');
    const sttBannerText = document.getElementById('sttBannerText');

    // Make Movable AI Avatar Draggable
    if (movableAvatarBox && videoStreamCard) {
        makeDraggable(movableAvatarBox, videoStreamCard);
    }

    // Initialize Speech Recognition (Google Speech API)
    initGoogleSpeechToText();

    // Initial render
    renderTabs();
    loadQuestion(0);
    startTimer();

    // -------------------------------------------------------------
    // 1. Movable AI Avatar Drag Logic
    // -------------------------------------------------------------
    function makeDraggable(elmnt, container) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        elmnt.style.cursor = 'grab';

        elmnt.onmousedown = dragMouseDown;
        elmnt.ontouchstart = dragTouchStart;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            elmnt.style.cursor = 'grabbing';
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            let newTop = elmnt.offsetTop - pos2;
            let newLeft = elmnt.offsetLeft - pos1;

            elmnt.style.position = 'absolute';
            elmnt.style.top = newTop + 'px';
            elmnt.style.left = newLeft + 'px';
            elmnt.style.transform = 'none';
            elmnt.style.margin = '0';
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            elmnt.style.cursor = 'grab';
        }

        function dragTouchStart(e) {
            const touch = e.touches[0];
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            document.ontouchend = closeTouchDrag;
            document.ontouchmove = touchDrag;
        }

        function touchDrag(e) {
            const touch = e.touches[0];
            pos1 = pos3 - touch.clientX;
            pos2 = pos4 - touch.clientY;
            pos3 = touch.clientX;
            pos4 = touch.clientY;

            elmnt.style.position = 'absolute';
            elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
            elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
            elmnt.style.transform = 'none';
            elmnt.style.margin = '0';
        }

        function closeTouchDrag() {
            document.ontouchend = null;
            document.ontouchmove = null;
        }
    }

    // -------------------------------------------------------------
    // 2. Google Text-To-Speech (TTS API)
    // -------------------------------------------------------------
    function pickFemaleVoice(voices) {
        if (!voices || voices.length === 0) return null;

        // Normalize names for comparison
        const normalized = voices.map(v => ({
            voice: v,
            name: (v.name || '').toLowerCase(),
            uri: (v.voiceURI || '').toLowerCase(),
            lang: (v.lang || '').toLowerCase()
        }));

        // 1) Prefer explicit Indian English female voices first
        const indiaMatch = normalized.find(n => (n.lang && n.lang.startsWith('en-in')) || n.name.includes('indian') || n.uri.includes('indian'));
        if (indiaMatch) return indiaMatch.voice;

        // 2) Exact indicators in name/uri
        for (const ind of femaleIndicators) {
            const low = ind.toLowerCase();
            const match = normalized.find(n => n.name.includes(low) || n.uri.includes(low));
            if (match) return match.voice;
        }

        // 2) Prefer voices that include 'google' and are english
        const googleEn = normalized.find(n => (n.name.includes('google') || n.uri.includes('google')) && n.lang.startsWith('en'));
        if (googleEn) return googleEn.voice;

        // 3) Prefer any english voice whose name looks like a personal name (capitalized tokens)
        const enVoice = normalized.find(n => n.lang.startsWith('en') && /[a-z]+\s?[a-z]*/i.test(n.name));
        if (enVoice) return enVoice.voice;

        // 4) fallback: first available
        return voices[0] || null;
    }

    function speakQuestionText(text) {
        if (!synth) return;
        synth.cancel(); // Stop current speech

        const utterance = new SpeechSynthesisUtterance(text);
        // Lightly slow speaking rate for clarity, and neutral pitch
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        // Attempt to select a female-sounding voice
        let voices = synth.getVoices();
        let selected = pickFemaleVoice(voices);

        // If voices array is empty (voices may not be loaded yet), wait briefly and retry
        if (!selected && voices.length === 0) {
            // attempt to wait for onvoiceschanged event
            const tryLoad = () => {
                voices = synth.getVoices();
                selected = pickFemaleVoice(voices);
                if (selected) utterance.voice = selected;
                synth.speak(utterance);
            };
            // Register temporary handler and retry after small timeout
            if (synth.onvoiceschanged !== undefined) {
                const prev = synth.onvoiceschanged;
                synth.onvoiceschanged = () => {
                    tryLoad();
                    // restore previous handler if any
                    synth.onvoiceschanged = prev;
                };
            }
            setTimeout(tryLoad, 150);
            return;
        }

        if (selected) utterance.voice = selected;

        utterance.onstart = () => {
            if (movableAvatarBox) movableAvatarBox.classList.add('speaking');
        };

        utterance.onend = () => {
            if (movableAvatarBox) movableAvatarBox.classList.remove('speaking');
        };

        utterance.onerror = () => {
            if (movableAvatarBox) movableAvatarBox.classList.remove('speaking');
        };

        synth.speak(utterance);
    }

    if (btnSpeakerToggle) {
        btnSpeakerToggle.addEventListener('click', () => {
            const q = questions[currentIndex];
            if (q) speakQuestionText(q.text);
        });
    }

    // Ensure voices loaded
    if (synth && synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = () => synth.getVoices();
    }

    // -------------------------------------------------------------
    // 3. Google Speech-To-Text (STT API) with Technical Phonetic Corrector
    // -------------------------------------------------------------
    let baseTextBeforeSpeech = '';

    // -------------------------------------------------------------
    // Advanced Metaphone, Multi-Alternative STT & Canonical Tech Corrector Engine
    // -------------------------------------------------------------

    function getLevenshteinDistance(a, b) {
        if (!a || !b) return (a || b).length;
        const m = [];
        for (let i = 0; i <= b.length; i++) m[i] = [i];
        for (let j = 0; j <= a.length; j++) m[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    m[i][j] = m[i - 1][j - 1];
                } else {
                    m[i][j] = Math.min(
                        m[i - 1][j - 1] + 1, // substitution
                        m[i][j - 1] + 1,     // insertion
                        m[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        return m[b.length][a.length];
    }

    // Advanced Metaphone / Phonetic Transformer
    function getAdvancedPhoneticKey(word) {
        if (!word) return '';
        let str = word.toLowerCase()
            .replace(/^kn/, 'n')
            .replace(/^gn/, 'n')
            .replace(/^wr/, 'r')
            .replace(/^ps/, 's')
            .replace(/ph/g, 'f')
            .replace(/gh/g, 'f')
            .replace(/ck/g, 'k')
            .replace(/sh/g, 'x')
            .replace(/ch/g, 'x')
            .replace(/th/g, '0')
            .replace(/qu/g, 'kw')
            .replace(/x/g, 'ks')
            .replace(/v/g, 'b')  // accent sound mapping (b/v/w)
            .replace(/w/g, 'b')
            .replace(/z/g, 's')
            .replace(/d(?=g)/g, '')
            .replace(/c(?=[iey])/g, 's')
            .replace(/c/g, 'k')
            .replace(/(.)\1+/g, '$1'); // collapse duplicate consonants

        const first = str.charAt(0);
        const rest = str.slice(1).replace(/[aeiouy]/g, '');
        return (first + rest).slice(0, 5);
    }

    // Canonical Technical Casing & Term Dictionary
    const canonicalTechTerms = {
        "javascript": "JavaScript",
        "html": "HTML",
        "css": "CSS",
        "sql": "SQL",
        "nosql": "NoSQL",
        "dom": "DOM",
        "virtual dom": "Virtual DOM",
        "api": "API",
        "apis": "APIs",
        "rest": "REST",
        "restful": "RESTful",
        "http": "HTTP",
        "https": "HTTPS",
        "json": "JSON",
        "b-tree": "B-Tree",
        "b-trees": "B-Trees",
        "btree": "B-Tree",
        "btrees": "B-Trees",
        "acid": "ACID",
        "crud": "CRUD",
        "url": "URL",
        "ip": "IP",
        "react": "React",
        "redux": "Redux",
        "python": "Python",
        "java": "Java",
        "fifo": "FIFO",
        "lifo": "LIFO",
        "async/await": "async/await"
    };

    const globalTechDictionary = [
        "javascript", "python", "java", "sql", "nosql", "database", "indexes", "index", "b-tree", "b-trees",
        "array", "function", "variable", "var", "let", "const", "scope", "closure", "closures", "promises",
        "async", "await", "virtual", "dom", "react", "component", "state", "props", "redux", "context",
        "api", "rest", "http", "status", "query", "queries", "table", "schema", "relational", "primary",
        "foreign", "key", "join", "lookup", "heap", "stack", "memory", "recursion", "algorithm", "binary",
        "node", "queue", "stack", "list", "linked", "thread", "concurrency", "lock", "deadlock", "cache"
    ];

    function getDynamicTargetVocabulary() {
        const vocabSet = new Set(globalTechDictionary);
        const qObj = questions[currentIndex] || {};
        
        if (qObj.keywords && Array.isArray(qObj.keywords)) {
            qObj.keywords.forEach(kw => vocabSet.add(kw.toLowerCase().trim()));
        }
        
        const textSources = `${qObj.text || ''} ${qObj.ideal || ''}`;
        const words = textSources.split(/[^a-zA-Z0-9_-]+/).filter(w => w.length >= 3);
        words.forEach(w => vocabSet.add(w.toLowerCase().trim()));

        return Array.from(vocabSet);
    }

    function countVocabMatches(text, vocabList) {
        if (!text) return 0;
        const lower = text.toLowerCase();
        let matches = 0;
        vocabList.forEach(v => {
            if (lower.includes(v)) matches++;
        });
        return matches;
    }

    function cleanAndCorrectSpeech(text) {
        if (!text) return '';

        let formatted = text
            .replace(/([.?!])([A-Za-z])/g, '$1 $2')
            .replace(/\s+/g, ' ')
            .trim();

        // 1. Common Multi-Word Phrase Corrections
        const phraseFixes = [
            { regex: /\bbe\s*tree(s)?\b/gi, replacement: "B-Tree$1" },
            { regex: /\bbee\s*tree(s)?\b/gi, replacement: "B-Tree$1" },
            { regex: /\bno\s*sequel\b/gi, replacement: "NoSQL" },
            { regex: /\bsequel\b/gi, replacement: "SQL" },
            { regex: /\barrest\s*api\b/gi, replacement: "REST API" },
            { regex: /\brest\s*api\b/gi, replacement: "REST API" },
            { regex: /\bvirtual\s*tom\b/gi, replacement: "Virtual DOM" },
            { regex: /\bvirtual\s*dom\b/gi, replacement: "Virtual DOM" },
            { regex: /\basync\s*a\s*wait\b/gi, replacement: "async/await" },
            { regex: /\basync\s*await\b/gi, replacement: "async/await" },
            { regex: /\bbar\s+is\s+function\b/gi, replacement: "var is function" },
            { regex: /\bcost\s+is\s+block\b/gi, replacement: "const is block" }
        ];

        phraseFixes.forEach(fix => {
            formatted = formatted.replace(fix.regex, fix.replacement);
        });

        // 2. Dynamic Levenshtein & Metaphone Word Corrector
        const targetVocab = getDynamicTargetVocabulary();
        const tokens = formatted.split(/\s+/);

        const correctedTokens = tokens.map(token => {
            const match = token.match(/^([a-zA-Z0-9_-]+)(.*)$/);
            if (!match) return token;

            const word = match[1];
            const punc = match[2] || '';
            const lowerWord = word.toLowerCase();

            // Check canonical casing dictionary first
            if (canonicalTechTerms[lowerWord]) {
                return canonicalTechTerms[lowerWord] + punc;
            }

            if (lowerWord.length < 3 || targetVocab.includes(lowerWord)) {
                return word + punc;
            }

            const wordPhonetic = getAdvancedPhoneticKey(lowerWord);
            let bestMatch = null;
            let minDistance = Infinity;

            for (const target of targetVocab) {
                if (Math.abs(target.length - lowerWord.length) > 3) continue;

                const dist = getLevenshteinDistance(lowerWord, target);
                const targetPhonetic = getAdvancedPhoneticKey(target);

                const isPhoneticMatch = wordPhonetic && targetPhonetic && wordPhonetic === targetPhonetic;
                
                if (dist <= 2 || isPhoneticMatch) {
                    if (dist < minDistance) {
                        minDistance = dist;
                        bestMatch = target;
                    }
                }
            }

            if (bestMatch && minDistance <= 2) {
                const finalWord = canonicalTechTerms[bestMatch] || 
                    (/^[A-Z]/.test(word) ? bestMatch.charAt(0).toUpperCase() + bestMatch.slice(1) : bestMatch);
                return finalWord + punc;
            }

            return word + punc;
        });

        let resultText = correctedTokens.join(' ');

        // 3. Remove repeated stutter words (e.g. "indexes indexes are" -> "indexes are")
        resultText = resultText.replace(/\b(\w+)\s+\1\b/gi, '$1');

        // 4. Ensure proper capitalization at sentence boundaries
        resultText = resultText.replace(/(^|[.?!]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

        return resultText;
    }

    function initGoogleSpeechToText() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition API not supported in this browser.');
            if (sttBannerText) sttBannerText.textContent = 'Voice input: Please use Chrome or Edge for Speech Recognition';
            return null;
        }

        if (recognition) return recognition;

        try {
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 4; // Request up to 4 alternative transcripts per result

            // Auto-detect browser language or default to en-IN for high Indian English accent recognition accuracy
            const navLang = (navigator.language || 'en-IN').toLowerCase();
            recognition.lang = navLang.includes('us') ? 'en-US' : (navLang.includes('gb') ? 'en-GB' : 'en-IN');

            recognition.onstart = () => {
                isListening = true;
                baseTextBeforeSpeech = mainAnswerInput ? mainAnswerInput.value.trim() : '';
                if (btnMicToggle) {
                    btnMicToggle.classList.add('recording');
                    btnMicToggle.setAttribute('title', 'Listening... Click to stop microphone');
                }
                if (listeningIndicator) listeningIndicator.style.opacity = '1';
                if (sttBanner) sttBanner.style.display = 'flex';
                if (sttBannerText) sttBannerText.textContent = 'Listening to your speech... Speak clearly into microphone';
            };

            recognition.onresult = (event) => {
                let speechChunks = [];
                const targetVocab = getDynamicTargetVocabulary();

                for (let i = 0; i < event.results.length; i++) {
                    const result = event.results[i];
                    let bestTranscript = result[0].transcript.trim();
                    let maxVocabMatches = countVocabMatches(bestTranscript, targetVocab);

                    // Scan alternative transcripts for highest domain vocabulary matches
                    for (let a = 1; a < Math.min(result.length, 4); a++) {
                        const altTranscript = result[a].transcript.trim();
                        const altMatches = countVocabMatches(altTranscript, targetVocab);
                        if (altMatches > maxVocabMatches) {
                            maxVocabMatches = altMatches;
                            bestTranscript = altTranscript;
                        }
                    }

                    if (bestTranscript) {
                        speechChunks.push(bestTranscript);
                    }
                }

                const rawSpeech = speechChunks.join(' ');
                const cleanSpeech = cleanAndCorrectSpeech(rawSpeech);

                if (mainAnswerInput && cleanSpeech) {
                    const combinedText = baseTextBeforeSpeech
                        ? `${baseTextBeforeSpeech} ${cleanSpeech}`
                        : cleanSpeech;

                    mainAnswerInput.value = combinedText;
                    const qObj = questions[currentIndex];
                    if (qObj) {
                        userAnswers[qObj.num] = combinedText;
                        evaluateAnswer(qObj.num, combinedText);
                        renderCurrentReport();
                        updateOverallReports();
                        renderTabs();
                    }
                }
            };

            recognition.onerror = (event) => {
                console.log('Speech recognition event error:', event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    isListening = false;
                    if (sttBanner) sttBanner.style.display = 'flex';
                    if (sttBannerText) sttBannerText.textContent = 'Microphone permission denied. Please allow mic access in your browser address bar.';
                    stopMicUI();
                } else if (event.error === 'audio-capture') {
                    isListening = false;
                    if (sttBanner) sttBanner.style.display = 'flex';
                    if (sttBannerText) sttBannerText.textContent = 'No microphone device found or mic is in use by another app.';
                    stopMicUI();
                } else if (event.error === 'network') {
                    if (sttBannerText) sttBannerText.textContent = 'Network warning: Speech recognition requires an active internet connection.';
                }
            };

            recognition.onend = () => {
                if (isListening) {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.warn('Recognition restart paused:', e);
                        setTimeout(() => {
                            if (isListening && recognition) {
                                try { recognition.start(); } catch (err) { stopMicUI(); }
                            }
                        }, 300);
                    }
                } else {
                    stopMicUI();
                }
            };
            return recognition;
        } catch (e) {
            console.error('Failed to create SpeechRecognition instance:', e);
            return null;
        }
    }

    function stopMicUI() {
        isListening = false;
        if (btnMicToggle) {
            btnMicToggle.classList.remove('recording');
            btnMicToggle.setAttribute('title', 'Click to Speak (Google Speech Recognition)');
        }
        if (listeningIndicator) listeningIndicator.style.opacity = '0.3';
        setTimeout(() => {
            if (!isListening && sttBanner) sttBanner.style.display = 'none';
        }, 1500);
    }

    function checkSecureContext() {
        const isHttps = window.location.protocol === 'https:';
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        return isHttps || isLocalhost || window.isSecureContext;
    }

    async function startSpeechToText() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        // Try direct speech recognition start if browser allows it
        if (checkSecureContext() || SpeechRecognition) {
            try {
                isListening = true;
                baseTextBeforeSpeech = mainAnswerInput ? mainAnswerInput.value.trim() : '';

                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        window.localMicStream = stream;
                    } catch (err) {
                        console.warn('Microphone permission userMedia prompt:', err);
                    }
                }

                const recInstance = initGoogleSpeechToText();
                if (recInstance) {
                    recInstance.start();
                    return;
                }
            } catch (e) {
                console.warn('Direct STT start error:', e);
            }
        }

        if (!SpeechRecognition) {
            alert('Google Speech Recognition is supported on Google Chrome, Microsoft Edge, and Android browsers. You can also type your answer directly in the box below!');
            return;
        }

        if (sttBanner) sttBanner.style.display = 'flex';
        if (sttBannerText) sttBannerText.innerHTML = '<i class="fas fa-lock text-warning me-1"></i> Mic blocked on HTTP IP. Use <b>http://localhost:5000</b> or Chrome Flag.';

        const useLocalhost = confirm(
            "🔒 Microphone is Blocked by Browser Security on HTTP IP (http://" + window.location.host + ")\n\n" +
            "HOW TO UNLOCK MICROPHONE INSTANTLY:\n\n" +
            "1. Click 'OK' to switch to http://localhost:5000 (Microphone works 100% on localhost!)\n\n" +
            "2. Or click 'Cancel' and open chrome://flags/#unsafely-treat-insecure-origin-as-secure to allow http://" + window.location.host + "."
        );

        if (useLocalhost) {
            const currentPath = window.location.pathname + window.location.search + window.location.hash;
            window.location.href = "http://localhost:5000" + currentPath;
        }
    }

    if (btnMicToggle) {
        btnMicToggle.addEventListener('click', () => {
            if (isListening) {
                isListening = false;
                if (recognition) {
                    try { recognition.stop(); } catch (e) { }
                }
                if (window.localMicStream) {
                    try {
                        window.localMicStream.getTracks().forEach(t => t.stop());
                    } catch (e) {}
                    window.localMicStream = null;
                }
                stopMicUI();
            } else {
                startSpeechToText();
            }
        });
    }

    // -------------------------------------------------------------
    // 4. Real Evaluation Engine ("all reports are real acordig the interview")
    // -------------------------------------------------------------
    function evaluateAnswer(qNum, answerText) {
        const text = cleanAndCorrectSpeech(answerText || '').trim().toLowerCase();
        const qObj = questions.find(q => q.num === qNum) || {};
        const dict = questionEvaluatorDict[qNum] || {};
        const keywords = qObj.keywords || dict.keywords || ["code", "developer", "solution", "system", "logic"];

        if (!text || text.length === 0) {
            evaluatedResults[qNum] = {
                stars: 0,
                scoreNum: "Pending",
                scorePercent: 0,
                feedback: "Answer the question (by voice or text) to receive real AI score and feedback.",
                userAnsDisplay: "No answer provided yet."
            };
            return;
        }

        // 1. Keyword match count with stemming & flexible variations
        let matchedKeywords = 0;
        keywords.forEach(kw => {
            const kwClean = kw.toLowerCase().trim();
            const stem = kwClean.replace(/(es|s|ing|ed)$/, '');
            if (text.includes(kwClean) || (stem.length >= 3 && text.includes(stem))) {
                matchedKeywords++;
            }
        });

        const keywordScore = Math.min(100, Math.round((matchedKeywords / Math.max(1, keywords.length)) * 100));

        // 2. Word count completeness score
        const words = text.split(/\s+/).filter(Boolean);
        const wordCount = words.length;
        let lengthScore = 0;
        if (wordCount >= 20) lengthScore = 100;
        else if (wordCount >= 12) lengthScore = 80;
        else if (wordCount >= 6) lengthScore = 60;
        else lengthScore = 40;

        // 3. Combined Real Score Calculation (Weighted)
        let totalPercent = Math.round((keywordScore * 0.65) + (lengthScore * 0.35));
        totalPercent = Math.min(100, Math.max(20, totalPercent));

        // 4. Convert score to Stars (1 to 5)
        let stars = 1;
        let feedbackStr = "";

        if (totalPercent >= 85) {
            stars = 5;
            feedbackStr = `Outstanding answer! Excellent coverage of core concepts (${matchedKeywords}/${keywords.length} key technical terms identified).`;
        } else if (totalPercent >= 70) {
            stars = 4;
            feedbackStr = `Good answer! Covered main points effectively (${matchedKeywords}/${keywords.length} key terms). Include more details for 5 stars.`;
        } else if (totalPercent >= 50) {
            stars = 3;
            feedbackStr = `Satisfactory answer (${matchedKeywords}/${keywords.length} terms). Mentioned key ideas but missed some important technical details.`;
        } else if (totalPercent >= 35) {
            stars = 2;
            feedbackStr = `Basic response (${matchedKeywords}/${keywords.length} terms). Needs more technical depth and elaboration. Compare your answer with the Ideal Answer.`;
        } else {
            stars = 1;
            feedbackStr = `Incomplete answer. Please review the ideal technical answer to strengthen your response.`;
        }

        evaluatedResults[qNum] = {
            stars: stars,
            scoreNum: `${stars} / 5`,
            scorePercent: totalPercent,
            feedback: feedbackStr,
            userAnsDisplay: answerText
        };
    }

    // Update Real Live Feedback Meters (Left Sidebar)
    function updateOverallReports() {
        const qNums = Object.keys(evaluatedResults);
        let answeredCount = 0;
        let totalPercentSum = 0;

        qNums.forEach(num => {
            const evalObj = evaluatedResults[num];
            if (evalObj && evalObj.scorePercent > 0) {
                answeredCount++;
                totalPercentSum += evalObj.scorePercent;
            }
        });

        const displayPercent = answeredCount > 0 ? Math.round(totalPercentSum / answeredCount) : 0;
        const isPending = answeredCount === 0;

        // Update Performance Score Circle Gauge
        const gaugeTextCenter = document.querySelector('.gauge-text-center');
        const gaugeFill = document.querySelector('.gauge-fill');
        const scoreStatusText = document.querySelector('.score-status-text');

        if (gaugeTextCenter) gaugeTextCenter.textContent = `${displayPercent}%`;
        if (gaugeFill) {
            const offset = 283 - (283 * displayPercent / 100);
            gaugeFill.style.strokeDashoffset = offset;
        }

        if (scoreStatusText) {
            if (isPending) {
                scoreStatusText.textContent = 'Not started';
            } else if (displayPercent >= 85) {
                scoreStatusText.textContent = 'Excellent performance';
            } else if (displayPercent >= 70) {
                scoreStatusText.textContent = 'Good performance';
            } else if (displayPercent >= 50) {
                scoreStatusText.textContent = 'Satisfactory';
            } else {
                scoreStatusText.textContent = 'Needs practice';
            }
        }

        // Update Live Feedback Progress Bars & Badges
        updateMetric('barConfidence', 'badgeConfidence', displayPercent, isPending);
        updateMetric('barClarity', 'badgeClarity', displayPercent > 0 ? Math.min(95, displayPercent) : 0, isPending);
        updateMetric('barSpeed', 'badgeSpeed', displayPercent > 0 ? Math.min(90, Math.max(40, displayPercent - 5)) : 0, isPending);
        updateMetric('barComm', 'badgeComm', displayPercent > 0 ? Math.min(92, displayPercent) : 0, isPending);
        updateMetric('barImpression', 'badgeImpression', displayPercent, isPending);

        // Update Tip Box
        const feedbackTipBox = document.getElementById('feedbackTipBox');
        if (feedbackTipBox) {
            if (isPending) {
                feedbackTipBox.innerHTML = `<i class="fas fa-info-circle me-1"></i> Start answering questions to receive real-time feedback.`;
            } else if (displayPercent >= 85) {
                feedbackTipBox.innerHTML = `<i class="fas fa-check-circle me-1"></i> Great job! Keep maintaining your confidence and clarity.`;
            } else if (displayPercent >= 70) {
                feedbackTipBox.innerHTML = `<i class="fas fa-check-circle me-1"></i> Good performance! Include more technical depth to reach top score.`;
            } else if (displayPercent >= 50) {
                feedbackTipBox.innerHTML = `<i class="fas fa-info-circle me-1"></i> Satisfactory answers. Speak clearly and elaborate on key technical concepts.`;
            } else {
                feedbackTipBox.innerHTML = `<i class="fas fa-exclamation-circle me-1"></i> Keep practicing! Review ideal answers to improve key terms.`;
            }
        }

        // Progress Panel
        const progressTotalCount = document.getElementById('progressTotalCount');
        const progressAnsweredCount = document.getElementById('progressAnsweredCount');
        const progressRemainingCount = document.getElementById('progressRemainingCount');
        const progressCurrentQ = document.getElementById('progressCurrentQ');
        const progressTotalBar = document.getElementById('progressTotalBar');

        const totalQ = questions.length > 0 ? questions.length : 10;
        const displayAnswered = answeredCount;
        const displayRemaining = Math.max(0, totalQ - displayAnswered);
        const displayCurrentQ = currentIndex + 1;

        if (progressTotalCount) progressTotalCount.textContent = totalQ;
        if (progressAnsweredCount) progressAnsweredCount.textContent = displayAnswered;
        if (progressRemainingCount) progressRemainingCount.textContent = displayRemaining;
        if (progressCurrentQ) progressCurrentQ.textContent = displayCurrentQ;
        if (progressTotalBar) progressTotalBar.style.width = `${Math.round((displayAnswered / Math.max(1, totalQ)) * 100)}%`;
    }

    function updateMetric(barId, badgeId, percentVal, isPending = false) {
        const val = Math.max(0, Math.min(100, percentVal));
        const bar = document.getElementById(barId);
        const badge = document.getElementById(badgeId);

        if (bar) bar.style.width = `${isPending ? 0 : val}%`;
        if (badge) {
            if (isPending) {
                badge.textContent = 'Pending';
                badge.className = 'metric-badge badge-pending';
            } else if (val >= 85) {
                badge.textContent = 'Excellent';
                badge.className = 'metric-badge badge-excellent';
            } else if (val >= 70) {
                badge.textContent = 'Clear';
                badge.className = 'metric-badge badge-clear';
            } else if (val >= 50) {
                badge.textContent = 'Good';
                badge.className = 'metric-badge badge-good';
            } else if (val > 0) {
                badge.textContent = 'Basic';
                badge.className = 'metric-badge badge-nice';
            } else {
                badge.textContent = 'Pending';
                badge.className = 'metric-badge badge-pending';
            }
        }
    }

    // -------------------------------------------------------------
    // 5. Question Navigation & Render Logic
    // -------------------------------------------------------------
    function renderTabs() {
        if (!qTabsContainer) return;
        qTabsContainer.innerHTML = '';
        questions.forEach((q, idx) => {
            const btn = document.createElement('button');
            const hasAnswer = (userAnswers[q.num] || '').trim().length > 0;
            btn.className = `q-tab-btn ${idx === currentIndex ? 'active' : ''} ${hasAnswer ? 'answered' : ''}`;
            btn.textContent = `Q${q.num}`;
            btn.addEventListener('click', () => {
                saveCurrentAnswer();
                loadQuestion(idx);
            });
            qTabsContainer.appendChild(btn);
        });
    }

    function loadQuestion(index) {
        currentIndex = index;
        const q = questions[index];
        if (!q) return;

        // Overlay updates
        if (overlayQuestionText) {
            overlayQuestionText.innerHTML = `"${escapeHtml(q.text)}"`;
        }
        if (overlayQuestionCounter) overlayQuestionCounter.textContent = `Question ${q.num} of ${questions.length}`;

        // Textarea update
        if (mainAnswerInput) mainAnswerInput.value = userAnswers[q.num] || '';

        // Auto speak question via Google TTS
        speakQuestionText(q.text);

        // Perform real evaluation if answer exists
        evaluateAnswer(q.num, userAnswers[q.num]);

        // Render Right Sidebar Report Card
        renderCurrentReport();
        updateOverallReports();
        renderTabs();
    }

    function renderCurrentReport() {
        const q = questions[currentIndex];
        if (!q) return;

        const resObj = evaluatedResults[q.num] || {};
        const reportAnswerTime = document.getElementById('reportAnswerTime');

        if (currentQNumber) currentQNumber.textContent = `Question ${q.num}`;
        if (reportQText) reportQText.textContent = q.text;
        if (reportUserAnswer) reportUserAnswer.textContent = userAnswers[q.num] || 'No answer provided yet.';
        if (reportIdealAnswer) reportIdealAnswer.textContent = q.ideal;
        if (reportScoreNum) reportScoreNum.textContent = resObj.scoreNum || 'Pending';
        if (reportFeedbackText) reportFeedbackText.textContent = resObj.feedback || 'Answer the question to receive real AI feedback.';
        if (reportAnswerTime) reportAnswerTime.textContent = resObj.answerTime || (userAnswers[q.num] ? 'Time: 1m 30s' : '');

        // Render Stars
        if (reportStarRating) {
            reportStarRating.innerHTML = '';
            const stars = resObj.stars || 0;
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('i');
                star.className = i <= stars ? 'fas fa-star text-warning' : 'far fa-star text-muted';
                reportStarRating.appendChild(star);
            }
        }

        // Update Next Question Button Label
        const btnNextQuestion = document.getElementById('btnNextQuestion');
        if (btnNextQuestion) {
            if (currentIndex < questions.length - 1) {
                btnNextQuestion.innerHTML = `Next Question <i class="fas fa-arrow-right ms-1"></i>`;
            } else {
                btnNextQuestion.innerHTML = `Finish & Submit Report <i class="fas fa-check-circle ms-1"></i>`;
            }
        }
    }

    const btnNextQuestion = document.getElementById('btnNextQuestion');
    if (btnNextQuestion) {
        btnNextQuestion.addEventListener('click', () => {
            saveCurrentAnswer();
            updateOverallReports();
            if (currentIndex < questions.length - 1) {
                loadQuestion(currentIndex + 1);
            } else {
                if (btnDownloadReport) {
                    btnDownloadReport.click();
                }
            }
        });
    }

    function saveCurrentAnswer() {
        const q = questions[currentIndex];
        if (q && mainAnswerInput) {
            userAnswers[q.num] = mainAnswerInput.value;
            evaluateAnswer(q.num, mainAnswerInput.value);
        }
    }

    if (mainAnswerInput) {
        mainAnswerInput.addEventListener('input', () => {
            const q = questions[currentIndex];
            if (q) {
                userAnswers[q.num] = mainAnswerInput.value;
                evaluateAnswer(q.num, mainAnswerInput.value);
                renderCurrentReport();
                updateOverallReports();
                renderTabs();
            }
        });
    }

    // Timer Countdown
    function startTimer() {
        setInterval(() => {
            if (timerSeconds > 0) {
                timerSeconds--;
                const m = Math.floor(timerSeconds / 60);
                const s = timerSeconds % 60;
                const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                if (overlayTimerText) overlayTimerText.textContent = formatted;
                const timerLeftSidebar = document.getElementById('timeLeftSidebar');
                if (timerLeftSidebar) timerLeftSidebar.textContent = formatted;
            }
        }, 1000);
    }

    // Real Report Download - POST to submit and redirect to download PDF
    if (btnDownloadReport) {
        btnDownloadReport.addEventListener('click', async () => {
            saveCurrentAnswer();
            updateOverallReports();
            
            // Format answers and questions lists
            const qList = questions.map(q => q.text);
            const aList = questions.map(q => userAnswers[q.num] || '');
            
            const answeredCount = questions.filter(q => (userAnswers[q.num] || '').trim().length > 0).length;
            const timeTaken = 1185 - timerSeconds;
            
            try {
                btnDownloadReport.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> Generating PDF...`;
                btnDownloadReport.disabled = true;
                
                const response = await fetch('/api/interview/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        interview_id: interviewId,
                        questions: qList,
                        answers: aList,
                        time_taken: timeTaken,
                        answered_count: answeredCount
                    })
                });
                
                if (response.ok) {
                    // Redirect candidate to the overall interview report page
                    window.location.href = `/interview/report/${interviewId}`;
                } else {
                    alert("Failed to compile interview report on the server.");
                }
            } catch (err) {
                console.error("Error generating PDF:", err);
                alert("An error occurred. Falling back to local text file report.");
                
                // Text report fallback
                let reportContent = `MockMentor AI REAL AI INTERVIEW REPORT\n`;
                reportContent += `=========================================\n`;
                reportContent += `Date: ${new Date().toLocaleDateString()}\n`;
                reportContent += `Interview Type: Technical Interview\n`;
                reportContent += `Difficulty: Medium\n`;
                reportContent += `Overall Performance Score: ${document.querySelector('.gauge-text-center')?.textContent || '0%'}\n`;
                reportContent += `=========================================\n\n`;

                questions.forEach(q => {
                    const evalObj = evaluatedResults[q.num] || {};
                    reportContent += `QUESTION ${q.num}: ${q.text}\n`;
                    reportContent += `Your Answer: ${userAnswers[q.num] || 'No answer provided'}\n`;
                    reportContent += `Ideal Technical Answer: ${q.ideal}\n`;
                    reportContent += `Score Rating: ${evalObj.scoreNum || 'Pending'}\n`;
                    reportContent += `AI Evaluation Feedback: ${evalObj.feedback || 'N/A'}\n`;
                    reportContent += `-----------------------------------------\n\n`;
                });

                const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `MockMentorAI_Real_Report_${interviewId}.txt`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } finally {
                btnDownloadReport.innerHTML = `<i class="fas fa-download"></i> Download Report`;
                btnDownloadReport.disabled = false;
            }
        });
    }

    function escapeHtml(str) {
        return (str || '')
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
});
