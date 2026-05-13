% ce fichier permettera de s'occuper de la partie
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


% ici je propose cette representation des ponts
% elle est comforme avec ce qui est demande dans l'énoncé
% modifier la si vous avez une autre idée


init_ponts_h :- casesPlateau(Cases), init_ponts_h_aux(Cases).

% fonction pour setup les ponts autour des cases
init_ponts_h_aux([]).
init_ponts_h_aux([[X,Y]|Rest]) :-
    X < 6, X1 is X + 1,
    assertz(pont_h([X,Y],[X1,Y])),
    init_ponts_h_aux(Rest).
init_ponts_h_aux([[X,_]|Rest]) :-
    X >= 6,
    init_ponts_h_aux(Rest).

init_ponts_v :- casesPlateau(Cases), init_ponts_v_aux(Cases).

% fonction pour setup les ponts autour des cases
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


%----------------------- fonction pour le deplacement des luttins -------------------------------

% vérifie si une position est occupée par un lutin du joueur 1
occupe(X,Y) :-
    postionLutinJoueur1(L1),
    member([X,Y], L1).

% vérifie si une position est occupée par un lutin du joueur 2
occupe(X,Y) :-
    postionLutinJoueur2(L2),
    member([X,Y], L2).

% vérifie si une position est occupée par un lutin du joueur 3
occupe(X,Y) :-
    postionLutinJoueur3(L3),
    member([X,Y], L3).

% vérifie si une position est occupée par un lutin du joueur 4
occupe(X,Y) :-
    postionLutinJoueur4(L4),
    member([X,Y], L4).

% vérifie qu'une position est bien contenue dans les limites du plateau
dans_plateau(X,Y) :-
    X >= 1, X =< 6,
    Y >= 1, Y =< 6.

% vérifie qu'il y a un pont à droite de X, Y
pont_entre(X, Y, right, X2, Y) :-
    X2 is X + 1,
    pont_h([X,Y],[X2,Y]).

% vérifie qu'il y a un pont à gauche de X, Y
pont_entre(X, Y, left, X2, Y) :-
    X2 is X - 1,
    pont_h([X2,Y],[X,Y]).

% vérifie qu'il y a un pont au dessus de X, Y
pont_entre(X, Y, up, X, Y2) :-
    Y2 is Y + 1,
    pont_v([X,Y],[X,Y2]).

% vérifie qu'il y a un pont en dessous de X, Y
pont_entre(X, Y, down, X, Y2) :-
    Y2 is Y - 1,
    pont_v([X,Y2],[X,Y]).

% déplace un lutin du joueur 1
deplacer_lutin(1, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur1(L),
    select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur1(L)),
    append(LTemp, [[Xf,Yf]], NouvelleL),
    assertz(postionLutinJoueur1(NouvelleL)).

% déplace un lutin du joueur 2
deplacer_lutin(2, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur2(L),
    select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur2(L)),
    append(LTemp, [[Xf,Yf]], NouvelleL),
    assertz(postionLutinJoueur2(NouvelleL)).

% déplace un lutin du joueur 3
deplacer_lutin(3, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur3(L),
    select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur3(L)),
    append(LTemp, [[Xf,Yf]], NouvelleL),
    assertz(postionLutinJoueur3(NouvelleL)).

% déplace un lutin du joueur 4
deplacer_lutin(4, Xs, Ys, Xf, Yf) :-
    postionLutinJoueur4(L),
    select([Xs,Ys], L, LTemp), !,
    retract(postionLutinJoueur4(L)),
    append(LTemp, [[Xf,Yf]], NouvelleL),
    assertz(postionLutinJoueur4(NouvelleL)).

% Calcule la case finale, retourne les ponts traversés et met à jour la base de connaissance
deplacement(Joueur, Xs, Ys, Dir, Xf, Yf, Ponts) :-
    calculer_destinationcase(Xs, Ys, Dir, Xf, Yf, Ponts),
    deplacer_lutin(Joueur, Xs, Ys, Xf, Yf).

% calcule la case finale depuis (X,Y) dans la direction Dir en utilisant Etat
% et renvoie aussi la liste des ponts parcouru
calculer_case_finale(Etat, X, Y, Dir, Xf, Yf, [pont(X,Y,X2,Y2)|Reste]) :-
    pont_adjacent(Etat, X, Y, Dir, X2, Y2),
    dans_plateau(X2, Y2),
    \+ occupe_etat(Etat, X2, Y2), !,
    calculer_case_finale(Etat, X2, Y2, Dir, Xf, Yf, Reste).

calculer_case_finale(_, X, Y, _, X, Y, []).

% calcule le nouvel état après application du mouvement
nouvel_etat_lutin(Joueur, Xs, Ys, Xf, Yf, Etat, NouvelEtat) :-
    lutins_joueur(Joueur, Etat, L),
    select([Xs,Ys], L, LTemp), !,
    append(LTemp, [[Xf,Yf]], NouvelleL),
    remplacer_lutins(Joueur, Etat, NouvelleL, NouvelEtat).

% version pure de deplacement reservee a l'IA
deplacement_ia(Joueur, Xs, Ys, Dir, Xf, Yf, Ponts, Etat, NouvelEtat) :-
    calculer_case_finale(Etat, Xs, Ys, Dir, Xf, Yf, Ponts),
    nouvel_etat_lutin(Joueur, Xs, Ys, Xf, Yf, Etat, NouvelEtat).


/* --------------------------------------------------------------------- */
/*                     GESTION DES PONTS                                 */
/* --------------------------------------------------------------------- */

% Retirer un pont — normalisation automatique des coordonnées
retirer_pont(X1, Y1, X2, Y2) :-
    Y1 =:= Y2,
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    retract(pont_h([Xmin,Y1],[Xmax,Y1])).

% version pure pour l'utiliser dans MinMax
retirer_pont_ia(etat(L1, L2, L3, L4, PH, PV), X1, Y1, X2, Y2, etat(L1, L2, L3, L4, PH_f, PV)) :-
    Y1 =:= Y2,
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    delete(PH, [[Xmin,Y1],[Xmax,Y1]], PH_f).

retirer_pont(X1, Y1, X2, Y2) :-
    X1 =:= X2,
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    retract(pont_v([X1,Ymin],[X1,Ymax])).

% version pure pour l'utiliser dans MinMax
retirer_pont_ia(etat(L1, L2, L3, L4, PH, PV), X1, Y1, X2, Y2, etat(L1, L2, L3, L4, PH, PV_f)) :-
    X1 =:= X2,
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    delete(PV, [[X1,Ymin],[X1,Ymax]], PV_f).

% Tourner un pont H (Y1=Y2) sur l'axe (Ax,Ay)
tourner_pont(X1, Y1, X2, Y1, Ax, Ay, up) :-
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    retract(pont_h([Xmin,Y1],[Xmax,Y1])),
    Ay2 is Ay + 1,
    Ay2 =< 6,
    assertz(pont_v([Ax,Ay],[Ax,Ay2])).

tourner_pont_ia(etat(L1, L2, L3, L4, PH, PV), X1, Y1, X2, Y1, Ax, Ay, up, etat(L1, L2, L3, L4, PH_f, PV_f)) :-
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    delete(PH, [[Xmin,Y1],[Xmax,Y1]], PH_f),
    Ay2 is Ay + 1,
    Ay2 =< 6,
    append(PV, [[[Ax,Ay],[Ax,Ay2]]], PV_f).

tourner_pont(X1, Y1, X2, Y1, Ax, Ay, down) :-
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    retract(pont_h([Xmin,Y1],[Xmax,Y1])),
    Ay2 is Ay - 1,
    Ay2 >= 1,
    assertz(pont_v([Ax,Ay2],[Ax,Ay])).

tourner_pont_ia(etat(L1, L2, L3, L4, PH, PV), X1, Y1, X2, Y1, Ax, Ay, down, etat(L1, L2, L3, L4, PH_f, PV_f)) :-
    Xmin is min(X1,X2), Xmax is max(X1,X2),
    delete(PH, [[Xmin,Y1],[Xmax,Y1]], PH_f),
    Ay2 is Ay - 1,
    Ay2 >= 1,
    append(PV, [[[Ax,Ay2],[Ax,Ay]]], PV_f).

% Tourner un pont V (X1=X2) sur l'axe (Ax,Ay)
tourner_pont(X1, Y1, X1, Y2, Ax, Ay, right) :-
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    retract(pont_v([X1,Ymin],[X1,Ymax])),
    Ax2 is Ax + 1,
    Ax2 =< 6,
    assertz(pont_h([Ax,Ay],[Ax2,Ay])).

tourner_pont_ia(etat(L1, L2, L3, L4, PH, PV), X1, Y1, X1, Y2, Ax, Ay, right, etat(L1, L2, L3, L4, PH_f, PV_f)) :-
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    delete(PV, [[X1,Ymin],[X1,Ymax]], PV_f),
    Ax2 is Ax + 1,
    Ax2 =< 6,
    append(PH, [[[Ax,Ay],[Ax2,Ay]]], PH_f).

tourner_pont(X1, Y1, X1, Y2, Ax, Ay, left) :-
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    retract(pont_v([X1,Ymin],[X1,Ymax])),
    Ax2 is Ax - 1,
    Ax2 >= 1,
    assertz(pont_h([Ax2,Ay],[Ax,Ay])).

tourner_pont_ia(etat(L1, L2, L3, L4, PH, PV), X1, Y1, X1, Y2, Ax, Ay, left, etat(L1, L2, L3, L4, PH_f, PV_f)) :-
    Ymin is min(Y1,Y2), Ymax is max(Y1,Y2),
    delete(PV, [[X1,Ymin],[X1,Ymax]], PV_f),
    Ax2 is Ax - 1,
    Ax2 >= 1,
    append(PH, [[[Ax,Ay],[Ax2,Ay]]], PH_f).

/* --------------------------------------------------------------------- */
/*              COMPARAISONS AVEC -inf / +inf                            */
/* --------------------------------------------------------------------- */

% inf_gt(+A, +B) : A > B en tenant compte de -inf et +inf
inf_gt(+inf, X) :- X \= +inf, !.
inf_gt(X, -inf) :- X \= -inf, !.
inf_gt(A, B)    :- number(A), number(B), A > B.

% inf_lt(+A, +B) : A < B en tenant compte de -inf et +inf
inf_lt(X, +inf) :- X \= +inf, !.
inf_lt(-inf, X) :- X \= -inf, !.
inf_lt(A, B)    :- number(A), number(B), A < B.

% inf_or_equal(+A, +B) : A =< B en tenant compte de -inf et +inf
inf_or_equal(A, A) :- !.
inf_or_equal(-inf, _) :- !.
inf_or_equal(_, +inf) :- !.
inf_or_equal(A, B) :- number(A), number(B), A =< B.

% doit_couper(+Alpha, +Beta) : vrai si Beta =< Alpha (coupure alpha-beta)
doit_couper(Alpha, Beta) :- inf_or_equal(Beta, Alpha).

% prolog_max(+A, +B, -Max)
prolog_max(+inf, _, +inf) :- !.
prolog_max(_, +inf, +inf) :- !.
prolog_max(-inf, B, B)    :- !.
prolog_max(A, -inf, A)    :- !.
prolog_max(A, B, A) :- A >= B, !.
prolog_max(_, B, B).

% prolog_min(+A, +B, -Min)
prolog_min(-inf, _, -inf) :- !.
prolog_min(_, -inf, -inf) :- !.
prolog_min(+inf, B, B)    :- !.
prolog_min(A, +inf, A)    :- !.
prolog_min(A, B, A) :- A =< B, !.
prolog_min(_, B, B).

/* --------------------------------------------------------------------- */
/*                        FONCTIONS POUR L'IA                            */
/* --------------------------------------------------------------------- */

%% capturer_etat(-Etat)
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

%% remplacer_lutins(+Joueur, +Etat, +NouveauxLutins, -NouvelEtat)
remplacer_lutins(1, etat(_,L2,L3,L4,PH,PV), NL, etat(NL,L2,L3,L4,PH,PV)).
remplacer_lutins(2, etat(L1,_,L3,L4,PH,PV), NL, etat(L1,NL,L3,L4,PH,PV)).
remplacer_lutins(3, etat(L1,L2,_,L4,PH,PV), NL, etat(L1,L2,NL,L4,PH,PV)).
remplacer_lutins(4, etat(L1,L2,L3,_,PH,PV), NL, etat(L1,L2,L3,NL,PH,PV)).

%% pont_adjacent(+Etat, +X, +Y, +Dir, -X2, -Y2)
pont_adjacent(etat(_,_,_,_,PH,_), X, Y, right, X2, Y) :-
    X2 is X+1, X2 =< 6,
    Xmin is min(X,X2), Xmax is max(X,X2),
    member([[Xmin,Y],[Xmax,Y]], PH).
pont_adjacent(etat(_,_,_,_,PH,_), X, Y, left, X2, Y) :-
    X2 is X-1, X2 >= 1,
    Xmin is min(X,X2), Xmax is max(X,X2),
    member([[Xmin,Y],[Xmax,Y]], PH).
pont_adjacent(etat(_,_,_,_,_,PV), X, Y, up, X, Y2) :-
    Y2 is Y+1, Y2 =< 6,
    Ymin is min(Y,Y2), Ymax is max(Y,Y2),
    member([[X,Ymin],[X,Ymax]], PV).
pont_adjacent(etat(_,_,_,_,_,PV), X, Y, down, X, Y2) :-
    Y2 is Y-1, Y2 >= 1,
    Ymin is min(Y,Y2), Ymax is max(Y,Y2),
    member([[X,Ymin],[X,Ymax]], PV).

% vérifie si une position est occupée par un lutin dans un état donné
occupe_etat(etat(L1,L2,L3,L4,_,_), X, Y) :-
    ( member([X,Y], L1)
    ; member([X,Y], L2)
    ; member([X,Y], L3)
    ; member([X,Y], L4)
    ), !.

% retourne la liste des ponts adjacents à la position [X,Y] dans l'état donné
ponts_adjacents(Etat, [X,Y], Ponts) :-
    findall(Dir,
        pont_adjacent(Etat, X, Y, Dir, _, _),
        Ponts).

% vérifie s'il y a un pont adjacent à la position [X,Y] dans l'état donné
a_un_pont(Etat, [X,Y]) :-
    ponts_adjacents(Etat, [X,Y], Ponts),
    Ponts \= [].

% compte le nombre de ponts adjacents à la position [X,Y] dans l'état donné
nb_ponts(Etat, [X,Y], N) :-
    ponts_adjacents(Etat, [X,Y], Ponts),
    length(Ponts, N).

get_bridge(Lutins, Etat, Bridges) :-
    maplist(nb_ponts(Etat), Lutins, Bridges).

% fonction qui regarde si un joueur peut bouger au moins 1 de ses lutins
peut_bouger(Etat, Lutins):-
    member([X, Y], Lutins),
    pont_adjacent(Etat, X, Y, _, X2, Y2),
    dans_plateau(X2, Y2),
    \+ occupe_etat(Etat, X2, Y2).

% un joueur est éliminé si aucun de ses lutins n'a de pont adjacent
joueur_bloque(Lutins, Etat) :-
    \+ a_un_pont_joueur(Etat, Lutins).

a_un_pont_joueur(Etat, Lutins) :-
    member([X,Y], Lutins),
    pont_adjacent(Etat, X, Y, _, _, _).

% connectivite(+Etat, +[X,Y], -Taille)
connectivite(Etat, [X,Y], Taille) :-
    findall(P, atteignable(Etat, [X,Y], P, [[X,Y]]), Noeuds),
    sort(Noeuds, NoeudUniques),
    length(NoeudUniques, Taille).

atteignable(_, Pos, Pos, _) :- !.
atteignable(Etat, [X,Y], Res, Visited) :-
    pont_adjacent(Etat, X, Y, _, X2, Y2),
    \+ member([X2,Y2], Visited),
    atteignable(Etat, [X2,Y2], Res, [[X2,Y2]|Visited]).

% score_lutin(+Etat, +Pos, -Score)
score_lutin(Etat, Pos, Score) :-
    nb_ponts(Etat, Pos, Degre),
    connectivite(Etat, Pos, Taille),
    Score is 5 * Degre + 3 * Taille.

score_joueur(Etat, Joueur, Score) :-
    lutins_joueur(Joueur, Etat, Lutins),
    maplist(score_lutin(Etat), Lutins, Scores),
    sumlist(Scores, Score).

% score_ennemis(+Etat, +Joueur, -ScoreTotal)
score_ennemis(Etat, Joueur, ScoreTotal) :-
    joueurs_ennemis(Joueur, Ennemis),
    maplist(score_joueur(Etat), Ennemis, Scores),
    sumlist(Scores, ScoreTotal).

joueurs_ennemis(Joueur, Ennemis):-
    delete([1, 2, 3, 4], Joueur, Ennemis).

nb_ponts_joueur(Etat, Joueur, Total) :-
    lutins_joueur(Joueur, Etat, Lutins),
    maplist(nb_ponts(Etat), Lutins, Ns),
    sumlist(Ns, Total).

% état terminal : au moins 3 joueurs bloqués
game_over(Etat):-
    Etat = etat(L1, L2, L3, L4, _PH, _PV),
    (joueur_bloque(L1, Etat) -> B1 = [1]; B1 = []),
    (joueur_bloque(L2, Etat) -> B2 = [2]; B2 = []),
    (joueur_bloque(L3, Etat) -> B3 = [3]; B3 = []),
    (joueur_bloque(L4, Etat) -> B4 = [4]; B4 = []),
    append([B1, B2, B3, B4], Blocked),
    length(Blocked, N),
    N >= 3.

% valeur d'un état pour un joueur donné
get_value(Etat, Joueur, -inf):-
    lutins_joueur(Joueur, Etat, Lutins),
    joueur_bloque(Lutins, Etat), !.

get_value(Etat, Joueur, +inf):-
    lutins_joueur(Joueur, Etat, Lutins),
    \+ joueur_bloque(Lutins, Etat),
    game_over(Etat), !.

get_value(Etat, Joueur, Valeur):-
    score_joueur(Etat, Joueur, Score_joueur),
    score_ennemis(Etat, Joueur, Score_enemie_totale),
    Valeur is Score_joueur - (Score_enemie_totale / 4).

/* --------------------------------------------------------------------- */
/*                     GÉNÉRATION DES MOUVEMENTS                         */
/* --------------------------------------------------------------------- */

% fallback : premier mouvement valide, sans critère d'optimisation
generer_mouvement_fallback(Etat, Joueur, Mouvement) :-
    lutins_joueur(Joueur, Etat, Lutins),
    member([Xs,Ys], Lutins),
    member(Dir, [up, down, left, right]),
    calculer_case_finale(Etat, Xs, Ys, Dir, Xf, Yf, Ponts),
    (Xs \= Xf ; Ys \= Yf),
    Mouvement = deplacement_ia(Joueur, Xs, Ys, Dir, Xf, Yf, Ponts, Etat, _),
    !.

% heuristiques en priorité, fallback si les deux échouent
generer_mouvement(Etat, Joueur, Mouvement) :-
    heuristic1_ia(Etat, Joueur, Mouvement).

generer_mouvement(Etat, Joueur, Mouvement) :-
    heuristic2_ia(Etat, Joueur, Mouvement).

generer_mouvement(Etat, Joueur, Mouvement) :-
    \+ heuristic1_ia(Etat, Joueur, _),
    \+ heuristic2_ia(Etat, Joueur, _),
    generer_mouvement_fallback(Etat, Joueur, Mouvement).

% heuristique 1 : offensive — se rapprocher du lutin ennemi le plus vulnérable
heuristic1_ia(Etat, Joueur, Mouvement):-
    joueurs_ennemis(Joueur, Ennemis),
    findall(Pos,
        (member(E, Ennemis), lutins_joueur(E, Etat, Ls), member(Pos, Ls)),
        Lutins_ennemis_total),
    maplist(nb_ponts(Etat), Lutins_ennemis_total, Bridges),
    min_list(Bridges, Min),
    nth0(Index, Bridges, Min),
    nth0(Index, Lutins_ennemis_total, Cible),
    lutins_joueur(Joueur, Etat, Lutins_joueur),
    choisir_lutin_proche(Lutins_joueur, Cible, [X1, Y1]),
    choisir_direction([X1, Y1], Cible, Dir),
    calculer_case_finale(Etat, X1, Y1, Dir, Xf, Yf, Ponts),
    (X1 = Xf, Y1 = Yf -> fail ; true),
    Mouvement = deplacement_ia(Joueur, X1, Y1, Dir, Xf, Yf, Ponts, Etat, _).

distance([X1,Y1], [X2,Y2], D) :-
    DX is abs(X1 - X2),
    DY is abs(Y1 - Y2),
    D is DX + DY.

choisir_lutin_proche(Lutins, Cible, LutinChoisi) :-
    maplist(distance(Cible), Lutins, Distances),
    min_list(Distances, Min),
    nth0(Index, Distances, Min),
    nth0(Index, Lutins, LutinChoisi).

choisir_direction([X1, Y1], [X2, Y2], Dir):-
    (X2 > X1 -> Dir = right;
     X2 < X1 -> Dir = left;
     Y2 > Y1 -> Dir = up;
     Dir = down).

% heuristique 2 : défensive — améliorer la connectivité du lutin le plus vulnérable
heuristic2_ia(Etat, Joueur, Mouvement):-
    lutins_joueur(Joueur, Etat, Lutins_joueur),
    findall([Xs, Ys],
        (member([Xs, Ys], Lutins_joueur), peut_bouger_lutin(Etat, Xs, Ys)),
        LutinsBougeables),
    LutinsBougeables \= [],
    maplist(nb_ponts(Etat), LutinsBougeables, Bridges),
    min_list(Bridges, Min),
    nth0(Index, Bridges, Min),
    nth0(Index, LutinsBougeables, [Xs, Ys]),
    connectivite(Etat, [Xs,Ys], Connec1),
    member(Dir, [up, down, left, right]),
    calculer_case_finale(Etat, Xs, Ys, Dir, Xf, Yf, Ponts),
    (Xs = Xf, Ys = Yf -> fail ; true),
    connectivite(Etat, [Xf, Yf], Connec2),
    Connec2 >= Connec1,
    Mouvement = deplacement_ia(Joueur, Xs, Ys, Dir, Xf, Yf, Ponts, Etat, _).

peut_bouger_lutin(Etat, X, Y) :-
    member(Dir, [up, down, left, right]),
    pont_adjacent(Etat, X, Y, Dir, X2, Y2),
    dans_plateau(X2, Y2),
    \+ occupe_etat(Etat, X2, Y2).

/* --------------------------------------------------------------------- */
/*                     MINMAX AVEC ÉLAGAGE ALPHA-BETA                    */
/* --------------------------------------------------------------------- */

% point d'entrée : initialise alpha=-inf et beta=+inf
get_IA_choice(Etat, Profondeur, Joueur, BestChoices) :-
    minMax(Etat, Joueur, Joueur, Profondeur, -inf, +inf, BestChoices, _Valeur).

% cas de base : profondeur 0
minMax(Etat, JoueurIA, _JoueurActuel, 0, _Alpha, _Beta, none, Valeur) :-
    !,
    get_value(Etat, JoueurIA, Valeur).

% cas de base : partie terminée
minMax(Etat, JoueurIA, _JoueurActuel, _Profondeur, _Alpha, _Beta, none, Valeur) :-
    game_over(Etat),
    !,
    get_value(Etat, JoueurIA, Valeur).

% noeud MAX : c'est le tour de l'IA
minMax(Etat, Joueur_IA, Joueur_IA, Profondeur, Alpha, Beta, MeilleurMvt, Valeur) :-
    Profondeur > 0,
    \+ game_over(Etat),
    findall(Mvt, generer_mouvement(Etat, Joueur_IA, Mvt), Mouvements),
    Mouvements \= [],
    next_player(Joueur_IA, JoueurSuivant),
    NewProfondeur is Profondeur - 1,
    maximiser(Etat, Joueur_IA, JoueurSuivant, NewProfondeur, Alpha, Beta,
              Mouvements, none, -inf, MeilleurMvt, Valeur).

% noeud MIN : c'est le tour d'un ennemi
minMax(Etat, Joueur_IA, JoueurActuel, Profondeur, Alpha, Beta, MeilleurMvt, Valeur) :-
    Profondeur > 0,
    \+ game_over(Etat),
    JoueurActuel \= Joueur_IA,
    findall(Mvt, generer_mouvement(Etat, JoueurActuel, Mvt), Mouvements),
    Mouvements \= [],
    next_player(JoueurActuel, JoueurSuivant),
    NewProfondeur is Profondeur - 1,
    minimiser(Etat, Joueur_IA, JoueurSuivant, NewProfondeur, Alpha, Beta,
              Mouvements, none, +inf, MeilleurMvt, Valeur).

% maximiser : parcourt les mouvements et garde le meilleur pour l'IA
% cas de base : plus de mouvements
maximiser(Etat, JoueurIA, JoueurSuivant, Profondeur, Alpha, Beta,
          [Mvt|Reste], MvtAcc, ValAcc, MeilleurMvt, Valeur) :-
    \+ doit_couper(Alpha, Beta),
    appliquer_mouvement_avec_retrait_ponts(Etat, Mvt, NouvelEtat),
    minMax(NouvelEtat, JoueurIA, JoueurSuivant, Profondeur, Alpha, Beta, _, ValMvt),
    ( inf_gt(ValMvt, ValAcc) ->
        prolog_max(Alpha, ValMvt, NouvelAlpha),
        ( doit_couper(NouvelAlpha, Beta) ->
            MeilleurMvt = Mvt, Valeur = ValMvt  % coupure immédiate
        ;
            maximiser(Etat, JoueurIA, JoueurSuivant, Profondeur,
                      NouvelAlpha, Beta, Reste, Mvt, ValMvt, MeilleurMvt, Valeur)
        )
    ;
        maximiser(Etat, JoueurIA, JoueurSuivant, Profondeur,
                  Alpha, Beta, Reste, MvtAcc, ValAcc, MeilleurMvt, Valeur)
    ).
% garde le pire pour l'IA ennemie
minimiser(Etat, JoueurIA, JoueurSuivant, Profondeur, Alpha, Beta,
          [Mvt|Reste], MvtAcc, ValAcc, MeilleurMvt, Valeur) :-
    \+ doit_couper(Alpha, Beta),
    appliquer_mouvement_avec_retrait_ponts(Etat, Mvt, NouvelEtat),
    minMax(NouvelEtat, JoueurIA, JoueurSuivant, Profondeur, Alpha, Beta, _, ValMvt),
    ( inf_lt(ValMvt, ValAcc) ->
        prolog_min(Beta, ValMvt, NouvelBeta),
        ( doit_couper(Alpha, NouvelBeta) ->
            MeilleurMvt = Mvt, Valeur = ValMvt  % coupure immédiate
        ;
            minimiser(Etat, JoueurIA, JoueurSuivant, Profondeur,
                      Alpha, NouvelBeta, Reste, Mvt, ValMvt, MeilleurMvt, Valeur)
        )
    ;
        minimiser(Etat, JoueurIA, JoueurSuivant, Profondeur,
                  Alpha, Beta, Reste, MvtAcc, ValAcc, MeilleurMvt, Valeur)
    ).

% fonction qui supprime tous les ponts de la liste passée en paramètre
retirer_liste_ponts(Etat, [], Etat).
retirer_liste_ponts(Etat, [pont(X1,Y1,X2,Y2)|Rest], EtatFinal) :-
    retirer_pont_ia(Etat, X1, Y1, X2, Y2, EtatIntermediaire),
    retirer_liste_ponts(EtatIntermediaire, Rest, EtatFinal).

% applique un mouvement et retire tous les ponts traversés
appliquer_mouvement_avec_retrait_ponts(Etat, Mvt, EtatFinal) :-
    Mvt = deplacement_ia(Joueur, Xs, Ys, Dir, Xf, Yf, Ponts, Etat, _),
    calculer_case_finale(Etat, Xs, Ys, Dir, Xf, Yf, Ponts),
    nouvel_etat_lutin(Joueur, Xs, Ys, Xf, Yf, Etat, EtatApresDepl),
    retirer_liste_ponts(EtatApresDepl, Ponts, EtatFinal).

next_player(1, 2).
next_player(2, 3).
next_player(3, 4).
next_player(4, 1).

/* notes supplémentaires :


- La condition d'élimination d'un joueur a été corrigée : un joueur est éliminé uniquement
si aucun de ses lutins n'a de pont adjacent, et non plus s'il ne peut pas bouger
(un lutin bloqué par un ennemi mais ayant des ponts ne compte pas comme éliminé).

- Le fallback garantit qu'une IA trouve toujours un mouvement même si les deux
heuristiques échouent en fin de partie.

- Selon l'énoncé le jeu est sensé être joué à 2, 3 ou 4 joueurs mais dans nos fonctions
on est parti du principe que le jeu est toujours constitué de 4 joueurs.
On devrait le mentionner dans le rapport.

*/