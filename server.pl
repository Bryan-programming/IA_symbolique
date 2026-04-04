:- use_module(library(http/http_server)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_files)).
:- use_module(library(http/http_json)).

:- initialization(main).

main :-
    writeln('STARTING SERVER.......'),
    http_server(http_dispatch, [port(8080)]).

    
:-http_handler(root('tau-prolog.js'),http_reply_file('./static/tau-prolog.js',[]),
[]).

:-http_handler(root('chat_bot.js'),http_reply_file('./static/chat_bot.js',[]),
[]).

:-http_handler(root('prolog_session.js'),http_reply_file('./static/prolog_session.js',[]),
[]).

:-http_handler(root('main.js'),http_reply_file('./static/main.js',[]),
[]).
% 
:-http_handler(root('style.css'),http_reply_file('./static/style.css',[]),
[]).

:-http_handler(root('pontu.jpg'),http_reply_file('./static/pontu.jpg',[]),
[]).

:-http_handler(root('logo.png'),http_reply_file('./static/logo.png',[]),
[]).

:-http_handler(root(.),http_reply_file('./static/index.html',[]),
[]).







