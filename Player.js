let maxJointAcceleration = 0.5;

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

    this.speed = 5
    this.lazer = createVector(0, 0)
    this.idiotJoints = []
    this.fps = 0
    this.oldx = 1
    this.time = 0
    this.interOff = 0
    this.jointSpeeds = []
    this.jointSpeed = 5
    this.maxJointSpeed = 5

    //TODO: JOINT ACCELARTION AND HUMAN LIKE JOINT MOVEMETNS FUCK FUCK ITS SO HARD
    //270 and 360
    //console.log(height-offY)

    this.ground = makeBox(this.world, b2Body.b2_staticBody, 0, height, width*10000000, 20, 1, 100, 0.2, 2, 10)
    this.ground.SetUserData("ground")

    //this.ground.SetFilterData()
    this.groundWidth = width*10000000
    this.groundHeight = 20

    this.ground2 = makeBox(this.world, b2Body.b2_staticBody, 0, height, width*10000000, 20, 1, 100, 0.2, 1)


    var lowestY = 0
    arrayCopy(bodyData, bodyCopy)


    for (let i = 0; i < bodyData.length; i++) {

      this.bodies.push(makeBox(this.world, b2Body.b2_dynamicBody, bodyData[i][0] + bodyData[i][2] / 2, (bodyData[i][1] + bodyData[i][3] / 2), (bodyData[i][2] / 2)/this.downScalar, (bodyData[i][3] / 2)/this.downScalar, 1, 0.8, 0.1, 1))
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
      this.jointSpeeds.push(0)
    }

    this.look()
    //console.log(this.jointSpeeds)
    this.genomeInputs = this.vision.length
    this.genomeOutputs = this.jointSpeeds.length;
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






        //--------------
        let counter = 0;
        for (var j of this.joints) {

                //for each joint

                let jointSpeed = this.jointSpeeds[counter];
                let simulatedEase = false;
                //if the joint is limited then decrease the velocity of the joint as it reaches the limits so it looks more natural
                if (j.limitRevolution) {

                    let upperLim = j.joint.GetUpperLimit();
                    let lowerLim = j.joint.GetLowerLimit();
                    let jointRange = upperLim - lowerLim;
                    let jointAngle = j.joint.GetJointAngle();

                    //if the joint is near the limit then slow the joint speed down to simulate ease in and out
                    let previousJointSpeed = jointSpeed;

                    if (jointSpeed < 0) {
                        if (jointAngle - lowerLim < 0.2 * jointRange) {
                            if (jointAngle < lowerLim) {
                                jointSpeed = 0;
                                simulatedEase = true;
                            } else {
                                jointSpeed = map(jointAngle - lowerLim, 0, 0.2 * jointRange, this.jointSpeeds[counter], 0);
                                simulatedEase = true;
                            }
                        }

                    } else {

                        if (upperLim - jointAngle < 0.2 * jointRange) {
                            if (upperLim < jointAngle) {
                                jointSpeed = 0;
                                simulatedEase = true;
                            } else {
                                jointSpeed = map(upperLim - jointAngle, 0, 0.2 * jointRange, 0, this.jointSpeeds[counter]);
                                simulatedEase = true;
                            }
                        }


                    }

                }


                //if the joint hasnt already had simulated ease applied because its close to the limits then limit the joints acceleration so it looks more natural
                if (!simulatedEase && Math.abs(j.GetMotorSpeed() - jointSpeed) > maxJointAcceleration) {
                    if (jointSpeed > j.GetMotorSpeed()) {
                        jointSpeed = j.GetMotorSpeed() + maxJointAcceleration;
                    } else {
                        jointSpeed = j.GetMotorSpeed() - maxJointAcceleration;
                    }
                }
                j.SetMotorSpeed(jointSpeed);
                counter += 1;


      //----------------------------------
    }

    for (var i = 0 ; i < this.bodies.length; i++) {

      if (this.bodies[i].GetPosition().x*SCALE - this.lazer.x < bodyData[i][2]/2/this.downScalar){
        this.dead = true
      }
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
    Joint.SetMotorSpeed(-(this.speed))
  }

  rotateLeft(Joint) {
    Joint.SetMotorSpeed((this.speed))
  }

  look() {
    this.vision = [];

    //-------------------------------------------angles and speeds of revolute joints
    let jointAngles = [];
    let inputJointSpeeds = [];
    for (var j of this.joints) {
        if (j.type === "revolute") {
            if (j.limitRevolution) {// if limited then map 0 and 1 to the limits
                let upperLim = j.joint.GetUpperLimit();
                let lowerLim = j.joint.GetLowerLimit();
                let jointAngle = constrain(j.joint.GetJointAngle(), lowerLim, upperLim);//make sure the angle is within the limit (sometimes the physics engine can be a little fucky)
                this.vision.push(map(jointAngle, lowerLim, upperLim, 0, 1));
            } else {
                jointAngles.push(j.joint.GetJointAngle());
            }

            inputJointSpeeds.push(j.joint.GetJointSpeed());

        }
    }


    //add the joint angles to the vision array
    for (var j of jointAngles) {
        let val = j;
        while (val < 0) {
            val += 2 * PI;
        }
        val %= 2 * PI;
        this.vision.push(map(val, 0, 2 * PI, 0, 1));
    }

    //add the joint speeds to the vision array
    for (var j of inputJointSpeeds) {
        let val = j;
        val = val / this.maxJointSpeed;
        // this.vision.push(val);
    }


    //-------------------------------------------if touching ground


    let bodyTouchingGroundCounter = this.bodies.filter((b) => b.touchingGround).length;
    //this.vision.push(bodyTouchingGroundCounter / this.bodies.length);

    for (let b of this.bodies) {
        if (b.untouchGroundNextFrame) {
            b.touchingGround = false;
            b.untouchGroundNextFrame = false;
        }
    }

    //-------------------------------------------rotation of the body
    //the rotation needs to be relative to the mass of the object
    let bodyMasses = [];
    let totalMass = 0;
    for (let b of this.bodies) {
        bodyMasses.push(b.GetMass());
        totalMass += b.GetMass();
    }

    let averageRotationRelativeToMass = 0;
    for (let i = 0; i < this.bodies.length; i++) {
        let val = getAngleBetween0and2PI(this.bodies[i].GetAngle());
        let angle = getAngleBetween0and2PI(this.bodies[i].GetA);
        //get the difference between the current angle and the stating angle
        let angleDiff = val - angle;

        //now we want that difference to be in range (-PI,PI)

        if (angleDiff > PI) {
            angleDiff -= 2 * PI;
        } else if (angleDiff < -PI) {
            angleDiff += 2 * PI;
        }

        //now we need to calculate the effeted difference based on it mass
        let rotationMass = bodyMasses[i] * angle / totalMass;
        averageRotationRelativeToMass += rotationMass;
    }

    //this.vision.push(map(averageRotationRelativeToMass, -PI, PI, -1, 1));

    //-------------------------------------------height off the ground based on weight
    //essentially get the height of the center of mass of the entire creature
    let heightOfCenterOfMass = 0;
    for (let i = 0; i < this.bodies.length; i++) {
        let height = this.bodies[i].GetWorldCenter().y;
        height = abs(height - this.ground.GetPosition().y);
        heightOfCenterOfMass += bodyMasses[i] * height / totalMass;
    }
    this.vision.push(map(heightOfCenterOfMass, 0, 7, 0, 1));


    //-------------------------------------------verticle velocity of the creature
    //again it should be relative to the mass of each body part so it cant just fling a leg up and be like "im flying"
    bodyMasses = [];
    totalMass = 0;
    for (let b of this.bodies) {
        bodyMasses.push(b.GetMass());
        totalMass += b.GetMass();
    }

    let averageVertVelRelativeToMass = 0;
    for (let i = 0; i < this.bodies.length; i++) {
        let val = this.bodies[i].GetLinearVelocity().y;

        averageVertVelRelativeToMass += bodyMasses[i] * val / totalMass;
    }
    this.vision.push(map(averageVertVelRelativeToMass, -5, 5, -1, 1));


    //-------------------------------------------angular velocity of creature
    //again based on mass
    bodyMasses = [];
    totalMass = 0;
    for (let b of this.bodies) {
        bodyMasses.push(b.GetMass());
        totalMass += b.GetMass();
    }

    let averageAngularVelRelativeToMass = 0;
    for (let i = 0; i < this.bodies.length; i++) {
        let val = this.bodies[i].GetAngularVelocity();

        averageAngularVelRelativeToMass += bodyMasses[i] * val / totalMass;
    }
    this.vision.push(map(averageAngularVelRelativeToMass, -1.5, 1.5, -1, 1));
    //console.log(this.vision)

  }

  getCenterOfMass() {
      let bodyMasses = [];
      let totalMass = 0;
      for (let b of this.bodies) {
          bodyMasses.push(b.body.GetMass());
          totalMass += b.body.GetMass();
      }

      let centerOfMass = createVector(0, 0);
      for (let i = 0; i < this.bodies.length; i++) {
          let pos = this.bodies[i].body.GetWorldCenter();
          centerOfMass = createVector(centerOfMass.x + pos.x * bodyMasses[i] / totalMass, centerOfMass.y + pos.y * bodyMasses[i] / totalMass);
      }

      return centerOfMass;
  }

  think() {
    this.decision = this.brain.feedForward(this.vision);

    for (var i = 0; i < this.decision.length; i++) {

        let jointSpeed = map(this.decision[i], 0, 1, -this.maxJointSpeed, this.maxJointSpeed);
        this.jointSpeeds[i] = jointSpeed;

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

function getAngleBetween0and2PI(angle) {

    while (angle < 0) {
        angle += 2 * PI;
    }
    angle %= 2 * PI;
    return angle;

}
