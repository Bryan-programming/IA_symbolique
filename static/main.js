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

recognition.addEventListener("result", (e) => {

  texts.appendChild(p);
  const text = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

  p.innerText = text;
  console.log(text)
    if (e.results[0].isFinal) {
      console.log("text prefix")
      console.log(text.slice(0,20))
	if (text.slice(0,15).includes("bot") || text.slice(0,20).includes("pontu")) {
      question = toArray(text.toLowerCase());
      plSession.query(`
                    lire_question([${question}], L_Mots), 
                    produire_reponse(L_Mots,L_reponse),
                    transformer_reponse_en_string(L_reponse,Message).
		 `);
      response = plSession.get_response();
      console.log("final response")
      real_response = fromArrayCodeToString(jmjCodeToString(response))
      console.log(real_response)
      p = document.createElement("p");
      p.classList.add("replay");
      p.innerText = real_response;
      texts.appendChild(p);
      p = document.createElement("p");
      speech.text = real_response;
      window.speechSynthesis.speak(speech);
    }}

});

recognition.addEventListener("end", () => {
  recognition.start();
});




recognition.start();

const button= document.getElementById("chat-submit");
button.addEventListener('click',()=>{
const input = document.querySelector('.chat-input');
const question = input.value;
input.value = "";
const ascii_list_of_question= toArray(question);
const question_parse = `lire_question([${ascii_list_of_question}],LMots),
                                  produire_reponse(LMots,L_reponse),
                                        transformer_reponse_en_string(L_reponse,Temp),
                                              atom_codes(Message,Temp).`;
  addUserMessage(question);
  // c'est ici que  j'envoi la requette à le session prolog 
  // runQuery est une methode de la class PrologSession que j'ai ajouté à ceux qui existait pour pouvoir faciler l'affichage de la reponse à l'ecran
  plSession.runQuery(question_parse);
});





//  ---------------------------- Espace pour les fonctions graphiques utilisant Tau-prolog----------------------------------- \\

// le nom de la session prolog utilisé ici est <<plSession>> c'est lui qu'il faut utliser pour utiliser les methodes de la classe PrologSession






function print_board() {
    /* ici j'ai suppose que le plateau sera une liste puisque on a pas encore la base de connaissance,
     puis apres quand on la fait en transforme cette base de connaisance en liste comme celle ci .*/


    const cases = [
        [1,1],[2,1],[3,1],[4,1],[5,1],[6,1],
        [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
        [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],
        [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],
        [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],
        [1,6],[2,6],[3,6],[4,6],[5,6],[6,6],
    ];

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
            row.appendChild(tdPontH);
        }
        // Ajouter les ponts vertical  à la ligne déjà créée
        if (y !== limit) {

              //creattion des cases pour les  ponts verticale
              const tdPontV = document.createElement("td");
              tdPontV.classList.add("pont-v");
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

}

function placerLutin(x, y, couleur) {
    const cas = document.querySelector(`.case[data-x="${x}"][data-y="${y}"]`);//recuperer la case par son id 
    const lutin = document.createElement('div');//creer un div enfant 
    lutin.classList.add('lutin', couleur);//lui donner une classe pour le styliser dans le css 
    cas.appendChild(lutin);//ajout du div cree a la case parente
}

print_board();

// placer les lutins pour le test 
    placerLutin(1, 1, 'vert');
    placerLutin(6, 6, 'rouge');
    placerLutin(1, 6, 'bleu');
    placerLutin(6, 1, 'jaune');


// template de code pour les requetes dans le fichier prolog 

// Reda et Rayane utilisez la session  plSession pour travailler: pour faire des requetes
// faites un plSession.query(code) et pour recuperer la reponse vous faites plSession. get_response()

//  Representation prolog que propose adam pour le plateau (ca va directement matcher avec ce que vous faites en javascript)

// casesPlateau(L):- L=[[1,1],[2,1],[3,1],[4,1],[5,1],[6,1], 
//         [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
//         [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],
//         [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],
//         [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],
//         [1,6],[2,6],[3,6],[4,6],[5,6],[6,6]].

// postionLutinJoueur1(L):- L=[[1,1],[2,1],[3,1],[4,1],[5,1],[6,1]].



//  ----------------------------------------------------- Fin ------------------------------------------------------------- \\

