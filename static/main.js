/* From https://www.youtube.com/watch?v=-k-PgvbktX4
   and https://codepen.io/Web_Cifar/pen/jOqBEjE
*/

// fonctions pour gérer l'interface de chat

/**
 * add the user message to the chat interface
 * @param {*} text - the text of the user message
 */
function addUserMessage(text) {
    document.querySelector('.output').innerHTML += `
        <div class="message user">
            <strong>Vous:</strong> ${text}
        </div>`;
}

/**
 * add the agent message to the chat interface
 * @param {*} text - the text of the agent message
 */
function addAgentMessage(text) {
    document.querySelector('.output').innerHTML += `
        <div class="message agent">
            <strong>PBot:</strong> ${text}
        </div>`;
}

/**
 * show a loading message in the chat and return the element to be able to remove it later
 * @returns {HTMLElement} - the loading element
 */
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

function toArray (str) {
  const array = []
  for (let i = 0; i < str.length; ++i) {
    array.push(str.charCodeAt(i))
  }

  array.push(10) // newline character
  return array
}

function fromArrayCodeToString (arr) {
  var res = [];
  for (var i = 0; i < arr.length; i++) {
    res.push(String.fromCharCode(arr[i]));
  }
  return res.join("");
}

function jmjCodeToString (parr) {
   if (parr.args.length == 0) { return [] }
   else { 
     const arr = jmjCodeToString(parr.args[1])
     arr.unshift(parr.args[0].value)
     return arr
   }
}

const texts = document.querySelector(".texts");

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

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

// j'ai essayer de faire des recherches et d'après elles l'event result se declenche quand le micro detecte du son
recognition.addEventListener("result", (e) => {

  const text = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

  console.log(text)
    if (e.results[0].isFinal){
      addUserMessage(text);
      console.log("text prefix")
      console.log(text.slice(0,20))	
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
      real_response = fromArrayCodeToString(jmjCodeToString(response))
      speech.text = real_response;
      window.speechSynthesis.speak(speech);
    }

});


const button= document.getElementById("chat-submit");
button.addEventListener('click',()=>{
const input = document.querySelector('.chat-input');
const question = input.value;
input.value = "";
const ascii_list_of_question= toArray(question);
const question_parse = `lire_question([${ascii_list_of_question}],LMots),
                                  produire_reponse(LMots,L_reponse),
                                        transformer_reponse_en_string(L_reponse,Message).`;
  addUserMessage(question);
  // c'est ici que  j'envoi la requette à le session prolog 
  // runQuery est une methode de la class PrologSession que j'ai ajouté à ceux qui existait pour pouvoir faciler l'affichage de la reponse à l'ecran
  plSession.runQuery(question_parse);
});

// ici j'ajoute la fonctionnalité vocale. 
const noteVocale = document.getElementById("chat-voice");
noteVocale.addEventListener('click',()=>{
      recognition.start();
})







//  ---------------------------- Espace pour les fonctions graphiques utilisant Tau-prolog----------------------------------- \\

// le nom de la session prolog utilisé ici est <<plSession>> c'est lui qu'il faut utliser pour utiliser les methodes de la classe PrologSession





function print_board() {

    let cases;
    plSession.session.query("casesPlateau(L).");
    plSession.session.answer(rep => {
        cases = fromList(rep.lookup("L"));

        let limit =cases[cases.length-1][1];

            const plateau = document.getElementById('plateau');
            const table = document.createElement('table');
            let row, rowPontV;

            cases.forEach(([x, y]) => {

                if (x === 1) {
                    row = document.createElement("tr");
                    if (y !== limit) rowPontV = document.createElement("tr");
                }
                //creation des cases normal
                const td = document.createElement("td");
                td.classList.add("case");
                td.dataset.x = x;
                td.dataset.y = y;
                row.appendChild(td);

                if (x !==limit) {
                    const tdPontH = document.createElement("td");
                    tdPontH.classList.add("pont-h");
                    tdPontH.dataset.x = x;
                    tdPontH.dataset.y = y;
                    row.appendChild(tdPontH);
                }
                // Ajouter les ponts vertical  à la ligne déjà créée
                if (y !== limit) {

                      //creattion des cases pour les  ponts verticale
                      const tdPontV = document.createElement("td");
                      tdPontV.classList.add("pont-v");
                      tdPontV.dataset.x=x;
                      tdPontV.dataset.y=y;
                      rowPontV.appendChild(tdPontV);

                      //creation des espaces vide entre les cases
                      const coin = document.createElement("td");
                      coin.classList.add("coin");
                      rowPontV.appendChild(coin);
                }

                if (x === limit) {
                    table.appendChild(row);
                    if (y !== limit) table.appendChild(rowPontV);
                }
            });
            plateau.appendChild(table);
    });
}

function placerLutin(x, y, couleur) {
    const cas = document.querySelector(`.case[data-x="${x}"][data-y="${y}"]`);//recuperer la case par son id 
    const lutin = document.createElement('div');//creer un div enfant 
    lutin.classList.add('lutin', couleur);//lui donner une classe pour le styliser dans le css 
    cas.appendChild(lutin);//ajout du div cree a la case parente
}

function placerPonth(x1, y1, x2, y2) {
    const cas = document.querySelector(`.pont-h[data-x="${x1}"][data-y="${y1}"]`);


    if (!cas) {
        console.error("Element introuvable !");
        return;
    }

    const pont_h = document.createElement('div');
    pont_h.classList.add('pont-hadded');
    cas.appendChild(pont_h);
}

function placerPontV(x1, y1, x2, y2) {
    const cas = document.querySelector(`.pont-v[data-x="${x1}"][data-y="${y1}"]`);

    if (!cas) {
        console.error("Element introuvable !");
        return;
    }

    const pont_v = document.createElement('div');
    pont_v.classList.add('pont-vadded');
    cas.appendChild(pont_v);
}

function refresh_joueurs() {
    document.querySelectorAll('.lutin').forEach(l => l.remove());
    placer_les_joueurs();
    move_luttin();
}

/*
    place the 4 players on the board using the function placerLutin
*/
function placer_les_joueurs(){

    let player1_luttins;
    let player2_luttins;
    let player3_luttins;
    let player4_luttins;

     // Joueur 1 vert
    plSession.session.query("postionLutinJoueur1(L).");
    plSession.session.answer(rep => {
        if (rep && rep !== false) player1_luttins = fromList(rep.lookup("L"));
    });
    if (player1_luttins) player1_luttins.forEach(([x,y]) => {
        placerLutin(x, y, 'vert');
    });

    // Joueur 2 rouge
    plSession.session.query("postionLutinJoueur2(L).");
    plSession.session.answer(rep => {
        if (rep && rep !== false) player2_luttins = fromList(rep.lookup("L"));
    });
    if (player2_luttins) player2_luttins.forEach(([x,y]) => {
        placerLutin(x, y, 'rouge');
    });

    // Joueur 3  bleu
    plSession.session.query("postionLutinJoueur3(L).");
    plSession.session.answer(rep => {
        if (rep && rep !== false) player3_luttins = fromList(rep.lookup("L"));
    });
    if (player3_luttins) player3_luttins.forEach(([x,y]) => {
        placerLutin(x, y, 'bleu');
    });

    // Joueur 4  jaune
    plSession.session.query("postionLutinJoueur4(L).");
    plSession.session.answer(rep => {
        if (rep && rep !== false) player4_luttins = fromList(rep.lookup("L"));
    });
    if (player4_luttins) player4_luttins.forEach(([x,y]) => {
        placerLutin(x, y, 'jaune');
    });
}


/*
   i copied this function from stackoverflow
   spec : transforme a prolog liste_of_liste to a javascript aray of arrays
*/
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
    if (pl.type.is_term(xs) && xs.indicator === "[]/0") {
        return arr;
    }

    return null;
}


function placer_les_ponts() {
    plSession.session.query("init_ponts_h, init_ponts_v.");
    plSession.session.answer(_ => {});

    // ponts horizontales
    plSession.session.query("tous_ponts_h(L).");
    plSession.session.answer(rep => {
        const ponts = fromList(rep.lookup("L"));
        ponts.forEach(([[x1, y1],[x2, y2]]) => {
            placerPonth(x1, y1, x2, y2);
        });
    });

    // ponts verticales
    plSession.session.query("tous_ponts_v(L).");
    plSession.session.answer(rep => {
        const ponts = fromList(rep.lookup("L"));
        ponts.forEach(([[x1, y1],[x2, y2]]) => {
            placerPontV(x1, y1, x2, y2);
        });
    });
}


//fonction concernants les deplacements des luttins -------------------------------------------------------------------------------------------------------------------------------


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

function activatearrows(lutin){

         let numJoueur;
         const color  = lutin.classList[1] ;

         //ici je recupere la couleur du lutin pour decdier le numero du joueur
         if( color==="vert")numJoueur=1;
         else if ( color==="rouge")numJoueur=2;
         else if ( color==="bleu")numJoueur=3;
         else numJoueur=4;

         // ici je recupere les corddonees de la case source du lutin qu'on veut deplacer
         const xs = lutin.parentElement.dataset.x;
         const ys = lutin.parentElement.dataset.y;

         const allarrows = document.querySelectorAll(".arrow");
         allarrows.forEach(arrow=>{
                arrow.addEventListener("click",function(){
                      console.log("i was called");
                      const direction = this.classList[1];

                      if (direction.toLowerCase() ==="up"){
                            plSession.session.query(`deplacement(${numJoueur}, ${xs}, ${ys}, up, Xf, Yf).`);
                            plSession.session.answer(rep => {
                                if (rep && rep !== false) {
                                    refresh_joueurs();
                                }
                            });
                      }
                      if (direction.toLowerCase() ==="down"){
                              plSession.session.query(`deplacement(${numJoueur}, ${xs}, ${ys}, down, Xf, Yf).`);
                              plSession.session.answer(rep => {
                                  if (rep && rep !== false) {
                                    refresh_joueurs();
                                  }
                              });
                      }
                      if (direction.toLowerCase() ==="right"){
                                 plSession.session.query(`deplacement(${numJoueur}, ${xs}, ${ys}, right, Xf, Yf).`);
                                 plSession.session.answer(rep => {
                                   if (rep && rep !== false) {
                                      refresh_joueurs();
                                   }
                                 });
                      }
                      if  (direction.toLowerCase() ==="left"){
                                plSession.session.query(`deplacement(${numJoueur}, ${xs}, ${ys}, left, Xf, Yf).`);
                                plSession.session.answer(rep => {
                                   if (rep && rep !== false) {
                                       refresh_joueurs();
                                       console.log("i did succed i left ");
                                   }
                                });
                      }
                });
         });
}

/*
    je me suis inspirer de cette video : "https://youtu.be/wX0pb6CBS-c" pour pouvoir detecter un "double click" en dehors d'une div
    cad quand je clique sur un joueur je n'execute le move que si je clique sur la flèche de direction

*/
function  move_luttin(){

          document.querySelectorAll(".lutin").forEach(lutin=>{
                    lutin.addEventListener("click",function (event){
                           const caseDiv = event.target.closest(".case");
                                      const source = [
                                          caseDiv.dataset.x,
                                          caseDiv.dataset.y
                                      ];
                                      showArrows();
                                      activatearrows(lutin);

                    });
          })
}




//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function main(){
     print_board();
     placer_les_joueurs();
     move_luttin();
     placer_les_ponts();

}

main();



//  ----------------------------------------------------- Fin ------------------------------------------------------------- \\
