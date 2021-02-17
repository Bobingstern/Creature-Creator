// this is a template to add a NEAT ai to any game
// this means that there is some information specific to the game to input here
let b2Vec2 = Box2D.Common.Math.b2Vec2;
let b2BodyDef = Box2D.Dynamics.b2BodyDef;
let b2Body = Box2D.Dynamics.b2Body;
let b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
let b2Fixture = Box2D.Dynamics.b2Fixture;
let b2World = Box2D.Dynamics.b2World;
let b2MassData = Box2D.Collision.Shapes.b2MassData;
let b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
let b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
let b2EdgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef;

let b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
let b2StaticBody = Box2D.Dynamics.b2Body.b2_staticBody;
let b2DynamicBody = Box2D.Dynamics.b2Body.b2_dynamicBody;
let b2RevoluteJoint = Box2D.Dynamics.Joints.b2RevoluteJoint;
let b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

let b2PrismaticJoint = Box2D.Dynamics.Joints.b2PrismaticJoint;
let b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;

let b2FilterData = Box2D.Dynamics.b2FilterData;

let b2DistanceJoint = Box2D.Dynamics.Joints.b2DistanceJoint;
let b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;

let b2WeldJoint = Box2D.Dynamics.Joints.b2WeldJoint;
let b2WeldJointDef = Box2D.Dynamics.Joints.b2WeldJointDef;

let nextConnectionNo = 1000;
let population;
let speed = 60;

let showBest = false;  //true if only show the best of the previous generation
let runBest = false;  //true if replaying the best ever game
let humanPlaying = false;  //true if the user is playing
let humanPlayer;

let showBrain = true;
let showBestEachGen = false;
let upToGen = 0;
let genPlayerTemp;  //player

let showNothing = false;
let started = false

let editor
let bodyData = []
let jointData = []
let SCALE = 30
let WORLD


function makeBox(world, bodyType, x, y, w, h, density, friction, res, mass, isSens) {
  let fixDef = new b2FixtureDef();
  fixDef.density = density;
  fixDef.friction = friction
  fixDef.restitution = res
  fixDef.isSensor = isSens
  // fixDef.mass = mass
  let bodyDef = new b2BodyDef()
  bodyDef.type = bodyType
  bodyDef.position.x = x / SCALE
  bodyDef.position.y = y / SCALE
  fixDef.shape = new b2PolygonShape()
  fixDef.shape.SetAsBox(w / SCALE, h / SCALE)
  let body = world.CreateBody(bodyDef)
  body.CreateFixture(fixDef)
  return body
}

function evolve() {
  startEvo()
  editor = null;
}

function setup() {
  window.canvas = createCanvas(1280, 720);
  humanPlayer = new Player();
  editor = new Editor(evolve)
}

function draw() {
  background(51)
  if (started){
    drawToScreen();
    if (showBestEachGen) {  //show the best of each gen
      showBestPlayersForEachGeneration();
    } else if (humanPlaying) {  //if the user is controling the ship[
      showHumanPlaying();
    } else if (runBest) {  // if replaying the best ever game
      showBestEverPlayer();
    } else {  //if just evolving normally
      if (!(population.done())) {  //if any players are alive then update them
        population.updateAlive();
      } else {  //all dead
        //genetic algorithm
        population.naturalSelection();
      }
    }
  }
  else{
    editor.show()
    editor.update()
  }
}

function startEvo(){
  population = new Population(100);
  started = true
  console.log('cheese')
}

function showBestPlayersForEachGeneration() {
  if (!(genPlayerTemp.dead)) {  //if current gen player is not dead then update it
    genPlayerTemp.look();
    genPlayerTemp.think();
    genPlayerTemp.update();
    genPlayerTemp.show();
  } else {  //if dead move on to the next generation
    upToGen++;
    if (upToGen >= population.genPlayers.length) {  //if at the end then return to the start and stop doing it
      upToGen = 0;
      showBestEachGen = false;
    } else {  //if not at the end then get the next generation
      genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
    }
  }
}

function showHumanPlaying() {
  if (!(humanPlayer.dead)) {  //if the player isnt dead then move and show the player based on input
    humanPlayer.look();
    humanPlayer.update();
    humanPlayer.show();
  } else {  //once done return to ai
    humanPlaying = false;
  }
}

function showBestEverPlayer() {
  if (!(population.bestPlayer.dead)) {  //if best player is not dead
    population.bestPlayer.look();
    population.bestPlayer.think();
    population.bestPlayer.update();
    population.bestPlayer.show();
  } else {  //once dead
    runBest = false;  //stop replaying it
    population.bestPlayer = population.bestPlayer.cloneForReplay();  //reset the best player so it can play again
  }
}

// draws the display screen
function drawToScreen() {
  if (!showNothing) {
    // pretty stuff
    drawBrain();
    writeInfo();
  }
}

function drawBrain() {  // show the brain of whatever genome is currently showing
  let startX = 0;
  let startY = 0;
  let w = 300;
  let h = 300;
  if (runBest) {
    population.bestPlayer.brain.drawGenome(startX, startY, w, h);
  } else
  if (humanPlaying) {
    showBrain = false;
  } else if (showBestEachGen) {
    genPlayerTemp.brain.drawGenome(startX, startY, w, h);
  } else {
    population.players[0].brain.drawGenome(startX, startY, w, h);
  }
}

// writes info about the current player
function writeInfo() {
  fill(200);
  textAlign(LEFT);
  textSize(30);
  if (showBestEachGen) {
    text("Score: " + genPlayerTemp.score, 650, 50);
    text("Gen: " + (genPlayerTemp.gen + 1), 1150, 50);
  } else
  if (humanPlaying) {
    text("Score: " + humanPlayer.score, 650, 50);
  } else
  if (runBest) {
    text("Score: " + population.bestPlayer.score, 650, 50);
    text("Gen: " + population.gen, 1150, 50);
  } else {
    if (showBest) {
      text("Score: " + population.players[0].score, 650, 50);
      text("Gen: " + population.gen, 1150, 50);
      text("Species: " + population.species.length, 50, canvas.height / 2 + 300);
      text("Global Best Score: " + population.bestScore, 50, canvas.height / 2 + 200);
    }
  }
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function keyPressed() {
  switch (key) {
    case ' ':
      //toggle showBest
      showBest = !showBest;
      break;
      // case '+': //speed up frame rate
      //   speed += 10;
      //   frameRate(speed);
      //   prletln(speed);
      //   break;
      // case '-': //slow down frame rate
      //   if(speed > 10) {
      //     speed -= 10;
      //     frameRate(speed);
      //     prletln(speed);
      //   }
      //   break;
    case 'B': //run the best
      runBest = !runBest;
      break;
    case 'G': //show generations
      showBestEachGen = !showBestEachGen;
      upToGen = 0;
      genPlayerTemp = population.genPlayers[upToGen].clone();
      break;
    case 'N': //show absolutely nothing in order to speed up computation
      showNothing = !showNothing;
      break;
    case 'P': //play
      humanPlaying = !humanPlaying;
      humanPlayer = new Player();
      break;
  }
  //any of the arrow keys
  switch (keyCode) {
    case UP_ARROW: //the only time up/ down / left is used is to control the player
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      break;
    case DOWN_ARROW:
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      break;
    case LEFT_ARROW:
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      break;
    case RIGHT_ARROW: //right is used to move through the generations

      if (showBestEachGen) { //if showing the best player each generation then move on to the next generation
        upToGen++;
        if (upToGen >= population.genPlayers.length) { //if reached the current generation then exit out of the showing generations mode
          showBestEachGen = false;
        } else {
          genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
        }
      } else if (humanPlaying) { //if the user is playing then move player right

        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      }
      break;
  }
}
