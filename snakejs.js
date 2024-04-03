const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY =5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let gamePaused = false;
let powerUpActive = false; //INitialization for power up

// css transition classes
const snakeHeadTransitionClass = 'snake-head-transition';
const snakeBodyTransitionClass = 'snake-body-transition';

//Getting high score from local storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`; // used ` ` so that the "high score doesnt appear as a text but the actual number"

const updateFoodPosition = () => {
    // Passing a random 1 - 30 value as food position
    foodX = Math.floor(Math.random() * 50) + 1;
    foodY = Math.floor(Math.random() * 50) + 1;
}

const handleGameOver = () => {
    // clearing the timer and reloading the page on game over
    clearInterval(setIntervalId);
    alert("Game Over! Press OK to replay....");
    location.reload();
}

const changeDirection = e => {
    // changing velocity based on key press
    if (gamePaused) return;
    if(e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if(e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if(e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if(e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

// Calling changeDirection on each key click and passing key dataset value as an object
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

const togglePause = () => {
    gamePaused = !gamePaused;
}

document.addEventListener("keyup", e => {
    if (e.key === " ") { // spacebar for pause/resume
        togglePause();

    }
});

const moveSnake = () => {
    if (gameOver || gamePaused) return;
    snakeX += velocityX;
    snakeY += velocityY
 
    // Check for wall collision 
    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        return handleGameOver();
    }
    
    // check for self-collision
    for (let i = 0; i < snakeBody.length; i++ ) {
        if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
         return handleGameOver();   
        }
    }
}

const powerUpEffects = {
    //the ff are in ALL CAPS Because they are constants. This shows that they shouldn't be changed
    LENGTH: 2, // increase snake length by 2
    SCORE: 2, // Adds 2 points to score
    DURATION: 30000 // Poer-up duration in milliseconds (30s)

};

let powerUpTimer;

const handlePowerUp = () => {
    // Increase snake length
    for (let i = 0; i < powerUpEffects.LENGTH; i++) {
        snakeBody.push([...snakeBody[snakeBody.length - 1]]); //Add new element to  
    }

    score += powerUpEffects.SCORE; //Increase score
    scoreElement.innerText = `Score: ${score}`;

    clearTimeout(powerUpTimer); // Clear previous power-up timer
    const powerUpElement = document.querySelector('.power-up');
    if (powerUpElement) {
        powerUpElement.remove(); // Remove power-up from the board
    }

    powerUpActive = false; // Deactivate power-up
    
}

const spawnPowerUp = () => {
    powerUpX = Math.floor(Math.random() * 50) + 1;
    powerUpY = Math.floor(Math.random() * 50) + 1;
    powerUpActive = true;
    // Display power-up on the board
    playBoard.innerHTML += `<div class="power-up" style="grid-area: ${powerUpY} / ${powerUpX}"></div>`;
    // set a timewr to remove the power-up after 30s
    powerUpTimer = setTimeout(() => {
        powerUpActive = false;
        const powerUpElement = document.querySelector('.power-up');
        if (powerUpElement) {
            powerUpElement.remove();
        }
    }, powerUpEffects.DURATION); 
}

let foodEaten = 0; // Counter to track food items eaten

const initGame = () => {
    if(gameOver) return handleGameOver();

    // Spawn food at the start of the game and after each power-up is consumed
    if (foodEaten % 10 === 0 && foodEaten > 0) {
        // Spawn power-up after eating 10 food items
        spawnPowerUp();
    } else { 
        let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;
        // render snake body
        snakeBody.forEach(segment => {
            html += `<div class="body" style="grid-area: ${segment[1]} / ${segment[0]}"></div>`
        });

        // Render snake head
        html += `<div class="head" style="grid-area: ${snakeY} / ${snakeX}"></div>`;
        playBoard.innerHTML = html;

    }
    
    // Checking if the snake hit the food
    if(snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]); // Pushing food position to snake body array
        score++; // increment score by 1
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
    }

    // Updating the snake's head position based on the current velocity
    snakeX += velocityX;
    snakeY += velocityY;
    
    // Shifting forward the values of the elements in the snake body by one
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }


 snakeBody[0] = [snakeX, snakeY]; // Setting first element of snake body to current snake position

// Checking if the snake's head is out of wall, if so setting gameOver to true
 if(snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
    return handleGameOver();
 }

 for (let i = 0; i < snakeBody.length; i++) {
    // Adding a div for each part of the snake's body
    html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
    // Checking if the snake head hit the body, if so set gameOver to true
    if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
        return handleGameOver();
    }
 }
 playBoard.innerHTML = html;

}
updateFoodPosition();
setIntervalId = setInterval(initGame, 100);
document.addEventListener("keyup", changeDirection);
