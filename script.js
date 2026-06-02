document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Dinamička izračunavanja za SVG animaciju iscrtavanja ---
    // Rješavamo "delay" tako što JavaScriptom čitamo točnu fizičku dužinu svake nacrtane linije
    const strokePaths = document.querySelectorAll('.stroke-path');
    strokePaths.forEach(path => {
        const length = path.getTotalLength();
        // Dinamički postavljamo dasharray i dashoffset umjesto fiksne vrijednosti 100
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;

        // Okidamo animaciju (CSS dodaje "drawPath") tek kad je ispravna dužina postavljena
        path.classList.add('animate-stroke');
    });

    /* -------------------------------------------------------------------------
       2. EFEKT PARALAKSE (Parallax Background)
       -------------------------------------------------------------------------
       Pratimo pomicanje miša ('mousemove' event). Na temelju pozicije miša u 
       odnosu na veličinu prozora, blago pomičemo pozadinske gradijente (bg1 i bg2) 
       u suprotnim smjerovima različitim brzinama kako bismo stvorili dojam 3D dubine.
    */
    const bg1 = document.getElementById('bg-layer-1');
    const bg2 = document.getElementById('bg-layer-2');
    const dogContainer = document.getElementById('dog-container');

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;

        bg1.style.transform = `translate(${x * 100}px, ${y * 100}px)`;
        bg2.style.transform = `translate(${x * -160}px, ${y * -160}px)`;
    });

    // --- Nova interakcija s psom (Klik) ---
    // Kad se klikne na psa, on napravi sretan skok (happy jump) umjesto neprirodnog okreta
    const guideDog = document.getElementById('guide-dog');
    guideDog.addEventListener('click', () => {
        guideDog.classList.add('dog-jump');

        // Ukloni klasu nakon završetka animacije (0.6s)
        setTimeout(() => {
            guideDog.classList.remove('dog-jump');
        }, 600);
    });

    // --- Click Prijelaz (Započni) ---
    const startBtn = document.getElementById('start-btn');
    const lessonsBtn = document.getElementById('lessons-btn');
    const heroScene = document.getElementById('hero-scene');
    const quizScene = document.getElementById('quiz-scene');
    const lessonsScene = document.getElementById('lessons-scene');
    const textContent = document.querySelector('.text-content');

    lessonsBtn.addEventListener('click', () => {
        // Otvaranje E-Lekcija
        heroScene.classList.remove('active');
        heroScene.classList.add('hidden');
        dogContainer.classList.add('run-away');
        textContent.classList.add('fade-out');

        setTimeout(() => {
            lessonsScene.classList.remove('hidden');
            lessonsScene.classList.add('active');
        }, 1000); // Čekamo da pas otrči
    });

    startBtn.addEventListener('click', () => {
        // Zaštita od višestrukog klika (Spam click prevention)
        startBtn.disabled = true;
        lessonsBtn.disabled = true;

        // Dodajemo klasu run-away za CSS transform (pas trči desno)
        dogContainer.classList.add('run-away');
        textContent.classList.add('fade-out');

        setTimeout(() => {
            heroScene.classList.remove('active');
            heroScene.classList.add('hidden');

            setTimeout(() => {
                quizScene.classList.remove('hidden');
                quizScene.classList.add('active');
                initQuiz(); // Promiješaj kviz prije početka
                loadQuestion(); // Učitaj prvo pitanje kviza
            }, 50);
        }, 1500); // Čekamo 1.5s da pas mirno otrči
    });

    const quizData = [
        {
            question: "Što je zapravo <strong>SVG</strong>?",
            options: [
                { text: "Video format za animacije", correct: false },
                { text: "Skalabilna vektorska grafika", correct: true },
                { text: "Audio format za web", correct: false }
            ]
        },
        {
            question: "Koji CSS selektor koristimo za interakciju kada pređemo mišem preko elementa?",
            options: [
                { text: ":hover", correct: true },
                { text: ":active", correct: false },
                { text: ":focus", correct: false }
            ]
        },
        {
            question: "Što od navedenog koristimo za glatke animacije bez previše koda?",
            options: [
                { text: "JS setInterval()", correct: false },
                { text: "CSS transform & transition", correct: true },
                { text: "HTML &lt;animate&gt;", correct: false }
            ]
        },
        {
            question: "Koji HTML tag koristimo za ubacivanje JavaScript koda?",
            options: [
                { text: "&lt;script&gt;", correct: true },
                { text: "&lt;js&gt;", correct: false },
                { text: "&lt;javascript&gt;", correct: false }
            ]
        },
        {
            question: "Što znači kratica <strong>CSS</strong>?",
            options: [
                { text: "Creative Style Sheets", correct: false },
                { text: "Computer Styling System", correct: false },
                { text: "Cascading Style Sheets", correct: true }
            ]
        },
        {
            question: "Koji grafički format <strong>NE gubi</strong> kvalitetu pri povećavanju?",
            options: [
                { text: "JPG", correct: false },
                { text: "SVG", correct: true },
                { text: "PNG", correct: false }
            ]
        },
        {
            question: "Koje CSS svojstvo koristimo za mijenjanje boje teksta?",
            options: [
                { text: "color", correct: true },
                { text: "text-color", correct: false },
                { text: "font-color", correct: false }
            ]
        },
        {
            question: "Što znači pojam <strong>DOM</strong> u web programiranju?",
            options: [
                { text: "Document Object Model", correct: true },
                { text: "Data Oriented Module", correct: false },
                { text: "Display Order Method", correct: false }
            ]
        },
        {
            question: "Koja se CSS mjerna jedinica dinamički prilagođava širini ekrana preglednika?",
            options: [
                { text: "px", correct: false },
                { text: "em", correct: false },
                { text: "vw", correct: true }
            ]
        },
        {
            question: "Koje se CSS svojstvo najčešće koristi za animaciju iscrtavanja SVG linija?",
            options: [
                { text: "line-draw", correct: false },
                { text: "stroke-dashoffset", correct: true },
                { text: "path-animate", correct: false }
            ]
        }
    ];

    let currentQuestionIndex = 0;
    let userScores = new Array(quizData.length).fill(null); // null = neodgovoreno
    let userSelections = new Array(quizData.length).fill(null); // Sprema tekst odgovora koji je korisnik odabrao

    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackMsg = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    const homeBtn = document.getElementById('home-btn');
    const quizDotsContainer = document.getElementById('quiz-dots');

    const backFromLessonsBtn = document.getElementById('back-from-lessons-btn');
    const navItems = document.querySelectorAll('#lessons-nav li');
    const lessonViews = document.querySelectorAll('.lesson-view');

    // Navigacija kroz E-Lekcije
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Skini active klasu sa svih i stavi na kliknuti
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Sakrij sve viewove
            lessonViews.forEach(view => view.classList.add('hidden-element'));

            // Pokaži ciljani view
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden-element');
        });
    });

    backFromLessonsBtn.addEventListener('click', () => {
        lessonsScene.classList.remove('active');
        lessonsScene.classList.add('hidden');

        setTimeout(() => {
            heroScene.classList.remove('hidden');
            heroScene.classList.add('active');

            dogContainer.classList.remove('run-away');
            textContent.classList.remove('fade-out');

            startBtn.disabled = false;
            lessonsBtn.disabled = false;
        }, 50);
    });

    // Fisher-Yates algoritam za nasumično miješanje niza
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Funkcija za pokretanje/resetiranje kviza s nasumičnim poretkom
    function initQuiz() {
        shuffleArray(quizData); // Promiješaj pitanja
        quizData.forEach(q => shuffleArray(q.options)); // Promiješaj odgovore

        currentQuestionIndex = 0;
        userScores.fill(null);
        userSelections.fill(null);
    }

    // Funkcija za prikaz točkica (progress bar)
    function renderDots() {
        quizDotsContainer.innerHTML = '';
        for (let i = 0; i < quizData.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';

            if (i === currentQuestionIndex) {
                dot.classList.add('current');
            }

            if (userScores[i] === true) {
                dot.classList.add('correct-dot');
            } else if (userScores[i] === false) {
                dot.classList.add('wrong-dot');
            }

            quizDotsContainer.appendChild(dot);
        }
    }

    // Funkcija koja generira trenutno pitanje
    function loadQuestion() {
        const currentQ = quizData[currentQuestionIndex];

        questionText.innerHTML = currentQ.question;
        renderDots();
        optionsContainer.innerHTML = '';
        feedbackMsg.textContent = '';
        nextBtn.classList.add('hidden-element'); // Sakrij Next tipku dok ne odgovori

        // Generiraj gumbe za odgovore
        currentQ.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'quiz-btn';
            btn.textContent = option.text;
            btn.setAttribute('data-correct', option.correct);

            if (userScores[currentQuestionIndex] !== null) {
                // Ako je korisnik već odgovorio, zaključaj gumbe
                btn.style.pointerEvents = 'none';
                btn.style.cursor = 'default';

                // Označi točan odgovor
                if (option.correct) {
                    btn.classList.add('correct');
                }

                // Pokaži i onaj krivi koji je korisnik bio kliknuo
                if (userSelections[currentQuestionIndex] === option.text && !option.correct) {
                    btn.classList.add('wrong');
                }
            } else {
                btn.addEventListener('click', selectAnswer);
            }

            optionsContainer.appendChild(btn);
        });

        // Ako je pitanje već odgovoreno (korisnik išao "Nazad"), prikaži gumb za dalje
        if (userScores[currentQuestionIndex] !== null) {
            feedbackMsg.style.color = userScores[currentQuestionIndex] ? 'var(--success)' : 'var(--error)';
            feedbackMsg.textContent = userScores[currentQuestionIndex] ? 'Već odgovoreno: Točno!' : 'Već odgovoreno: Netočno.';
            nextBtn.classList.remove('hidden-element');
        }

        if (currentQuestionIndex === quizData.length - 1) {
            nextBtn.textContent = "Završi";
        } else {
            nextBtn.textContent = "Sljedeće pitanje";
        }
    }

    function selectAnswer(e) {
        const selectedBtn = e.target;
        const isCorrect = selectedBtn.getAttribute('data-correct') === 'true';

        // Spremi rezultat za ovo pitanje u niz i ažuriraj točkice
        userScores[currentQuestionIndex] = isCorrect;
        userSelections[currentQuestionIndex] = selectedBtn.textContent;
        renderDots();

        // Zaključaj sve opcije
        const allBtns = optionsContainer.querySelectorAll('.quiz-btn');
        allBtns.forEach(b => {
            b.style.pointerEvents = 'none';
            // Pokaži korisniku koji je bio točan odgovor neovisno što je kliknuo
            if (b.getAttribute('data-correct') === 'true') {
                b.classList.add('correct');
            }
        });

        if (isCorrect) {
            feedbackMsg.style.color = 'var(--success)';
            feedbackMsg.textContent = 'Točno! Odlično.';
        } else {
            selectedBtn.classList.add('wrong');
            feedbackMsg.style.color = 'var(--error)';
            feedbackMsg.textContent = 'Netočno. Pokušaj ponovno sljedeći put! 😅';
        }

        // Pokaži tipku za dalje
        nextBtn.classList.remove('hidden-element');
    }

    // Funkcija za ispaljivanje konfeta
    function shootConfetti() {
        for (let i = 0; i < 60; i++) {
            const conf = document.createElement('div');
            conf.className = 'confetti';
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.backgroundColor = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)];
            conf.style.animationDuration = (Math.random() * 2 + 2) + 's';
            conf.style.animationDelay = (Math.random() * 0.5) + 's';
            document.body.appendChild(conf);

            setTimeout(() => conf.remove(), 4000); // Počisti DOM nakon animacije
        }
    }

    // Klik na Sljedeće pitanje / Pokušaj ponovno
    nextBtn.addEventListener('click', () => {
        if (nextBtn.getAttribute('data-finished') === 'true') {
            // Logika za "Pokušaj ponovno"
            nextBtn.removeAttribute('data-finished');
            homeBtn.classList.add('hidden-element'); // Sakrij home button za novi pokušaj
            initQuiz(); // Ponovno promiješaj sva pitanja i odgovore
            loadQuestion();
            return;
        }

        if (currentQuestionIndex < quizData.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            // Kraj kviza i izračun rezultata
            const correctAnswersCount = userScores.filter(score => score === true).length;
            const percentage = Math.round((correctAnswersCount / quizData.length) * 100);

            feedbackMsg.style.color = 'white';
            feedbackMsg.textContent = 'Kviz završen!';
            optionsContainer.innerHTML = '';

            // Prikaz završnog postotka
            let resultColor = percentage >= 50 ? 'var(--success)' : 'var(--error)';
            let resultMessage = `Tvoj rezultat: <strong>${correctAnswersCount} / ${quizData.length}</strong> točnih odgovora.<br><br>`;
            resultMessage += `<span style="font-size: 3rem; font-weight: 800; color: ${resultColor};">${percentage}%</span>`;

            questionText.innerHTML = resultMessage;

            // Ako je prolaz (>= 50%), baci konfete!
            if (percentage >= 50) {
                shootConfetti();
            }

            // Promijeni gumb u "Pokušaj ponovno"
            nextBtn.textContent = 'Pokušaj ponovno';
            nextBtn.setAttribute('data-finished', 'true');
            homeBtn.classList.remove('hidden-element'); // Prikaži gumb za povratak
        }
    });

    // Povratak na početnu
    homeBtn.addEventListener('click', () => {
        quizScene.classList.remove('active');
        quizScene.classList.add('hidden');

        setTimeout(() => {
            heroScene.classList.remove('hidden');
            heroScene.classList.add('active');

            // Resetiraj poziciju psa i tekst
            dogContainer.classList.remove('run-away');
            textContent.classList.remove('fade-out');

            startBtn.disabled = false;
            lessonsBtn.disabled = false;

            // Sakrij home gumb i resetiraj next gumb za sljedeći put
            homeBtn.classList.add('hidden-element');
            nextBtn.removeAttribute('data-finished');
        }, 50);
    });

    // Nazad gumb
    backBtn.addEventListener('click', () => {
        nextBtn.removeAttribute('data-finished'); // Resetiraj finished state ako se korisnik vrati nazad

        if (currentQuestionIndex > 0) {
            // Vrati na prethodno pitanje
            currentQuestionIndex--;
            loadQuestion();
        } else {
            // Ako smo na prvom pitanju, vrati se skroz na početni ekran (Hero scenu)
            quizScene.classList.remove('active');
            quizScene.classList.add('hidden');

            setTimeout(() => {
                heroScene.classList.remove('hidden');
                heroScene.classList.add('active');

                // Resetiraj poziciju psa i tekst (vrati ih natrag na ekran)
                dogContainer.classList.remove('run-away');
                textContent.classList.remove('fade-out');

                startBtn.disabled = false; // Ponovno omogući gumb za započinjanje
                lessonsBtn.disabled = false;
            }, 50);
        }
    });
});
