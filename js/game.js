
	var Game = function () {
		/* When this class is called initiate the game */
		this.init();
	};

	Game.prototype = {
		gameTime: 5000, 	/* @desc Default time each game lasts for */
		time: 5000,			/* @desc The time left in the ghame the user is playing */
		score: 0,			/* @desc The score of the latest game */
		highScore: 0, 		/* @desc The users high score */
		started: false,  	/* @desc A varable that is set to say if the game is started or not */
		
		/*
		 * @desc Jquery pointers to the HTML elements used to make the game, this is handy if you want to change the HTML, you only have to change the selectors in one place
		 */
		elements: {
			game: $(".game"), 
			menu: $(".menu"), 
			play: $(".menu .button").eq(0),
			howToPlay: $(".menu .button").eq(1),
			credits: $(".menu .button").eq(3), 
			settings: $(".menu .button").eq(2), 
			timer: $(".timer"), 
			score: $(".score"), 
			count: $(".score .count"), 
			time: $(".score .time"), 
			helpModal: $(".howToPlayModal"),
			creditModal: $(".credits"),
			settingsModal: $(".settings"), 
			reset: $(".reset-high"), 
			updateTimeBtn: $(".btn-update-game-time"), 
			newTime: $(".new-game-time"), 
			col: $(".col"),
			active: ".active", /* This is a string as this can change often */ 
			highScoreContainer: $(".high")
		}, 
		
		
		/*
		 * @desc This function loads the saved settings for the game and applys them
		 */
		init: function () {
		
			var self = this;
			
			self.binds();
			
			var high = localStorage.getItem("highScore");
			var time = localStorage.getItem("gameTime");
			
			if (typeof high != "undefined" && high != null) self.highScore = parseInt(high);
			if (typeof time != "undefined" && time != null) self.gameTime = parseInt(time);
			
			$(".high").html(self.highScore);
			
		}, 
		
		/*
		 * @desc This function binds all of the JavaScript events needed for the game to the document
		 */
		binds: function () {
		
			var self = this;
			
			self.elements.updateTimeBtn.bind("click", function () {
				
				var val = parseInt(self.elements.newTime.val());
				
				if (isNaN(val)) {
					alert("Invalid game time entered!");
				} else {
					self.setHighScore(0);
					self.gameTime = val * 1000;
					localStorage.setItem("gameTime", self.gameTime)
					alert("Game time updated");
				}	
				
			});
			
			self.elements.reset.bind("click", function () {
				self.setHighScore(0);
			});
			
			self.elements.play.bind("click", function () {
				self.play();
			});
			
			self.elements.howToPlay.bind("click", function () {
				self.elements.helpModal.modal();
			});
			
			self.elements.credits.bind("click", function () {
				self.elements.creditModal.modal();
			});
			
			self.elements.settings.bind("click", function () {
				self.elements.settingsModal.modal();
			});
			
			$(document).keydown(function(e) {
				
				switch(e.which) {
					case 37:
						self.do(0);
					break;
					case 39:
						self.do(2);
					break;
					case 40:
					case 38:
						self.do(1);
					break;
				}
			});
			
		}, 
		
		/*
		 * @desc This function starts a game, it hides the menu and starts the count down timer for the game, once finished it starts the game
		 */
		play: function () {
		
			var self = this;
			
			self.elements.timer.html("3").show();
			self.elements.menu.hide();
			
			setTimeout(function () {
				self.elements.timer.html("2");
				
				setTimeout(function () {
					self.elements.timer.html("1");
					
					setTimeout(function () {
						self.elements.timer.hide();
						self.startGame();
					}, 1000);
					
				}, 1000);
				
			}, 1000);
			
		}, 
		
		/*
		 * @desc This function sets up the game and starts the timer 
		 */
		startGame: function () {
		
			var self = this;
			
			self.score = 0;
			self.elements.score.show();
			self.elements.game.show();
			self.time = self.gameTime;
			self.startTimer();
			self.selectRand();
			self.started = true;
			
		}, 
		
		/*
		 * @desc This function ends the game and shows the menu and displays an alert box to the user showing there score. This function will also check to see if the user has beeten there high score then update it if they have.
		 */
		endGame: function () {
			
			var self = this;
			
			self.started = false;
			clearInterval(self.intval);
			
			self.elements.menu.show();
			self.elements.score.hide();
			self.elements.game.hide();
			
			if (self.score > self.highScore) {
				self.setHighScore(self.score);
				var playAgain = confirm("Your score was "+self.score+" \n\nThat was a new high score!\n\nDo you want to play again?");
			} else {
				var playAgain = confirm("Your score was "+self.score+"\n\nDo you want to play again?");
			}
			
			if (playAgain) self.play();
			
			
		},
		
		/*
		 * @desch this function sets a 10ms interval this reduces the timer by 10ms once it reaces zero the game is ended
		 */
		startTimer: function () {
			
			var self = this;
			
			self.intval = setInterval(function () {
				
				self.time -= 10;
				
				var time = (self.time / 1000).toFixed(2);
				
				self.elements.time.html(time);
				self.elements.count.html(self.score);
				
				if (self.time <= 0) {
					
					self.endGame();
				}
				
			}, 10);
			
		},
		
		/*
		 * @desc This function randomly selects part of the screen to highlight, it alternates the background color as then the same section was highlighted you dindt know if the keypress registered or not.
		 */
		selectRand: function () {
			
			var self = this;
			
			var next =  Math.floor(Math.random() * 3);
			
			$(self.elements.active).removeAttr("style").removeClass("active");
			
			self.elements.col.eq(next).addClass("active");
			
			var color = (self.score % 2 == 0?"#212121":"#555555")
			
			$(self.elements.active).css("background-color", color);
			
		}, 
		
		/*
		 * @desc This function proccesses the users keypress, if the game has started it will check to see if the selection is correct if not it will end the game
		 * @param integer direction - The key the user has selected this should match the column number (left coluymn = 0, center column = 1, right column = 2)
		 */
		do: function (direction) {
		
			var self = this;
			
			if (!self.started) return false;
			
			var container = $(".col").eq(direction);
			
			if (!container.hasClass("active")) return self.endGame();
			
			self.score++;
			
			self.selectRand();
			
		}, 
		
		/*
		 * @desc This function sets the high score and saves it to the users computer so if they log in again at a later date it is not lost.
		 * @param integer score - The score to be saved, this can be a numeric string or an integer, if it is a string or a float it will be converted to an integer
		 */
		setHighScore: function (score) {
	
			var self = this;
			
			score = parseInt(score);
			
			if (isNaN(score)) return false; 
			
			self.highScore = score;
			localStorage.setItem("highScore", score);
			self.elements.highScoreContainer.html(self.highScore);
			
		}
		
	}
	
	game = new Game();