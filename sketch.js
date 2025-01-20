let dinoImg, cactusImg, treeImg, bgImage; // proměnné ukládající obrázky dinosaura, překážek (kaktus, strom) a pozadí
let dino; // proměnná obsahující objekt dinosaura (hráče)
let obstacles = []; // pole se všemi překážkami na obrazovce
let score = 0; // aktuální skóre hráče, zvyšuje se každým snímkem hry
let gameOver = false; // stav hry, pokud je true, hra končí
let highScore = 0; // nejvyšší dosažené skóre

function preload() { // speciální funkce v p5.js, přednačítává obrázky
  dinoImg = loadImage('./assets/dinosaur.png'); // načtení obrázku dinosaura
  cactusImg = loadImage('./assets/obstacle.png'); // načtení obrázku kaktusu
  bgImage = loadImage('./assets/background.png'); // načtení obrázku pozadí
  treeImg = loadImage('./assets/tree.png'); // načtení obrázku stromu (druhá překážka)
}

function setup() {
  const canvas = createCanvas(800, 400); // vytvoření herního plátna o velikosti 800x400
  canvas.parent('gameCanvasContainer'); // připojení plátna k HTML elementu
  dino = new Dino(dinoImg); // vytvoření objektu Dino
}

function draw() {
  background(bgImage || 200); // pokud se nenahraje obrázek pozadí, použije se šedé pozadí

  fill(210, 180, 140); // nastavení barvy pro zem
  noStroke(); // vypnutí obrysů
  rect(0, 300, width, 50); // vykreslení země

  document.getElementById('score').textContent = `Skóre: ${score}`; // aktualizace skóre v HTML
  document.getElementById('highScore').textContent = `Nejvyšší skóre: ${highScore}`; // aktualizace nejvyššího skóre

  if (!gameOver) { // pokud hra běží
    dino.update(); // aktualizace stavu dinosaura
    dino.display(); // vykreslení dinosaura

    for (let i = obstacles.length - 1; i >= 0; i--) { // cyklus pro všechny překážky
      obstacles[i].update(); // aktualizace překážky
      obstacles[i].display(); // vykreslení překážky

      if (dino.collidesWith(obstacles[i])) { // kontrola kolize s dinosaurem
        gameOver = true; // pokud došlo ke kolizi, hra končí
      }

      if (obstacles[i].offScreen()) { // pokud překážka opustí obrazovku
        obstacles.splice(i, 1); // odstranění překážky z pole
      }
    }

    if (frameCount % 90 === 0) { // každých 90 snímků vytvoříme novou překážku
      if (score >= 1000) { // pokud hráč dosáhne 1000 bodů, generujeme náhodně kaktus nebo strom
        if (random(1) < 0.5) {
          obstacles.push(new Obstacle(cactusImg));
        } else {
          obstacles.push(new Obstacle2(treeImg));
        }
      } else {
        obstacles.push(new Obstacle(cactusImg)); // do 1000 bodů generujeme pouze kaktusy
      }
    }

    score++; // zvýšení skóre
  } else { // pokud je hra ukončena
    if (score > highScore) { // pokud bylo dosaženo nového rekordu
      highScore = score; // aktualizace nejvyššího skóre
    }

    textAlign(CENTER, CENTER);
    textSize(32);
    fill(0);
    text('Konec hry!', width / 2, height / 2 - 20); // zobrazení textu o konci hry
    textSize(16);
    text(`Skóre: ${score}`, width / 2, height / 2 + 20); // zobrazení skóre
    textSize(14);
    text(`Nejvyšší skóre: ${highScore}`, width / 2, height / 2 + 40); // zobrazení nejvyššího skóre
    noLoop(); // zastavení hry
  }
}

// Třída pro dinosaura (hráče)
class Dino {
  constructor(img) {
    this.x = 50; // pozice x
    this.y = 300; // pozice y (na zemi)
    this.velocity = 0; // rychlost pádu/skoku
    this.gravity = 0.8; // gravitace působící na dinosaura
    this.jumpStrength = -15; // síla skoku
    this.isJumping = false; // stav skákání
    this.img = img; // obrázek dinosaura
  }

  update() { // aktualizace pozice dinosaura
    if (this.isJumping) {
      this.velocity += this.gravity; // aplikace gravitace
      this.y += this.velocity; // pohyb ve směru y

      if (this.y >= 300) { // pokud dopadne na zem
        this.y = 300;
        this.velocity = 0;
        this.isJumping = false;
      }
    }
  }

  display() { // vykreslení dinosaura
    image(this.img, this.x, this.y, 50, 50);
  }

  jump() { // metoda pro skok
    if (!this.isJumping) {
      this.velocity = this.jumpStrength; // aplikace síly skoku
      this.isJumping = true;
    }
  }

  collidesWith(obstacle) { // detekce kolize s překážkou
    if (obstacle.x < this.x + 50 && obstacle.x + 50 > this.x && this.y + 50 > obstacle.y) {
      return true;
    }
    return false;
  }
}

// Třída pro první typ překážky (kaktus)
class Obstacle {
  constructor(img) {
    this.x = width; // výchozí pozice (pravá strana obrazovky)
    this.y = 300; // pozice na zemi
    this.speed = 5; // rychlost pohybu
    this.img = img; // obrázek překážky
  }

  update() {
    this.x -= this.speed; // pohyb překážky doleva
  }

  display() {
    image(this.img, this.x, this.y, 50, 50);
  }

  offScreen() {
    return this.x < -50; // pokud překážka opustí obrazovku
  }
}

// Třída pro druhý typ překážky (strom)
class Obstacle2 {
  constructor(img) {
    this.x = width;
    this.y = 250; // mírně výš než kaktus
    this.speed = 6; // rychlejší než kaktus
    this.img = img;
  }

  update() {
    this.x -= this.speed;
  }

  display() {
    image(this.img, this.x, this.y, 60, 60);
  }

  offScreen() {
    return this.x < -60;
  }
}

function keyPressed() {
  if (key === ' ') { // pokud hráč zmáčkne mezerník
    dino.jump(); // dinosaur skočí
  }
}

function mousePressed() {
  if (gameOver) { // pokud hra skončila a klikne se myší
    gameOver = false; // restart hry
    score = 0;
    obstacles = [];
    loop(); // opětovné spuštění hry
  }
}
