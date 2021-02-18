class Editor {
  constructor(evolveFunc) {
    // Rectangluar control
    this.RectDraw = false
    this.RectDrawX = null
    this.RectDrawY = null
    this.RectDrawing = true
    this.rectDrawn = false
    this.drawMode = true
    this.id = 0
    this.world = new b2World(new b2Vec2(0, 50))
    this.bodies = []
    this.bodyScales = []
    this.inSim = false
    this.evolving = false
    // Joint control
    this.joints = []
    this.jointDraw = false
    this.jointBody = []
    this.jointAnchorLocation = []
    // Buttons
    this.makeButtons()
    this.evolveFunction = evolveFunc
    // Ground
    this.ground = makeBox(this.world, b2Body.b2_staticBody, 0, height, width, 20, 1, 0.3, 0.1, 1)
    this.groundWidth = width
    this.groundHeight = 20
    this.TestButton
    this.TestButton
    this.EvolveButton
    this.EvolveButton
    this.ToggleDrawModeButton
    this.ToggleDrawModeButton
    this.UndoButton
    this.UndoButton
    this.ClearButton
    this.ClearButton
  }

  makeButtons() {
    this.TestButton = this.makeButton("Test Creature", [0, 255, 0], 10, 10, 100, 50, 19)
    this.TestButton.mousePressed(this.addShitToWorld)
    this.EvolveButton = this.makeButton("Evolve", [255, 127, 0], 110, 10, 100, 50, 19)
    this.EvolveButton.mousePressed(this.evolve)
    this.ToggleDrawModeButton = this.makeButton("Switch to Joint mode", [0, 127, 255], 210, 10, 100, 50, 14)
    this.ToggleDrawModeButton.mousePressed(this.toggleMode)
    this.UndoButton = this.makeButton("Undo (Glitchy)", [255, 255, 0], 310, 10, 100, 50, 18)
    this.UndoButton.mousePressed(this.ridLastPieceOfShit)
    this.ClearButton = this.makeButton("Clear World", [255, 0, 0], 410, 10, 100, 50, 19)
    this.ClearButton.mousePressed(this.ridWorldOfShit)
  }

  evolve() {
    editor.TestButton.remove()
    editor.UndoButton.remove()
    editor.ClearButton.remove()
    editor.ToggleDrawModeButton.remove()
    editor.EvolveButton.remove()

    editor.RectDrawing = false
    editor.jointDraw = false
    editor.eolving = true
    editor.evolveFunction()
  }

  show() {
    // Rect stuff
    if (this.RectDraw) {
      push()
      fill(255, 255, 255, 50)
      rectMode(CORNER)
      rect(this.RectDrawX, this.RectDrawY, (mouseX - this.RectDrawX), (mouseY - this.RectDrawY))
      pop()
    } else {
      this.RectDrawX = null
      this.RectDrawY = null
    }
    if (this.drawMode) {
      for (let i = 0; i < bodyData.length; i++) {
        push()
        fill(255, 255, 255, 50)
        rectMode(CORNER)
        rect(bodyData[i][0], bodyData[i][1], bodyData[i][2], bodyData[i][3])
        pop()
      }
    } else {
      for (let i = 0; i < this.bodies.length; i++) {
        let pos = this.bodies[i].GetPosition()
        let angle = this.bodies[i].GetAngle()
        push()
        fill(255, 255, 255, 100)
        translate(pos.x * SCALE, pos.y * SCALE)
        rectMode(CENTER)
        rotate(angle)
        rect(0, 0, this.bodyScales[i][0] * 2, this.bodyScales[i][1] * 2)
        pop()
      }
    }
    // Joint stuff
    if (editor.jointBody.length % 2 != 0 || editor.jointBody.length == 0 || editor.jointBody.length / editor.jointAnchorLocation.length == 2) {

    } else {
      push()
      fill(255, 255, 0, 100)
      ellipse(mouseX, mouseY, 10, 10)
      pop()
    }
    if (this.jointDraw && !(this.inSim)) {
      let closest = 0
      let closestDist = 1000000000000
      for (let i = 0; i < bodyData.length; i++) {
        let d = dist(bodyData[i][0] + bodyData[i][2] / 2, bodyData[i][1] + bodyData[i][3] / 2, mouseX, mouseY)
        if (d < closestDist) {
          closestDist = d
          closest = i
        }
      }

      for (var i = 0; i < this.jointAnchorLocation.length; i++) {
        push()
        fill(255, 255, 0, 100)
        ellipse(this.jointAnchorLocation[i][0], this.jointAnchorLocation[i][1], 10, 10)
        pop()
      }
      if (bodyData.length > 0) {
        push()
        fill(255, 255, 0, 50)
        rectMode(CORNER)
        rect(bodyData[closest][0], bodyData[closest][1], bodyData[closest][2], bodyData[closest][3])
        pop()
      }
    }
  }

  addShitToWorld() {
    editor.inSim = true
    editor.TestButton.remove()
    if (!(editor.evolving)) {
      editor.TestButton = editor.makeButton("Exit Simulation", [0, 255, 0], 10, 10, 100, 50, 19)
      editor.TestButton.mousePressed(editor.exitSim)
    }
    editor.UndoButton.remove()
    editor.ClearButton.remove()
    editor.ToggleDrawModeButton.remove()
    editor.EvolveButton.remove()

    for (let i = 0; i < bodyData.length; i++) {
      editor.bodies.push(makeBox(editor.world, b2Body.b2_dynamicBody, bodyData[i][0] + bodyData[i][2] / 2, bodyData[i][1] + bodyData[i][3] / 2, bodyData[i][2] / 2, bodyData[i][3] / 2, 1, 0.3, 0.1, 1))
      editor.bodyScales.push([bodyData[i][2] / 2, bodyData[i][3] / 2])
    }
    editor.drawMode = false
    editor.addJointsUsingMathAndShit()
    for (let i = 0; i < jointData.length; i++) {
      let jointDef = new b2RevoluteJointDef()
      jointDef.bodyA = editor.bodies[jointData[i][0]]
      jointDef.bodyB = editor.bodies[jointData[i][1]]

      let bodyAnchorPos = createVector(jointData[i][2], jointData[i][3])

      let bodyAoffset = createVector(bodyAnchorPos.x / SCALE - editor.bodies[jointData[i][0]].GetPosition().x, bodyAnchorPos.y / SCALE - editor.bodies[jointData[i][0]].GetPosition().y)
      let bodyBoffset = createVector(bodyAnchorPos.x / SCALE - editor.bodies[jointData[i][1]].GetPosition().x, bodyAnchorPos.y / SCALE - editor.bodies[jointData[i][1]].GetPosition().y)

      jointDef.localAnchorA.Set(bodyAoffset.x, bodyAoffset.y)
      jointDef.localAnchorB.Set(bodyBoffset.x, bodyBoffset.y)
      jointDef.collideConnected = false
      editor.joints.push(editor.world.CreateJoint(jointDef))
    }
  }

  exitSim() {
    editor.inSim = false
    editor.makeButtons()
    editor.world = 0
    editor.world = new b2World(new b2Vec2(0, 50))
    editor.bodies = []
    editor.bodyScales = []
    editor.bodies.push(makeBox(editor.world, b2Body.b2_staticBody, 0, height, width, 20, 1, 0.3, 0.1, 1))
    editor.bodyScales.push([width, 20])
    editor.drawMode = true
    editor.RectDrawing = true
    editor.jointDraw = false
  }

  ridWorldOfShit() {
    bodyData = []
    jointData = []
    editor.world = 0
    editor.world = new b2World(new b2Vec2(0, 50))
    editor.bodies = []
    editor.bodyScales = []
    editor.bodies.push(makeBox(editor.world, b2Body.b2_staticBody, 0, height, width, 20, 1, 0.3, 0.1, 1))
    editor.bodyScales.push([width, 20])
    editor.drawMode = true
  }

  ridLastPieceOfShit() {
    if (editor.bodyScales.length < 1) {
      return
    }
    editor.bodies = editor.bodies.slice(0, -1)
    editor.bodyScales = editor.bodyScales.slice(0, -1)
    editor.id--
    bodyData = bodyData.slice(0, -1)
  }

  toggleMode() {
    editor.ToggleDrawModeButton.remove()
    if (editor.RectDrawing) {
      editor.ToggleDrawModeButton = editor.makeButton("Switch to Joint Mode", [0, 127, 255], 210, 10, 100, 50, 14)
    } else {
      editor.ToggleDrawModeButton = editor.makeButton("Switch to Rect Mode", [0, 127, 255], 210, 10, 100, 50, 14)
    }
    editor.ToggleDrawModeButton.mousePressed(editor.toggleMode)
    editor.RectDrawing = !(editor.RectDrawing)
    editor.jointDraw = !(editor.jointDraw)
  }

  update() {
    // Rect
    if (!this.drawMode) {
      this.world.Step(1 / 60, 10, 10)
    }
  }

  makeButton(text, bgcolor, x, y, w, h, size) {
    let button = createButton(text)
    button.style("background-color", color(bgcolor[0], bgcolor[1], bgcolor[2]))
    button.position(x, y)
    button.size(w, h)
    button.style("font-size", size)
    button.mouseOver(function() {
      button.style("background-color", color(bgcolor[0], bgcolor[1], bgcolor[2], 100))
    })
    button.mouseOut(function() {
      button.style("background-color", color(bgcolor[0], bgcolor[1], bgcolor[2], 255))
    })
    return button
  }

  addJointsUsingMathAndShit() {
    let temps = 0
    for (let i = 0; i < this.jointBody.length; i += 2) {
      var toPush = [this.jointBody[i], this.jointBody[i + 1], this.jointAnchorLocation[temps][0], this.jointAnchorLocation[temps][1]]
      jointData.push(toPush)
      temps++
    }
  }
}

function mouseClicked() {
  if (mouseY < 70 || editor == null || editor.inSim) {
    return
  }
  if (editor.RectDraw) {
    bodyData.push([editor.RectDrawX, editor.RectDrawY, mouseX - editor.RectDrawX, mouseY - editor.RectDrawY, editor.id])
    editor.RectDraw = false
    editor.id++
    console.log(bodyData)
  }
  // Joint
  if (editor.jointDraw) {
    let closest = 0
    let closestDist = 1000000000000
    for (let i = 0; i < bodyData.length; i++) {
      let d = dist(bodyData[i][0] + bodyData[i][2] / 2, bodyData[i][1] + bodyData[i][3] / 2, mouseX, mouseY)
      if (d < closestDist) {
        closestDist = d
        closest = i
      }
    }
    push()
    fill(255, 255, 255)
    rectMode(CENTER)
    rect(bodyData[closest][0] + bodyData[closest][2] / 2, bodyData[closest][1] + bodyData[closest][3] / 2, 20, 20)
    pop()
    if (editor.jointBody.length % 2 != 0 || editor.jointBody.length == 0 || editor.jointBody.length / editor.jointAnchorLocation.length == 2) {
      let id = bodyData[closest][4]
      editor.jointBody.push(id)
      console.log(editor.jointBody)
    } else {
      editor.jointAnchorLocation.push([mouseX, mouseY])
    }
  }
}

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
  if (mouseY < 70 || editor == null) {
    return
  }
  if (editor.RectDrawing) {
    if (keyCode === 82) { // R
      editor.RectDraw = true
      editor.RectDrawX = mouseX
      editor.RectDrawY = mouseY
    }
  }
  if (keyCode === 90) { // Z
    editor.ridLastPieceOfShit()
  }
  if (keyCode === 84) { // T
    editor.toggleMode()
  }
}
