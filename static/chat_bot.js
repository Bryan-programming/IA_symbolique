const CHATBOT = String.raw`
:- use_module(library(lists)).

/* --------------------------------------------------------------------- */
/*                        PRODUIRE_REPONSE                               */
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

sublist(SL,L) :- prefix(SL,L), !.
sublist(SL,[_|T]) :- sublist(SL,T).

sublistrem(SL,L,Lr) :- prefixrem(SL,L,Lr), !.
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
mclef(pont, 3).

regle_rep(commence,1,
 [ qui, commence, le, jeu ],
 [ "par convention, c est au joueur en charge des lutins verts de commencer la partie." ] ).

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
/*                   CONVERSION QUESTION -> LISTE DE MOTS                */
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
    get0(FirstChar), lower_case(FirstChar,LChar),
    read_lc_string_aux(LChar,String).
read_lc_string_aux(10,[]) :- !.
read_lc_string_aux(-1,[]) :- !.
read_lc_string_aux(LChar,[LChar|Rest]) :- read_lc_string(Rest).

extract_word([C|Chars],Rest,[C|RestOfWord]) :-
    my_char_type(C,Type), extract_word_aux(Type,Chars,Rest,RestOfWord).
extract_word_aux(special,Rest,Rest,[]) :- !.
extract_word_aux(Type,[C|Chars],Rest,[C|RestOfWord]) :-
    my_char_type(C,Type), !, extract_word_aux(Type,Chars,Rest,RestOfWord).
extract_word_aux(_,Rest,Rest,[]).

remove_initial_blanks([C|Chars],Result) :-
    my_char_type(C,whitespace), !, remove_initial_blanks(Chars,Result).
remove_initial_blanks(X,X).

digit_value(48,0). digit_value(49,1). digit_value(50,2). digit_value(51,3).
digit_value(52,4). digit_value(53,5). digit_value(54,6). digit_value(55,7).
digit_value(56,8). digit_value(57,9).

string_to_number(S,N) :- string_to_number_aux(S,0,N).
string_to_number_aux([D|Digits],ValueSoFar,Result) :-
    digit_value(D,V), NewValueSoFar is 10*ValueSoFar + V,
    string_to_number_aux(Digits,NewValueSoFar,Result).
string_to_number_aux([],Result,Result).

string_to_atomic([C|Chars],Number) :- string_to_number([C|Chars],Number), !.
string_to_atomic(String,Atom) :- atom_codes(Atom,String).

extract_atomics(String,ListOfAtomics) :-
    remove_initial_blanks(String,NewString),
    extract_atomics_aux(NewString,ListOfAtomics).
extract_atomics_aux([C|Chars],[A|Atomics]) :-
    extract_word([C|Chars],Rest,Word), string_to_atomic(Word,A),
    extract_atomics(Rest,Atomics).
extract_atomics_aux([],[]).

clean_string([C|Chars],L) :- my_char_type(C,punctuation), clean_string(Chars,L), !.
clean_string([C|Chars],[C|L]) :- clean_string(Chars,L), !.
clean_string([C|[]],[]) :- my_char_type(C,punctuation), !.
clean_string([C|[]],[C]).

read_atomics(Input, ListOfAtomics) :-
    clean_string(Input,Cleanstring), extract_atomics(Cleanstring,ListOfAtomics).

transformer_reponse_en_string(Li,Lo) :- flatten_strings_in_sentences(Li,Lo).
flatten_strings_in_sentences([],[]).
flatten_strings_in_sentences([W|T],S) :-
    string_as_list(W,L1), flatten_strings_in_sentences(T,L2), append(L1,L2,S).
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

% PHASE DE PLACEMENT : les lutins commencent avec des listes vides
% Ils seront ajoutés un par un via placer_lutin_joueur/3
postionLutinJoueur1([]).
postionLutinJoueur2([]).
postionLutinJoueur3([]).
postionLutinJoueur4([]).

casesPlateau(L):- L=[[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],
        [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
        [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],
        [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],
        [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],
        [1,6],[2,6],[3,6],[4,6],[5,6],[6,6]].

init_ponts_h :- casesPlateau(Cases), init_ponts_h_aux(Cases).
init_ponts_h_aux([]).
init_ponts_h_aux([[X,Y]|Rest]) :-
    X < 6, X1 is X + 1, assertz(pont_h([X,Y],[X1,Y])), init_ponts_h_aux(Rest).
init_ponts_h_aux([[X,_]|Rest]) :- X >= 6, init_ponts_h_aux(Rest).

init_ponts_v :- casesPlateau(Cases), init_ponts_v_aux(Cases).
init_ponts_v_aux([]).
init_ponts_v_aux([[X,Y]|Rest]) :-
    Y < 6, Y1 is Y + 1, assertz(pont_v([X,Y],[X,Y1])), init_ponts_v_aux(Rest).
init_ponts_v_aux([[_,Y]|Rest]) :- Y >= 6, init_ponts_v_aux(Rest).

tous_ponts_h(L) :- findall([[X1,Y1],[X2,Y2]], pont_h([X1,Y1],[X2,Y2]), L).
tous_ponts_v(L) :- findall([[X1,Y1],[X2,Y2]], pont_v([X1,Y1],[X2,Y2]), L).


/* --------------------------------------------------------------------- */
/*              PHASE DE PLACEMENT : placer un lutin                     */
/* --------------------------------------------------------------------- */

% placer_lutin_joueur(+Joueur, +X, +Y)
% Place un lutin du joueur sur la case (X,Y) si elle est libre
placer_lutin_joueur(1, X, Y) :-
    dans_plateau(X, Y), \+ occupe(X, Y),
    postionLutinJoueur1(L),
    retract(postionLutinJoueur1(L)),
    append(L, [[X,Y]], NL), assertz(postionLutinJoueur1(NL)).

placer_lutin_joueur(2, X, Y) :-
    dans_plateau(X, Y), \+ occupe(X, Y),
    postionLutinJoueur2(L),
    retract(postionLutinJoueur2(L)),
    append(L, [[X,Y]], NL), assertz(postionLutinJoueur2(NL)).

placer_lutin_joueur(3, X, Y) :-
    dans_plateau(X, Y), \+ occupe(X, Y),
    postionLutinJoueur3(L),
    retract(postionLutinJoueur3(L)),
    append(L, [[X,Y]], NL), assertz(postionLutinJoueur3(NL)).

placer_lutin_joueur(4, X, Y) :-
    dans_plateau(X, Y), \+ occupe(X, Y),
    postionLutinJoueur4(L),
    retract(postionLutinJoueur4(L)),
    append(L, [[X,Y]], NL), assertz(postionLutinJoueur4(NL)).

% choisir_placement_ia(+Joueur, -X, -Y)
% Choisit la case ayant le plus de ponts adjacents (pas encore occupée)
% Stratégie : préférer les cases intérieures (plus de connexions)
choisir_placement_ia(_Joueur, X, Y) :-
    findall(N-Xa-Ya,
        (member(Xa, [1,2,3,4,5,6]),
         member(Ya, [1,2,3,4,5,6]),
         \+ occupe(Xa, Ya),
         findall(D, pont_entre(Xa, Ya, D, _, _), Dirs),
         length(Dirs, N)),
        Pairs),
    Pairs \= [],
    msort(Pairs, Sorted),
    last(Sorted, _-X-Y).

% Fallback si msort/last échoue
choisir_placement_ia(_Joueur, X, Y) :-
    member(X, [1,2,3,4,5,6]),
    member(Y, [1,2,3,4,5,6]),
    \+ occupe(X, Y), !.


/* --------------------------------------------------------------------- */
/*                     DEPLACEMENT DES LUTINS                            */
/* --------------------------------------------------------------------- */

occupe(X,Y) :- postionLutinJoueur1(L1), member([X,Y], L1).
occupe(X,Y) :- postionLutinJoueur2(L2), member([X,Y], L2).
occupe(X,Y) :- postionLutinJoueur3(L3), member([X,Y], L3).
occupe(X,Y) :- postionLutinJoueur4(L4), member([X,Y], L4).

dans_plateau(X,Y) :- X >= 1, X =< 6, Y >= 1, Y =< 6.

pont_entre(X, Y, right, X2, Y) :- X2 is X + 1, pont_h([X,Y],[X2,Y]).
pont_entre(X, Y, left,  X2, Y) :- X2 is X - 1, pont_h([X2,Y],[X,Y]).
pont_entre(X, Y, up,  X, Y2)   :- Y2 is Y + 1, pont_v([X,Y],[X,Y2]).
pont_entre(X, Y, down, X, Y2)  :- Y2 is Y - 1, pont_v([X,Y2],[X,Y]).

calculer_destinationcase(X, Y, Dir, Xf, Yf, [pont(X,Y,X2,Y2)|Reste]) :-
    pont_entre(X, Y, Dir, X2, Y2),
    dans_plateau(X2, Y2),
    \+ occupe(X2, Y2), !,
    calculer_destinationcase(X2, Y2, Dir, Xf, Yf, Reste).
calculer_destinationcase(X, Y, _, X, Y, []).

deplacer_lutin(1, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur1(L), select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur1(L)),
    append(LTemp, [[Xf,Yf]], NL), assertz(postionLutinJoueur1(NL)).
deplacer_lutin(2, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur2(L), select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur2(L)),
    append(LTemp, [[Xf,Yf]], NL), assertz(postionLutinJoueur2(NL)).
deplacer_lutin(3, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur3(L), select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur3(L)),
    append(LTemp, [[Xf,Yf]], NL), assertz(postionLutinJoueur3(NL)).
deplacer_lutin(4, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur4(L), select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur4(L)),
    append(LTemp, [[Xf,Yf]], NL), assertz(postionLutinJoueur4(NL)).

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

retirer_pont_ia(etat(L1,L2,L3,L4,PH,PV), X1, Y1, X2, Y2, etat(L1,L2,L3,L4,PH_f,PV)) :-
    Y1 =:= Y2, Xmin is min(X1,X2), Xmax is max(X1,X2),
    delete(PH, [[Xmin,Y1],[Xmax,Y1]], PH_f).
retirer_pont_ia(etat(L1,L2,L3,L4,PH,PV), X1, Y1, X2, Y2, etat(L1,L2,L3,L4,PH,PV_f)) :-
    X1 =:= X2, Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    delete(PV, [[X1,Ymin],[X1,Ymax]], PV_f).

tourner_pont(X1, Y1, X2, Y1, Ax, Ay, up) :-
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    retract(pont_h([Xmin,Y1],[Xmax,Y1])),
    Ay2 is Ay + 1, Ay2 =< 6, assertz(pont_v([Ax,Ay],[Ax,Ay2])).
tourner_pont(X1, Y1, X2, Y1, Ax, Ay, down) :-
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    retract(pont_h([Xmin,Y1],[Xmax,Y1])),
    Ay2 is Ay - 1, Ay2 >= 1, assertz(pont_v([Ax,Ay2],[Ax,Ay])).
tourner_pont(X1, Y1, X1, Y2, Ax, Ay, right) :-
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    retract(pont_v([X1,Ymin],[X1,Ymax])),
    Ax2 is Ax + 1, Ax2 =< 6, assertz(pont_h([Ax,Ay],[Ax2,Ay])).
tourner_pont(X1, Y1, X1, Y2, Ax, Ay, left) :-
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    retract(pont_v([X1,Ymin],[X1,Ymax])),
    Ax2 is Ax - 1, Ax2 >= 1, assertz(pont_h([Ax2,Ay],[Ax,Ay])).

tourner_pont_ia(etat(L1,L2,L3,L4,PH,PV), X1, Y1, X2, Y1, Ax, Ay, up, etat(L1,L2,L3,L4,PH_f,PV_f)) :-
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    delete(PH, [[Xmin,Y1],[Xmax,Y1]], PH_f),
    Ay2 is Ay + 1, Ay2 =< 6, append(PV, [[[Ax,Ay],[Ax,Ay2]]], PV_f).
tourner_pont_ia(etat(L1,L2,L3,L4,PH,PV), X1, Y1, X2, Y1, Ax, Ay, down, etat(L1,L2,L3,L4,PH_f,PV_f)) :-
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    delete(PH, [[Xmin,Y1],[Xmax,Y1]], PH_f),
    Ay2 is Ay - 1, Ay2 >= 1, append(PV, [[[Ax,Ay2],[Ax,Ay]]], PV_f).
tourner_pont_ia(etat(L1,L2,L3,L4,PH,PV), X1, Y1, X1, Y2, Ax, Ay, right, etat(L1,L2,L3,L4,PH_f,PV_f)) :-
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    delete(PV, [[X1,Ymin],[X1,Ymax]], PV_f),
    Ax2 is Ax + 1, Ax2 =< 6, append(PH, [[[Ax,Ay],[Ax2,Ay]]], PH_f).
tourner_pont_ia(etat(L1,L2,L3,L4,PH,PV), X1, Y1, X1, Y2, Ax, Ay, left, etat(L1,L2,L3,L4,PH_f,PV_f)) :-
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    delete(PV, [[X1,Ymin],[X1,Ymax]], PV_f),
    Ax2 is Ax - 1, Ax2 >= 1, append(PH, [[[Ax,Ay],[Ax2,Ay]]], PH_f).


/* --------------------------------------------------------------------- */
/*              COMPARAISONS AVEC -inf / +inf                            */
/* --------------------------------------------------------------------- */

inf_gt(+inf, X) :- X \= +inf, !.
inf_gt(X, -inf) :- X \= -inf, !.
inf_gt(A, B)    :- number(A), number(B), A > B.

inf_lt(X, +inf) :- X \= +inf, !.
inf_lt(-inf, X) :- X \= -inf, !.
inf_lt(A, B)    :- number(A), number(B), A < B.

inf_or_equal(A, A) :- !.
inf_or_equal(-inf, _) :- !.
inf_or_equal(_, +inf) :- !.
inf_or_equal(A, B) :- number(A), number(B), A =< B.

doit_couper(Alpha, Beta) :- inf_or_equal(Beta, Alpha).

prolog_max(+inf, _, +inf) :- !.
prolog_max(_, +inf, +inf) :- !.
prolog_max(-inf, B, B)    :- !.
prolog_max(A, -inf, A)    :- !.
prolog_max(A, B, A) :- A >= B, !.
prolog_max(_, B, B).

prolog_min(-inf, _, -inf) :- !.
prolog_min(_, -inf, -inf) :- !.
prolog_min(+inf, B, B)    :- !.
prolog_min(A, +inf, A)    :- !.
prolog_min(A, B, A) :- A =< B, !.
prolog_min(_, B, B).


/* --------------------------------------------------------------------- */
/*                        FONCTIONS POUR L'IA                            */
/* --------------------------------------------------------------------- */

% CORRECTION : sum_list remplace sumlist (non supporté en Tau-Prolog)
sum_list([], 0).
sum_list([H|T], Sum) :- sum_list(T, Rest), Sum is H + Rest.

capturer_etat(etat(L1, L2, L3, L4, PH, PV)) :-
    postionLutinJoueur1(L1), postionLutinJoueur2(L2),
    postionLutinJoueur3(L3), postionLutinJoueur4(L4),
    tous_ponts_h(PH), tous_ponts_v(PV).

lutins_joueur(1, etat(L,_,_,_,_,_), L).
lutins_joueur(2, etat(_,L,_,_,_,_), L).
lutins_joueur(3, etat(_,_,L,_,_,_), L).
lutins_joueur(4, etat(_,_,_,L,_,_), L).

remplacer_lutins(1, etat(_,L2,L3,L4,PH,PV), NL, etat(NL,L2,L3,L4,PH,PV)).
remplacer_lutins(2, etat(L1,_,L3,L4,PH,PV), NL, etat(L1,NL,L3,L4,PH,PV)).
remplacer_lutins(3, etat(L1,L2,_,L4,PH,PV), NL, etat(L1,L2,NL,L4,PH,PV)).
remplacer_lutins(4, etat(L1,L2,L3,_,PH,PV), NL, etat(L1,L2,L3,NL,PH,PV)).

pont_adjacent(etat(_,_,_,_,PH,_), X, Y, right, X2, Y) :-
    X2 is X+1, X2 =< 6, Xmin is min(X,X2), Xmax is max(X,X2),
    member([[Xmin,Y],[Xmax,Y]], PH).
pont_adjacent(etat(_,_,_,_,PH,_), X, Y, left, X2, Y) :-
    X2 is X-1, X2 >= 1, Xmin is min(X,X2), Xmax is max(X,X2),
    member([[Xmin,Y],[Xmax,Y]], PH).
pont_adjacent(etat(_,_,_,_,_,PV), X, Y, up, X, Y2) :-
    Y2 is Y+1, Y2 =< 6, Ymin is min(Y,Y2), Ymax is max(Y,Y2),
    member([[X,Ymin],[X,Ymax]], PV).
pont_adjacent(etat(_,_,_,_,_,PV), X, Y, down, X, Y2) :-
    Y2 is Y-1, Y2 >= 1, Ymin is min(Y,Y2), Ymax is max(Y,Y2),
    member([[X,Ymin],[X,Ymax]], PV).

occupe_etat(etat(L1,L2,L3,L4,_,_), X, Y) :-
    ( member([X,Y], L1) ; member([X,Y], L2) ; member([X,Y], L3) ; member([X,Y], L4) ), !.

ponts_adjacents(Etat, [X,Y], Ponts) :-
    findall(Dir, pont_adjacent(Etat, X, Y, Dir, _, _), Ponts).

a_un_pont(Etat, [X,Y]) :-
    ponts_adjacents(Etat, [X,Y], Ponts), Ponts \= [].

nb_ponts(Etat, [X,Y], N) :-
    ponts_adjacents(Etat, [X,Y], Ponts), length(Ponts, N).

a_un_pont_joueur(Etat, Lutins) :-
    member([X,Y], Lutins), pont_adjacent(Etat, X, Y, _, _, _).

% Un joueur est éliminé si TOUS ses lutins n'ont aucun pont adjacent
joueur_bloque(Lutins, Etat) :- \+ a_un_pont_joueur(Etat, Lutins).

% Met à jour la liste de lutins d'un joueur dans la base de connaissance
mettre_a_jour_joueur(1, NouvelleL) :-
    retract(postionLutinJoueur1(_)), assertz(postionLutinJoueur1(NouvelleL)).
mettre_a_jour_joueur(2, NouvelleL) :-
    retract(postionLutinJoueur2(_)), assertz(postionLutinJoueur2(NouvelleL)).
mettre_a_jour_joueur(3, NouvelleL) :-
    retract(postionLutinJoueur3(_)), assertz(postionLutinJoueur3(NouvelleL)).
mettre_a_jour_joueur(4, NouvelleL) :-
    retract(postionLutinJoueur4(_)), assertz(postionLutinJoueur4(NouvelleL)).

% Élimine les lutins individuels sans aucun pont adjacent
eliminer_lutins_bloques(Joueur) :-
    capturer_etat(Etat),
    lutins_joueur(Joueur, Etat, Lutins),
    findall([X,Y], (member([X,Y], Lutins), a_un_pont(Etat, [X,Y])), LutinsRestants),
    ( LutinsRestants = Lutins -> true
    ; mettre_a_jour_joueur(Joueur, LutinsRestants)
    ).

% Élimine pour tous les joueurs
eliminer_tous_lutins_bloques :-
    eliminer_lutins_bloques(1),
    eliminer_lutins_bloques(2),
    eliminer_lutins_bloques(3),
    eliminer_lutins_bloques(4).

% Un joueur peut bouger si au moins un lutin peut atteindre une case différente
peut_bouger_un_lutin(Etat, Lutins) :-
    member([Xs,Ys], Lutins),
    member(Dir, [up, down, left, right]),
    calculer_case_finale(Etat, Xs, Ys, Dir, Xf, Yf, _),
    (Xs \= Xf ; Ys \= Yf).

connectivite(Etat, [X,Y], Taille) :-
    findall(P, atteignable(Etat, [X,Y], P, [[X,Y]]), Noeuds),
    sort(Noeuds, NoeudUniques), length(NoeudUniques, Taille).

atteignable(_, Pos, Pos, _) :- !.
atteignable(Etat, [X,Y], Res, Visited) :-
    pont_adjacent(Etat, X, Y, _, X2, Y2),
    \+ member([X2,Y2], Visited),
    atteignable(Etat, [X2,Y2], Res, [[X2,Y2]|Visited]).

% CORRECTION : sans maplist — findall + sum_list
score_lutin(Etat, [X,Y], Score) :-
    nb_ponts(Etat, [X,Y], Degre),
    connectivite(Etat, [X,Y], Taille),
    Score is 5 * Degre + 3 * Taille.

score_joueur(Etat, Joueur, Score) :-
    lutins_joueur(Joueur, Etat, Lutins),
    findall(S, (member(Pos, Lutins), score_lutin(Etat, Pos, S)), Scores),
    sum_list(Scores, Score).

score_ennemis(Etat, Joueur, ScoreTotal) :-
    joueurs_ennemis(Joueur, Ennemis),
    findall(S, (member(E, Ennemis), score_joueur(Etat, E, S)), Scores),
    sum_list(Scores, ScoreTotal).

joueurs_ennemis(Joueur, Ennemis) :- delete([1, 2, 3, 4], Joueur, Ennemis).

% État terminal : au moins 3 joueurs éliminés
game_over(Etat) :-
    Etat = etat(L1, L2, L3, L4, _PH, _PV),
    (joueur_bloque(L1, Etat) -> B1 = [1]; B1 = []),
    (joueur_bloque(L2, Etat) -> B2 = [2]; B2 = []),
    (joueur_bloque(L3, Etat) -> B3 = [3]; B3 = []),
    (joueur_bloque(L4, Etat) -> B4 = [4]; B4 = []),
    append([B1, B2, B3, B4], Blocked),
    length(Blocked, N), N >= 3.

get_value(Etat, Joueur, -inf) :-
    lutins_joueur(Joueur, Etat, Lutins), joueur_bloque(Lutins, Etat), !.
get_value(Etat, Joueur, +inf) :-
    lutins_joueur(Joueur, Etat, Lutins),
    \+ joueur_bloque(Lutins, Etat), game_over(Etat), !.
get_value(Etat, Joueur, Valeur) :-
    score_joueur(Etat, Joueur, Score_joueur),
    score_ennemis(Etat, Joueur, Score_enemie_totale),
    Valeur is Score_joueur - (Score_enemie_totale / 4).


/* --------------------------------------------------------------------- */
/*                  CHOIX DE L'ACTION SUR UN PONT (IA)                   */
/* --------------------------------------------------------------------- */

actions_pont(_Etat, pont(X1,Y1,X2,Y2), Actions) :-
    Y1 =:= Y2, !,
    findall(retirer(X1,Y1,X2,Y2), true, ARet),
    findall(tourner(X1,Y1,X2,Y2,Ax,Ay,Sens),
        ( member(Ax-Ay, [X1-Y1, X2-Y2]),
          member(Sens, [up, down]),
          Ay2 is (Sens = up -> Ay + 1 ; Ay - 1),
          Ay2 >= 1, Ay2 =< 6), ATour),
    append(ARet, ATour, Actions).

actions_pont(_Etat, pont(X1,Y1,X2,Y2), Actions) :-
    X1 =:= X2, !,
    findall(retirer(X1,Y1,X2,Y2), true, ARet),
    findall(tourner(X1,Y1,X2,Y2,Ax,Ay,Sens),
        ( member(Ax-Ay, [X1-Y1, X2-Y2]),
          member(Sens, [right, left]),
          Ax2 is (Sens = right -> Ax + 1 ; Ax - 1),
          Ax2 >= 1, Ax2 =< 6), ATour),
    append(ARet, ATour, Actions).

appliquer_action_pont(Etat, retirer(X1,Y1,X2,Y2), EtatFinal) :-
    retirer_pont_ia(Etat, X1, Y1, X2, Y2, EtatFinal).
appliquer_action_pont(Etat, tourner(X1,Y1,X2,Y2,Ax,Ay,Sens), EtatFinal) :-
    tourner_pont_ia(Etat, X1, Y1, X2, Y2, Ax, Ay, Sens, EtatFinal).

evaluer_actions_pont(_, _, [], MeilleureAction, _, EtatMeilleur, MeilleureAction, EtatMeilleur) :- !.
evaluer_actions_pont(Etat, Joueur, [Act|Reste], MeilleureAcc, ValAcc, EtatMeilleur, MeilleureAction, EtatFinal) :-
    ( appliquer_action_pont(Etat, Act, EtatApres) ->
        get_value(EtatApres, Joueur, Val),
        ( inf_gt(Val, ValAcc) ->
            NouvelAcc = Act, NouvelVal = Val, NouvelEtatMeil = EtatApres
        ; NouvelAcc = MeilleureAcc, NouvelVal = ValAcc, NouvelEtatMeil = EtatMeilleur )
    ; NouvelAcc = MeilleureAcc, NouvelVal = ValAcc, NouvelEtatMeil = EtatMeilleur ),
    evaluer_actions_pont(Etat, Joueur, Reste, NouvelAcc, NouvelVal, NouvelEtatMeil, MeilleureAction, EtatFinal).

meilleure_action_pont(Etat, Joueur, Pont, MeilleureAction, EtatFinal) :-
    actions_pont(Etat, Pont, Actions), Actions \= [],
    evaluer_actions_pont(Etat, Joueur, Actions, none, -inf, Etat, MeilleureAction, EtatFinal).

gerer_ponts_IA(_, [], Etat, Etat).
gerer_ponts_IA(Joueur, [Pont|Reste], EtatCourant, EtatFinal) :-
    meilleure_action_pont(EtatCourant, Joueur, Pont, _Action, EtatApres),
    gerer_ponts_IA(Joueur, Reste, EtatApres, EtatFinal).


/* --------------------------------------------------------------------- */
/*                     GÉNÉRATION DES MOUVEMENTS                         */
/* --------------------------------------------------------------------- */

calculer_case_finale(Etat, X, Y, Dir, Xf, Yf, [pont(X,Y,X2,Y2)|Reste]) :-
    pont_adjacent(Etat, X, Y, Dir, X2, Y2),
    dans_plateau(X2, Y2),
    \+ occupe_etat(Etat, X2, Y2), !,
    calculer_case_finale(Etat, X2, Y2, Dir, Xf, Yf, Reste).
calculer_case_finale(_, X, Y, _, X, Y, []).

nouvel_etat_lutin(Joueur, Xs, Ys, Xf, Yf, Etat, NouvelEtat) :-
    lutins_joueur(Joueur, Etat, L), select([Xs,Ys], L, LTemp), !,
    append(LTemp, [[Xf,Yf]], NouvelleL),
    remplacer_lutins(Joueur, Etat, NouvelleL, NouvelEtat).

generer_mouvement_fallback(Etat, Joueur, Mouvement) :-
    lutins_joueur(Joueur, Etat, Lutins),
    member([Xs,Ys], Lutins),
    member(Dir, [up, down, left, right]),
    calculer_case_finale(Etat, Xs, Ys, Dir, Xf, Yf, Ponts),
    (Xs \= Xf ; Ys \= Yf),
    Mouvement = deplacement_ia(Joueur, Xs, Ys, Dir, Xf, Yf, Ponts, Etat, _), !.

peut_bouger_lutin(Etat, X, Y) :-
    member(Dir, [up, down, left, right]),
    pont_adjacent(Etat, X, Y, Dir, X2, Y2),
    dans_plateau(X2, Y2), \+ occupe_etat(Etat, X2, Y2).

distance([X1,Y1], [X2,Y2], D) :-
    DX is abs(X1-X2), DY is abs(Y1-Y2), D is DX+DY.

% CORRECTION : sans maplist
choisir_lutin_proche(Lutins, Cible, LutinChoisi) :-
    findall(D-Lutin, (member(Lutin, Lutins), distance(Cible, Lutin, D)), Pairs),
    Pairs \= [], msort(Pairs, [_-LutinChoisi|_]).

choisir_direction([X1,Y1], [X2,Y2], Dir) :-
    (X2 > X1 -> Dir = right; X2 < X1 -> Dir = left; Y2 > Y1 -> Dir = up; Dir = down).

heuristic1_ia(Etat, Joueur, Mouvement) :-
    joueurs_ennemis(Joueur, Ennemis),
    findall(N-Pos,
        (member(E, Ennemis), lutins_joueur(E, Etat, Ls), member(Pos, Ls), nb_ponts(Etat, Pos, N)),
        Pairs),
    Pairs \= [], msort(Pairs, [_-Cible|_]),
    lutins_joueur(Joueur, Etat, Lutins_joueur),
    choisir_lutin_proche(Lutins_joueur, Cible, [X1,Y1]),
    choisir_direction([X1,Y1], Cible, Dir),
    calculer_case_finale(Etat, X1, Y1, Dir, Xf, Yf, Ponts),
    (X1 = Xf, Y1 = Yf -> fail ; true),
    Mouvement = deplacement_ia(Joueur, X1, Y1, Dir, Xf, Yf, Ponts, Etat, _).

heuristic2_ia(Etat, Joueur, Mouvement) :-
    lutins_joueur(Joueur, Etat, Lutins_joueur),
    findall(Pos, (member(Pos, Lutins_joueur), Pos = [Xs,Ys], peut_bouger_lutin(Etat, Xs, Ys)), LutinsBougeables),
    LutinsBougeables \= [],
    findall(N-Pos, (member(Pos, LutinsBougeables), nb_ponts(Etat, Pos, N)), Pairs),
    msort(Pairs, [_-[Xs,Ys]|_]),
    connectivite(Etat, [Xs,Ys], Connec1),
    member(Dir, [up, down, left, right]),
    calculer_case_finale(Etat, Xs, Ys, Dir, Xf, Yf, Ponts),
    (Xs = Xf, Ys = Yf -> fail ; true),
    connectivite(Etat, [Xf,Yf], Connec2), Connec2 >= Connec1,
    Mouvement = deplacement_ia(Joueur, Xs, Ys, Dir, Xf, Yf, Ponts, Etat, _).

generer_mouvement(Etat, Joueur, Mouvement) :- heuristic1_ia(Etat, Joueur, Mouvement).
generer_mouvement(Etat, Joueur, Mouvement) :- heuristic2_ia(Etat, Joueur, Mouvement).
generer_mouvement(Etat, Joueur, Mouvement) :-
    \+ heuristic1_ia(Etat, Joueur, _), \+ heuristic2_ia(Etat, Joueur, _),
    generer_mouvement_fallback(Etat, Joueur, Mouvement).

appliquer_mouvement_avec_retrait_ponts(Etat, Mvt, EtatFinal) :-
    Mvt = deplacement_ia(Joueur, Xs, Ys, Dir, Xf, Yf, Ponts, Etat, _),
    calculer_case_finale(Etat, Xs, Ys, Dir, Xf, Yf, Ponts),
    nouvel_etat_lutin(Joueur, Xs, Ys, Xf, Yf, Etat, EtatApresDepl),
    gerer_ponts_IA(Joueur, Ponts, EtatApresDepl, EtatFinal).


/* --------------------------------------------------------------------- */
/*                     MINMAX AVEC ÉLAGAGE ALPHA-BETA                    */
/* --------------------------------------------------------------------- */

get_IA_choice(Etat, Profondeur, Joueur, BestChoices) :-
    minMax(Etat, Joueur, Joueur, Profondeur, -inf, +inf, BestChoices, _Valeur).

minMax(Etat, JoueurIA, _JoueurActuel, 0, _Alpha, _Beta, none, Valeur) :-
    !, get_value(Etat, JoueurIA, Valeur).

minMax(Etat, JoueurIA, _JoueurActuel, _Profondeur, _Alpha, _Beta, none, Valeur) :-
    game_over(Etat), !, get_value(Etat, JoueurIA, Valeur).

minMax(Etat, Joueur_IA, Joueur_IA, Profondeur, Alpha, Beta, MeilleurMvt, Valeur) :-
    Profondeur > 0, \+ game_over(Etat),
    findall(Mvt, generer_mouvement(Etat, Joueur_IA, Mvt), Mouvements),
    Mouvements \= [],
    next_player_ia(Joueur_IA, JoueurSuivant),
    NewProfondeur is Profondeur - 1,
    maximiser(Etat, Joueur_IA, JoueurSuivant, NewProfondeur, Alpha, Beta,
              Mouvements, none, -inf, MeilleurMvt, Valeur).

minMax(Etat, Joueur_IA, JoueurActuel, Profondeur, Alpha, Beta, MeilleurMvt, Valeur) :-
    Profondeur > 0, \+ game_over(Etat), JoueurActuel \= Joueur_IA,
    findall(Mvt, generer_mouvement(Etat, JoueurActuel, Mvt), Mouvements),
    Mouvements \= [],
    next_player_ia(JoueurActuel, JoueurSuivant),
    NewProfondeur is Profondeur - 1,
    minimiser(Etat, Joueur_IA, JoueurSuivant, NewProfondeur, Alpha, Beta,
              Mouvements, none, +inf, MeilleurMvt, Valeur).

maximiser(_, _, _, _, _, _, [], MvtAcc, ValAcc, MvtAcc, ValAcc) :- !.
maximiser(Etat, JoueurIA, JoueurSuivant, Profondeur, Alpha, Beta,
          [Mvt|Reste], MvtAcc, ValAcc, MeilleurMvt, Valeur) :-
    ( doit_couper(Alpha, Beta) -> MeilleurMvt = MvtAcc, Valeur = ValAcc ;
        appliquer_mouvement_avec_retrait_ponts(Etat, Mvt, NouvelEtat),
        minMax(NouvelEtat, JoueurIA, JoueurSuivant, Profondeur, Alpha, Beta, _, ValMvt),
        ( inf_gt(ValMvt, ValAcc) ->
            NouvelMvtAcc = Mvt, NouvelValAcc = ValMvt, prolog_max(Alpha, ValMvt, NouvelAlpha)
        ; NouvelMvtAcc = MvtAcc, NouvelValAcc = ValAcc, NouvelAlpha = Alpha ),
        maximiser(Etat, JoueurIA, JoueurSuivant, Profondeur,
                  NouvelAlpha, Beta, Reste, NouvelMvtAcc, NouvelValAcc, MeilleurMvt, Valeur) ).

minimiser(_, _, _, _, _, _, [], MvtAcc, ValAcc, MvtAcc, ValAcc) :- !.
minimiser(Etat, JoueurIA, JoueurSuivant, Profondeur, Alpha, Beta,
          [Mvt|Reste], MvtAcc, ValAcc, MeilleurMvt, Valeur) :-
    ( doit_couper(Alpha, Beta) -> MeilleurMvt = MvtAcc, Valeur = ValAcc ;
        appliquer_mouvement_avec_retrait_ponts(Etat, Mvt, NouvelEtat),
        minMax(NouvelEtat, JoueurIA, JoueurSuivant, Profondeur, Alpha, Beta, _, ValMvt),
        ( inf_lt(ValMvt, ValAcc) ->
            NouvelMvtAcc = Mvt, NouvelValAcc = ValMvt, prolog_min(Beta, ValMvt, NouvelBeta)
        ; NouvelMvtAcc = MvtAcc, NouvelValAcc = ValAcc, NouvelBeta = Beta ),
        minimiser(Etat, JoueurIA, JoueurSuivant, Profondeur,
                  Alpha, NouvelBeta, Reste, NouvelMvtAcc, NouvelValAcc, MeilleurMvt, Valeur) ).

% Ordre cohérent avec JS : vert(1) → bleu(3) → jaune(4) → rouge(2)
next_player_ia(1, 3).
next_player_ia(3, 4).
next_player_ia(4, 2).
next_player_ia(2, 1).
`