const gameBoard = document.getElementById('BoardSudoku');
const solBoard = document.getElementById('SudokuSolution');

var board = {
    row: 9,
    col: 9,
    num: 9,
    big_cell_size: 3
};

function rng(l, r){
    return Math.floor(Math.random() * (r - l + 1)) + l;
}

function hash(i, j){
	return (i - 1) * board.col + j;
}


let state = new Array(board.row + 1);
let reveal = new Array(board.row + 1);
let start_board = new Array(board.row + 1);
let valid = new Array(board.row + 1);
var score = 0, min_hidden_number, max_hidden_number, cur_mode;

for(var i = 1; i <= board.row; i++){
    state[i] = new Array(board.col + 1).fill(0);
    reveal[i] = new Array(board.col + 1).fill(0);
    start_board[i] = new Array(board.col + 1).fill(0);
    valid[i] = new Array(board.col + 1);
    for(var j = 1; j <= board.col; j++){
        valid[i][j] = new Array(board.num + 1).fill(1);
    }
}

function reset_all(mode){
    score = 0; 
    if(mode == 5) mode = rng(0, 3);
    if(mode == 0) min_hidden_number = 36, max_hidden_number = 43; // ~ 10ms
    if(mode == 1) min_hidden_number = 44, max_hidden_number = 48; // ~ 10ms
    if(mode == 2) min_hidden_number = 49, max_hidden_number = 52; // ~ 10ms
    if(mode == 3) min_hidden_number = 53, max_hidden_number = 55; // ~ 2500ms
    if(mode == 4) min_hidden_number = 56, max_hidden_number = 58; // ~ 5000ms
    for(var i = 1; i <= board.row; i++){
        for(var j = 1; j <= board.col; j++){
            state[i][j] = reveal[i][j] = start_board[i][j] = 0;
            for(var k = 1; k <= board.num; k++){
                valid[i][j][k] = 1;
            }
        }
    }
}

function Big_cell(x){
    return Math.floor((x - 1) / board.big_cell_size) + 1;
}

function is_filled(state){
    for(var i = 1; i <= board.row; i++){
        for(var j = 1; j <= board.col; j++){
            if(!state[i][j]) return false;
        }
    }
    return true;
}
function is_valid(state){
    for(var row = 1; row <= board.big_cell_size; row++){
        for(var col = 1; col <= board.big_cell_size; col++){
            let freq = new Array(board.num + 1).fill(0);
            for(var i = (row - 1) * board.big_cell_size + 1; i <= row * board.big_cell_size; i++){
                for(var j = (col - 1) * board.big_cell_size + 1; j <= col * board.big_cell_size; j++){
                    if(state[i][j]) freq[state[i][j]]++;
                }
            }
            for(var i = 1; i <= board.num; i++){
                if(freq[i] >= 2) return false;
            }
        }
    }
    for(var i = 1; i <= board.row; i++){
        for(var j = 1; j <= board.col; j++){
            let freq = new Array(board.num + 1).fill(0);
            for(var row = 1; row <= board.row; row++){
                if(state[row][j]) freq[state[row][j]]++;
            }
            for(var k = 1; k <= board.num; k++){
                if(freq[k] >= 2) return false;
                freq[k] = 0;
            }
            for(var col = 1; col <= board.col; col++){
                if(state[i][col]) freq[state[i][col]]++;
            }
            for(var k = 1; k <= board.num; k++){
                if(freq[k] >= 2) return false;
            }
        }
    }
    return true;
}


function update_valid_number(valid, row, col, number){
    for(var i = 1; i <= board.num; i++){
        valid[i][col][number] = 0;
        valid[row][i][number] = 0;
        valid[row][col][i] = 0;
    }
    row = Big_cell(row), col = Big_cell(col);
    for(var i = (row - 1) * board.big_cell_size + 1; i <= row * board.big_cell_size; i++){
        for(var j = (col - 1) * board.big_cell_size + 1; j <= col * board.big_cell_size; j++){
            valid[i][j][number] = 0;
        }
    }
    return valid;
}


function update_color(){
    for(var i = 1; i <= board.row; i++){
        for(var j = 1; j <= board.col; j++){
            let cell = document.getElementById(hash(i, j));
            if(!start_board[i][j]) cell.style.color = "blue";
            else cell.style.color = "black";
            cell.style.backgroundColor = "white";
        }
    }
    for(var x = 1; x <= board.row; x += board.big_cell_size){
        for(var y = 1; y <= board.col; y += board.big_cell_size){
            for(var i_1 = x; i_1 <= x + board.big_cell_size - 1; i_1++){
                for(var j_1 = y; j_1 <= y + board.big_cell_size - 1; j_1++){
                    if(!reveal[i_1][j_1]) continue;
                    for(var i_2 = x; i_2 <= x + board.big_cell_size - 1; i_2++){
                        for(var j_2 = y; j_2 <= y + board.big_cell_size - 1; j_2++){
                            if(!reveal[i_2][j_2]) continue;
                            if((i_1 == i_2) && (j_1 == j_2)) continue;
                            if(reveal[i_1][j_1] == reveal[i_2][j_2]){
                                let cell_1 = document.getElementById(hash(i_1, j_1));
                                let cell_2 = document.getElementById(hash(i_2, j_2));
                                if(!start_board[i_1][j_1]) cell_1.style.color = "red";
                                else cell_1.style.backgroundColor = "red";
                                if(!start_board[i_2][j_2]) cell_2.style.color = "red";
                                else cell_2.style.backgroundColor = "red";
                            }
                        }
                    }
                    for(var row = 1; row <= board.row; row++){
                        if(!reveal[row][j_1]) continue;
                        if(row == i_1) continue;
                        if(reveal[i_1][j_1] == reveal[row][j_1]){
                            let cell_1 = document.getElementById(hash(i_1, j_1));
                            let cell_2 = document.getElementById(hash(row, j_1));
                            if(!start_board[i_1][j_1]) cell_1.style.color = "red";
                            else cell_1.style.backgroundColor = "red";
                            if(!start_board[row][j_1]) cell_2.style.color = "red";
                            else cell_2.style.backgroundColor = "red";
                        }
                    }
                    for(var col = 1; col <= board.col; col++){
                        if(!reveal[i_1][col]) continue;
                        if(col == j_1) continue;
                        if(reveal[i_1][j_1] == reveal[i_1][col]){
                            let cell_1 = document.getElementById(hash(i_1, j_1));
                            let cell_2 = document.getElementById(hash(i_1, col));
                            if(!start_board[i_1][j_1]) cell_1.style.color = "red";
                            else cell_1.style.backgroundColor = "red";
                            if(!start_board[i_1][col]) cell_2.style.color = "red";
                            else cell_2.style.backgroundColor = "red";
                        }
                    }
                }
            }
        }
    }
}

function update_state(reveal){
    let valid = new Array(board.row + 1);
    for(var i = 1; i <= board.row; i++){
        valid[i] = new Array(board.col + 1);
        for(var j = 1; j <= board.col; j++){
            valid[i][j] = new Array(board.num + 1).fill(1);
        }
    }
    for(var i = 1; i <= board.row; i++){
        for(var j = 1; j <= board.col; j++){
            if(!reveal[i][j]) continue;
            valid = update_valid_number(valid, i, j, reveal[i][j]);
        }
    }
    return valid;
}

function shuffle(array){
    var size = array.length
    for(var i = 0; i < size - 1; i++){
        var index = rng(i + 1, size - 1);
        var tmp = array[i];
        array[i] = array[index];
        array[index] = tmp;
    }
    return array;
}

function GenerateBoard(cur_row, cur_col){
    if(cur_row > board.row) return true;
    let val = [];
    for(var i = 1; i <= board.num; i++) val.push(i);
    val = shuffle(val);
    for(var i = 0; i < board.num; i++){
        var number = val[i];
        state[cur_row][cur_col] = number;
        if(is_valid(state) == false){
            state[cur_row][cur_col] = 0;
            continue;
        }
        else{
            var next_cur_col = cur_col + 1, next_cur_row = cur_row;
            if(next_cur_col == board.col + 1) next_cur_row++, next_cur_col = 1;
            var check = GenerateBoard(next_cur_row, next_cur_col);
            if(check == true){
                // let cell = document.getElementById(hash(cur_row + board.row, cur_col));
                // cell.textContent = state[cur_row][cur_col];
                // cell.style.color = "black";  
                return true;
            }
            else{
                state[cur_row][cur_col] = 0;
                continue;
            }
        }
    }
    state[cur_row][cur_col] = 0;
    return false;
}

function solve_sudoku(cur_board, valid_state){
    if(is_valid(cur_board) == true && is_filled(cur_board)) return true;
    var min_valid_state = 1000, row = 1, col = 1;
    for(var i = 1; i <= board.row; i++){
        for(var j = 1; j <= board.col; j++){
            if(cur_board[i][j]) continue;
            var count = 0;
            for(var num = 1; num <= board.num; num++){
                if(valid_state[i][j][num] == true) count++;
            }
            if(min_valid_state > count){
                min_valid_state = count; 
                row = i;
                col = j; 
            }
        }
    }
    for(var num = 1; num <= board.num; num++){
        if(valid_state[row][col][num] == false) continue;
        cur_board[row][col] = num;
        var flag = solve_sudoku(cur_board, update_state(cur_board));
        cur_board[row][col] = 0;
        if(flag == true) return true;
    }
    return false;
}
function Reveal_cell(){
    var hidden_number = rng(min_hidden_number, max_hidden_number);
    score = board.row * board.col - hidden_number;
    let arr = [];
    for(var i = 1; i <= board.row; i++){
        for(var j = 1; j <= board.col; j++){
            arr.push(hash(i, j));
            let cell = document.getElementById(hash(i, j));
            start_board[i][j] = reveal[i][j] = state[i][j];
            cell.textContent = state[i][j];
            cell.style.color = "black";
        }
    }
    arr = shuffle(arr);
    var cnt = 0, prev_cnt = -1, check = 0;
    for(var i = 0; i < hidden_number; i++){
        if(cur_mode == 3 || cur_mode == 4){
            if(i > 150){
                init(cur_mode);
                return;
            }
            if(cnt == prev_cnt) check++;
            if(check && cnt < 46){
                init(cur_mode);
                return;
            }
        }
        let cell = document.getElementById(arr[i]);
        var cell_row = Math.floor((arr[i] - 1) / board.col) + 1, cell_col = arr[i] % board.col;
        if(!cell_col) cell_col = board.col;
        // console.log(cnt);
        prev_cnt = cnt;
        var flag = 0;
        for(var num = 1; num <= board.num; num++){
            if(state[cell_row][cell_col] == num) continue;
            reveal[cell_row][cell_col] = num;
            if(solve_sudoku(reveal, update_state(reveal)) == true){
                flag = 1; break;
            }
        }
        if(flag == true){
            start_board[cell_row][cell_col] = state[cell_row][cell_col];
            reveal[cell_row][cell_col] = state[cell_row][cell_col];
            hidden_number++; arr.push(arr[i]); continue;
        }
        start_board[cell_row][cell_col] = reveal[cell_row][cell_col] = 0;
        cell.textContent = "";
        cell.style.color = "";
        cnt++;
    }
    valid = update_state(reveal);
}

function fill(row, col, num){
    if(start_board[row][col]) return;
    if(!reveal[row][col]) score++;
    reveal[row][col] = num;
    let cell = document.getElementById(hash(row, col));
    cell.textContent = reveal[row][col];
    cell.style.color = "blue"; 
    update_color();
    valid = update_state(reveal); 
    for(var i = 1; i <= board.num; i++){
        valid[i][col][num] = 0;
        valid[row][i][num] = 0;
        valid[row][col][i] = 0;
    }
    row = Big_cell(row), col = Big_cell(col);
    for(var i = (row - 1) * board.big_cell_size + 1; i <= row * board.big_cell_size; i++){
        for(var j = (col - 1) * board.big_cell_size + 1; j <= col * board.big_cell_size; j++){
            valid[i][j][num] = 0;
        }
    }
    win();
}

function erase(row, col){
    if(start_board[row][col]) return;
    if(!reveal[row][col]) return;
    score--;
    reveal[row][col] = 0;
    update_color();
    let cell = document.getElementById(hash(row, col));
    cell.textContent = "";
    cell.style.color = "";
    valid = update_state(reveal); 
}

function same_big_cell(i, j, x, y){
    var row_1 = Math.floor((i - 1) / board.big_cell_size) + 1, col_1 = Math.floor((j - 1) / board.big_cell_size) + 1;
    var row_2 = Math.floor((x - 1) / board.big_cell_size) + 1, col_2 = Math.floor((y - 1) / board.big_cell_size) + 1;
    return ((row_1 == row_2) && (col_1 == col_2));
}
function highlight(row, col){
    for(var i = 1; i <= board.row; i++){
        for(var j = 1; j <= board.col; j++){
            let cell = document.getElementById(hash(i, j));
            cell.style.backgroundColor = "white";
        }
    }
    if(!reveal[row][col]){
        let cell = document.getElementById(hash(row, col));
        cell.style.backgroundColor = "lightblue";
        return;
    }
    for(var i = 1; i <= board.row; i++){
        for(var j = 1; j <= board.col; j++){
            if(reveal[i][j] == reveal[row][col]){
                let cell = document.getElementById(hash(i, j));
                cell.style.backgroundColor = "lightblue";
                if(!start_board[i][j] || (i == row && j == col)) continue;
                if(i == row || j == col || same_big_cell(i, j, row, col)) cell.style.backgroundColor = "red";
            }
        }
    }
}
function init(mode){
    cur_mode = mode;
	gameBoard.innerHTML = '';
	solBoard.innerHTML = '';
    reset_all(mode);
    var table = document.createElement('table');
    for(var x = 1; x <= board.row; x += board.big_cell_size){
        var big_row = document.createElement('tr');
        for(var y = 1; y <= board.col; y += board.big_cell_size){
            var big_cell = document.createElement('td');
            for(var i = x; i <= x + board.big_cell_size - 1; i++){
                var row = document.createElement('tr');
                for(var j = y; j <= y + board.big_cell_size - 1; j++){
                    var cell = document.createElement('td');
                    cell.id = hash(i, j);
                    cell.textContent = '';
                    addCellListener(cell, i, j);
                    row.appendChild(cell);
                }
                big_cell.appendChild(row);
            }
            big_row.appendChild(big_cell);
        }
        table.appendChild(big_row);
    } 
    gameBoard.appendChild(table);
    var sol = document.createElement('table');
    for(var x = 1; x <= board.row; x += board.big_cell_size){
        var big_row = document.createElement('tr');
        for(var y = 1; y <= board.col; y += board.big_cell_size){
            var big_cell = document.createElement('td');
            for(var i = x; i <= x + board.big_cell_size - 1; i++){
                var row = document.createElement('tr');
                for(var j = y; j <= y + board.big_cell_size - 1; j++){
                    var cell = document.createElement('td');
                    cell.id = hash(i + board.row, j);
                    cell.textContent = '';
                    row.appendChild(cell);
                }
                big_cell.appendChild(row);
            }
            big_row.appendChild(big_cell);
        }
        sol.appendChild(big_row);
    }
    // solBoard.appendChild(sol);
    var osu = GenerateBoard(1, 1);
    Reveal_cell();
}

function addCellListener(cell, row, col){
	cell.addEventListener('mousedown', function(event){
        if(event.which == 1){
            highlight(row, col); 
            document.onkeydown = (e) => {
                e = e || window.event;
                if(e.keyCode == 8) erase(row, col);
                if(e.keyCode >= 49 && e.keyCode <= 57) fill(row, col, e.keyCode - 48);
            }
        }
    });
}

function win(){
    if(score < board.row * board.col) return;
    if(is_valid(reveal)) alert("Luck?");
}


window.addEventListener('load', function(){ 
});
