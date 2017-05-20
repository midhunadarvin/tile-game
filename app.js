(function (window, document) {
	window.onload = Initialize;
	var self = this;
	self.timer = timer;
    self.cancelTimer = cancelTimer;
	self.resetGame = resetGame;
	self.setDifficulty = setDifficulty;
	self.undoMove = undoMove;

	// Global Variables
	var rows;
	var cols;
	var timer;
	var timerCount = 0;
	var timerMinute = 0;
	var currentDifficulty = 'medium';
	var isAnimating = false;
	var grids = {
		'easy': 'grid-3-3',
		'medium': 'grid-4-4',
		'hard': 'grid-10-10'
	};
	var movesMade = [];

	// Store initial grid structures
	localStorage.setItem('grid-3-3', document.getElementById('grid-3-3').innerHTML);
	localStorage.setItem('grid-4-4', document.getElementById('grid-4-4').innerHTML);
	localStorage.setItem('grid-10-10', document.getElementById('grid-10-10').innerHTML);
	
	// Set event listeners and load the default grid
	function Initialize() {
		setDifficulty('medium');
		document.addEventListener("keydown", getKeyCode, false);
		document.getElementById('easy-button').addEventListener('click', function() { self.resetGame();self.setDifficulty('easy'); });
		document.getElementById('medium-button').addEventListener('click', function() { self.resetGame();self.setDifficulty('medium'); });
		document.getElementById('hard-button').addEventListener('click', function() { self.resetGame();self.setDifficulty('hard'); });
		document.getElementById('reset-button').addEventListener('click', function() { self.resetGame(); });
		document.getElementById('success-button').addEventListener('click', function() { self.resetGame(); });
		document.getElementById('undo-button').addEventListener('click', function() { self.undoMove(); });
	}

	// Set the difficulty settings
	function setDifficulty(difficulty) {
		switch(difficulty){
			case 'easy': {
				rows = 3;
				cols = 3;
				document.getElementById(grids.easy).style.display = 'block';
				document.getElementById(grids.medium).style.display = 'none';
				document.getElementById(grids.hard).style.display = 'none';
				currentDifficulty = 'easy';
				resetGrids();
				setGrids();
				break;
			}
			case 'medium': {
				rows = 4;
				cols = 4;
				document.getElementById(grids.medium).style.display = 'block';
				document.getElementById(grids.easy).style.display = 'none';
				document.getElementById(grids.hard).style.display = 'none';
				currentDifficulty = 'medium';
				resetGrids();
				setGrids();
				break;
			}
			case 'hard': {
				rows = 10;
				cols = 10;
				document.getElementById(grids.hard).style.display = 'block';
				document.getElementById(grids.medium).style.display = 'none';
				document.getElementById(grids.easy).style.display = 'none';
				currentDifficulty = 'hard';
				resetGrids();
				setGrids();
				break;
			}
			default: break;
		}
	}

	// Set up the grids
	function setGrids() {
		var gridClass;
		gridClass = getGridClass();
		var tiles = document.querySelectorAll('.'+gridClass+' .tile');
		var index = 0;
		for(var i=0;i<rows;i++){
			for(var j=0;j<cols;j++){
				tiles[index].id = i+'-'+j;
				index++;
			}
		}
		randomizeTiles();
		setTimer();
	}

	// Reset the Game
	function resetGame() {
		movesMade = [];
		document.getElementById('undo-button').disabled = true;
		cancelTimer();
		resetTimer();
		resetGrids();
		setGrids();
	}

	// Reset the Timer
	function resetTimer() {
		timerCount = 0;
		timerMinute = 0;
		document.getElementById('time').innerHTML = '00:00';
		document.getElementById('time-result').innerHTML = '00:00';
		document.getElementById('success-box').style.display = 'none';
	}

	// Set the Timer
	function setTimer() {
		if(self.timer)
			clearInterval(self.timer);
		self.timer = setInterval(tick, 1000);
	}

	// Cancel the timer
	function cancelTimer() {
		clearInterval(self.timer);
	}

	// Get the grid class based on difficulty
	function getGridClass() {
		switch(currentDifficulty) {
			case 'easy': {
				return grids.easy;
			}
			case 'medium': {
				return grids.medium;
			}
			case 'hard': {
				return grids.hard;
			}
			default: return grids.medium;
		}
	}

	// Check if the current grid structure is a valid solution
	function validateSolution() {
		var gridClass = getGridClass();
		var tiles = document.querySelectorAll('.'+gridClass+' .tile');
		var solved = true;
		for(var i=0; i<tiles.length-1; i++){
			
			if(tiles[i].getAttribute("value") == i+1){
				continue;
			}else{
				solved = false;
				break;
			}
		}
		if(solved==true) {
			cancelTimer();
			var finalTime = document.getElementById('time').innerHTML;
			document.getElementById('success-box').style.display = 'block';
			document.getElementById('time-result').innerHTML = finalTime;
			document.getElementById('reset-button').addEventListener('click', resetGame);
			document.body.scrollTop = 0; // For Chrome, Safari and Opera 
    		document.documentElement.scrollTop = 0; // For IE and Firefox
		}
	}

	// Randomly alter the tiles
	function randomizeTiles() {
		var moves = ['Up', 'Left', 'Down', 'Right'];
		for(var i=0; i<50; i++) {
			swapTiles(moves[Math.floor(Math.random() * 10)%4], false);
		}
	}

	// Handle key down event for arrow keys
	function getKeyCode(e) {
		var keyCode = e.keyCode;
		e.preventDefault();
		if(isAnimating)
			return;
		if(keyCode==37) {
			swapTiles('Left', true);
		} else if(keyCode==38) {
			swapTiles('Up', true);
		} else if(keyCode==39) {
			swapTiles("Right", true);
		} else if(keyCode==40) {
			swapTiles("Down", true);
		}
	}

	// Swap Tiles
	function swapTiles(direction, check, undo) {
		var gridClass = getGridClass()
		var elem = document.querySelector('.'+gridClass+' .blank');

		var ids = elem.id.split('-');
		var rowIndex = ids[0];
		var colIndex = ids[1];

		switch(direction) {
			case 'Left': {
				if(colIndex == 0){
					console.log('First column');
					return;
				}
				var nextIndex = parseInt(colIndex) - 1;
				var nextElem = document.getElementById(rowIndex + '-' + nextIndex);
				break;
			}
			case 'Right': {
				if(colIndex == cols-1){
					console.log('Last column');
					return;
				}
				var nextIndex = parseInt(colIndex) + 1;
				var nextElem = document.getElementById(rowIndex + '-' + nextIndex);
				break;
			}
			case 'Up': {
				if(rowIndex == 0){
					console.log('First Row');
					return;
				}
				var nextIndex = parseInt(rowIndex) - 1;
				var nextElem = document.getElementById(nextIndex + '-' + colIndex);
				break;
			}
			case 'Down':{
				if(rowIndex == rows-1){
					console.log('Last row');
					return;
				}
				var nextIndex = parseInt(rowIndex) + 1;
				var nextElem = document.getElementById(nextIndex + '-' + colIndex);
				break;
			}
			default: break;
		}
		if(check || undo){
			animateElements(elem, nextElem, direction).then(function(){
				swapElements(elem, nextElem);
				swapIds(elem, nextElem);
				if(check)
					validateSolution();
				if(!undo) {
					movesMade.push(direction);
					if(movesMade.length > 5){
						movesMade.shift();
					}
					if(movesMade.length > 0)
						document.getElementById('undo-button').disabled = false;
					else
						document.getElementById('undo-button').disabled = true;
				}
			});
		}else{
			swapElements(elem, nextElem);
			swapIds(elem, nextElem);
		}	

		
	}

	// Undo Functionality 
	function undoMove() {
		if(movesMade.length <= 1){
			document.getElementById('undo-button').disabled = true;
		}
		var move = movesMade.pop();
		switch(move) {
			case 'Left': {
				swapTiles('Right', false, true);
				break;
			}
			case 'Right': {
				swapTiles('Left', false, true);
				break;
			}
			case 'Up': {
				swapTiles('Down', false, true);
				break;
			}
			case 'Down': {
				swapTiles('Up', false, true);
				break;
			}
			default: break;
		}
	}

	// Swap ids of two DOM Elements
	function swapIds(elemA, elemB) {
		var tempId = elemA.id;
		elemA.id = elemB.id;
		elemB.id = tempId;
	}

	// Swap two DOM elements 
	function swapElements(elm1, elm2) {
		var parent1, next1,
			parent2, next2;

		parent1 = elm1.parentNode;
		next1   = elm1.nextSibling;
		parent2 = elm2.parentNode;
		next2   = elm2.nextSibling;

		parent1.insertBefore(elm2, next1);
		parent2.insertBefore(elm1, next2);
	}

	// Animate the elements 
	function animateElements(elemA, elemB, direction) {
		isAnimating = true;
		return new Promise(function (resolve, reject) {
			switch(direction) {
				case 'Left': {
					elemA.style.transform = 'translate(-100%, 0px)';
					elemB.style.transform = 'translate(100%, 0px)';
					break;
				}
				case 'Right': {
					elemA.style.transform = 'translate(100%, 0px)';
					elemB.style.transform = 'translate(-100%, 0px)';
					break;
				}
				case 'Up': {
					elemA.style.transform = 'translate(0px, -100%)';
					elemB.style.transform = 'translate(0px, 100%)';
					break;
				}
				case 'Down': {
					elemA.style.transform = 'translate(0px, 100%)';
					elemB.style.transform = 'translate(0px, -100%)';
					break;
				}
			}
			
			setTimeout(function(){
				elemA.style.transform = 'translate(0px, 0px)';
				elemB.style.transform = 'translate(0px, 0px)';
				isAnimating = false;
				resolve(true);
			},500);
		});
	}

	// Reset Grids to initial structure
	function resetGrids() {
		document.getElementById('grid-3-3').innerHTML = localStorage.getItem('grid-3-3');
		document.getElementById('grid-4-4').innerHTML = localStorage.getItem('grid-4-4');
		document.getElementById('grid-10-10').innerHTML = localStorage.getItem('grid-10-10');
	}

	// Update the timer
	function tick(){
		timerCount++;
		if(timerCount==60){
			timerCount = 0;
			timerMinute++;
		}
		var minutes;
		if(timerMinute < 10) {
			minutes = '0'+timerMinute;
		}else {
			minutes = timerMinute;
		}

		if(timerCount<10){
			seconds = '0'+timerCount;
		}else{
			seconds = timerCount;
		}

		document.getElementById('time').innerHTML = minutes+':'+seconds;
	}
}(this, this.document));

