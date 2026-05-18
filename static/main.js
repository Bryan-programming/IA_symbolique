/* From https://www.youtube.com/watch?v=-k-PgvbktX4
   and https://codepen.io/Web_Cifar/pen/jOqBEjE
*/
let phase = "placement";
let joueursBlockes = 0;

const nbLutinsParJoueur = 6;

const lutinsPlaces = {
    vert: 0,
    rouge: 0,
    bleu: 0,
    jaune: 0
};
function addUserMessage(text) {
    document.querySelector('.output').innerHTML += `
        <div class="message user">
            <strong>Vous:</strong> ${text}
        </div>`;
}

function addAgentMessage(text) {
    document.querySelector('.output').innerHTML += `
        <div class="message agent">
            <strong>PBot:</strong> ${text}
        </div>`;
}

function showLoading() {
    const el = document.createElement('div');
    el.className = 'Loading';
    el.innerText = 'Le bot  réfléchit...';
    document.querySelector('.output').appendChild(el);
    return el;
}

function annonceOut() {
    document.getElementById("annonce").style.display = "none";
    const mess_annonce = "Bienvenue ! Je suis le bot de PontuXL. Puis-je vous aider ?";
    p = document.createElement("p");
    p.classList.add("replay");
    p.innerText = mess_annonce;
    texts.appendChild(p);
    p = document.createElement("p");
    speech.text = mess_annonce;
    window.speechSynthesis.speak(speech);
}

function toArray(str) {
    const array = [];
    for (let i = 0; i < str.length; ++i) array.push(str.charCodeAt(i));
    array.push(10);
    return array;
}

function fromArrayCodeToString(arr) {
    var res = [];
    for (var i = 0; i < arr.length; i++) res.push(String.fromCharCode(arr[i]));
    return res.join("");
}

function jmjCodeToString(parr) {
    if (parr.args.length == 0) { return []; }
    else {
        const arr = jmjCodeToString(parr.args[1]);
        arr.unshift(parr.args[0].value);
        return arr;
    }
}

const texts = document.querySelector(".texts");

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = 'fr-FR';

const speech = new SpeechSynthesisUtterance();
speech.lang = "fr-FR";
speech.volume = 1;
speech.rate = 1;
speech.pitch = 1;

const plSession = new PrologSession();
var question = '';
var response = '';
var realresponse = '';
var msg;
let p = document.createElement("p");

recognition.addEventListener("result", (e) => {
    const text = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
    console.log(text);
    if (e.results[0].isFinal) {
        addUserMessage(text);
        ascii_list_of_question = toArray(text.toLowerCase());
        const question_parse = `lire_question([${ascii_list_of_question}],LMots),
                                  produire_reponse(LMots,L_reponse),
                                        transformer_reponse_en_string(L_reponse,Message).`;
        plSession.runQuery(question_parse);
        plSession.query(`
                    lire_question([${ascii_list_of_question}], L_Mots), 
                    produire_reponse(L_Mots,L_reponse),
                    transformer_reponse_en_string(L_reponse,Message).
         `);
        response = plSession.get_response();
        real_response = fromArrayCodeToString(jmjCodeToString(response));
        speech.text = real_response;
        window.speechSynthesis.speak(speech);
    }
});

const button = document.getElementById("chat-submit");
button.addEventListener('click', () => {
    const input = document.querySelector('.chat-input');
    const question = input.value;
    input.value = "";
    const ascii_list_of_question = toArray(question);
    const question_parse = `lire_question([${ascii_list_of_question}],LMots),
                                  produire_reponse(LMots,L_reponse),
                                        transformer_reponse_en_string(L_reponse,Message).`;
    addUserMessage(question);
    plSession.runQuery(question_parse);
});

const noteVocale = document.getElementById("chat-voice");
noteVocale.addEventListener('click', () => { recognition.start();});


//  ---------------------------- Fonctions graphiques Tau-prolog \\

let turn = 'vert';

// bleu=3 et rouge=2 sont gérés par l'IA
const iaConfig = { rouge: 2, bleu: 3 };

function pontId(x1, y1, x2, y2) {
    if (y1 === y2) {
        return `h-${Math.min(x1,x2)}-${y1}-${Math.max(x1,x2)}-${y1}`;
    } else {
        return `v-${x1}-${Math.min(y1,y2)}-${x1}-${Math.max(y1,y2)}`;
    }
}

function fromPontTerm(term) {
    return [
        term.args[0].value,
        term.args[1].value,
        term.args[2].value,
        term.args[3].value
    ];
}

function pontsEnAttente() {
    return document.getElementById("arrow-panel").querySelectorAll('strong').length > 0;
}

function print_board() {
    let cases;
    plSession.session.query("casesPlateau(L).");
    plSession.session.answer(rep => {
        cases = fromList(rep.lookup("L"));
        let limit = cases[cases.length - 1][1];
        const plateau = document.getElementById('plateau');
        const table = document.createElement('table');
        let row, rowPontV;

        const lignes = {};
        cases.forEach(([x, y]) => {
            if (!lignes[y]) lignes[y] = [];
            lignes[y].push(x);
        });

        Object.keys(lignes).map(Number).sort((a, b) => b - a).forEach(y => {
            row = document.createElement("tr");
            if (y !== 1) rowPontV = document.createElement("tr");

            lignes[y].sort((a, b) => a - b).forEach(x => {
                const td = document.createElement("td");
                td.classList.add("case");
                td.dataset.x = x;
                td.dataset.y = y;
                row.appendChild(td);

                if (x !== limit) {
                    const tdPontH = document.createElement("td");
                    tdPontH.classList.add("pont-h");
                    tdPontH.dataset.x = x;
                    tdPontH.dataset.y = y;
                    row.appendChild(tdPontH);
                }

                if (y !== 1) {
                    const tdPontV = document.createElement("td");
                    tdPontV.classList.add("pont-v");
                    tdPontV.dataset.x = x;
                    tdPontV.dataset.y = y - 1;
                    rowPontV.appendChild(tdPontV);
                    const coin = document.createElement("td");
                    coin.classList.add("coin");
                    rowPontV.appendChild(coin);
                }
            });

            table.appendChild(row);
            if (y !== 1) table.appendChild(rowPontV);
        });

        plateau.appendChild(table);
    });
}
function activerPlacement() {
    document.querySelectorAll(".case").forEach(c => {
        c.addEventListener("click", function () {

            if (phase !== "placement") return;

            if (iaConfig[turn] !== undefined) return;

            const x = this.dataset.x;
            const y = this.dataset.y;

            let joueurNum;
            if (turn === "vert") joueurNum = 1;
            else if (turn === "rouge") joueurNum = 2;
            else if (turn === "bleu") joueurNum = 3;
            else joueurNum = 4;

            plSession.session.query(`
                placer_lutin_joueur(${joueurNum}, ${x}, ${y}).
            `);

            plSession.session.answer(rep => {
                if (rep && rep !== false) {

                    lutinsPlaces[turn]++;

                    refresh_joueurs();

                    next_player_placement();
                    verifier_fin_placement();
                }
            });
        });
    });
}

function next_player_placement() {
    if (turn === 'vert')       turn = 'bleu';
    else if (turn === 'bleu')  turn = 'jaune';
    else if (turn === 'jaune') turn = 'rouge';
    else                       turn = 'vert';

    highlight_turn(turn);

    // IA joue automatiquement
    if (iaConfig[turn] !== undefined) {
        setTimeout(() => placement_IA(iaConfig[turn]), 400);
    }
}

function placement_IA(joueur) {
    plSession.session.query(`
        choisir_placement_ia(${joueur}, X, Y).
    `);

    plSession.session.answer(rep => {
        if (rep && rep !== false) {

            const x = termArg(rep.lookup("X"));
            const y = termArg(rep.lookup("Y"));

            plSession.session.query(`
                placer_lutin_joueur(${joueur}, ${x}, ${y}).
            `);

            plSession.session.answer(_ => {

                const couleur =
                    joueur === 1 ? "vert" :
                    joueur === 2 ? "rouge" :
                    joueur === 3 ? "bleu" : "jaune";

                lutinsPlaces[couleur]++;

                refresh_joueurs();

                next_player_placement();
                verifier_fin_placement();
            });
        }
    });
}

function verifier_fin_placement() {
    const total =
        lutinsPlaces.vert +
        lutinsPlaces.rouge +
        lutinsPlaces.bleu +
        lutinsPlaces.jaune;

    if (total === nbLutinsParJoueur * 4) {

        console.log("FIN PLACEMENT");

        phase = "jeu";

        document.getElementById("arrow-panel").innerHTML = "";

        move_luttin(); 
        highlight_turn(turn);
    }
}
function placerLutin(x, y, couleur) {
    const cas = document.querySelector(`.case[data-x="${x}"][data-y="${y}"]`);
    const lutin = document.createElement('div');
    lutin.classList.add('lutin', couleur);
    cas.appendChild(lutin);
}

function placerPonth(x1, y1, x2, y2) {
    const cas = document.querySelector(`.pont-h[data-x="${x1}"][data-y="${y1}"]`);
    if (!cas) { console.error("Element introuvable !"); return; }
    const pont_h = document.createElement('div');
    pont_h.classList.add('pont-hadded');
    pont_h.dataset.pont = pontId(x1, y1, x2, y2);
    cas.appendChild(pont_h);
}

function placerPontV(x1, y1, x2, y2) {
    const cas = document.querySelector(`.pont-v[data-x="${x1}"][data-y="${y1}"]`);
    if (!cas) { console.error("Element introuvable !"); return; }
    const pont_v = document.createElement('div');
    pont_v.classList.add('pont-vadded');
    pont_v.dataset.pont = pontId(x1, y1, x2, y2);
    cas.appendChild(pont_v);
}

function refresh_joueurs() {
    document.querySelectorAll('.lutin').forEach(l => l.remove());
    placer_les_joueurs();
    move_luttin();
}

function placer_les_joueurs() {
    let p1, p2, p3, p4;
    plSession.session.query("postionLutinJoueur1(L).");
    plSession.session.answer(rep => { if (rep && rep !== false) p1 = fromList(rep.lookup("L")); });
    if (p1) p1.forEach(([x, y]) => placerLutin(x, y, 'vert'));

    plSession.session.query("postionLutinJoueur2(L).");
    plSession.session.answer(rep => { if (rep && rep !== false) p2 = fromList(rep.lookup("L")); });
    if (p2) p2.forEach(([x, y]) => placerLutin(x, y, 'rouge'));

    plSession.session.query("postionLutinJoueur3(L).");
    plSession.session.answer(rep => { if (rep && rep !== false) p3 = fromList(rep.lookup("L")); });
    if (p3) p3.forEach(([x, y]) => placerLutin(x, y, 'bleu'));

    plSession.session.query("postionLutinJoueur4(L).");
    plSession.session.answer(rep => { if (rep && rep !== false) p4 = fromList(rep.lookup("L")); });
    if (p4) p4.forEach(([x, y]) => placerLutin(x, y, 'jaune'));
}

function fromList(xs) {
    var arr = [];
    while (pl.type.is_term(xs) && xs.indicator === "./2") {
        let value = xs.args[0];
        if (pl.type.is_term(value) && (value.indicator === "./2" || value.indicator === "[]/0")) {
            value = fromList(value);
        } else if (value.value !== undefined) {
            value = value.value;
        }
        arr.push(value);
        xs = xs.args[1];
    }
    if (pl.type.is_term(xs) && xs.indicator === "[]/0") return arr;
    return null;
}

function placer_les_ponts() {
    plSession.session.query("init_ponts_h, init_ponts_v.");
    plSession.session.answer(_ => {});

    plSession.session.query("tous_ponts_h(L).");
    plSession.session.answer(rep => {
        const ponts = fromList(rep.lookup("L"));
        ponts.forEach(([[x1, y1], [x2, y2]]) => placerPonth(x1, y1, x2, y2));
    });

    plSession.session.query("tous_ponts_v(L).");
    plSession.session.answer(rep => {
        const ponts = fromList(rep.lookup("L"));
        ponts.forEach(([[x1, y1], [x2, y2]]) => placerPontV(x1, y1, x2, y2));
    });
}


// ---- GESTION DES PONTS (humain) ----

function supprimerPontDOM(x1, y1, x2, y2) {
    const id = pontId(x1, y1, x2, y2);
    const pont = document.querySelector(`[data-pont="${id}"]`);
    if (pont) pont.remove();
    else console.warn("Pont DOM introuvable pour id:", id);
}

function tournerPontDOM(x1, y1, x2, y2, ax, ay, sens) {
    supprimerPontDOM(x1, y1, x2, y2);
    if (y1 === y2) {
        let vyMin = sens === "up" ? ay : ay - 1;
        let vyMax = sens === "up" ? ay + 1 : ay;
        const casV = document.querySelector(`.pont-v[data-x="${ax}"][data-y="${vyMin}"]`);
        if (casV) {
            const div = document.createElement('div');
            div.classList.add('pont-vadded');
            div.dataset.pont = pontId(ax, vyMin, ax, vyMax);
            casV.appendChild(div);
        } else {
            console.warn(`pont-v cible introuvable: (${ax},${vyMin})`);
        }
    } else {
        let hxMin = sens === "right" ? ax : ax - 1;
        let hxMax = sens === "right" ? ax + 1 : ax;
        const casH = document.querySelector(`.pont-h[data-x="${hxMin}"][data-y="${ay}"]`);
        if (casH) {
            const div = document.createElement('div');
            div.classList.add('pont-hadded');
            div.dataset.pont = pontId(hxMin, ay, hxMax, ay);
            casH.appendChild(div);
        } else {
            console.warn(`pont-h cible introuvable: (${hxMin},${ay})`);
        }
    }
}

function verifierPanneauVide(panel) {
    const pontsRestants = panel.querySelectorAll('strong');
    if (pontsRestants.length === 0) {
        panel.innerHTML = "";
        next_player();
    }
}

function proposer_actions_ponts(ponts) {
    const panel = document.getElementById("arrow-panel");
    panel.innerHTML = "<p style='color:white;margin:4px 0;font-size:14px'>Ponts traversés :</p>";

    ponts.forEach(pont => {
        const x1 = pont[0], y1 = pont[1], x2 = pont[2], y2 = pont[3];
        const estHorizontal = (y1 === y2);

        const div = document.createElement("div");
        div.style.color = "white";
        div.style.marginBottom = "10px";
        div.style.fontSize = "12px";
        div.style.borderBottom = "1px solid rgba(255,255,255,0.2)";
        div.style.paddingBottom = "8px";
        div.innerHTML = `<strong>(${x1},${y1})→(${x2},${y2})</strong><br>`;

        const btnRetirer = document.createElement("button");
        btnRetirer.textContent = "Retirer";
        btnRetirer.style.margin = "2px";
        btnRetirer.style.fontSize = "11px";
        btnRetirer.addEventListener("click", () => {
            plSession.session.query(`retirer_pont(${x1}, ${y1}, ${x2}, ${y2}).`);
            plSession.session.answer(_ => {});
            supprimerPontDOM(x1, y1, x2, y2);
            div.remove();
            verifierPanneauVide(panel);
        });
        div.appendChild(btnRetirer);

        // filtre les rotations hors-plateau avant de créer les boutons
        const rotationsPossibles = estHorizontal ? [
            { ax: x1, ay: y1, sens: "up",   label: `↑ axe (${x1},${y1})`, valide: y1 + 1 <= 6 },
            { ax: x1, ay: y1, sens: "down",  label: `↓ axe (${x1},${y1})`, valide: y1 - 1 >= 1 },
            { ax: x2, ay: y2, sens: "up",    label: `↑ axe (${x2},${y2})`, valide: y2 + 1 <= 6 },
            { ax: x2, ay: y2, sens: "down",  label: `↓ axe (${x2},${y2})`, valide: y2 - 1 >= 1 },
        ] : [
            { ax: x1, ay: y1, sens: "right", label: `→ axe (${x1},${y1})`, valide: x1 + 1 <= 6 },
            { ax: x1, ay: y1, sens: "left",  label: `← axe (${x1},${y1})`, valide: x1 - 1 >= 1 },
            { ax: x2, ay: y2, sens: "right", label: `→ axe (${x2},${y2})`, valide: x2 + 1 <= 6 },
            { ax: x2, ay: y2, sens: "left",  label: `← axe (${x2},${y2})`, valide: x2 - 1 >= 1 },
        ];

        rotationsPossibles.filter(r => r.valide).forEach(({ ax, ay, sens, label }) => {
            const lax = ax, lay = ay, lsens = sens;
            const btn = document.createElement("button");
            btn.textContent = label;
            btn.style.margin = "2px";
            btn.style.fontSize = "11px";
            btn.addEventListener("click", (event) => {
                const boutonClique = event.currentTarget;
                const query = `tourner_pont(${x1}, ${y1}, ${x2}, ${y2}, ${lax}, ${lay}, ${lsens}).`;
                console.log("Requête Prolog envoyée :", query);
                plSession.session.query(query);
                plSession.session.answer(rep => {
                    console.log("Réponse Prolog :", rep);
                    if (rep && rep !== false) {
                        tournerPontDOM(x1, y1, x2, y2, lax, lay, lsens);
                        div.remove();
                        verifierPanneauVide(panel);
                    } else {
                        boutonClique.style.opacity = "0.5";
                        boutonClique.style.backgroundColor = "#777";
                        boutonClique.disabled = true;
                    }
                });
            });
            div.appendChild(btn);
        });

        panel.appendChild(div);
    });
}


// ---- GESTION DES PONTS (IA) ----

function termArg(arg) {
    if (arg.value !== undefined) return arg.value;
    return arg.id;
}

function appliquer_action_pont_DOM(action) {
    const nom = action.id;
    if (nom === "retirer") {
        const x1 = termArg(action.args[0]);
        const y1 = termArg(action.args[1]);
        const x2 = termArg(action.args[2]);
        const y2 = termArg(action.args[3]);
        plSession.session.query(`retirer_pont(${x1},${y1},${x2},${y2}).`);
        plSession.session.answer(_ => {});
        supprimerPontDOM(x1, y1, x2, y2);
    } else if (nom === "tourner") {
        const x1   = termArg(action.args[0]);
        const y1   = termArg(action.args[1]);
        const x2   = termArg(action.args[2]);
        const y2   = termArg(action.args[3]);
        const ax   = termArg(action.args[4]);
        const ay   = termArg(action.args[5]);
        const sens = termArg(action.args[6]);
        plSession.session.query(`tourner_pont(${x1},${y1},${x2},${y2},${ax},${ay},${sens}).`);
        plSession.session.answer(_ => {});
        tournerPontDOM(x1, y1, x2, y2, ax, ay, sens);
    }
}

function gerer_ponts_IA(joueur, ponts) {
    if (!ponts || ponts.length === 0) return;
    ponts.forEach(([x1, y1, x2, y2]) => {
        plSession.session.query(`
            capturer_etat(Etat),
            meilleure_action_pont(Etat, ${joueur}, pont(${x1},${y1},${x2},${y2}), Action, _).
        `);
        plSession.session.answer(rep => {
            if (rep && rep !== false && typeof rep.lookup === 'function') {
                appliquer_action_pont_DOM(rep.lookup("Action"));
            } else {
                plSession.session.query(`retirer_pont(${x1},${y1},${x2},${y2}).`);
                plSession.session.answer(_ => {});
                supprimerPontDOM(x1, y1, x2, y2);
            }
        });
    });
}


// ---- IA ----

function jouer_IA(numJoueur) {
    plSession.session.query(`
        capturer_etat(Etat),
        generer_mouvement(Etat, ${numJoueur}, Mvt),
        Mvt = deplacement_ia(_, Xs, Ys, Dir, _, _, _).
    `);
    plSession.session.answer(rep => {
        if (rep && rep !== false && typeof rep.lookup === 'function') {
            const xs  = termArg(rep.lookup("Xs"));
            const ys  = termArg(rep.lookup("Ys"));
            const dir = termArg(rep.lookup("Dir"));
            appliquer_coup_IA(numJoueur, xs, ys, dir);
        } else {
            console.warn("IA : aucun mouvement possible pour joueur", numJoueur);
            next_player();
        }
    });
}

function appliquer_coup_IA(joueur, xs, ys, dir) {
    plSession.session.query(
        `deplacement(${joueur}, ${xs}, ${ys}, ${dir}, Xf, Yf, Ponts).`
    );
    plSession.session.answer(rep => {
        if (!rep || rep === false || typeof rep.lookup !== 'function') {
            console.warn("IA : deplacement a échoué");
            return;
        }
        const pontsRaw = rep.lookup("Ponts");
        const pontsArr = fromList(pontsRaw);
        const ponts    = pontsArr ? pontsArr.map(fromPontTerm) : [];

        refresh_joueurs();

        if (ponts.length > 0) {
            gerer_ponts_IA(joueur, ponts);
        }

        next_player();
    });
}


// ---- DÉPLACEMENTS DES LUTINS (humain) ----

function showArrows() {
    const panel = document.getElementById("arrow-panel");
    panel.innerHTML = "";
    ["UP", "DOWN", "LEFT", "RIGHT"].forEach(dir => {
        const btn = document.createElement("div");
        btn.classList.add("arrow", dir.toLowerCase());
        btn.textContent = dir;
        panel.appendChild(btn);
    });
}

function activatearrows(lutin) {
    let numJoueur;
    const color = lutin.classList[1];
    if (color === "vert") numJoueur = 1;
    else if (color === "rouge") numJoueur = 2;
    else if (color === "bleu") numJoueur = 3;
    else numJoueur = 4;

    const xs = lutin.parentElement.dataset.x;
    const ys = lutin.parentElement.dataset.y;

    if (color !== turn) { alert("pas ton tours"); return; }
    if (iaConfig[turn] !== undefined) return;
    const allarrows = document.querySelectorAll(".arrow");
    allarrows.forEach(arrow => {
        arrow.addEventListener("click", function () {
            const direction = this.classList[1];
            const query = `deplacement(${numJoueur}, ${xs}, ${ys}, ${direction.toLowerCase()}, Xf, Yf, Ponts).`;
            plSession.session.query(query);
            plSession.session.answer(rep => {
                if (rep && rep !== false) {
                    const pontsRaw = rep.lookup("Ponts");
                    const pontsArr = fromList(pontsRaw);
                    refresh_joueurs();
                    if (pontsArr && pontsArr.length > 0) {
                        proposer_actions_ponts(pontsArr.map(fromPontTerm));
                    } else {
                        next_player();
                    }
                }
            });
        });
    });
}

function move_luttin() {
    document.querySelectorAll(".lutin").forEach(lutin => {
        lutin.addEventListener("click", function (event) {
            if (pontsEnAttente()) return;
            const caseDiv = event.target.closest(".case");
            if(phase!="jeu"){
                activatearrows(lutin);
                return;
            }
            showArrows();
            activatearrows(lutin);
        });
    });
}

const turnToPlayer = { vert: 'player3', bleu: 'player2', jaune: 'player4', rouge: 'player1' };

function highlight_turn(color) {
    document.querySelectorAll('.turns div').forEach(d => d.classList.remove('active-turn'));
    const cls = turnToPlayer[color];
    if (cls) document.querySelector('.' + cls)?.classList.add('active-turn');
}

function next_player() {
    // 1. eliminer les lutins bloques
    plSession.session.query("eliminer_tous_lutins_bloques.");
    plSession.session.answer(_ => {
        refresh_joueurs();

        // 2. Verifier game_over
        plSession.session.query("capturer_etat(Etat), game_over(Etat).");
        plSession.session.answer(rep => {
            if (rep && rep !== false) {
                alert("Partie terminée !");
                return;
            }

            // 3. Passer au joueur suivant
            if (turn === 'vert')       turn = 'bleu';
            else if (turn === 'bleu')  turn = 'jaune';
            else if (turn === 'jaune') turn = 'rouge';
            else                       turn = 'vert';

            highlight_turn(turn);

            // 4. Vérifier si le joueur suivant peut bouger
            const numJoueur = turn === 'vert' ? 1 : turn === 'rouge' ? 2 : turn === 'bleu' ? 3 : 4;
            plSession.session.query(`capturer_etat(Etat), lutins_joueur(${numJoueur}, Etat, Lutins), peut_bouger_un_lutin(Etat, Lutins).`);
            plSession.session.answer(canMove => {
                if (!canMove || canMove === false) {
                    joueursBlockes++;
                    if (joueursBlockes >= 4) {
                        alert("Match nul ! Aucun joueur ne peut bouger.");
                        return;
                    }
                    next_player();
                    return;
                }
                joueursBlockes = 0;
                if (iaConfig[turn] !== undefined) {
                    setTimeout(() => jouer_IA(iaConfig[turn]), 1500);
                }
            });
        });
    });
}


//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function main() {
    print_board();
    placer_les_ponts();
    activerPlacement(); 
    highlight_turn(turn);
}
main();


//  ----------------------------------------------------- Fin ------------------------------------------------------------- \\