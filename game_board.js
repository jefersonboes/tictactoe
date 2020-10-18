/* Tic Tac Toe - Game
 * Copyright (C) 2020 Jeferson Boes
 */

class GameBoard {

    constructor () {
        this.canvas = null;
        this.ctx = null;

        this.pieces = [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
        ];
        this.clicks = [];
        this.piece_type = '';
        this.invert_piece = true;
        this.line_win = [false, false, false];
        this.col_win = [false, false, false];
        this.cross_win = [false, false];
        this.game_runnning = false;
        this.locked = true;
        this.onPieceMoved = null;
        this.onNotifyStatus = null;
    }

    update_size() {
        this.width = canvas.width;
        this.height = canvas.height;
        this.piece_size = Math.ceil(canvas.width / 3 * .4);
    }

    init_game_board(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        this.update_size();

        let self = this;
        this.canvas.addEventListener('click', function(evt) {
            const rect = self.canvas.getBoundingClientRect();
            const x = evt.clientX - rect.left;
            const y = evt.clientY - rect.top;
    
            self.clicks.push({x: x, y: y});
    
            self.detect_click_position(x, y);
        });

        this.canvas.addEventListener('mousedown', function(evt) {
            //prevent text selects
            evt.preventDefault();
        });

        setInterval(function() {
            self.clear_clicks();
        }, 300);
    
        this.render_start();
    }
    
    new_game(piece_type = 'x', invert_piece = true) {
        console.log('new_game');
        
        this.pieces = [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
        ];
        this.clicks = [];
        this.piece_type = piece_type;
        this.invert_piece = invert_piece;
        this.line_win = [false, false, false];
        this.col_win = [false, false, false];
        this.cross_win = [false, false];
        this.game_runnning = true;
        this.locked = false;
    
        this.notify_game_status('player x plays', false);
    }

    end_game() {
        console.log('end_game');
        
        this.pieces = [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
        ];
        this.clicks = [];
        this.piece_type = 'x';
        this.invert_piece = true;
        this.line_win = [false, false, false];
        this.col_win = [false, false, false];
        this.cross_win = [false, false];
        this.game_runnning = false;
        this.locked = false;
    
        this.notify_game_status('Game stopped', false);
    }

    setOnPieceMoved(onPieceMoved) {
        this.onPieceMoved = onPieceMoved;
    }

    setOnNotifyStatus(onNotifyStatus) {
        this.onNotifyStatus = onNotifyStatus;
    }
    
    notify_piece_moved(x, y, piece) {
        this.pieces[y][x] = piece;
    
        if (piece == 'o')
            piece = 'x';
        else
            piece = 'o';
    
        this.notify_game_status('player ' + piece + ' plays', false);
    
        this.detect_winner();
    }
    
    lock_moves(lock) {
        this.locked = lock;
    }

    isLocked() {
        return this.locked;
    }

    notify_game_status(status, game_over) {
        if (this.onNotifyStatus != null)
            this.onNotifyStatus(status, game_over);
    }

    clear_clicks() {
        if (this.clicks.length > 0)
            this.clicks.splice(0, 1);
    }
    
    detect_winner() {
        let check_pieces_win = function(self, piece) {
            let detect_line = function(line, piece) {
                for (let x = 0; x < 3; x++)
                    if (self.pieces[line][x] != piece)
                        return false;
                return true;
            }
    
            let detect_col = function(col, piece) {
                for (let y = 0; y < 3; y++)
                    if (self.pieces[y][col] != piece)
                        return false;
                return true;
            }
    
            for (let y = 0; y < 3; y++) {
                if (detect_line(y, piece)) {
                    self.line_win[y]  = true;
                    console.log('line win ' + piece + ' ' +  y);
                    return true;
                }
            }
    
            for (let x = 0; x < 3; x++) {
                if (detect_col(x, piece)) {
                    self.col_win[x]  = true;
                    console.log('col win ' + piece + ' ' +  x);
                    return true;
                }
            }
    
            let cross_win_check = true
            for (let i = 0; i < 3; i++) {        
                if (self.pieces[i][i] != piece)
                    cross_win_check = false;
            }
            if (cross_win_check) {
                self.cross_win[0] = true;
                console.log('cross win ' + piece + ' ' + '0');
                return true;
            }
    
            cross_win_check = true
            for (let i = 2; i >= 0; i--) {   
                if (self.pieces[i][2-i] != piece)
                    cross_win_check = false;
            }
            if (cross_win_check) {
                self.cross_win[1] = true;
                console.log('cross win ' + piece + ' ' +  '1');
                return true;
            }
    
            return false;
        }
    
        if (check_pieces_win(this, 'x')) {
            this.game_runnning = false;
            this.notify_game_status('player x winner', true);
            console.log('player x winner');
        } else if (check_pieces_win(this, 'o')) {
            this.game_runnning = false;
            this.notify_game_status('player o winner', true);
            console.log('player o winner');
        } else {
            let canContinue = false;

            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    if (this.pieces[y][x] == '') {
                        canContinue = true;
                        break;
                    }
                }

                if (canContinue)
                    break;
            }

            if (!canContinue) {
                this.game_runnning = false;
                this.notify_game_status('game over, without winners', true);
                console.log('game over, without winners');
            }
        }
    }

    detect_click_position(x, y) {
        let xx = Math.trunc(x / (this.width / 3));
        let yy = Math.trunc(y / (this.height / 3));
    
        if (xx < 3 && yy < 3) {
            if (this.game_runnning && !this.locked) {
                this.move_piece(xx, yy);
                this.detect_winner();
            }
            console.log('click: ' + xx + ', ' + yy);
        }
    }
    
    move_piece(x, y) {
        if (this.pieces[y][x] == '') {
            let piece = this.piece_type;
            this.pieces[y][x] = piece;

            let inverted_piece = this.piece_type;
            if (inverted_piece == 'o') inverted_piece = 'x'; else inverted_piece = 'o';
            if (this.invert_piece) this.piece_type = inverted_piece;
    
            this.notify_game_status('player ' + inverted_piece + ' plays', false);
    
            if (this.onPieceMoved != null)
                this.onPieceMoved({x: x, y: y, piece: piece});
        }
    }

    render_start() {
        let self = this;
        setInterval(function() {
            requestAnimationFrame(function () {
                self.animate();
            });
        }, 100);
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.beginPath();
        this.ctx.strokeStyle = "rgb(166, 226, 46)";
        this.ctx.fillStyle = "rgb(166, 226, 46)";
        this.ctx.lineWidth = 5;
        this.draw_board();
        this.draw_pieces();
        this.draw_win_lines();
        this.draw_clicks();
    }
    
    draw_clicks() {
        for (let i = 0; i < this.clicks.length; i++) {
            let x = this.clicks[i].x;
            let y = this.clicks[i].y;
    
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
    
    draw_board() {
        for (let i = 1; i < 3; i++) {                
            this.ctx.moveTo(i * (this.width / 3), 0);
            this.ctx.lineTo(i * (this.width / 3), this.height);
        }    
    
        for (let i = 1; i < 3; i++) {                
            this.ctx.moveTo(0, i * (this.height / 3));
            this.ctx.lineTo(this.width, i * (this.height / 3));
        }    
    
        this.ctx.stroke();
    }
    
    draw_pieces() {
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                if (this.pieces[y][x] == 'o') {
                    this.ctx.beginPath();
                    this.ctx.arc(this.width / 3 * x + (this.width / 3 / 2), this.height / 3 * y + (this.height / 3 / 2), this.piece_size * .6, 0, 2 * Math.PI);
                    this.ctx.stroke();
                } else if (this.pieces[y][x] == 'x') {
                    let xx = this.width / 3 * x + (this.width / 3 / 2 - this.piece_size / 2), yy = this.height / 3 * y + (this.height / 3 / 2 - this.piece_size / 2);
                    this.ctx.moveTo(xx, yy);
                    this.ctx.lineTo(xx + this.piece_size, yy + this.piece_size);
                    this.ctx.moveTo(xx, yy + this.piece_size);
                    this.ctx.lineTo(xx + this.piece_size, yy);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    draw_win_lines() {
        //-
        for (let y = 0; y < 3; y++) {
            if (this.line_win[y]) {
                let xx = 0;
                let yy = (this.height / 3) * y + (this.height / 3 / 2);
                this.ctx.moveTo(xx + 10, yy);
                this.ctx.lineTo(this.width - 10, yy);
                this.ctx.stroke();
            }
        }
    
        //|
        for (let x = 0; x < 3; x++) {
            if (this.col_win[x]) {
                let xx = (this.width / 3) * x + (this.width / 3 / 2);
                let yy = 0
                this.ctx.moveTo(xx, yy + 10);
                this.ctx.lineTo(xx, this.height - 10);
                this.ctx.stroke();
            }
        }
    
        //\
        if (this.cross_win[0]) {
            this.ctx.moveTo(10, 10);
            this.ctx.lineTo(this.width - 10, this.height - 10);
            this.ctx.stroke();
        }
    
        ///
        if (this.cross_win[1]) {
            this.ctx.moveTo(this.width - 10, 10);
            this.ctx.lineTo(10, this.height - 10);
            this.ctx.stroke();
        }
    }
}
