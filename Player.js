class Player {

  constructor() {
    this.fitness = 0;
    this.vision = [];  //the input array fed into the neuralNet
    this.decision = [];  //the out put of the NN
    this.unadjustedFitness;
    this.lifespan = 0;  //how long the player lived for this.fitness
    this.bestScore = 0;  //stores the this.score achieved used for replay
    this.dead = false;
    this.score = 0;
    this.gen = 0;
    this.world = new b2World(new b2Vec2(0, 50))
    this.bodies = []
    this.joints = []
    this.bodyScales = []
    this.downScalar = 1
    this.ground = makeBox(this.world, b2Body.b2_staticBody, 0, height, width*10000, 20, 1, 0.3, 0.1, 1)
    this.groundWidth = width
    this.groundHeight = 20
    this.speed = 200
    this.lazer = createVector(0, 0)


    for (let i = 0; i < bodyData.length; i++) {
      this.bodies.push(makeBox(this.world, b2Body.b2_dynamicBody, bodyData[i][0] + bodyData[i][2] / 2, bodyData[i][1] + bodyData[i][3] / 2, (bodyData[i][2] / 2)/this.downScalar, (bodyData[i][3] / 2)/this.downScalar, 1, 0.3, 0.1, 1))
      this.bodyScales.push([(bodyData[i][2] / 2)/this.downScalar, (bodyData[i][3] / 2)/this.downScalar])
    }
    for (let i = 0; i < jointData.length; i++) {
      let jointDef = new b2RevoluteJointDef()
      jointDef.bodyA = this.bodies[jointData[i][0]]
      jointDef.bodyB = this.bodies[jointData[i][1]]
      let bodyAnchorPos = createVector(jointData[i][2], jointData[i][3])
      let bodyAoffset = createVector((bodyAnchorPos.x / SCALE - this.bodies[jointData[i][0]].GetPosition().x)/this.downScalar, (bodyAnchorPos.y / SCALE - this.bodies[jointData[i][0]].GetPosition().y)/this.downScalar)
      let bodyBoffset = createVector((bodyAnchorPos.x / SCALE - this.bodies[jointData[i][1]].GetPosition().x)/this.downScalar, (bodyAnchorPos.y / SCALE - this.bodies[jointData[i][1]].GetPosition().y)/this.downScalar)
      jointDef.localAnchorA.Set(bodyAoffset.x, bodyAoffset.y)
      jointDef.localAnchorB.Set(bodyBoffset.x, bodyBoffset.y)
      jointDef.collideConnected = false
      jointDef.enableMotor = true
      jointDef.maxMotorTorque = 100000
      this.joints.push(this.world.CreateJoint(jointDef))
    }
    this.genomeInputs = this.joints.length+this.bodies.length+this.bodies.length;
    this.genomeOutputs = this.joints.length;
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);
  }

  show() {
    for (let i = 0; i < this.bodies.length; i++) {
      let pos = this.bodies[i].GetPosition()
      let angle = this.bodies[i].GetAngle()
      push()
      fill(255, 255, 255, 100)
      translate(pos.x * SCALE+offset.x, pos.y * SCALE)
      rectMode(CENTER)
      rotate(angle)
      rect(0, 0, this.bodyScales[i][0] * 2, this.bodyScales[i][1] * 2)
      pop()
    }
    push()
    fill(255, 0, 0)
    rectMode(CENTER)
    rect(this.lazer.x+offset.x, height / 2, 10, height)
    pop()
  }

  move() {
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  }

  update() {
    this.lazer.x += 1

    if (!(this.dead)) {
      this.fitness += 0.001

      this.score = this.fitness
      this.world.Step(1 / 60, 10, 10)
      for (let i = 0; i < this.decision.length; i++) {
        if (this.decision[i] > 0.5) {
          this.rotateLeft(this.joints[i])
        } else {
          this.rotateRight(this.joints[i])
        }
      }
    }

    for (var i = 0 ; i < this.bodies.length; i++) {

      if (this.bodies[i].GetPosition().x*SCALE - this.lazer.x < bodyData[i][2]/2/this.downScalar){
        this.dead = true
      }
    }
  }

  rotateRight(Joint) {
    Joint.SetMotorSpeed(radians(-(this.speed)))
  }

  rotateLeft(Joint) {
    Joint.SetMotorSpeed(radians(this.speed))
  }

  look() {
    for (var i=0;i<this.joints.length;i++){
      this.vision[i] = this.joints[i].GetJointAngle()
    }
    for (var i=0;i<this.bodies.length;i++){
      this.vision[this.vision.length] = this.bodies[i].GetLinearVelocity().x
      this.vision[this.vision.length] = this.bodies[i].GetLinearVelocity().y
    }

    for (var i=0;i<this.bodies.length;i++){

      this.vision[this.vision.length] = this.bodies[i].GetPosition().y*SCALE
    }
  }

  think() {
    let max = 0;
    let maxIndex = 0;
    this.decision = this.brain.feedForward(this.vision);
    for (let i = 0; i < this.decision.length; i++) {
      if (this.decision[i] > max) {
        max = this.decision[i];
        maxIndex = i;
      }
    }
  }

  clone() {
    let clone = new Player();
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;
    return clone;
  }

  cloneForReplay() {
    let clone = new Player();
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;
    return clone;
  }

  calculateFitness() {

  }

  crossover(parent2) {
    let child = new Player();
    child.brain = this.brain.crossover(parent2.brain);
    child.brain.generateNetwork();
    return child;
  }
}
