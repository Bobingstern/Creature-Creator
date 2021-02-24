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
let jointLimits = []
let SCALE = 30
let WORLD
let offset
let offBeg
let lazerSpeed = 1
var col = [173, 216, 255, 255]
let bodyCopy = []
let offY = 0
let lUp
let lDown
let DeadShots = []
let actualBest
let worlds = []

var numberOfWorlds = 5;
var playersPerWorld = 100;
var playersInEachWorld = [];
let batches = 10
let PopSize = 500
let nonJoints = []


function clearWorlds() {
  for (var i = 0; i < playersInEachWorld.length; i++) {
    playersInEachWorld[i] = 0;
  }
}

function getFreeWorld() {
  worlds.push(new b2World(new b2Vec2(0, 50), true))
  return worlds[worlds.length-1]
}

function newWorlds() {
  console.log("New WOrld");

worlds = []


  population.bestScore = 0; //the score of the best ever player
  population.globalBestScore = 0;


  //
  // ground = new Ground(world);
  // ground.cloneFrom(groundTemplate);
  // ground.setBodies(world); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  // world.SetContactListener(listener);
}





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
  var filtData = new b2FilterData();
    // filtData.groupIndex = -1;



  let body = world.CreateBody(bodyDef)
  body.CreateFixture(fixDef)
  return body
}

function evolve() {
  startEvo()
  editor = null;
}

function getBest() {
  let best_player = null
  let best_fitness = 0
  for (var i = 0; i < population.players.length; i++) {
    if (population.players[i].score > best_fitness && !(population.players[i].dead)) {
      best_fitness = population.players[i].fitness
      best_player = population.players[i]
    }
  }
  return best_player
}


function setup() {
  window.canvas = createCanvas(1280, 720);
  frameRate(60)

  for (var i = 0; i < numberOfWorlds; i++) {
   let tempWorld = new b2World(new b2Vec2(0, 50), true);

   // tempWorld.SetContactListener(listener2);

   worlds.push(tempWorld);
   playersInEachWorld.push(0);
 }

  editor = new Editor(evolve)
  offset = createVector(0, 0)
  lUp = createButton("Lazer Speed+")
  lUp.mousePressed(function(){lazerSpeed+=0.5})
  lDown = createButton("Lazer Speed-")
  lDown.mousePressed(function(){lazerSpeed-=0.5})
}

function draw() {
  background(51)
  push()
  fill(255, 255, 255, 100)
  rectMode(CORNER)
  rect(-10000000, height-20, 100000000000000, 20)
  pop()
  if (started){
    drawToScreen();
    if (showBestEachGen) {  //show the best of each gen
      showBestPlayersForEachGeneration();
    } else if (humanPlaying) {  //if the user is controling the ship[
      showHumanPlaying();
    } else if (runBest) {  // if replaying the best ever game
      showBestEverPlayer();

    } else {  //if just evolving normally
      if (population.batchNo != population.batches+1) { //if any players are alive then update them

        population.updateAliveInBatches();

      } else { //all dead
      //genetic algorithm
      // grounds[0].show()
      population.naturalSelection();

      }

    }




    let bestPlayer = getBest()




    if (!(bestPlayer == null)) {
      text("Speed of best Player: "+bestPlayer.fps, 500, 50)
      text("Lazer Speed: "+lazerSpeed, 800, 100)
      push()
      let easing = 0.05;
      let targetX = -1 * bestPlayer.bodies[0].GetPosition().x * SCALE+500;
      let dx = targetX - offset.x;
      if (targetX*-1 > 0){

        offset.x += dx * easing;
      }


      translate(offset.x, 0)
      fill(0, 0, 0)
      for (var i = -1000; i < 1000; i++) {
        //text(i*10, i*300, 100)
        fill(0)
        rect(i * 20, height-20, 10, 20)
        fill(255, 255, 0)
        rect(i * 20+10, height-20, 10, 20)
      }
      pop()
    }


  } else {
    editor.show()
    editor.update()
  }






}

function startEvo(){
  var lowestY = 0
  for (var i=0;i<bodyData.length;i++){
    if (bodyData[i][1]-bodyData[i][3] > lowestY){
      lowestY = bodyData[i][1]-bodyData[i][3]
    }
  }
  offY = height-lowestY


  population = new Population(PopSize);
  started = true

  offBeg = population.players[0].bodies[0].GetPosition().x*SCALE-400
  offset.x = offBeg
  //console.log(worlds)



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
    population.players[0].brain.drawGenome(startX, startY, w, h+population.players[0].genomeInputs*10);
  }
}

// writes info about the current player
function writeInfo() {
  fill(200);
  textAlign(LEFT);
  textSize(30);
  text("Gen: " + population.gen, 300, 50);
  text("Batch No: " + population.batchNo+"/"+batches, 300, 100);



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

}
