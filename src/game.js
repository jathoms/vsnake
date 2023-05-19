let snake;
let food;
let w;
let h;
let fps = 20;
let rez = 5;
let pressed;
let ate;
let foodpos = [0, 0];
const backgroundColorWhileAlive = "#1F2133";
const backgroundColorWhileDead = "#FF0000";
const windowWidthSizeOffset = 1;
const windowHeightSizeOffset = 30;

class ArraySet extends Set {
  add(arr) {
    super.add(arr.toString());
  }
  has(arr) {
    return super.has(arr.toString());
  }
}
let occupied = new ArraySet();

const focusGame = () => {
  document.getElementById("game").focus();
};

function setup() {
  createCanvas(
    windowWidth - windowWidthSizeOffset,
    windowHeight - windowHeightSizeOffset
  );
  w = floor(width / rez);
  h = floor(height / rez);
  snake = new Snake();
  frameRate(fps);
  createNewFood();

  let slider = document.getElementById("myRange");

  slider.oninput = () => {
    oldRez = rez;
    rez = slider.value;
    if (rez > oldRez) {
    }
  };
}

function windowResized() {
  resizeCanvas(
    windowWidth - windowWidthSizeOffset,
    windowHeight - windowHeightSizeOffset,
    (noRedraw = true)
  );
  w = floor(width / rez - rez / 2);
  h = floor(height / rez - rez / 2);

  food = createVector(
    min(foodpos[0], w - rez / 2),
    min(foodpos[1], h - rez / 2)
  );
}

function createNewFood() {
  body = snake.getBody();
  body.forEach((segment) => {
    occupied.add([segment.x, segment.y]);
  });
  let x = floor(random(w));
  let y = floor(random(h));

  while (occupied.has([x, y])) {
    x = floor(random(w));
    y = floor(random(h));
  }
  food = createVector(x, y);
  foodpos = [x, y];
  occupied.clear();
}

function keyPressed() {
  let dir2;
  let dir = [snake.xdir, snake.ydir];
  switch (keyCode) {
    case LEFT_ARROW:
      dir2 = [-1, 0];
      break;
    case RIGHT_ARROW:
      dir2 = [1, 0];
      break;
    case DOWN_ARROW:
      dir2 = [0, 1];
      break;
    case UP_ARROW:
      dir2 = [0, -1];
      break;
    default:
      break;
  }
  if (key === " ") {
    snake.grow();
  }

  backwards = dir.map((x) => {
    if (x !== 0) {
      return x * -1;
    } else {
      return 0;
    }
  });

  if (
    JSON.stringify(backwards) !== JSON.stringify(dir2) &&
    JSON.stringify(dir) !== JSON.stringify(dir2)
  ) {
    snake.setDir(...dir2);

    pressed = true;
    snake.update();
    if (snake.eat(food)) {
      createNewFood();
      ate = true;
    }
  }
}

function draw() {
  scale(rez);
  background(backgroundColorWhileAlive);

  if (!pressed) {
    snake.update();
  }
  snake.show();

  if (snake.endGame(ate)) {
    print("END GAME");
    background(backgroundColorWhileDead);
    noLoop();
  }

  noStroke();
  fill(255, 0, 0);
  rect(food.x, food.y, 1, 1);

  pressed = false;
  ate = false;

  if (snake.eat(food)) {
    createNewFood();
    ate = true;
  }
}
