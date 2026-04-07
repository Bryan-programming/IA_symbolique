const CHATBOT = String.raw`
:- use_module(library(lists)).

/* --------------------------------------------------------------------- */
/*        PRODUIRE_REPONSE                                               */
/* --------------------------------------------------------------------- */

produire_reponse([fin],[L1]) :-
    L1 = [merci, de, m, '\'', avoir, consulte], !.

produire_reponse(L,Rep) :-
    mclef(M,_), member(M,L),
    clause(regle_rep(M,_,Pattern,Rep),Body),
    match_pattern(Pattern,L),
    call(Body), !.

produire_reponse(_,[S1,S2]) :-
    S1 = "je n'ai pas bien compris votre question,",
    S2 = "veuillez recommencer".

match_pattern(Pattern,Lmots) :-
    sublist(Pattern,Lmots).

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

nb_lutins(6).
nb_equipes(4).
write_to_chars(6,"6 ").

mclef(commence,10).
mclef(equipe,5).
mclef(deplacer,5).
mclef(ordre,7).
mclef(pont,3).

regle_rep(commence,1,
 [qui, commence, le, jeu],
 ["par convention, c est au joueur en charge des lutins verts de commencer la partie."]).

regle_rep(ordre,7,
 [[ordre], 3, [joueurs], 5],
 ["d abord les verts, puis les bleus, puis les jaunes puis les rouges"]).

regle_rep(equipe,5,
  [[combien], 3, [lutins], 5, [equipe]],
  ["chaque equipe compte ", X_in_chars, " lutins"]) :-
    nb_lutins(X),
    write_to_chars(X,X_in_chars).

regle_rep(deplacer,5,
  [[deplacer], 3, [lutins], 5, [case], 3, [occupee]],
  ["non"]).

regle_rep(pont,3,
  [[pont], 3, [retirer], 5, [deplace], 3, [lutin]],
  ["Il est permis de retirer le pont emprunte ou tout autre pont."]).


/* --------------------------------------------------------------------- */
/*        CONVERSION QUESTION EN LISTE DE MOTS                           */
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

lower_case(X,Y) :- X >= 65, X =< 90, Y is X + 32, !.
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

digit_value(48,0). digit_value(49,1). digit_value(50,2). digit_value(51,3).
digit_value(52,4). digit_value(53,5). digit_value(54,6). digit_value(55,7).
digit_value(56,8). digit_value(57,9).

string_to_number(S,N) :- string_to_number_aux(S,0,N).
string_to_number_aux([D|Digits],VSF,Result) :-
    digit_value(D,V), NVSF is 10*VSF + V,
    string_to_number_aux(Digits,NVSF,Result).
string_to_number_aux([],Result,Result).

string_to_atomic([C|Chars],Number) :- string_to_number([C|Chars],Number), !.
string_to_atomic(String,Atom) :- atom_codes(Atom,String).

extract_atomics(String,ListOfAtomics) :-
    remove_initial_blanks(String,NewString),
    extract_atomics_aux(NewString,ListOfAtomics).
extract_atomics_aux([C|Chars],[A|Atomics]) :-
    extract_word([C|Chars],Rest,Word),
    string_to_atomic(Word,A),
    extract_atomics(Rest,Atomics).
extract_atomics_aux([],[]).

clean_string([C|Chars],L) :- my_char_type(C,punctuation), clean_string(Chars,L), !.
clean_string([C|Chars],[C|L]) :- clean_string(Chars,L), !.
clean_string([C|[]],[]) :- my_char_type(C,punctuation), !.
clean_string([C|[]],[C]).

read_atomics(Input,ListOfAtomics) :-
    clean_string(Input,Cleanstring),
    extract_atomics(Cleanstring,ListOfAtomics).


/* --------------------------------------------------------------------- */
/*        TRANSFORMER REPONSE EN STRING                                  */
/* --------------------------------------------------------------------- */

transformer_reponse_en_string(Li,Lo) :- flatten_strings_in_sentences(Li,Lo).

flatten_strings_in_sentences([],[]).
flatten_strings_in_sentences([W|T],S) :-
    string_as_list(W,L1),
    flatten_strings_in_sentences(T,L2),
    append(L1,L2,S).

string_as_list(W,W).


/* --------------------------------------------------------------------- */
/*        FAITS DU JEU                                                   */
/* --------------------------------------------------------------------- */

:- dynamic(postionLutinJoueur1/1).
:- dynamic(postionLutinJoueur2/1).
:- dynamic(postionLutinJoueur3/1).
:- dynamic(postionLutinJoueur4/1).
:- dynamic(pont_h/2).
:- dynamic(pont_v/2).

casesPlateau(L) :- L = [
    [1,1],[2,1],[3,1],[4,1],[5,1],[6,1],
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
init_ponts_h_aux([[X,_]|Rest]) :- X >= 6, init_ponts_h_aux(Rest).

init_ponts_v :- casesPlateau(Cases), init_ponts_v_aux(Cases).
init_ponts_v_aux([]).
init_ponts_v_aux([[X,Y]|Rest]) :-
    Y < 6, Y1 is Y + 1,
    assertz(pont_v([X,Y],[X,Y1])),
    init_ponts_v_aux(Rest).
init_ponts_v_aux([[_,Y]|Rest]) :- Y >= 6, init_ponts_v_aux(Rest).

tous_ponts_h(L) :- findall([[X1,Y1],[X2,Y2]], pont_h([X1,Y1],[X2,Y2]), L).
tous_ponts_v(L) :- findall([[X1,Y1],[X2,Y2]], pont_v([X1,Y1],[X2,Y2]), L).


/* --------------------------------------------------------------------- */
/*        DEPLACEMENT DES LUTINS                                         */
/* --------------------------------------------------------------------- */

occupe(X,Y) :- postionLutinJoueur1(L1), member([X,Y], L1).
occupe(X,Y) :- postionLutinJoueur2(L2), member([X,Y], L2).
occupe(X,Y) :- postionLutinJoueur3(L3), member([X,Y], L3).
occupe(X,Y) :- postionLutinJoueur4(L4), member([X,Y], L4).

dans_plateau(X,Y) :- X >= 1, X =< 6, Y >= 1, Y =< 6.

pont_entre(X, Y, up, X, Y2) :-
    Y2 is Y + 1,
    pont_v([X,Y],[X,Y2]).

pont_entre(X, Y, down, X, Y2) :-
    Y2 is Y - 1,
    pont_v([X,Y2],[X,Y]).

pont_entre(X, Y, right, X2, Y) :-
    X2 is X + 1,
    pont_h([X,Y],[X2,Y]).

pont_entre(X, Y, left, X2, Y) :-
    X2 is X - 1,
    pont_h([X2,Y],[X,Y]).

calculer_destinationcase(X, Y, Dir, Xf, Yf, [pont(X,Y,X2,Y2)|Reste]) :-
    pont_entre(X, Y, Dir, X2, Y2),
    dans_plateau(X2, Y2),
    \+ occupe(X2, Y2), !,
    calculer_destinationcase(X2, Y2, Dir, Xf, Yf, Reste).
calculer_destinationcase(X, Y, _, X, Y, []).

deplacer_lutin(1, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur1(L), select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur1(L)),
    append(LTemp, [[Xf,Yf]], NL),
    assertz(postionLutinJoueur1(NL)).

deplacer_lutin(2, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur2(L), select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur2(L)),
    append(LTemp, [[Xf,Yf]], NL),
    assertz(postionLutinJoueur2(NL)).

deplacer_lutin(3, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur3(L), select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur3(L)),
    append(LTemp, [[Xf,Yf]], NL),
    assertz(postionLutinJoueur3(NL)).

deplacer_lutin(4, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur4(L), select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur4(L)),
    append(LTemp, [[Xf,Yf]], NL),
    assertz(postionLutinJoueur4(NL)).

deplacement(Joueur, Xs, Ys, Dir, Xf, Yf, Ponts) :-
    calculer_destinationcase(Xs, Ys, Dir, Xf, Yf, Ponts),
    deplacer_lutin(Joueur, Xs, Ys, Xf, Yf).


/* --------------------------------------------------------------------- */
/*        GESTION DES PONTS                                              */
/* --------------------------------------------------------------------- */

% Retirer un pont — normalisation automatique des coordonnées
retirer_pont(X1, Y1, X2, Y2) :-
    Y1 =:= Y2,
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    retract(pont_h([Xmin,Y1],[Xmax,Y1])).

retirer_pont(X1, Y1, X2, Y2) :-
    X1 =:= X2,
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    retract(pont_v([X1,Ymin],[X1,Ymax])).

% Tourner un pont H (Y1=Y2) — 4 rotations selon axe et sens
% axe = case sur laquelle le pont pivote
% sens = up (nouveau pont V vers le haut) ou down (vers le bas)

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

% Tourner un pont V (X1=X2) — 4 rotations selon axe et sens
% sens = right (nouveau pont H vers la droite) ou left (vers la gauche)

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

`