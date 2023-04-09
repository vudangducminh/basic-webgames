const button = document.getElementById("button");
const gameBoard = document.getElementById('MinesweeperBoard');

const boardDefault =
{
	cnt_row : 13,
	cnt_col : 30,
	cnt_bomb : 80,
	bomb : '💣',
	flag : '🚩',
	dead : false,
	opening: true,
	timerID: -1,
	colors : {1: 'blue', 2: 'green', 3: 'red', 4: 'purple', 5: 'maroon', 6: 'turquoise', 7: 'black', 8: 'grey'}
};

var board_info = {};
Object.assign(board_info, boardDefault);

let state;

var cnt;
var cntflag;

function rng(l, r)
{
	return Math.floor(Math.random()*(r-l+1))+l;
}

let flag;

let clicked;

let rightflag;

let gameTime;

function hash(i, j)
{
	return (i-1)*board_info.cnt_col+j-1;
}

function init()
{	
    stopTimer(board_info.timerID);
	Object.assign(board_info, boardDefault);
	document.getElementById("EndGame").innerHTML="";
	document.getElementById("timer").innerHTML = "⏲️: 0";
	gameBoard.innerHTML = '';
	

	cnt = 0;
	cntflag = 0;
	gameTime = 0;

	state = new Array(board_info.cnt_row+1);
	for(var i=1; i<=board_info.cnt_row; i++)
	{
		state[i] = new Array(board_info.cnt_col+1).fill(0);
	}

	flag = new Array(board_info.cnt_col*board_info.cnt_row+1).fill(false);

	clicked  = new Array(board_info.cnt_row+1);
	for(var i=1; i<=board_info.cnt_row; i++)
	{
		clicked[i] = new Array(board_info.cnt_col+1).fill(false);
	}

	rightflag  = new Array(board_info.cnt_row+1);
	for(var i=1; i<=board_info.cnt_row; i++)
	{
		rightflag[i] = new Array(board_info.cnt_col+1).fill(false);
	}

	var bomb = new Set();
	while(bomb.size < board_info.cnt_bomb)
	{
		var idx=rng(1, hash(board_info.cnt_row, board_info.cnt_col));
		if(flag[idx]) continue;
		bomb.add(idx-1);
		flag[idx]=true;
	} //add bombs
	var table=document.createElement('table');
	var row, td;
	for (var i=1; i<=board_info.cnt_row; i++) 
	{
        row = document.createElement('tr');
        for (var j=1; j<=board_info.cnt_col; j++) 
        {
            td = document.createElement('td');
            td.id=hash(i, j);
            row.appendChild(td);
            td.textContent='';
            addCellListener(td, i, j);
        }
        table.appendChild(row);
    }
    gameBoard.appendChild(table);
    for(var i=1; i<=board_info.cnt_row; i++)
    {
    	for(var j=1; j<=board_info.cnt_col; j++)
    	{
    		var idx=hash(i, j);
    		if(flag[idx]) state[i][j]=-1;
    		else
    		{
    			for(var x=-1; x<=1; x++)
    			{
    				for(var y=-1; y<=1; y++)
    				{
    					if(x==0 && y==0) continue;
    					var new_i=i+x, new_j=j+y;
    					if(new_i<1 || new_j<1 || new_i>board_info.cnt_row || new_j>board_info.cnt_col) continue;
    					if(flag[hash(new_i, new_j)]) state[i][j]++;
    				}
    			}
    		}
    	}
    }
    alertbomb();
}

function startTimer(){
	board_info.timerID = setInterval(function(){
		gameTime+=1;
		document.getElementById("timer").innerHTML = "⏲️: " + gameTime;
	},1000);
}

function stopTimer(id){
	clearInterval(id);
}

function addCellListener(td, i, j)
{
	td.addEventListener('mousedown', function(event){
        if(event.which==1) cell_click(this, i, j);
    });
    td.addEventListener('contextmenu', function(event){
        toggle_flag(event, this, i, j);
    });
}

function alertbomb()
{
	document.getElementById("flags").innerHTML="🚩:"+(board_info.cnt_bomb-cntflag);
}

function toggle_flag(event,cell, i, j)
{
    event.preventDefault();
	if(board_info.dead) return;
	if(clicked[i][j]) return;
	if(rightflag[i][j]==false)
	{
		cell.textContent=board_info.flag;
		rightflag[i][j]=true;
		cntflag++;
	}
	else
	{
		cell.textContent='';
		rightflag[i][j]=false;
		cntflag--;
	}
	if(board_info.dead==false) alertbomb();
}

function reveal(cell, i, j)
{
	if(clicked[i][j]==false) cnt++;
	clicked[i][j]=true;
	if(rightflag[i][j]) cntflag--;
	if(state[i][j]==-1)
	{
		cell.style.backgroundColor = 'red';
		board_info.dead=true;
		cell.textContent=board_info.bomb;
		toggleEndGame();
		return;
	}
	cell.style.backgroundColor = 'lightGrey';
	if(state[i][j]>0) 
	{
		cell.textContent = state[i][j];
		cntbomb=state[i][j];
		cell.style.color=board_info.colors[cntbomb];
		return;
	}
	cell.textContent='';
	for(var x=-1; x<=1; x++)
   	{
    	for(var y=-1; y<=1; y++)
    	{
    		if(x==0 && y==0) continue;
    		var new_i=i+x, new_j=j+y;
    		if(new_i<1 || new_j<1 || new_i>board_info.cnt_row || new_j>board_info.cnt_col) continue;
    		if(clicked[new_i][new_j]) continue;
    		let nextcell=document.getElementById(hash(new_i, new_j));
    		if(state[new_i][new_j]>=0) reveal(nextcell, new_i, new_j);
    	}
    }
}

function check_next(cell, i, j)
{
	var count=0;
	for(var x=-1; x<=1; x++)
   	{
    	for(var y=-1; y<=1; y++)
    	{
    		if(x==0 && y==0) continue;
    		var new_i=i+x, new_j=j+y;
    		if(new_i<1 || new_j<1 || new_i>board_info.cnt_row || new_j>board_info.cnt_col) continue;
    		if(rightflag[new_i][new_j]) count++;
    	}
    }
    if(state[i][j]==count)
    {
    	for(var x=-1; x<=1; x++)
	   	{
	    	for(var y=-1; y<=1; y++)
	    	{
	    		if(x==0 && y==0) continue;
	    		var new_i=i+x, new_j=j+y;
	    		if(new_i<1 || new_j<1 || new_i>board_info.cnt_row || new_j>board_info.cnt_col) continue;
	    		let new_cell=document.getElementById(hash(new_i, new_j));
	    		if(rightflag[new_i][new_j]==false) reveal(new_cell, new_i, new_j);
	    	}
	    }
    }
}

function cell_click(cell, i, j)
{
	if(board_info.opening === true){
		board_info.opening = false;
		startTimer();
	}
	if(board_info.dead) return;
	if(rightflag[i][j]) return;
	if(clicked[i][j]) check_next(cell, i, j);
	else reveal(cell, i, j);
	if(board_info.dead==false) alertbomb();
	if(cnt==board_info.cnt_row*board_info.cnt_col-board_info.cnt_bomb) toggleEndGame();
}

function toggleEndGame()
{
	stopTimer(board_info.timerID);
	cnt=0;
	if(board_info.dead==false)
	{
		document.getElementById("EndGame").innerHTML="You win!";
		document.getElementById("EndGame").style.color="green";
		for(var i=1; i<=board_info.cnt_row; i++)
		{
			for(var j=1; j<=board_info.cnt_col; j++)
			{
				if(flag[hash(i, j)]) 
				{
					let cell=document.getElementById(hash(i, j));
					cell.textContent=board_info.flag;
				}
			}
		}
		board_info.dead=true;
		return;
	}
	for(var i=1; i<=board_info.cnt_row; i++)
	{
		for(var j=1; j<=board_info.cnt_col; j++)
		{
			if(clicked[i][j]) continue;
			let cell=document.getElementById(hash(i, j));
			if(rightflag[i][j] && !flag[hash(i, j)]) cell.style.backgroundColor='IndianRed';
			else if(state[i][j]>=0) continue;
			else cell.textContent=board_info.bomb;
		}
	}
	document.getElementById("EndGame").innerHTML="You lose!";
	document.getElementById("EndGame").style.color="red";
}

window.addEventListener('load', function() {
    init();
});
