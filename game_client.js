/* Tic Tac Toe - Game
 * Copyright (C) 2020 Jeferson Boes
 */

const topic_name = 'tic_tac_toe';

class OnlineGameClient {

    constructor() {
        this.client = null;
        this.room_id = null;
        this.ping_interval = null;
        this.onMsgPieceMoved = null;
        this.onNewGame = null;
        this.onEndGame = null;
        this.onConnectedToRoom = null;
        this.onPingReceived = null;
    }

    init_online_game(callback) {
        if (this.client != null) {
            if (callback != null) callback();
            return;
        }

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

                if (callback != null)
                    callback();
            });
        });

        this.client.on('message', (topic, msg) => {
            let msgObj = JSON.parse(msg);

            if (topic != topic_name || msgObj.room_id != this.room_id)
                return;
            
            if (msgObj.type == 'end_game') {
                console.log('end game received');

                if (msgObj.new_room_id != null && msgObj.new_room_id == this.room_id) {                
                    console.log('ignored end game');
                    return;
                }
             
                this.client.end(true);
                this.client = null;
                this.room_id = null;
                clearInterval(this.ping_interval);

                if (this.onEndGame != null)
                    this.onEndGame();

                return;
            }

            if (msgObj.client_id == this.self_id)
                return;

            if (msgObj.type == 'move') {
                if (this.onMsgPieceMoved != null)
                    this.onMsgPieceMoved(msgObj.move);
            } else if (msgObj.type == 'new_game') {
                if (this.onNewGame != null)
                    this.onNewGame(msgObj.piece_type, msgObj.invert_piece);
            } else if (msgObj.type == 'req_gb_content') {
                //not implemented
            } else if (msgObj.type == 'ping') {
                if (this.onPingReceived != null)
                    this.onPingReceived();
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

        let self = this;
        this.ping_interval = setInterval(function() {
            self.sendPing();
        }, 1000);
    }

    finalize_online_game() {
        if (this.client != null)
            this.sendEndGame();
    }

    send_msg(msg) {
        if (this.client == null)
            return;
        msg.client_id = this.self_id;
        msg.room_id = this.room_id;
        msg = JSON.stringify(msg)
        this.client.publish(topic_name, msg, {qos: 1});
    }    

    setOnMsgPieceMoved(onMsgPieceMoved) {
        this.onMsgPieceMoved = onMsgPieceMoved;
    }

    setOnNewGame(onNewGame) {
        this.onNewGame = onNewGame;
    }

    setOnEndGame(onEndGame) {
        this.onEndGame = onEndGame;
    }

    setOnConnectedToRoom(onConnectedToRoom) {
        this.onConnectedToRoom = onConnectedToRoom;
    }

    setOnPingReceived(onPingReceived) {
        this.onPingReceived = onPingReceived;
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

    sendEndGame(new_room_id = null) {
        let end_game_msg = {
            type: 'end_game',
            new_room_id: new_room_id,
        };

        console.log('sending end game');
        this.send_msg(end_game_msg);
    }

    sendPing() {
        let ping_smg = {
            type: 'ping',
        }

        this.send_msg(ping_smg);
    }
    
    connectToRoom(room_id, callback = null) {
        if (room_id == this.room_id) {
            if (callback != null) callback();            
            return
        };
                
        this.sendEndGame(room_id);

        this.room_id = room_id;
        this.init_online_game(callback);

        console.log('connected to room id ' + this.room_id);

        if (this.onConnectedToRoom != null)
            this.onConnectedToRoom();
    }

    createRoom(callback = null) {
        let room_id = Math.random().toString(16).substr(2, 8);
        this.connectToRoom(room_id, callback);
    }

    requestGBContent() {
        let req_gb_content_msg = {
            type: 'req_gb_content',
        };

        this.send_msg(req_gb_content_msg);
    }

    getCurrentRoomId() {
        return this.room_id;        
    }
}
