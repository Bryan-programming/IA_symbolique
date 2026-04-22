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

%  calcule la case finale apres glissement — retourne aussi les ponts traversés
calculer_destinationcase(X, Y, Dir, Xf, Yf, [pont(X,Y,X2,Y2)|Reste]) :-
    pont_entre(X, Y, Dir, X2, Y2),
    dans_plateau(X2, Y2),
    \+ occupe(X2, Y2), !,
    calculer_destinationcase(X2, Y2, Dir, Xf, Yf, Reste).

calculer_destinationcase(X, Y, _, X, Y, []).

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


/* --------------------------------------------------------------------- */
/*                     GESTION DES PONTS                                 */
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

% Tourner un pont H (Y1=Y2) sur l'axe (Ax,Ay)
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

% Tourner un pont V (X1=X2) sur l'axe (Ax,Ay)
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


% ----------------------------------------------------------------------------------------
%                               fonctions pour l'IA 
% ----------------------------------------------------------------------------------------

/*
stratégie pour l'ia : 
il faut une fonction qui prend en paramètre l'état actuel du jeu (lutins, ponts, etc),
on définit une profondeur de recherche max (afin de réduire la difficulté notament en début de partie)
l'ia teste chaque mouvement possible dans des copies de l'état actuel qu'elle crée au préalable
une fois qu'elle a finit de faire toute les actions possible on regarde les résultat possible en fonction des mouvement
on choisit ensuite l'état qui a le meilleur score et on return la suite de mouvement qui a permis d'arriver à cet état
on part du principe que si j'appele la fonction, c'est au tour de l'ia de jouer
étant donée qu'on joue contre des joueurs, on part du principe que chaque joueur fais les choix optimale
*/

% spec : Etat contient l'état du jeu, Profondeur correspond au nombre de mouvement qu'on prédit, 
% Joueur correspond au joueur que l'ia joue, BestChoices est le meilleur coup à effectuer pour l'ia
get_IA_choice(Etat, Profondeur, Joueur, Alpha, Beta, BestChoices).
    % étape 1 : créer une copie du jeu afin d'y appliquer une mouvement

    % étape 2 : génerer tout les état possible afin d'applique minMax

    % étape 3 : utiliser l'élagage alpha-béta afin de diminuer le nombre de branches à visiter


% ---------- fonctions à implémenter pour l'ia -------------

%% capturer_etat(-Etat)
%  Lit la base de faits et construit le terme etat/6.
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

% vérifie si il y'a un pont adjacent à la position [X,Y] dans l'état donné
a_un_pont(Etat, [X,Y]) :-
    ponts_adjacents(Etat, [X,Y], Ponts),
    Ponts \= [].

% compte le nombre de ponts adjacents à la position [X,Y] dans l'état donné%
nb_ponts(Etat, [X,Y], N) :-
    ponts_adjacents(Etat, [X,Y], Ponts),
    length(Ponts, N).

% pour gagner le jeu il faut faire en sorte de retirer les ponts autours des lutins ennemis
% donc il faut créer une fonction pour compter le nombre de ponts autour de chaque lutins enemie 
% et par example return le lutins avec le moins de lutins autour de lui. (utilisé dans l'heuristique 1)
get_bridge(Lutins, Etat, Bridges) :-
    maplist(nb_ponts(Etat), Lutins, Bridges).

% fonction qui regarde si un joueur peut bouger au moins 1 de ses lutins.
peut_bouger(Etat, Lutins):-
    member(Pos, Lutins),
    a_un_pont(Etat, Pos).
    % doit encore gérer le cas ou il y a un lutins ennemie sur la case

% return true si une joueur ne peux plus bouger
joueur_bloque(Lutins, Etat):-
    \+ peut_bouger(Etat, Lutins).

% connectivite(+Etat, +[X,Y], -Taille)
% calcule le nombre de noeuds atteignables depuis [X,Y]
% en suivant les ponts existants dans Etat
% exemple : si [X,Y] est dans une zone de 5 noeuds reliés, Taille = 5
connectivite(Etat, [X,Y], Taille) :-
    % collecte tous les noeuds atteignables depuis [X,Y]
    % [[X,Y]] dans Visited pour éviter de revisiter le noeud de départ
    findall(P, atteignable(Etat, [X,Y], P, [[X,Y]]), Noeuds),
    % supprime les doublons — un noeud peut être trouvé par plusieurs chemins
    sort(Noeuds, NoeudUniques),
    % la taille de la composante = nombre de noeuds uniques atteignables
    length(NoeudUniques, Taille).

% atteignable(+Etat, +Pos, -Res, +Visited)
% cas de base : Pos est atteignable depuis lui-même
atteignable(_, Pos, Pos, _).
% cas récursif : Res est atteignable depuis Pos
% si on peut aller vers un noeud voisin non visité, et que Res est atteignable depuis ce noeud
atteignable(Etat, [X,Y], Res, Visited) :-
    % cherche un noeud voisin de [X,Y] via un pont existant
    pont_adjacent(Etat, X, Y, _, X2, Y2),
    % vérifie que ce noeud n'a pas déjà été visité (évite les cycles)
    \+ member([X2,Y2], Visited),
    % continue la recherche depuis le noeud voisin en l'ajoutant aux visités
    atteignable(Etat, [X2,Y2], Res, [[X2,Y2]|Visited]).
% fonction qui verifie si un joueur a gagné et que tout les autres sont éliminé (donc état terminal)
% question : 
% que se passe t il si tout les joueurs sont éliminé en même temps ?
% ma solution est d'implémenter game_over de la façons suivante :
% on regarde si au moins 3 personnes sont éliminé, ce qui gère le cas de base (1 gagnant, 3 personnes éliminé)
% ainsi que le cas oû tout les monde perd (4 personnes éliminé) 
game_over(Etat):-
    Etat = etat(L1, L2, L3, L4, PH, PV),
    (joueur_bloque(L1, Etat) -> B1 = [1]; B1 = []),
    (joueur_bloque(L2, Etat) -> B2 = [2]; B2 = []),
    (joueur_bloque(L3, Etat) -> B3 = [3]; B3 = []),
    (joueur_bloque(L4, Etat) -> B4 = [4]; B4 = []),
    append([B1, B2, B3, B4], Blocked),
    length(Blocked, N),
    N >= 3.

% pour tester la fonction : 
% game_over(etat([[1,1]], [[2,1]], [[3,1]], [[4,1]], [[[1,1],[2,1]], [[2,1],[3,1]], [[3,1],[4,1]]], [])). : échoue
% game_over(etat([[1,1]], [], [[3,1]], [[4,1]], [[[1,1],[2,1]], [[3,1],[4,1]]], [])). : échoue
% game_over(etat([[1,1]], [], [], [], [[[1,1], [2,1]]], [])). : réussi
% game_over(etat([[1,1]], [[2,2]], [[3,3]], [[4,4]], [], [])). : réussi

% fonction qui calcule la valeur associé à un état (non-terminal), sera utilisé dans minMax
% il faut définir plusieur critères qui accorderons des points en fonctions de la situation
% par example on regardes combien de lutins les adversaire peuvent bouger et plus ce chiffre est faible, 
% plus la valeur de la situation est élevé. on peut aussi prendre en compte le nombre de lutins qu'on peut bouger
get_value(Plateau, Joueur, Valeur). 

% applique un mouvement et retourne le nouvelle état 
appliquer_mouvement(Etat, Mouvement, Etat_final).