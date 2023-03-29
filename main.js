const regenerateButton = document.getElementById("regenerate");
const board = document.getElementById("board");

let boardState = new Array(11);
for (let i=1;i<=10;i++){
    boardState[i] = new Array(11).fill(0);
}

let checkFF = new Array(11);
for (let i=1;i<=10;i++){
    checkFF[i] = new Array(11).fill(0);
}

regenerateButton.addEventListener('click', e=>{
    init();
});

function randInt(x){
    return Math.floor(Math.random()*x);
}

function init(){
    board.textContent = '';
    var bombSites = new Set();
    var prevLength = 0;
    for (var i=1;i<=10;i++){
        while (bombSites.size <= prevLength){
            var pos = randInt(100);
            bombSites.add(pos);
        }
        prevLength++;
    }
    
    /*bombSites.forEach(pos => {
        console.log(pos);
    });*/
    for (var i=1;i<=10;i++){
        for (var j=1;j<=10;j++){
            var content = (randInt(100)).toString();
            var box = document.createElement('button');
            box.classList.add("board-button");
            box.classList.add("btn");
            box.classList.add("btn-outline-secondary");
            box.textContent = "?";
            box.positionX = i;
            box.positionY = j;
            if(bombSites.has(10*i+j)){
                box.hasBomb = true;
                boardState[i][j] = -1;
                console.log(i,j,boardState[i][j]);
            }
            else{
                box.hasBomb = false;
                boardState[i][j] = 0;
            } 
            board.appendChild(box);
        }
    }
    boardState[1][1] = ((boardState[1][2]==-1)+(boardState[2][1]==-1)+(boardState[2][2]==-1));
    boardState[1][10] = ((boardState[1][9]==-1)+(boardState[2][9]==-1)+(boardState[2][10]==-1));
    boardState[10][1] = ((boardState[9][1]==-1)+(boardState[10][2]==-1)+(boardState[9][2]==-1));
    boardState[10][10] = ((boardState[10][9]==-1)+(boardState[9][10]==-1)+(boardState[9][9]==-1));
    for (var i=2;i<=9;i++){
        if (boardState[1][i]==0){
            boardState[1][i] = ((boardState[1][i-1]==-1)+(boardState[1][i+1]==-1)+(boardState[2][i-1]==-1)+(boardState[2][i]==-1)+(boardState[2][i+1]==-1));
        }
    }
    for (var i=2;i<=9;i++){
        if (boardState[10][i]==0){
            boardState[10][i] = ((boardState[10][i-1]==-1)+(boardState[10][i+1]==-1)+(boardState[9][i-1]==-1)+(boardState[9][i]==-1)+(boardState[9][i+1]==-1));
        }
    }
    for (var i=2;i<=9;i++){
        if (boardState[i][1]==0){
            boardState[i][1] = ((boardState[i-1][1]==-1)+(boardState[i-1][2]==-1)+(boardState[i][2]==-1)+(boardState[i+1][1]==-1)+(boardState[i+1][2]==-1));
        }
    }
    for (var i=2;i<=9;i++){
        if (boardState[i][10]==0){
            boardState[i][10] = ((boardState[i-1][10]==-1)+(boardState[i-1][9]==-1)+(boardState[i][9]==-1)+(boardState[i+1][9]==-1)+(boardState[i+1][10]==-1));
        }
    }
    for (var i=2;i<=9;i++){
        for (var j=2;j<=9;j++){
            if (boardState[i][j]==0){
                boardState[i][j] = ((boardState[i-1][j-1]==-1)+(boardState[i-1][j]==-1)+(boardState[i-1][j+1]==-1)+(boardState[i][j-1]==-1)+(boardState[i][j+1]==-1)+(boardState[i+1][j-1]==-1)+(boardState[i+1][j]==-1)+(boardState[i+1][j+1]==-1));
            }
        }
    }
    //console.log(boardState);
    let boardButtonsTemp = document.getElementsByClassName("board-button");
    for (var i=0; i<boardButtonsTemp.length; i++){
        boardButtonsTemp[i].addEventListener('click', changeText, false);
    }
}
init();

const boardButtons = document.getElementsByClassName("board-button");

function floodFillReveal(x,y){
    console.log(x,y);
    if(x<1 || y<1 || x>10 || y>10) return;
    if(checkFF[x][y] == 1) return;
    checkFF[x][y] = 1;
    console.log(x*10+y);    
    boardButtons[(x-1)*10+(y-1)].textContent = boardState[x][y];
    
    if(boardState[x][y]!=0) return;
    
    floodFillReveal(x-1,y-1);
    floodFillReveal(x-1,y);
    floodFillReveal(x-1,y+1);
    floodFillReveal(x,y-1);
    floodFillReveal(x,y+1);
    floodFillReveal(x+1,y-1);
    floodFillReveal(x+1,y);
    floodFillReveal(x+1,y+1);
}

function changeText(){
    var state = boardState[this.positionX][this.positionY];
    this.textContent = state;
    if(state == -1){
        this.textContent = "X";
    }
    else if (state == 0){
        floodFillReveal(this.positionX, this.positionY);
        //console.log(this.positionX,this.positionY,boardState[this.positionX][this.positionY]);
    }
    this.removeEventListener('click',changeText);
    
}

function gameOver(){
    
}