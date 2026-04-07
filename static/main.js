/* From https://www.youtube.com/watch?v=-k-PgvbktX4
   and https://codepen.io/Web_Cifar/pen/jOqBEjE
*/

// ---- Fonctions chat ---- //

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

function toArray(str) {
    const array = [];
    for (let i = 0; i < str.length; ++i) {
        array.push(str.charCodeAt(i));
    }
    array.push(10);
    return array;
}

function fromArrayCodeToString(arr) {
    var res = [];
    for (var i = 0; i < arr.length; i++) {
        res.push(String.fromCharCode(arr[i]));
    }
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
var response = '';
let p = document.createElement("p");

recognition.addEventListener("result", (e) => {
    const text = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
    if (e.results[0].isFinal) {
        addUserMessage(text);
        const ascii = toArray(text.toLowerCase());
        const q = `lire_question([${ascii}],LMots), produire_reponse(LMots,L_reponse), transformer_reponse_en_string(L_reponse,Message).`;
        plSession.runQuery(q);
        plSession.query(`lire_question([${ascii}], L_Mots), produire_reponse(L_Mots,L_reponse), transformer_reponse_en_string(L_reponse,Message).`);
        response = plSession.get_response();
        speech.text = fromArrayCodeToString(jmjCodeToString(response));
        window.speechSynthesis.speak(speech);
    }
});

const button = document.getElementById("chat-submit");
button.addEventListener('click', () => {
    const input = document.querySelector('.chat-input');
    const question = input.value;
    input.value = "";
    const ascii = toArray(question);
    const q = `lire_question([${ascii}],LMots), produire_reponse(LMots,L_reponse), transformer_reponse_en_string(L_reponse,Message).`;
    addUserMessage(question);
    plSession.runQuery(q);
});

const noteVocale = document.getElementById("chat-voice");
noteVocale.addEventListener('click', () => { recognition.start(); });


// ---- Utilitaires Prolog → JS ---- //

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

// Convertit un terme Prolog pont(X1,Y1,X2,Y2) en [x1,y1,x2,y2]
function fromPontTerm(term) {
    return [
        term.args[0].value,
        term.args[1].value,
        term.args[2].value,
        term.args[3].value
    ];
}

// Génère un identifiant unique normalisé pour un pont
// Toujours coordonnées minimales en premier (ordre lexicographique comme Prolog)
function pontId(x1, y1, x2, y2) {
    if (y1 === y2) {
        const xmin = Math.min(x1, x2);
        const xmax = Math.max(x1, x2);
        return `h-${xmin}-${y1}-${xmax}-${y1}`;
    } else {
        const ymin = Math.min(y1, y2);
        const ymax = Math.max(y1, y2);
        return `v-${x1}-${ymin}-${x1}-${ymax}`;
    }
}


// ---- Construction du plateau ---- //

function print_board() {
    plSession.session.query("casesPlateau(L).");
    plSession.session.answer(rep => {
        const cases = fromList(rep.lookup("L"));
        const limit = 6;

        const plateau = document.getElementById('plateau');
        const table = document.createElement('table');

        const casesParLigne = {};
        cases.forEach(([x, y]) => {
            if (!casesParLigne[y]) casesParLigne[y] = [];
            casesParLigne[y].push(x);
        });

        // Y=6 en haut du DOM, Y=1 en bas (origine coin inférieur gauche)
        const ysDesc = Object.keys(casesParLigne).map(Number).sort((a, b) => b - a);

        ysDesc.forEach(y => {
            const row = document.createElement("tr");
            const rowPontV = document.createElement("tr");
            const hasRowPontV = y > 1;

            casesParLigne[y].sort((a, b) => a - b).forEach(x => {
                const td = document.createElement("td");
                td.classList.add("case");
                td.dataset.x = x;
                td.dataset.y = y;
                row.appendChild(td);

                if (x < limit) {
                    const tdPontH = document.createElement("td");
                    tdPontH.classList.add("pont-h");
                    tdPontH.dataset.x = x;
                    tdPontH.dataset.y = y;
                    row.appendChild(tdPontH);
                }

                if (hasRowPontV) {
                    const tdPontV = document.createElement("td");
                    tdPontV.classList.add("pont-v");
                    tdPontV.dataset.x = x;
                    tdPontV.dataset.y = y - 1; // ymin
                    rowPontV.appendChild(tdPontV);

                    const coin = document.createElement("td");
                    coin.classList.add("coin");
                    rowPontV.appendChild(coin);
                }
            });

            table.appendChild(row);
            if (hasRowPontV) table.appendChild(rowPontV);
        });

        plateau.appendChild(table);
    });
}


// ---- Placement des éléments ---- //

function placerLutin(x, y, couleur) {
    const cas = document.querySelector(`.case[data-x="${x}"][data-y="${y}"]`);
    if (!cas) return;
    const lutin = document.createElement('div');
    lutin.classList.add('lutin', couleur);
    cas.appendChild(lutin);
}

function placerPonth(x1, y1, x2, y2) {
    const xmin = Math.min(x1, x2);
    const xmax = Math.max(x1, x2);
    const cas = document.querySelector(`.pont-h[data-x="${xmin}"][data-y="${y1}"]`);
    if (!cas) { console.error(`pont-h introuvable: (${xmin},${y1})`); return; }
    const div = document.createElement('div');
    div.classList.add('pont-hadded');
    div.dataset.pont = pontId(xmin, y1, xmax, y1);
    cas.appendChild(div);
}

function placerPontV(x1, y1, x2, y2) {
    const ymin = Math.min(y1, y2);
    const ymax = Math.max(y1, y2);
    const cas = document.querySelector(`.pont-v[data-x="${x1}"][data-y="${ymin}"]`);
    if (!cas) { console.error(`pont-v introuvable: (${x1},${ymin})`); return; }
    const div = document.createElement('div');
    div.classList.add('pont-vadded');
    div.dataset.pont = pontId(x1, ymin, x1, ymax);
    cas.appendChild(div);
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

function placer_les_ponts() {
    plSession.session.query("init_ponts_h, init_ponts_v.");
    plSession.session.answer(_ => {});

    plSession.session.query("tous_ponts_h(L).");
    plSession.session.answer(rep => {
        const ponts = fromList(rep.lookup("L"));
        if (ponts) ponts.forEach(([[x1, y1], [x2, y2]]) => placerPonth(x1, y1, x2, y2));
    });

    plSession.session.query("tous_ponts_v(L).");
    plSession.session.answer(rep => {
        const ponts = fromList(rep.lookup("L"));
        if (ponts) ponts.forEach(([[x1, y1], [x2, y2]]) => placerPontV(x1, y1, x2, y2));
    });
}

function refresh_joueurs() {
    document.querySelectorAll('.lutin').forEach(l => l.remove());
    placer_les_joueurs();
    move_luttin();
}


// ---- Gestion des ponts ---- //

function supprimerPontDOM(x1, y1, x2, y2) {
    const id = pontId(x1, y1, x2, y2);
    console.log("Suppression pont id:", id);
    const pont = document.querySelector(`[data-pont="${id}"]`);
    console.log("Pont trouvé:", pont);
    if (pont) {
        pont.remove();
    } else {
        console.warn("Pont DOM introuvable pour id:", id);
    }
}

function tournerPontDOM(x1, y1, x2, y2, ax, ay, sens) {
    supprimerPontDOM(x1, y1, x2, y2);

    if (y1 === y2) {
        let vyMin, vyMax;
        if (sens === "up") { vyMin = ay; vyMax = ay + 1; }
        else { vyMin = ay - 1; vyMax = ay; }
        const id = pontId(ax, vyMin, ax, vyMax);
        const casV = document.querySelector(`.pont-v[data-x="${ax}"][data-y="${vyMin}"]`);
        console.log(`[H→V] Cherche pont-v[data-x="${ax}"][data-y="${vyMin}"] id=${id}`);
        console.log("[H→V] Cellule trouvée:", casV);
        if (casV) {
            const div = document.createElement('div');
            div.classList.add('pont-vadded');
            div.dataset.pont = id;
            casV.appendChild(div);
            console.log("[H→V] Pont créé:", div);
        }
    } else {
        let hxMin, hxMax;
        if (sens === "right") { hxMin = ax; hxMax = ax + 1; }
        else { hxMin = ax - 1; hxMax = ax; }
        const id = pontId(hxMin, ay, hxMax, ay);
        const casH = document.querySelector(`.pont-h[data-x="${hxMin}"][data-y="${ay}"]`);
        console.log(`[V→H] Cherche pont-h[data-x="${hxMin}"][data-y="${ay}"] id=${id}`);
        console.log("[V→H] Cellule trouvée:", casH);
        if (casH) {
            const div = document.createElement('div');
            div.classList.add('pont-hadded');
            div.dataset.pont = id;
            casH.appendChild(div);
            console.log("[V→H] Pont créé:", div);
        }
    }
}

function proposer_actions_ponts(ponts) {
    const panel = document.getElementById("arrow-panel");
    panel.innerHTML = "<p style='color:white;margin:4px 0;font-size:14px'>Ponts traversés :</p>";

    ponts.forEach(pont => {
        const x1 = pont[0];
        const y1 = pont[1];
        const x2 = pont[2];
        const y2 = pont[3];
        const estHorizontal = (y1 === y2);

        const div = document.createElement("div");
        div.style.color = "white";
        div.style.marginBottom = "10px";
        div.style.fontSize = "12px";
        div.style.borderBottom = "1px solid rgba(255,255,255,0.2)";
        div.style.paddingBottom = "8px";
        div.innerHTML = `<strong>(${x1},${y1})→(${x2},${y2})</strong><br>`;

        // Bouton retirer
        const btnRetirer = document.createElement("button");
        btnRetirer.textContent = "Retirer";
        btnRetirer.style.margin = "2px";
        btnRetirer.style.fontSize = "11px";
        btnRetirer.addEventListener("click", () => {
            plSession.session.query(`retirer_pont(${x1}, ${y1}, ${x2}, ${y2}).`);
            plSession.session.answer(_ => {});
            supprimerPontDOM(x1, y1, x2, y2);
            div.remove();
        });
        div.appendChild(btnRetirer);

        // 4 boutons de rotation
        const rotations = estHorizontal ? [
            { ax: x1, ay: y1, sens: "up",   label: `↑ axe (${x1},${y1})` },
            { ax: x1, ay: y1, sens: "down",  label: `↓ axe (${x1},${y1})` },
            { ax: x2, ay: y2, sens: "up",    label: `↑ axe (${x2},${y2})` },
            { ax: x2, ay: y2, sens: "down",  label: `↓ axe (${x2},${y2})` },
        ] : [
            { ax: x1, ay: y1, sens: "right", label: `→ axe (${x1},${y1})` },
            { ax: x1, ay: y1, sens: "left",  label: `← axe (${x1},${y1})` },
            { ax: x2, ay: y2, sens: "right", label: `→ axe (${x2},${y2})` },
            { ax: x2, ay: y2, sens: "left",  label: `← axe (${x2},${y2})` },
        ];

        rotations.forEach(({ ax, ay, sens, label }) => {
            const lax = ax;
            const lay = ay;
            const lsens = sens;

            const btn = document.createElement("button");
            btn.textContent = label;
            btn.style.margin = "2px";
            btn.style.fontSize = "11px";

            btn.addEventListener("click", () => {
                const query = `tourner_pont(${x1}, ${y1}, ${x2}, ${y2}, ${lax}, ${lay}, ${lsens}).`;
                console.log("Query:", query);
                plSession.session.query(query);
                plSession.session.answer(rep => {
                    console.log("Réponse:", pl.format_answer(rep));
                    if (rep && rep !== false) {
                        tournerPontDOM(x1, y1, x2, y2, lax, lay, lsens);
                        div.remove();
                    } else {
                        btn.style.opacity = "0.3";
                        btn.disabled = true;
                    }
                });
            });

            div.appendChild(btn);
        });

        panel.appendChild(div);
    });
}


// ---- Déplacement des lutins ---- //

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
    const color = lutin.classList[1];
    let numJoueur;
    if (color === "vert") numJoueur = 1;
    else if (color === "rouge") numJoueur = 2;
    else if (color === "bleu") numJoueur = 3;
    else numJoueur = 4;

    const xs = lutin.parentElement.dataset.x;
    const ys = lutin.parentElement.dataset.y;

    document.querySelectorAll(".arrow").forEach(arrow => {
        arrow.addEventListener("click", function () {
            const direction = this.classList[1].toLowerCase();
            const query = `deplacement(${numJoueur}, ${xs}, ${ys}, ${direction}, Xf, Yf, Ponts).`;
            console.log("Déplacement query:", query);
            plSession.session.query(query);
            plSession.session.answer(rep => {
                if (rep && rep !== false) {
                    const pontsRaw = rep.lookup("Ponts");
                    const pontsArr = fromList(pontsRaw);
                    refresh_joueurs();
                    if (pontsArr && pontsArr.length > 0) {
                        const ponts = pontsArr.map(fromPontTerm);
                        proposer_actions_ponts(ponts);
                    }
                } else {
                    console.log("Déplacement impossible.");
                }
            });
        });
    });
}

function move_luttin() {
    document.querySelectorAll(".lutin").forEach(lutin => {
        lutin.addEventListener("click", function (event) {
            event.stopPropagation();
            showArrows();
            activatearrows(lutin);
        });
    });
}


// ---- Main ---- //

function main() {
    print_board();
    placer_les_joueurs();
    move_luttin();
    placer_les_ponts();
}

main();