// This sectin contains some game constants. It is not super interesting
const GAME_WIDTH = 375;
const GAME_HEIGHT = 500;

const ENEMY_WIDTH = 75;
const ENEMY_HEIGHT = 75;
const MAX_ENEMIES = 3;

const PLAYER_WIDTH = 75;
const PLAYER_HEIGHT = 86;

const ROCKET_WIDTH = 10;
const ROCKET_HEIGHT = 58;

// These two constants keep us from using "magic numbers" in our code
const LEFT_ARROW_CODE = 37;
const RIGHT_ARROW_CODE = 39;
const UP_ARROW_CODE = 38;
const DOWN_ARROW_CODE = 40;
const SUPER_MODE = 81;

// These two constants allow us to DRY
const MOVE_LEFT = 'left';
const MOVE_RIGHT = 'right';
const MOVE_UP = 'up';
const MOVE_DOWN = 'down';

// Preload game images
const images = {};
[
  'enemy.png',
  'stars.png',
  'player.png',
  'rocket.png',
  'bonus.png',
  'enemy-carrot.png',
  'enemy-avocado.png',
  'enemy-radish.png',
  'enemy-eggplant.png',
  'enemy-cauliflower.png',
  'enemy-broccoli.png',
  'impact.png',
].forEach((imgName) => {
  const img = document.createElement('img');
  img.src = `images/${imgName}`;
  images[imgName] = img;
});

const enemyImages = [
  'enemy-carrot.png',
  'enemy-avocado.png',
  'enemy-radish.png',
  'enemy-eggplant.png',
  'enemy-cauliflower.png',
  'enemy-broccoli.png',
];

// HTML Elements we're gonna upadte constantly in our game

const Keydisplay = document.getElementById('KeyPressed');

// This section is where you will be doing most of your coding

class Entity {
  render(ctx) {
    ctx.drawImage(this.sprite, this.x, this.y);
  }
}

class Impact extends Entity {
  constructor(xPos, yPos) {
    super();
    this.x = xPos;
    this.y = yPos;
    this.sprite = images['impact.png'];
    this.duration = 0;
    this.max_duration = 10;
  }

  update(timeDiff) {
    this.duration += 1;
    console.log(`duration from object is ${this.duration} and max duration is ${this.max_duration}`);
  }
}

class Enemy extends Entity {
  constructor(xPos) {
    super();
    this.x = xPos;
    this.y = -ENEMY_HEIGHT;
    this.sprite = images[enemyImages[Math.floor(Math.random() * 6)]];

    // Each enemy should have a different speed
    this.speed = Math.random() / 2 + 0.25;
  }

  update(timeDiff) {
    this.y = this.y + timeDiff * this.speed;
  }
}

class Bonus extends Entity {
  constructor(xPos) {
    super();
    this.x = xPos;
    this.y = -ENEMY_HEIGHT;
    this.sprite = images['player.png'];

    // Each enemy should have a different speed
    this.speed = Math.random() / 2 + 0.25;
  }
  update(timeDiff) {
    this.y = this.y + timeDiff * this.speed;
  }
}

class Rocket extends Entity {
  constructor(xPos, yPos) {
    super();
    this.x = xPos + PLAYER_WIDTH / 2;
    this.y = yPos - 10;
    this.sprite = images['rocket.png'];

    // Each enemy should have a different speed
    this.speed = 1;
  }

  update(timeDiff) {
    this.y = this.y - timeDiff * this.speed;
  }
}

class Player extends Entity {
  constructor() {
    super();
    this.x = 2 * PLAYER_WIDTH;
    this.y = GAME_HEIGHT - PLAYER_HEIGHT - 5;
    this.sprite = images['player.png'];
    this.numberOfLifes = [1, 2, 3];
  }

  // This method is called by the game engine when left/right arrows are pressed
  move(direction) {
    if (direction === MOVE_LEFT && this.x > 0) {
      this.x = this.x - PLAYER_WIDTH;
    } else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
      this.x = this.x + PLAYER_WIDTH;
    } else if (direction === MOVE_DOWN && this.y > 0) {
      this.y = this.y + PLAYER_HEIGHT;
    } else if (direction === MOVE_UP && this.y < GAME_HEIGHT - PLAYER_HEIGHT) {
      this.y = this.y - PLAYER_HEIGHT;
    }
  }
}
/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
  constructor(element) {
    // Setup the player
    this.player = new Player();

    // Setup enemies, making sure there are always three
    this.setupEnemies();

    // Setup bonus :
    this.setupBonus();

    // Setup the <canvas> element where we will be drawing
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    element.appendChild(canvas);

    this.ctx = canvas.getContext('2d');

    // Create a life-container to hold the lifes png as html elements
    const lifeContainer = document.createElement('div');
    lifeContainer.setAttribute('id', 'life-container');
    element.appendChild(lifeContainer);

    this.player.numberOfLifes.forEach((index) => {
      const life = document.createElement('img');
      life.setAttribute('class', 'life');
      life.setAttribute('src', 'images/player.png');
      lifeContainer.appendChild(life);
    });

    // const life1 = document.createElement('img');
    // life1.setAttribute('class', 'life');
    // life1.setAttribute('src', 'images/player.png');
    // lifeContainer.appendChild(life1);

    // const life2 = document.createElement('img');
    // life2.setAttribute('class', 'life');
    // life2.setAttribute('src', 'images/player.png');
    // lifeContainer.appendChild(life2);

    // const life3 = document.createElement('img');
    // life3.setAttribute('class', 'life');
    // life3.setAttribute('src', 'images/player.png');
    // lifeContainer.appendChild(life3);

    // Since gameLoop will be called out of context, bind it once here.
    this.gameLoop = this.gameLoop.bind(this);
  }

  /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
  setupEnemies() {
    if (!this.enemies) {
      this.enemies = [];
    }

    while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
      this.addEnemy();
    }
  }
  // This method finds a random spot where there is no enemy, and puts one in there
  addEnemy() {
    const enemySpots = GAME_WIDTH / ENEMY_WIDTH;

    let enemySpot;
    // Keep looping until we find a free enemy spot at random - removed the !enemySpot
    while (this.enemies[enemySpot]) {
      enemySpot = Math.floor(Math.random() * enemySpots);
    }
    // Create a new Enemy with a position from 0 to 4 in the array and multiplying the value by 75
    this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH);
  }

  // Call the add bonus every X interval of time
  setupBonus() {
    this.addBonus();
    setInterval(() => {
      this.addBonus();
    }, 5000);
  }

  // Create the bonus
  addBonus() {
    const bonusSpots = GAME_WIDTH / PLAYER_WIDTH;
    const bonusSpot = Math.floor(Math.random() * bonusSpots);

    this.bonus = new Bonus(bonusSpot * PLAYER_WIDTH);
  }

  setupRocket() {
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === SUPER_MODE) {
        this.rocket = new Rocket(this.player.x, this.player.y);
      }
    });
  }

  // This method kicks off the game
  start() {
    this.score = 0;
    this.lastFrame = Date.now();

    //  Create flag for Supermode
    let isSuperMode = false;

    // Listen for keyboard left/right and update the player
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === LEFT_ARROW_CODE) {
        this.player.move(MOVE_LEFT);
        Keydisplay.innerText = 'left';
      } else if (e.keyCode === RIGHT_ARROW_CODE) {
        this.player.move(MOVE_RIGHT);
        Keydisplay.innerText = 'right';
      } else if (e.keyCode === SUPER_MODE) {
        isSuperMode = true;
        Keydisplay.innerText = 'Q';
        setTimeout(() => (isSuperMode = false), 3000);
      }
      if (isSuperMode) {
        if (e.keyCode === UP_ARROW_CODE) {
          this.player.move(MOVE_UP);
          Keydisplay.innerText = 'Up';
        } else if (e.keyCode === DOWN_ARROW_CODE) {
          this.player.move(MOVE_DOWN);
          Keydisplay.innerText = 'Down';
        }
      }
    });

    // Mobile control
    document.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      console.log(touch);
      console.log(e);
      if (touch.clientX < this.player.x) {
        this.player.move(MOVE_LEFT);
      } else if (touch.clientX > this.player.x) {
        this.player.move(MOVE_RIGHT);
      }
    });

    this.gameLoop();
  }

  /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
  gameLoop() {
    // Check how long it's been since last frame
    const currentFrame = Date.now();
    const timeDiff = currentFrame - this.lastFrame;

    // Increase the score!
    this.score += timeDiff;

    // Call update on all enemies
    this.enemies.forEach(enemy => enemy.update(timeDiff));

    // Call update on rocket
    if (this.rocket) {
      this.rocket.update(timeDiff);
    }
    // Call update to fries bonus
    if (this.bonus) this.bonus.update(timeDiff);

    // Call update to impact
    if (this.impact) {
      this.impact.update();
      if (this.impact.duration >= this.impact.max_duration) {
        delete this.impact;
      }
    }

    // Draw everything!
    this.ctx.drawImage(images['stars.png'], 0, 0); // draw the star bg
    this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
    this.player.render(this.ctx); // draw the player
    if (this.rocket) this.rocket.render(this.ctx);
    if (this.bonus) this.bonus.render(this.ctx);
    if (this.impact) this.impact.render(this.ctx);

    // Check if any enemies should die
    this.enemies.forEach((enemy, enemyIdx) => {
      if (enemy.y > GAME_HEIGHT) {
        delete this.enemies[enemyIdx];
      }
    });
    this.setupEnemies();

    // Check if Bonus has been caught
    if (this.checkBonus()) {
      this.player.numberOfLifes.push(1);
    }

    // Check if missile has been fired
    this.setupRocket();

    // Check if enemy has been destroyed and remove rocket accoridngly
    if (this.destroyEnemy()) {
      this.score = this.score + 5000;
      delete this.rocket;
    }

    // Check if player is dead
    if (this.isPlayerDead()) {
      // If they are dead, then it's game over!
      this.ctx.font = 'bold 40px Impact';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText('GAME OVER', 100, 200);
      this.ctx.shadowColor = 'black';
      this.ctx.shadowOffsetX = 5;
      this.ctx.shadowOffsetY = 5;
      this.ctx.shadowBlur = 7;

      this.ctx.font = 'bold 18px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(`But hey you know ${this.score} is not that bad`, 30, 250);
      this.ctx.shadowColor = 'black';
      this.ctx.shadowOffsetX = 5;
      this.ctx.shadowOffsetY = 5;
      this.ctx.shadowBlur = 7;
      // add a start button to restart the game
      // display the button
      const restartButton = document.getElementsByClassName('restart');
      restartButton[0].classList.toggle('hidden');

      // actually restart the game
      restartButton[0].onclick = () => {
        // Remove the old canvas
        const oldcanvParent = document.getElementById('app');
        const oldcanv = document.getElementById('canvas');
        oldcanvParent.removeChild(oldcanv);
        const lifes = document.getElementById('life-container');
        oldcanvParent.removeChild(lifes);

        // start a new game
        const gameEngine2 = new Engine(document.getElementById('app'));
        gameEngine2.start();

        // toggle class to hide button
        restartButton[0].classList.toggle('hidden');
      };
    } else {
      // If player is not dead, then draw the score
      this.ctx.font = 'bold 30px Impact';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(this.score, 5, 30);

      // Set the time marker and redraw
      this.lastFrame = Date.now();
      requestAnimationFrame(this.gameLoop);
    }
  }

  // isLvlFinished

  // Lvl condition will go there

  // Check if player gets bonus
  checkBonus() {
    const mainPlayer = this.player;
    if (this.bonus) {
      if (
        this.bonus.x < mainPlayer.x + PLAYER_WIDTH &&
        this.bonus.x + PLAYER_WIDTH > mainPlayer.x &&
        this.bonus.y < mainPlayer.y + PLAYER_HEIGHT &&
        this.bonus.y + PLAYER_HEIGHT > mainPlayer.y
      ) {
        delete this.bonus;
        this.player.numberOfLifes.push[1];

        const lifeContainerToAppend = document.getElementById('life-container');
        const life = document.createElement('img');
        life.setAttribute('class', 'life');
        life.setAttribute('src', 'images/player.png');
        lifeContainerToAppend.appendChild(life);

        return true;
      }
    }
    return false;
  }

  // Check rocket vs ennemy
  destroyEnemy() {
    let flag = false;
    this.enemies.forEach((enemy, enemyIdx) => {
      if (this.rocket) {
        if (
          enemy.x < this.rocket.x + ROCKET_WIDTH &&
          enemy.x + ENEMY_WIDTH > this.rocket.x &&
          enemy.y < this.rocket.y + ROCKET_HEIGHT &&
          enemy.y + ENEMY_HEIGHT > this.rocket.y
        ) {
          // External consequences - (the action of deleting the rocket in itselve happens in the destroyEnemy above)
          delete this.enemies[enemyIdx];
          flag = true;
        }
      }
    });
    return flag;
  }

  // Check collision with Enemy

  checkCollision() {
    const mainPlayer = this.player;
    let removelife = false;
    const mainRocket = this.rocket;

    this.enemies.forEach((enemy, enemyIdx) => {
      // checking if all conditions are true below that means there is a collision
      if (
        enemy.x < mainPlayer.x + PLAYER_WIDTH &&
        enemy.x + ENEMY_WIDTH > mainPlayer.x &&
        enemy.y < mainPlayer.y + PLAYER_HEIGHT &&
        enemy.y + ENEMY_HEIGHT > mainPlayer.y
      ) {
        this.impact = new Impact(this.player.x, this.player.y);
        // setTimeout(() => delete this.impact, 400);

        // if check collision is true - delete enemy
        delete this.enemies[enemyIdx];

        // remove a life from html and from numeroflife array
        const lifes = document.getElementById('life-container');
        lifes.removeChild(lifes.firstElementChild);
        removelife = true;
      }
    });
    return removelife;
    // return removelife;
  }

  isPlayerDead() {
    // check if collision has happened, and then remvoe on life if true
    if (this.player.numberOfLifes.length < 1) {
      return true;
    }

    if (this.checkCollision()) {
      this.player.numberOfLifes.splice(-1, 1);
    }

    return false;
    // then check if life = 0 if yes return true meaning player is dead

    // return false;
    // return this.enemies.some(enemy =>
    //   // checking if all conditions are true below that means there is a collision

    //   enemy.x < mainPlayer.x + PLAYER_WIDTH &&
    //     enemy.x + ENEMY_WIDTH > mainPlayer.x &&
    //     enemy.y < mainPlayer.y + PLAYER_HEIGHT &&
    //     enemy.y + ENEMY_HEIGHT > mainPlayer.y);
  }
}

// This section will start the game
const gameEngine = new Engine(document.getElementById('app'));
gameEngine.start();
