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
    this.world = getFreeWorld()
    this.bodies = []
    this.joints = []
    this.bodyScales = []
    this.downScalar = 2

    this.speed = 300
    this.lazer = createVector(0, 0)
    this.idiotJoints = []
    this.fps = 0
    this.oldx = 1
    this.time = 0
    this.interOff = 0
    //270 and 360
    //console.log(height-offY)

    this.ground = makeBox(this.world, b2Body.b2_staticBody, 0, height, width*10000000, 20, 10000000000, 0.3, 0.1, 2, 10)
    this.ground.SetUserData("ground")

    //this.ground.SetFilterData()
    this.groundWidth = width*10000000
    this.groundHeight = 20

    this.ground2 = makeBox(this.world, b2Body.b2_staticBody, 0, height, width*10000000, 20, 10000000000, 0.3, 0.1, 1)


    var lowestY = 0
    arrayCopy(bodyData, bodyCopy)


    for (let i = 0; i < bodyData.length; i++) {

      this.bodies.push(makeBox(this.world, b2Body.b2_dynamicBody, bodyData[i][0] + bodyData[i][2] / 2, (bodyData[i][1] + bodyData[i][3] / 2), (bodyData[i][2] / 2)/this.downScalar, (bodyData[i][3] / 2)/this.downScalar, 1, 0.3, 0.1, 1))
      this.bodyScales.push([(bodyData[i][2] / 2)/this.downScalar, (bodyData[i][3] / 2)/this.downScalar])
    }

    for (let i = 0; i < jointData.length; i++) {
      let jointDef = new b2RevoluteJointDef()
      jointDef.bodyA = this.bodies[jointData[i][0]]
      jointDef.bodyB = this.bodies[jointData[i][1]]
      if (jointLimits[i][0] != 1000 && jointLimits[i][1] != 1000){
        jointDef.enableLimit = true
        jointDef.lowerAngle = radians(jointLimits[i][0])
        jointDef.upperAngle = radians(jointLimits[i][1])
      }
      else{
        jointDef.enableLimit = true
        jointDef.lowerAngle = radians(-10)
        jointDef.upperAngle = radians(10)

      }

      jointDef.enableMotor = true
      jointDef.maxMotorTorque = 10000

      let bodyAnchorPos = createVector(jointData[i][2], jointData[i][3])
      let bodyAoffset = createVector((bodyAnchorPos.x / SCALE - this.bodies[jointData[i][0]].GetPosition().x)/this.downScalar, (bodyAnchorPos.y / SCALE - this.bodies[jointData[i][0]].GetPosition().y)/this.downScalar)
      let bodyBoffset = createVector((bodyAnchorPos.x / SCALE - this.bodies[jointData[i][1]].GetPosition().x)/this.downScalar, (bodyAnchorPos.y / SCALE - this.bodies[jointData[i][1]].GetPosition().y)/this.downScalar)
      jointDef.localAnchorA.Set(bodyAoffset.x, bodyAoffset.y)
      jointDef.localAnchorB.Set(bodyBoffset.x, bodyBoffset.y)
      jointDef.collideConnected = false

      this.joints.push(this.world.CreateJoint(jointDef))
    }
    this.genomeInputs = this.joints.length+this.bodies.length+this.bodies.length;
    this.genomeOutputs = this.joints.length;
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);

    this.lazer.x = this.bodies[0].GetPosition().x*SCALE-400

    //console.log(DeadShots)
    if (DeadShots.length > 0){
      for (var i=0;i<DeadShots.length;i++){
        this.bodies[DeadShots[i]].SetUserData("body")

      }
    }


    bodyData = []

    arrayCopy(bodyCopy, bodyData)


    ///-----------
    this.listener = new Box2D.Dynamics.b2ContactListener;
    this.listener.dead = false
    this.world.SetContactListener(this.listener);

    this.listener.BeginContact = function(contact) {

      // console.log(contact.GetFixtureA().GetBody().GetUserData());
      let fixA = contact.GetFixtureA().GetBody().GetUserData()
      let fixB = contact.GetFixtureB().GetBody().GetUserData()

      if (fixA == "ground" && fixB == "body" || fixA == "body" && fixB == "ground") {

        this.dead = true


      }


    }

    this.listener.EndContact = function(contact) {
      // console.log(contact.GetFixtureA().GetBody().GetUserData());
    }

    this.listener.PreSolve = function() {

    }



  }

  show() {
    for (let i = 0; i < this.bodies.length; i++) {
      let pos = this.bodies[i].GetPosition()
      let angle = this.bodies[i].GetAngle()
      push()

      fill(255, 255, 255, 200)
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
    this.lazer.x += lazerSpeed
    if (this.listener.dead){
      this.dead = true
    }
    if (!(this.dead)) {

      //this.world.Step(1 / 60, 10, 10)


      this.fitness = this.bodies[0].GetPosition().x
      this.score = this.bodies[0].GetPosition().x
      this.lifespan += 0.001
      this.time += 1


        if (this.oldx != 1){
          this.fps = this.bodies[0].GetPosition().x*SCALE - this.oldx
        }
        this.oldx = this.bodies[0].GetPosition().x*SCALE

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

  ded(){
    this.world.Step(1/60, 10, 10)
    for (var i=0;i<this.joints.length;i++){
      this.world.DestroyJoint(this.joints[i])
    }
    for (let i = 0; i < this.bodies.length; i++) {
      let pos = this.bodies[i].GetPosition()
      let angle = this.bodies[i].GetAngle()
      push()
      blendMode(LIGHTEST);
      fill(255, 0, 0, 10)
      translate(pos.x * SCALE+offset.x, pos.y * SCALE)
      rectMode(CENTER)
      rotate(angle)
      rect(0, 0, this.bodyScales[i][0] * 2, this.bodyScales[i][1] * 2)
      pop()
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
