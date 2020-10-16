/* Tic Tac Toe - Game
 * Copyright (C) 2020 Jeferson Boes
 * Sounds from https://notificationsounds.com/notification-sounds
 */

window.onload = function () {
    console.log("onload");

    let gb = new GameBoard();
    let ogc = new OnlineGameClient();
    let online_mode = false;
    let canvas = document.getElementById('canvas');
    let player = document.getElementById('player');
    let game_status = document.getElementById('game_status');
    let room = document.getElementById('room');
    let wait_ping_count = 9999;

    butNewGame.addEventListener('click', function(evt) {
        if (online_mode) {
            gb.new_game('x', false);
            ogc.sendNewGame('o', false);
        } else {
            gb.new_game();
        }

        notify_player_info('You: ' + gb.piece_type);
    });

    butCreateRoom.addEventListener('click', function(evt) {
        setLoading(true);
        gb.end_game();
        notify_player_info('');
        ogc.createRoom(() => {
            setLoading(false);
        });
    });

    butConnectRoom.addEventListener('click', function(evt) {
        let room_id = ogc.getCurrentRoomId();
        if (room_id == null) room_id = '';
        room_id = prompt("Enter room id", room_id);

        if (room_id != null && room_id.trim() != '') {
            connect_to_room(room_id);
        }
    });

    butEndGame.addEventListener('click', function(evt) {
        if (online_mode) {
            end_online_game();
        } else {
            gb.end_game();
            notify_player_info('');
        }
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

            playAudioEffect(aunt);
        }
    });

    ogc.setOnNewGame(function(piece_type, invert_piece) {
        if (online_mode) {
            console.log('received new game ' + piece_type + ' ' + invert_piece);

            gb.new_game(piece_type, invert_piece);
            gb.lock_moves(true);

            notify_player_info('You: ' + gb.piece_type);

            playAudioEffect(aung);
        }
    });

    ogc.setOnEndGame(function() {
        gb.end_game();
        online_mode = false;
        wait_ping_count = 9999;
        notify_player_info('');
        notify_room_info('');
        setLoading(false);
        window.location.href = get_current_url() + '#room_id=';
    });

    ogc.setOnConnectedToRoom(function() {
        notify_room_info('Current room id: ' + ogc.getCurrentRoomId());
        gb.end_game();
        notify_player_info('');

        online_mode = true;
        let url = get_current_url();
        url += '#room_id=' + ogc.getCurrentRoomId();
        window.location.href = url;
    });

    ogc.setOnPingReceived(function() {
        wait_ping_count = 0;
    });

    gb.setOnNotifyStatus(notify_game_status);
    gb.init_game_board(canvas);

    function notify_player_info(info) {
        player.innerHTML = info;
    }

    function notify_game_status(status, game_over) {
        game_status.innerHTML = status;

        if (game_over)
            playAudioEffect(augo);
    }

    function notify_room_info(room_info) {
        room.innerHTML = room_info;
    }

    function get_current_url() {
        let hash = window.location.hash;
        let url = self.location.href;
        url = url.replace(hash, '');

        return url;
    }

    function connect_to_room(room_id) {
        setLoading(true);
        ogc.connectToRoom(room_id, () => {
            setLoading(false);
        });
    }

    function end_online_game() {
        setLoading(true);
        ogc.finalize_online_game();
    }

    function check_room() {        
        let url = get_current_url();
        let hash = window.location.hash.replace('#', '');
        let params = hash.split('=');

         //get room in anchor
        let room_id = null;
        if (params.length > 1) {            
            if (params[0].toLowerCase() == 'room_id')
                room_id = params[1].trim();
        }

        if (room_id == null || room_id.trim() == '') {
            if (online_mode) end_online_game();
            return;
        }

        if (room_id != null && room_id != '' && room_id != ogc.room_id)
            connect_to_room(room_id);
    }

    check_room();

    window.addEventListener('hashchange', function() {
        console.log('hashchange');

        check_room();
    });

    setInterval(() => {
        wait_ping_count++;
        if (wait_ping_count > 50) {
            let msg = 'No opponent online';
            if (opponent_status.innerHTML != msg) {
                opponent_status.innerHTML = msg;
                playAudioEffect(auout);
            }
        } else {
            let msg = 'Opponent is online';
            if (opponent_status.innerHTML != msg) {
                opponent_status.innerHTML = msg;
                playAudioEffect(auin);
            }
        }
    }, 100);
}

function playAudioEffect(audio) {
    audio.load();

    const playPromise = audio.play()
    if (playPromise !== undefined) {
        playPromise.then(function() {
            msg.style.display = 'none';
        }).catch(function(error) {
            msg.style.display = 'block';
        });
    }
}
