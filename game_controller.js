/* Tic Tac Toe - Game
 * Copyright (C) 2020 Jeferson Boes
 */

window.onload = function () {
    console.log("onload");

    let gb = new GameBoard();
    let ogc = new OnlineGameClient();    
    let online_mode = false;
    let canvas = document.getElementById('canvas');
    let player = document.getElementById('player');
    let game_status = document.getElementById('game_status');

    butNewGame.addEventListener('click', function(evt) {
        online_mode = false;
        ogc.finalize_online_game();
        gb.new_game();

        notify_player_info('You: ' + gb.piece_type);
    });

    butNewOnlineGame.addEventListener('click', function(evt) {
        online_mode = true;
        ogc.init_online_game();
        gb.new_game('x', false);
        ogc.sendNewGame('o', false);

        notify_player_info('You: ' + gb.piece_type);
    });

    gb.setOnPieceMoved(function (move) {
        notify_player_info('You: ' + gb.piece_type);

        if (online_mode) {
            console.log('send piece moved:' + JSON.stringify(move));

            ogc.sendPieceMoved(move);
            gb.lock_moves(true);
        }
    });

    ogc.setOnMsgPieceMoved(function (move) {
        if (online_mode) {
            console.log('received piece moved:' + JSON.stringify(move));

            gb.notify_piece_moved(move.x, move.y, move.piece);
            gb.lock_moves(false);
        }
    });

    ogc.setOnNewGame(function(piece_type, invert_piece) {
        if (online_mode) {
            console.log('received new game ' + piece_type + ' ' + invert_piece);

            gb.new_game(piece_type, invert_piece);
            gb.lock_moves(true);

            notify_player_info('You: ' + gb.piece_type);
        }
    });

    gb.setOnNotifyStatus(notify_game_status);
    gb.init_game_board(canvas);

    function notify_player_info(info) {
        player.innerHTML = info;
    }

    function notify_game_status(status) {
        game_status.innerHTML = status;
    }
}
