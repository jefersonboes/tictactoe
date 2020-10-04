/* Tic Tac Toe - Game
 * Copyright (C) 2020 Jeferson Boes
 */

const topic_name = 'tic_tac_toe';

class OnlineGameClient {

    constructor() {
        this.client = null;
        this.onMsgPieceMoved = null;
        this.onNewGame = null;
    }

    init_online_game() {        
        if (this.client != null)
            return;

        this.self_id = Math.random().toString(16).substr(2, 8);

        this.client = mqtt.connect('wss://mqtt.flespi.io', {
            clientId: 'tic_tac_toe_' + this.self_id,
            username: 'FlespiToken ' + '5Fq8sZb9tc2nE2LjvkFqndZOBgTEL6PGC3CUQDRaGJnaAZhT7M7iNVWfZDJAzm6Z',
            protocolVersion: 5,
            clean: true,
        });
        log('mqtt client created, connecting...');

        this.client.on('connect', () => {
            log('connected, subscribing to ' + topic_name + ' topic...');

            this.client.subscribe(topic_name, {qos: 1}, (err) => {
                if (err) {
                    log('failed to subscribe to topic ' + topic_name + ':', err);
                    return;
                }
                log('subscribed to ' + topic_name + ' topic');
            });
        });

        this.client.on('message', (topic, msg) => {
            let msgObj = JSON.parse(msg);
            if (msgObj.client_id == this.self_id || topic != topic_name)
                return;

            if (msgObj.type == 'move') {
                if (this.onMsgPieceMoved != null)
                    this.onMsgPieceMoved(msgObj.move);
            } else if (msgObj.type == 'new_game') {
                if (this.onNewGame != null)
                    this.onNewGame(msgObj.piece_type, msgObj.invert_piece);
            }
        });

        this.client.on('close', () => {
            log('disconnected');
        })

        this.client.on('error', (err) => {
            log('mqtt client error:', err);
            this.client.end(true);
            this.client = null;
        });

        function log() {
            let args = Array.prototype.slice.call(arguments);
            console.log.apply(console, args);
        }
    }

    finalize_online_game() {
        if (this.client != null) {
            this.client.end(true);
            this.client = null;
        }
    }

    send_msg(msg) {
        if (this.client == null)
            return;
        msg.client_id = this.self_id;
        msg = JSON.stringify(msg)
        this.client.publish(topic_name, msg, {qos: 1});
    }    

    setOnMsgPieceMoved(onMsgPieceMoved) {
        this.onMsgPieceMoved = onMsgPieceMoved;
    }

    setOnNewGame(onNewGame) {
        this.onNewGame = onNewGame;
    }

    sendPieceMoved(move) {
        let move_msg = {
            type: 'move',
            move: move
        };
        
        this.send_msg(move_msg);
    }

    sendNewGame(piece_type = 'x', invert_piece = true) {
        let new_game_msg = {
            type: 'new_game',
            piece_type: piece_type,
            invert_piece: invert_piece,
        };

        this.send_msg(new_game_msg);
    }
}
