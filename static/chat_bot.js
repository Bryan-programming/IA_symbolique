const CHATBOT = String.raw`
:- use_module(library(lists)).

/* --------------------------------------------------------------------- */
/*                                                                       */
/*        PRODUIRE_REPONSE(L_Mots,L_strings) :                           */
/*                                                                       */
/*        Input : une liste de mots L_Mots representant la question      */
/*                de l'utilisateur                                       */
/*        Output : une liste de strings donnant la                       */
/*                 reponse fournie par le bot                            */
/*                                                                       */
/*        NB Par défaut le predicat retourne dans tous les cas           */
/*            [  "Je ne sais pas.", "Les étudiants",                     */
/*               "vont m'aider, vous le verrez !" ]                      */
/*                                                                       */
/*        Je ne doute pas que ce sera le cas ! Et vous souhaite autant   */
/*        d'amusement a coder le predicat que j'ai eu a ecrire           */
/*        cet enonce et ce squelette de solution !                       */
/*                                                                       */
/* --------------------------------------------------------------------- */


produire_reponse([fin],[L1]) :-
    L1 = [merci, de, m, '\'', avoir, consulte], !.

produire_reponse(L,Rep) :-
    mclef(M,_), member(M,L),
    clause(regle_rep(M,_,Pattern,Rep),Body),
    match_pattern(Pattern,P),
    call(Body), !.

produire_reponse(_,[S1,S2]) :-
    S1 = "je n'ai pas bien compris votre question,",
    S2 = "veuillez recommencer".

match_pattern(Pattern,Lmots) :-
    sublist(Pattern,L_mots).

match_pattern(LPatterns,Lmots) :-
    match_pattern_dist([100|LPatterns],Lmots).

match_pattern_dist([],_).
match_pattern_dist([N,Pattern|Lpatterns],Lmots) :-
    within_dist(N,Pattern,Lmots,Lmots_rem),
    match_pattern_dist(Lpatterns,Lmots_rem).

within_dist(_,Pattern,Lmots,Lmots_rem) :-
    prefixrem(Pattern,Lmots,Lmots_rem).
within_dist(N,Pattern,[_|Lmots],Lmots_rem) :-
    N > 1, Naux is N-1,
    within_dist(Naux,Pattern,Lmots,Lmots_rem).

sublist(SL,L) :-
    prefix(SL,L), !.
sublist(SL,[_|T]) :- sublist(SL,T).

sublistrem(SL,L,Lr) :-
    prefixrem(SL,L,Lr), !.
sublistrem(SL,[_|T],Lr) :- sublistrem(SL,T,Lr).

prefixrem([],L,L).
prefixrem([H|T],[H|L],Lr) :- prefixrem(T,L,Lr).


% ----------------------------------------------------------------%

nb_lutins(4).
nb_equipes(4).
write_to_chars(4,"4 ").

mclef(commence,10).
mclef(equipe,5).
mclef(deplacer,5).
mclef(ordre,7).
mclef(pont, 3).

% --------------------------------------------------------------- %

/* note importante pour comprendre la fonction suivante
le 2ème paramètre est un chiffre qui correspond au niveau de priorité d une règle
plus le chiffre est bas, plus la règle est prioritère par rapport à d'autre ayant la même structure
*/

regle_rep(commence,1,
 [ qui, commence, le, jeu ],
 [ "par convention, c est au joueur en charge des lutins verts de commencer la partie." ] ).

% j'ai décidé de rajouter cet phrase en plus
regle_rep(ordre,7,
 [ [ ordre ], 3, [ joueurs ], 5 ],
 [ "d abord les verts, puis les bleus, puis les jaunes puis les rouges" ] ).

regle_rep(equipe,5,
  [ [ combien ], 3, [ lutins ], 5, [ equipe ] ],
  [ "chaque equipe compte ", X_in_chars, " lutins" ]) :- 
        nb_lutins(X),
        write_to_chars(X,X_in_chars).

regle_rep(deplacer,5,
  [ [ deplacer ], 3, [ lutins ], 5, [ case ], 3, [occupee] ],
  [ "non" ]).

regle_rep(pont,3,
  [ [ pont ], 3, [ retirer ], 5, [ deplace ], 3, [lutin] ],
  [ "Il est permis de retirer le pont emprunte ou tout autre pont." ]).


/* --------------------------------------------------------------------- */
/*                                                                       */
/*          CONVERSION D'UNE QUESTION DE L'UTILISATEUR EN                */
/*                        LISTE DE MOTS                                  */
/*                                                                       */
/* --------------------------------------------------------------------- */

lire_question(Input, LMots) :- read_atomics(Input, LMots).


my_char_type(46,period) :- !.
my_char_type(X,alphanumeric) :- X >= 65, X =< 90, !.
my_char_type(X,alphanumeric) :- X >= 97, X =< 123, !.
my_char_type(X,alphanumeric) :- X >= 48, X =< 57, !.
my_char_type(X,whitespace) :- X =< 32, !.
my_char_type(X,punctuation) :- X >= 33, X =< 47, !.
my_char_type(X,punctuation) :- X >= 58, X =< 64, !.
my_char_type(X,punctuation) :- X >= 91, X =< 96, !.
my_char_type(X,punctuation) :- X >= 123, X =< 126, !.
my_char_type(_,special).

lower_case(X,Y) :-
    X >= 65,
    X =< 90,
    Y is X + 32, !.
lower_case(X,X).

read_lc_string(String) :-
    get0(FirstChar),
    lower_case(FirstChar,LChar),
    read_lc_string_aux(LChar,String).

read_lc_string_aux(10,[]) :- !.
read_lc_string_aux(-1,[]) :- !.
read_lc_string_aux(LChar,[LChar|Rest]) :- read_lc_string(Rest).

extract_word([C|Chars],Rest,[C|RestOfWord]) :-
    my_char_type(C,Type),
    extract_word_aux(Type,Chars,Rest,RestOfWord).

extract_word_aux(special,Rest,Rest,[]) :- !.
extract_word_aux(Type,[C|Chars],Rest,[C|RestOfWord]) :-
    my_char_type(C,Type), !,
    extract_word_aux(Type,Chars,Rest,RestOfWord).
extract_word_aux(_,Rest,Rest,[]).

remove_initial_blanks([C|Chars],Result) :-
    my_char_type(C,whitespace), !,
    remove_initial_blanks(Chars,Result).
remove_initial_blanks(X,X).

digit_value(48,0).
digit_value(49,1).
digit_value(50,2).
digit_value(51,3).
digit_value(52,4).
digit_value(53,5).
digit_value(54,6).
digit_value(55,7).
digit_value(56,8).
digit_value(57,9).

string_to_number(S,N) :-
    string_to_number_aux(S,0,N).
string_to_number_aux([D|Digits],ValueSoFar,Result) :-
    digit_value(D,V),
    NewValueSoFar is 10*ValueSoFar + V,
    string_to_number_aux(Digits,NewValueSoFar,Result).
string_to_number_aux([],Result,Result).

string_to_atomic([C|Chars],Number) :-
    string_to_number([C|Chars],Number), !.
string_to_atomic(String,Atom) :- atom_codes(Atom,String).

extract_atomics(String,ListOfAtomics) :-
    remove_initial_blanks(String,NewString),
    extract_atomics_aux(NewString,ListOfAtomics).
extract_atomics_aux([C|Chars],[A|Atomics]) :-
    extract_word([C|Chars],Rest,Word),
    string_to_atomic(Word,A),
    extract_atomics(Rest,Atomics).
extract_atomics_aux([],[]).

clean_string([C|Chars],L) :-
    my_char_type(C,punctuation),
    clean_string(Chars,L), !.
clean_string([C|Chars],[C|L]) :-
    clean_string(Chars,L), !.
clean_string([C|[]],[]) :-
    my_char_type(C,punctuation), !.
clean_string([C|[]],[C]).

read_atomics(Input, ListOfAtomics) :-
    clean_string(Input,Cleanstring),
    extract_atomics(Cleanstring,ListOfAtomics).


/* --------------------------------------------------------------------- */
/*                                                                       */
/*        PRODUIRE_REPONSE : ecrit la liste de strings                   */
/*                                                                       */
/* --------------------------------------------------------------------- */

transformer_reponse_en_string(Li,Lo) :- flatten_strings_in_sentences(Li,Lo).

flatten_strings_in_sentences([],[]).
flatten_strings_in_sentences([W|T],S) :-
    string_as_list(W,L1),
    flatten_strings_in_sentences(T,L2),
    append(L1,L2,S).

% Pour tau-Prolog
string_as_list(W,W).


/* --------------------------------------------------------------------- */
/*                        FAITS DU JEU PONTU                             */
/* --------------------------------------------------------------------- */

:- dynamic(postionLutinJoueur1/1).
:- dynamic(postionLutinJoueur2/1).
:- dynamic(postionLutinJoueur3/1).
:- dynamic(postionLutinJoueur4/1).
:- dynamic(pont_h/2).
:- dynamic(pont_v/2).

casesPlateau(L):- L=[[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],
        [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
        [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],
        [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],
        [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],
        [1,6],[2,6],[3,6],[4,6],[5,6],[6,6]].

postionLutinJoueur1([[1,1],[2,1],[3,4],[4,1],[5,1],[6,1]]).
postionLutinJoueur2([[1,2],[2,2],[3,1],[4,3],[5,2],[6,3]]).
postionLutinJoueur3([[1,5],[3,5],[2,5],[4,4],[5,5],[6,4]]).
postionLutinJoueur4([[1,6],[2,6],[3,3],[4,6],[5,6],[6,6]]).

init_ponts_h :- casesPlateau(Cases), init_ponts_h_aux(Cases).

init_ponts_h_aux([]).
init_ponts_h_aux([[X,Y]|Rest]) :-
    X < 6, X1 is X + 1,
    assertz(pont_h([X,Y],[X1,Y])),
    init_ponts_h_aux(Rest).
init_ponts_h_aux([[X,_]|Rest]) :-
    X >= 6,
    init_ponts_h_aux(Rest).

init_ponts_v :- casesPlateau(Cases), init_ponts_v_aux(Cases).

init_ponts_v_aux([]).
init_ponts_v_aux([[X,Y]|Rest]) :-
    Y < 6, Y1 is Y + 1,
    assertz(pont_v([X,Y],[X,Y1])),
    init_ponts_v_aux(Rest).
init_ponts_v_aux([[_,Y]|Rest]) :-
    Y >= 6,
    init_ponts_v_aux(Rest).

tous_ponts_h(L) :- findall([[X1,Y1],[X2,Y2]], pont_h([X1,Y1],[X2,Y2]), L).
tous_ponts_v(L) :- findall([[X1,Y1],[X2,Y2]], pont_v([X1,Y1],[X2,Y2]), L).


%----------------------- deplacement des luttins -------------------------------

occupe(X,Y) :-
    postionLutinJoueur1(L1),
    member([X,Y], L1).
occupe(X,Y) :-
    postionLutinJoueur2(L2),
    member([X,Y], L2).
occupe(X,Y) :-
    postionLutinJoueur3(L3),
    member([X,Y], L3).
occupe(X,Y) :-
    postionLutinJoueur4(L4),
    member([X,Y], L4).

dans_plateau(X,Y) :-
    X >= 1, X =< 6,
    Y >= 1, Y =< 6.

pont_entre(X, Y, right, X2, Y) :-
    X2 is X + 1,
    pont_h([X,Y],[X2,Y]).
pont_entre(X, Y, left, X2, Y) :-
    X2 is X - 1,
    pont_h([X2,Y],[X,Y]).
pont_entre(X, Y, up, X, Y2) :-
    Y2 is Y + 1,
    pont_v([X,Y],[X,Y2]).
pont_entre(X, Y, down, X, Y2) :-
    Y2 is Y - 1,
    pont_v([X,Y2],[X,Y]).

calculer_destinationcase(X, Y, Dir, Xf, Yf, [pont(X,Y,X2,Y2)|Reste]) :-
    pont_entre(X, Y, Dir, X2, Y2),
    dans_plateau(X2, Y2),
    \+ occupe(X2, Y2), !,
    calculer_destinationcase(X2, Y2, Dir, Xf, Yf, Reste).
calculer_destinationcase(X, Y, _, X, Y, []).

deplacer_lutin(1, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur1(L),
    select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur1(L)),
    append(LTemp, [[Xf,Yf]], NouvelleL),
    assertz(postionLutinJoueur1(NouvelleL)).
deplacer_lutin(2, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur2(L),
    select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur2(L)),
    append(LTemp, [[Xf,Yf]], NouvelleL),
    assertz(postionLutinJoueur2(NouvelleL)).
deplacer_lutin(3, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur3(L),
    select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur3(L)),
    append(LTemp, [[Xf,Yf]], NouvelleL),
    assertz(postionLutinJoueur3(NouvelleL)).
deplacer_lutin(4, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur4(L),
    select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur4(L)),
    append(LTemp, [[Xf,Yf]], NouvelleL),
    assertz(postionLutinJoueur4(NouvelleL)).

deplacement(Joueur, Xs, Ys, Dir, Xf, Yf, Ponts) :-
    calculer_destinationcase(Xs, Ys, Dir, Xf, Yf, Ponts),
    deplacer_lutin(Joueur, Xs, Ys, Xf, Yf).


/* --------------------------------------------------------------------- */
/*                     GESTION DES PONTS                                 */
/* --------------------------------------------------------------------- */

retirer_pont(X1, Y1, X2, Y2) :-
    Y1 =:= Y2,
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    retract(pont_h([Xmin,Y1],[Xmax,Y1])).
retirer_pont(X1, Y1, X2, Y2) :-
    X1 =:= X2,
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    retract(pont_v([X1,Ymin],[X1,Ymax])).

tourner_pont(X1, Y1, X2, Y1, Ax, Ay, up) :-
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    retract(pont_h([Xmin,Y1],[Xmax,Y1])),
    Ay2 is Ay + 1,
    Ay2 =< 6,
    assertz(pont_v([Ax,Ay],[Ax,Ay2])).
tourner_pont(X1, Y1, X2, Y1, Ax, Ay, down) :-
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    retract(pont_h([Xmin,Y1],[Xmax,Y1])),
    Ay2 is Ay - 1,
    Ay2 >= 1,
    assertz(pont_v([Ax,Ay2],[Ax,Ay])).
tourner_pont(X1, Y1, X1, Y2, Ax, Ay, right) :-
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    retract(pont_v([X1,Ymin],[X1,Ymax])),
    Ax2 is Ax + 1,
    Ax2 =< 6,
    assertz(pont_h([Ax,Ay],[Ax2,Ay])).
tourner_pont(X1, Y1, X1, Y2, Ax, Ay, left) :-
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    retract(pont_v([X1,Ymin],[X1,Ymax])),
    Ax2 is Ax - 1,
    Ax2 >= 1,
    assertz(pont_h([Ax2,Ay],[Ax,Ay])).


/* --------------------------------------------------------------------- */
/*                        FONCTIONS POUR L'IA                            */
/* --------------------------------------------------------------------- */

capturer_etat(etat(L1, L2, L3, L4, PH, PV)) :-
    postionLutinJoueur1(L1),
    postionLutinJoueur2(L2),
    postionLutinJoueur3(L3),
    postionLutinJoueur4(L4),
    tous_ponts_h(PH),
    tous_ponts_v(PV).

lutins_joueur(1, etat(L,_,_,_,_,_), L).
lutins_joueur(2, etat(_,L,_,_,_,_), L).
lutins_joueur(3, etat(_,_,L,_,_,_), L).
lutins_joueur(4, etat(_,_,_,L,_,_), L).

% versions pures pour manipuler l'état sans effet de bord
retirer_pont_ia(etat(L1,L2,L3,L4,PH,PV), X1, Y1, X2, Y2, etat(L1,L2,L3,L4,PH_f,PV)) :-
    Y1 =:= Y2,
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    delete(PH, [[Xmin,Y1],[Xmax,Y1]], PH_f).
retirer_pont_ia(etat(L1,L2,L3,L4,PH,PV), X1, Y1, X2, Y2, etat(L1,L2,L3,L4,PH,PV_f)) :-
    X1 =:= X2,
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    delete(PV, [[X1,Ymin],[X1,Ymax]], PV_f).

tourner_pont_ia(etat(L1,L2,L3,L4,PH,PV), X1, Y1, X2, Y1, Ax, Ay, up, etat(L1,L2,L3,L4,PH_f,PV_f)) :-
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    delete(PH, [[Xmin,Y1],[Xmax,Y1]], PH_f),
    Ay2 is Ay + 1, Ay2 =< 6,
    append(PV, [[[Ax,Ay],[Ax,Ay2]]], PV_f).
tourner_pont_ia(etat(L1,L2,L3,L4,PH,PV), X1, Y1, X2, Y1, Ax, Ay, down, etat(L1,L2,L3,L4,PH_f,PV_f)) :-
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    delete(PH, [[Xmin,Y1],[Xmax,Y1]], PH_f),
    Ay2 is Ay - 1, Ay2 >= 1,
    append(PV, [[[Ax,Ay2],[Ax,Ay]]], PV_f).
tourner_pont_ia(etat(L1,L2,L3,L4,PH,PV), X1, Y1, X1, Y2, Ax, Ay, right, etat(L1,L2,L3,L4,PH_f,PV_f)) :-
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    delete(PV, [[X1,Ymin],[X1,Ymax]], PV_f),
    Ax2 is Ax + 1, Ax2 =< 6,
    append(PH, [[[Ax,Ay],[Ax2,Ay]]], PH_f).
tourner_pont_ia(etat(L1,L2,L3,L4,PH,PV), X1, Y1, X1, Y2, Ax, Ay, left, etat(L1,L2,L3,L4,PH_f,PV_f)) :-
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    delete(PV, [[X1,Ymin],[X1,Ymax]], PV_f),
    Ax2 is Ax - 1, Ax2 >= 1,
    append(PH, [[[Ax,Ay],[Ax2,Ay]]], PH_f).

% comparaison avec -inf
inf_gt(+inf, X) :- X \= +inf, !.
inf_gt(X, -inf) :- X \= -inf, !.
inf_gt(A, B)    :- number(A), number(B), A > B.

% ponts adjacents dans un état pur
pont_adjacent_etat(etat(_,_,_,_,PH,_), X, Y, right, X2, Y) :-
    X2 is X+1, X2 =< 6,
    Xmin is min(X,X2), Xmax is max(X,X2),
    member([[Xmin,Y],[Xmax,Y]], PH).
pont_adjacent_etat(etat(_,_,_,_,PH,_), X, Y, left, X2, Y) :-
    X2 is X-1, X2 >= 1,
    Xmin is min(X,X2), Xmax is max(X,X2),
    member([[Xmin,Y],[Xmax,Y]], PH).
pont_adjacent_etat(etat(_,_,_,_,_,PV), X, Y, up, X, Y2) :-
    Y2 is Y+1, Y2 =< 6,
    Ymin is min(Y,Y2), Ymax is max(Y,Y2),
    member([[X,Ymin],[X,Ymax]], PV).
pont_adjacent_etat(etat(_,_,_,_,_,PV), X, Y, down, X, Y2) :-
    Y2 is Y-1, Y2 >= 1,
    Ymin is min(Y,Y2), Ymax is max(Y,Y2),
    member([[X,Ymin],[X,Ymax]], PV).

% score simplifié : somme des ponts adjacents de chaque lutin du joueur
% CORRECTION : Etat passé directement, pas de terme anonyme dans findall
nb_ponts_etat(Etat, [X,Y], N) :-
    findall(Dir, pont_adjacent_etat(Etat, X, Y, Dir, _, _), Dirs),
    length(Dirs, N).

get_value(Etat, Joueur, Score) :-
    lutins_joueur(Joueur, Etat, Lutins),
    findall(N, (member([X,Y], Lutins), nb_ponts_etat(Etat, [X,Y], N)), Ns),
    sumlist(Ns, Score).

% génère toutes les actions possibles sur un pont traversé
% deux findall séparés pour éviter le ';' dans Tau-Prolog
actions_pont(_Etat, pont(X1,Y1,X2,Y2), Actions) :-
    Y1 =:= Y2, !,
    findall(retirer(X1,Y1,X2,Y2), true, ARet),
    findall(tourner(X1,Y1,X2,Y2,Ax,Ay,Sens),
        ( member(Ax-Ay, [X1-Y1, X2-Y2]),
          member(Sens, [up, down]),
          Ay2 is (Sens = up -> Ay + 1 ; Ay - 1),
          Ay2 >= 1, Ay2 =< 6
        ), ATour),
    append(ARet, ATour, Actions).

actions_pont(_Etat, pont(X1,Y1,X2,Y2), Actions) :-
    X1 =:= X2, !,
    findall(retirer(X1,Y1,X2,Y2), true, ARet),
    findall(tourner(X1,Y1,X2,Y2,Ax,Ay,Sens),
        ( member(Ax-Ay, [X1-Y1, X2-Y2]),
          member(Sens, [right, left]),
          Ax2 is (Sens = right -> Ax + 1 ; Ax - 1),
          Ax2 >= 1, Ax2 =< 6
        ), ATour),
    append(ARet, ATour, Actions).

% applique une action sur un pont dans un état pur
appliquer_action_pont(Etat, retirer(X1,Y1,X2,Y2), EtatFinal) :-
    retirer_pont_ia(Etat, X1, Y1, X2, Y2, EtatFinal).
appliquer_action_pont(Etat, tourner(X1,Y1,X2,Y2,Ax,Ay,Sens), EtatFinal) :-
    tourner_pont_ia(Etat, X1, Y1, X2, Y2, Ax, Ay, Sens, EtatFinal).

% évalue toutes les actions et retourne la meilleure
evaluer_actions_pont(_, _, [], MeilleureAction, _, EtatMeilleur, MeilleureAction, EtatMeilleur) :- !.
evaluer_actions_pont(Etat, Joueur, [Act|Reste], MeilleureAcc, ValAcc, EtatMeilleur, MeilleureAction, EtatFinal) :-
    ( appliquer_action_pont(Etat, Act, EtatApres) ->
        get_value(EtatApres, Joueur, Val),
        ( inf_gt(Val, ValAcc) ->
            NouvelAcc      = Act,
            NouvelVal      = Val,
            NouvelEtatMeil = EtatApres
        ;
            NouvelAcc      = MeilleureAcc,
            NouvelVal      = ValAcc,
            NouvelEtatMeil = EtatMeilleur
        )
    ;
        % action impossible (hors plateau) — on ignore
        NouvelAcc      = MeilleureAcc,
        NouvelVal      = ValAcc,
        NouvelEtatMeil = EtatMeilleur
    ),
    evaluer_actions_pont(Etat, Joueur, Reste, NouvelAcc, NouvelVal, NouvelEtatMeil, MeilleureAction, EtatFinal).

% point d'entrée : choisit la meilleure action sur un pont
meilleure_action_pont(Etat, Joueur, Pont, MeilleureAction, EtatFinal) :-
    actions_pont(Etat, Pont, Actions),
    Actions \= [],
    evaluer_actions_pont(Etat, Joueur, Actions, none, -inf, Etat, MeilleureAction, EtatFinal).

% traite tous les ponts traversés en chaîne
gerer_ponts_IA(_, [], Etat, Etat).
gerer_ponts_IA(Joueur, [Pont|Reste], EtatCourant, EtatFinal) :-
    meilleure_action_pont(EtatCourant, Joueur, Pont, _Action, EtatApres),
    gerer_ponts_IA(Joueur, Reste, EtatApres, EtatFinal).
`