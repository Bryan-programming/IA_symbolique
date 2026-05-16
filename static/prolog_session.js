class PrologSession {

  session = pl.create(10000000);
    
  /**
   * Create a new instance.
   * @param {function(string)} write - Output stream callback
   */
  constructor () {



    // Read prolog programs
    const resultParsing = this.session.consult(CHATBOT)
      
    if (resultParsing !== true) {
      console.error(pl.format_answer(resultParsing))
    }

    // Set default output
    this.session.set_current_output(new pl.type.Stream(
      {
        put (text, _) {
          this.response += text
          return true
        },
        flush: () => true
      },
      'write', 'html_output', 'text', false, 'eof_code'
    ))}
  /**
   * Query the prolog database.
   * @param {String} code - Prolog code to answer
   * @return {Promise<Object|false|null>} - Answer (see tau-prolog)
   */
  query (code) {
    console.log(`?- ${code}`)
    this.session.query(code)
    this.session.answer(rep => {
	console.log(pl.format_answer(rep))

  // à savoir : ici Message est la variable à passer dans le predicat qui fournit la reponse
	if (!rep) {
    addAgentMessage("Erreur : la requête Prolog a échoué.");
    return;
  }

  const msg = rep.lookup("Message");

  if (!msg) {
      addAgentMessage("Erreur : Prolog n’a pas renvoyé de message.");
      return;
  }

  const listRep = fromList(msg);
      })
  }

  reset_response() {
     this.response = ''
  }
    
  get_response() {
    console.log("Essai de retour de response")
    console.log(this.response)
    return this.response }
  
  // j'ai crée cette fonction pour convertir la reponse prolog(list de list d'ascii) en string pour bien l'afficher  
  runQuery(question) {
    console.log("question : " + question);
    this.reset_response();
    
    this.session.query(question);
    this.session.answer(rep => {
        console.log("rep brut:", pl.format_answer(rep));

        // Échec Prolog (false) ou fin de solutions (null)
        if (!rep || rep === false) {
            addAgentMessage("Je n'ai pas compris votre question.");
            return;
        }

        // Vérifier que lookup existe
        if (typeof rep.lookup !== 'function') {
            addAgentMessage("Erreur interne : réponse Prolog inattendue.");
            console.error("rep n'est pas un substitution:", rep);
            return;
        }

        const msg = rep.lookup("Message");
        
        if (!msg) {
            addAgentMessage("Erreur : variable Message non instanciée.");
            console.error("Message non trouvé dans:", pl.format_answer(rep));
            return;
        }

        console.log("msg Prolog:", pl.format_answer(msg));
        
        const listRep = fromList(msg);
        console.log("listRep =", listRep);
        
        const reponse = fromArrayCodeToString(listRep);
        addAgentMessage(reponse);
    });
}

}
