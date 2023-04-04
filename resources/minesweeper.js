const button = document.getElementById("button");
const board = document.getElementById("board");

var board_info =
{
	cnt_row : 13,
	cnt_col : 30,
	cnt_bomb : 80,
	bomb : '💣',
	flag : '🚩',
	dead : false,
	colors : {1: 'blue', 2: 'green', 3: 'red', 4: 'purple', 5: 'maroon', 6: 'turquoise', 7: 'black', 8: 'grey'}
};

let state = new Array(board_info.cnt_row+1);
for(var i=1; i<=board_info.cnt_row; i++)
{
	state[i] = new Array(board_info.cnt_col+1).fill(0);
}

var cnt=0;
var cntflag=0;

function rng(l, r)
{
	return Math.floor(Math.random()*(r-l+1))+l;
}

let flag = new Array(board_info.cnt_col*board_info.cnt_row+1).fill(false);

let clicked = new Array(board_info.cnt_row+1);
for(var i=1; i<=board_info.cnt_row; i++)
{
	clicked[i] = new Array(board_info.cnt_col+1).fill(false);
}

let rightflag = new Array(board_info.cnt_row+1);
for(var i=1; i<=board_info.cnt_row; i++)
{
	rightflag[i] = new Array(board_info.cnt_col+1).fill(false);
}

function hash(i, j)
{
	return (i-1)*board_info.cnt_col+j-1;
}

function init()
{
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
    document.getElementById('MinesweeperBoard').appendChild(table);
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

function addCellListener(td, i, j)
{
	td.addEventListener('mousedown', function(event){
        
        if(event.which==1) cell_click(this, i, j);
        if(board_info.dead==false) alertbomb();
    });
    td.addEventListener('contextmenu', function(event){
        toggle_flag(event, this, i, j);
    });
}

function alertbomb()
{
	document.getElementById("EndGame").innerHTML=(board_info.cnt_bomb-cntflag) + " bombs left";
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
	if(board_info.dead) return;
	if(clicked[i][j]) check_next(cell, i, j);
	else reveal(cell, i, j);
	if(cnt==board_info.cnt_row*board_info.cnt_col-board_info.cnt_bomb) toggleEndGame();
}

function toggleEndGame()
{
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
			if(state[i][j]>=0) continue;
			else
			{
				cell.textContent=board_info.bomb;
				cell.style.backgroundColor = 'red';
			}
		}
	}
	document.getElementById("EndGame").innerHTML="You lose!";
	document.getElementById("EndGame").style.color="red";
}

window.addEventListener('load', function() {
    init();
});

function newgame()
{
	window.location.reload();
	board_info.dead=false;
}
