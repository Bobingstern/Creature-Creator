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
    this.buttons = []
    // Buttons
    this.makeButtons()
    this.evolveFunction = evolveFunc
    // Ground
    this.ground = makeBox(this.world, b2Body.b2_staticBody, 0, height, width, 20, 1, 0.3, 0.1, 1)
    this.groundWidth = width
    this.groundHeight = 20



    this.jointLimitMode = false
    this.curRightAngle = 45
    this.curLeftAngle = -45
    this.mouseJoint = 0
    this.MouseJoint = 0
    this.fakeBodyData = []
    this.rectDrawFlag = false
    this.rectDeleteMode = false
    this.deathMode = false
    this.DeadShots = []
    this.downScalar = 2
    this.jointShowId = -1


    ///----------------------TODO: ADD DEATH MODE BUTTON


  }

  makeButtons() {
    this.TestButton = this.makeButton("Test Creature", [0, 255, 0], 10, 10, 100, 50, 19)
    this.TestButton.mousePressed(this.addShitToWorld)
    this.EvolveButton = this.makeButton("Evolve", [255, 127, 0], 10, 60, 100, 50, 19)
    this.EvolveButton.mousePressed(this.evolve)
    this.ToggleDrawModeButton = this.makeButton("Switch to Joint mode", [0, 127, 255], 10, 110, 100, 50, 14)
    this.ToggleDrawModeButton.mousePressed(this.toggleMode)
    this.UndoButton = this.makeButton("Undo (Glitchy)", [255, 255, 0], 10, 160, 100, 50, 18)
    this.UndoButton.mousePressed(this.ridLastPieceOfShit)
    this.ClearButton = this.makeButton("Clear World", [255, 0, 0], 10, 210, 100, 50, 19)
    this.ClearButton.mousePressed(this.ridWorldOfShit)
    this.DeletButton = this.makeButton("Delete Mode", [255, 0, 255], 10, 260, 100, 50, 19)
    this.DeletButton.mousePressed(this.rectDelMode)
    this.FloorButton = this.makeButton("Death on Floor Mode", [255, 255, 255], 10, 310, 100, 50, 15)
    this.FloorButton.mousePressed(this.deathFloorButton)

  }

  evolve() {
    editor.buttons = []
    editor.FloorButton.remove()
    editor.DeletButton.remove()
    editor.TestButton.remove()
    editor.UndoButton.remove()
    editor.ClearButton.remove()
    editor.ToggleDrawModeButton.remove()
    editor.EvolveButton.remove()
    editor.addJointsUsingMathAndShit()
    editor.deathMode = false


    editor.RectDrawing = false
    editor.jointDraw = false
    editor.evolving = true
    //editor.addShitToWorld()
    //editor.exitSim()
    editor.evolveFunction()



  }



  deathFloorButton(){
    editor.deathMode = !(editor.deathMode)
    editor.rectDeleteMode = false
    editor.jointDraw = false
  }



  show() {
    // Rect stuff

    // for (var i=0;i<this.buttons.length;i++){
    //   push()
    //   rectMode(CORNER)
    //   fill(255, 255, 255)
    //   rect(this.buttons[i][0]-10, this.buttons[i][1]-10, this.buttons[i][2], this.buttons[i][3])
    //   pop()
    // }


    if (this.RectDrawing && !this.rectDeleteMode && !this.deathMode){
      textSize(20)
      fill(255, 0, 0)
      text("Click to make a starting point for your rectangle and move your mouse\nClick to confirm the placement", 150, 30)
    }

    if (this.rectDeleteMode && !this.deathMode){
      textSize(20)
      fill(255, 0, 0)
      text("Delete Mode, Figure it out", 150, 30)
    }

    if (this.deathMode){
      text("Choose a body that will kill the creature when it touches the ground", 150, 30)
    }


    if (this.RectDraw && !this.rectDeleteMode) {



        if (editor.RectDraw && editor.rectDrawFlag && !editor.rectDeleteMode && !editor.deathMode) {
          if (mouseX - editor.RectDrawX > 1 && mouseY - editor.RectDrawY > 1){
            push()
            fill(255, 255, 255, 50)
            rectMode(CORNER)
            rect(this.RectDrawX, this.RectDrawY, (mouseX - this.RectDrawX), (mouseY - this.RectDrawY))
            pop()
          }
          else{
            var originX = editor.RectDrawX
            var originY = editor.RectDrawY
            var toDrawPointX = (mouseX - editor.RectDrawX)
            var toDrawPointX = (mouseY - editor.RectDrawY)


            originX = mouseX
            originY = mouseY

            var x = originX
            var y = originY
            var w = editor.RectDrawX-originX
            var h = editor.RectDrawY-originY

            push()
            fill(255, 255, 255, 50)
            rectMode(CORNER)
            rect(x, y, w, h)
            pop()

          }
        }



    } else {
      this.RectDrawX = null
      this.RectDrawY = null
    }
    if (this.drawMode) {

      for (let i = 0; i < bodyData.length; i++) {
        push()
        fill(255, 255, 255, 255)
        rectMode(CORNER)

        rect(bodyData[i][0], bodyData[i][1], bodyData[i][2], bodyData[i][3])
        pop()
      }
    } else {
      for (let i = 0; i < this.bodies.length; i++) {
        let pos = this.bodies[i].GetPosition()
        let angle = this.bodies[i].GetAngle()
        push()
        fill(255, 255, 255, 255)
        translate(pos.x * SCALE, pos.y * SCALE)
        rectMode(CENTER)
        rotate(angle)
        rect(0, 0, this.bodyScales[i][0] * 2, this.bodyScales[i][1] * 2)
        pop()
      }
    }



    if (this.rectDeleteMode || this.deathMode){
      let closest = 0
      let closestDist = 1000000000000
      var ind = null
      for (var i=0;i<bodyData.length;i++){
        var scales = createVector(bodyData[i][2], bodyData[i][3])
        var pos = createVector(bodyData[i][0], bodyData[i][1])

        if (mouseX > pos.x && mouseX < pos.x + scales.x && mouseY > pos.y && mouseY < pos.y + scales.y){
          closest = i
        }

      }

      if (bodyData.length > 0) {
        push()
        fill(255, 255, 0, 50)
        rectMode(CORNER)
        rect(bodyData[closest][0], bodyData[closest][1], bodyData[closest][2], bodyData[closest][3])
        pop()

      }
    }









    // Joint stuff-------------------



    if (this.jointShowId != -1 && !this.inSim){
      console.log(this.jointShowId)
      push()
      fill(255, 255, 0, 100)
      rect(bodyData[this.jointShowId][0], bodyData[this.jointShowId][1], bodyData[this.jointShowId][2], bodyData[this.jointShowId][3])
      pop()
    }



    if (editor.jointBody.length % 2 != 0 || editor.jointBody.length == 0 || editor.jointBody.length / editor.jointAnchorLocation.length == 2) {

    } else {
      push()
      fill(255, 255, 0, 100)
      ellipse(mouseX, mouseY, 10, 10)
      pop()
    }
    if (this.jointDraw && !(this.inSim)) {







      // if (editor.jointBody.length / editor.jointAnchorLocation.length == 2){
      //   push()
      //   fill(255, 255, 0, 80)
      //   rect(bodyData[editor.jointBody[editor.jointBody.length-1]][0], bodyData[editor.jointBody[editor.jointBody.length-1]][1], bodyData[editor.jointBody[editor.jointBody.length-1]][2], bodyData[editor.jointBody[editor.jointBody.length-1]][3])
      //
      //   pop()
      // }
      let closest = 0
      let closestDist = 1000000000000
      var ind = null
      for (var i=0;i<bodyData.length;i++){
        var scales = createVector(bodyData[i][2], bodyData[i][3])
        var pos = createVector(bodyData[i][0], bodyData[i][1])

        if (mouseX > pos.x && mouseX < pos.x + scales.x && mouseY > pos.y && mouseY < pos.y + scales.y){
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

    if (this.jointLimitMode){
      if (keyIsDown(39)){
        editor.curRightAngle++

      }
      if (keyIsDown(37)){
        editor.curRightAngle--
      }

      if (keyIsDown(68)){
        editor.curLeftAngle++

      }
      if (keyIsDown(65)){
        editor.curLeftAngle--
      }

      // if (this.curLeftAngle > 359){
      //   this.curLeftAngle = 0
      // }
      // if (this.curLeftAngle < 0){
      //   this.curLeftAngle = 359
      // }
      //
      // if (this.curRightAngle > 359){
      //   this.curRightAngle = 0
      // }
      // if (this.curRightAngle < 0){
      //   this.curRightAngle = 359
      // }


      var pos = createVector(this.jointAnchorLocation[this.jointAnchorLocation.length-1][0], this.jointAnchorLocation[this.jointAnchorLocation.length-1][1])

      var rotated = this.rotat(pos.x, pos.y, radians(this.curLeftAngle), new p5.Vector(pos.x+100, pos.y))
      line(pos.x, pos.y, rotated.x, rotated.y)

      var rotated2 = this.rotat(pos.x, pos.y, radians(this.curRightAngle), new p5.Vector(pos.x+100, pos.y))
      line(pos.x, pos.y, rotated2.x, rotated2.y)



      push()
      fill(255, 255, 255, 100)
      arc(pos.x, pos.y, 100, 100, radians(this.curLeftAngle), radians(this.curRightAngle))
      pop()

      textSize(20)
      text("Lower: "+this.curLeftAngle+" Upper: "+this.curRightAngle, 120, 50)
      text("The Angle Limit thing is kinda confusing so i recommend testing the default angle to see how it works. \nPress Enter to confirm and C to disregard this joint from the AI (It will still be connected)", 120, 80)
    }


  }

  rotat(cx, cy, angle, pos){
    let p = pos.copy()
    var s = sin(angle);
    var c = cos(angle);

    // translate point back to origin:

    p.x -= cx;
    p.y -= cy;

    // rotate point
    var xnew = p.x * c - p.y * s;
    var ynew = p.x * s + p.y * c;

    // translate point back:
    p.x = xnew + cx;
    p.y = ynew + cy;
    return p;
  }

  addShitToWorld() {
    var lowestY = 0
    editor.rectDeleteMode = false
    arrayCopy(bodyData, bodyCopy)


    //--------------------------------TODO: FIX THE OFFSET BUG THING

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
    editor.DeletButton.remove()

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
      if (jointLimits[i][0] != 1000 && jointLimits[i][1] != 1000){
        jointDef.enableLimit = true
        jointDef.lowerAngle = radians(jointLimits[i][0])
        jointDef.upperAngle = radians(jointLimits[i][1])
      }
      else{
        jointDef.enableLimit = true
        jointDef.lowerAngle = radians(-1)
        jointDef.upperAngle = radians(1)
      }

      let bodyAnchorPos = createVector(jointData[i][2], jointData[i][3])

      let bodyAoffset = createVector(bodyAnchorPos.x / SCALE - editor.bodies[jointData[i][0]].GetPosition().x, bodyAnchorPos.y / SCALE - editor.bodies[jointData[i][0]].GetPosition().y)
      let bodyBoffset = createVector(bodyAnchorPos.x / SCALE - editor.bodies[jointData[i][1]].GetPosition().x, bodyAnchorPos.y / SCALE - editor.bodies[jointData[i][1]].GetPosition().y)

      jointDef.localAnchorA.Set(bodyAoffset.x, bodyAoffset.y)
      jointDef.localAnchorB.Set(bodyBoffset.x, bodyBoffset.y)
      jointDef.collideConnected = false
      editor.joints.push(editor.world.CreateJoint(jointDef))
    }
    bodyData = []
    arrayCopy(bodyCopy, bodyData)
  }


  exitSim() {

    editor.inSim = false
    editor.makeButtons()
    //editor.world = 0
    editor.world = new b2World(new b2Vec2(0, 50))
    editor.bodies = []
    editor.bodyScales = []
    //editor.id = 0
    editor.joints = []

    editor.ground = makeBox(editor.world, b2Body.b2_staticBody, 0, height, width, 20, 1, 0.3, 0.1, 1)
    editor.groundWidth = width
    editor.groundHeight = 20
    jointData = []

    editor.drawMode = true
    editor.jointDraw = false
    editor.jointLimitMode = false
    editor.RectDraw = false
    editor.RectDrawX = null
    editor.RectDrawY = null
    editor.RectDrawing = true
    editor.rectDrawn = false


  }

  ridWorldOfShit() {
    bodyData = []
    jointData = []
    editor.world = 0
    editor.world = new b2World(new b2Vec2(0, 50))
    editor.bodies = []
    editor.bodyScales = []
    editor.ground = makeBox(editor.world, b2Body.b2_staticBody, 0, height, width, 20, 1, 0.3, 0.1, 1)
    editor.groundWidth = width
    editor.groundHeight = 20
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
      editor.ToggleDrawModeButton = editor.makeButton("Switch to Joint Mode", [0, 127, 255], 10, 110, 100, 50, 14)
    } else {
      editor.ToggleDrawModeButton = editor.makeButton("Switch to Rect Mode", [0, 127, 255], 10, 110, 100, 50, 14)
    }
    editor.ToggleDrawModeButton.mousePressed(editor.toggleMode)
    editor.RectDrawing = !(editor.RectDrawing)
    editor.jointDraw = !(editor.jointDraw)
  }

  update() {
    // Rect
    if (!this.drawMode) {
      this.world.Step(1 / 60, 10, 10)


      if (mouseIsPressed){
        if (editor.inSim){

          var ind = null
          for (var i=0;i<editor.bodies.length;i++){
            var scales = createVector(editor.bodyScales[i][0], editor.bodyScales[i][1])
            var pos = createVector(editor.bodies[i].GetPosition().x*SCALE - scales.x, editor.bodies[i].GetPosition().y*SCALE - scales.y)

            if (mouseX > pos.x && mouseX < pos.x + scales.x*2 && mouseY > pos.y && mouseY < pos.y + scales.y*2){
              ind = i
            }

          }


          if (ind != null){
            editor.bodies[ind].SetPosition(new b2Vec2(mouseX/SCALE, mouseY/SCALE), editor.bodies[ind].GetAngle())
            editor.bodies[ind].SetLinearVelocity(new b2Vec2(0, 0))
          }

        }
      }
    }
  }

  makeButton(text, bgcolor, x, y, w, h, size) {
    this.buttons.push([x, y, w, h])

    let button = createButton(text)
    button.style("background-color", color(bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3]))
    button.position(x, y)
    button.size(w, h)
    button.style("font-size", size)
    button.mouseOver(function() {
      button.style("background-color", color(bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3], 100))
    })
    button.mouseOut(function() {
      button.style("background-color", color(bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3], 255))
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

  rectDelMode(){
    editor.rectDeleteMode = !(editor.rectDeleteMode)
    if (editor.rectDeleteMode){
      editor.DeletButton.remove()
      editor.DeletButton = editor.makeButton("Back", [255, 0, 255], 10, 260, 100, 50, 19)
      editor.DeletButton.mousePressed(editor.rectDelMode)
    }
    else{
      editor.DeletButton.remove()
      editor.DeletButton = editor.makeButton("Delete Mode", [255, 0, 255], 10, 260, 100, 50, 19)
      editor.DeletButton.mousePressed(editor.rectDelMode)
    }
  }
}

function mouseClicked() {
  if (mouseX < 100 || editor == null || editor.inSim) {
    return
  }
  var cheesecakes = false
  if (editor.RectDraw && editor.rectDrawFlag && !editor.rectDeleteMode && !editor.deathMode) {
    if (mouseX - editor.RectDrawX > 1 && mouseY - editor.RectDrawY > 1){
      bodyData.push([editor.RectDrawX, editor.RectDrawY, mouseX - editor.RectDrawX, mouseY - editor.RectDrawY, editor.id])
      editor.RectDraw = false
      editor.rectDrawFlag = false
      cheesecakes = true
      editor.id++
    }
    else{
      var originX = editor.RectDrawX
      var originY = editor.RectDrawY
      var toDrawPointX = (mouseX - editor.RectDrawX)
      var toDrawPointX = (mouseY - editor.RectDrawY)


      originX = mouseX
      originY = mouseY

      var x = originX
      var y = originY
      var w = editor.RectDrawX-originX
      var h = editor.RectDrawY-originY


      bodyData.push([x, y, w, h, editor.id])
      editor.RectDraw = false
      editor.rectDrawFlag = false
      cheesecakes = true
      editor.id++
    }
  }

  if (editor.RectDrawing && !editor.rectDrawFlag && !cheesecakes && !editor.rectDeleteMode && !editor.deathMode){
    editor.rectDrawFlag = true
    editor.RectDraw = true
    editor.RectDrawX = mouseX
    editor.RectDrawY = mouseY
  }

  if (editor.rectDeleteMode){
    let closest = 0
    let closestDist = 1000000000000
    var ind = null
    for (var i=0;i<bodyData.length;i++){
      var scales = createVector(bodyData[i][2], bodyData[i][3])
      var pos = createVector(bodyData[i][0], bodyData[i][1])

      if (mouseX > pos.x && mouseX < pos.x + scales.x && mouseY > pos.y && mouseY < pos.y + scales.y){
        closest = i
      }

    }


    var copyOfJoint =  []
    //console.log(bodyData)
    bodyData.splice(closest, 1)
    for (var i=0;i<editor.jointBody.length;i+=2){
      copyOfJoint.push([i, i+1])
    }

    for (var i=copyOfJoint.length-1;i>=0;i--){
      if (copyOfJoint[i][0] == closest || copyOfJoint[i][1] == closest){
        copyOfJoint.splice(i, 1)
        editor.jointAnchorLocation.splice(i, 1)
      }
    }

    editor.jointBody = []
    for (var i=0;i<copyOfJoint.length;i++){
      editor.jointBody.push(copyOfJoint[i][0])
      editor.jointBody.push(copyOfJoint[i][1])
    }




    editor.id = 0

    for (var i=0;i<bodyData.length;i++){
      bodyData[i][4] = editor.id

      editor.id++
    }
  }


  if (editor.deathMode){
    let closest = 0
    let closestDist = 1000000000000
    var ind = null
    for (var i=0;i<bodyData.length;i++){
      var scales = createVector(bodyData[i][2], bodyData[i][3])
      var pos = createVector(bodyData[i][0], bodyData[i][1])

      if (mouseX > pos.x && mouseX < pos.x + scales.x && mouseY > pos.y && mouseY < pos.y + scales.y){
        closest = i
      }

    }

    DeadShots.push(closest)
    console.log(DeadShots)


  }
  



  // Joint
  if (!editor.jointLimitMode && !editor.rectDeleteMode && !editor.deathMode){
    if (editor.jointDraw) {
      let closest = 0
      let closestDist = 1000000000000
      var ind = null
      for (var i=0;i<bodyData.length;i++){
        var scales = createVector(bodyData[i][2], bodyData[i][3])
        var pos = createVector(bodyData[i][0], bodyData[i][1])

        if (mouseX > pos.x && mouseX < pos.x + scales.x && mouseY > pos.y && mouseY < pos.y + scales.y){
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
        if (editor.jointBody[editor.jointBody.length-1] != id){
          editor.jointBody.push(id)
          editor.jointShowId = id
        }

      } else {
        editor.jointAnchorLocation.push([mouseX, mouseY])
        editor.jointLimitMode = true
        editor.jointShowId = -1


      }
    }
  }






}

function keyPressed() {
  switch (key) {
    case ' ':
      //toggle showBest
      actualBest = !actualBest;
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

  if (keyCode === 90) { // Z
    editor.ridLastPieceOfShit()
  }
  if (keyCode === 84) { // T
    editor.toggleMode()
  }

  if (keyCode === 81){
    editor.rectDelMode()
  }
  if (keyCode === 69){
    editor.deathMode = true
  }

  if (editor.jointLimitMode){
    if (keyCode == 13){
      jointLimits.push([editor.curLeftAngle, editor.curRightAngle])
      editor.jointLimitMode = false

    }

    if (keyCode == 67){
      jointLimits.push([editor.curLeftAngle, editor.curRightAngle])
      editor.jointLimitMode = false
      nonJoints.push(jointLimits.length-1)

    }

  }
}

function mousePressed(){

}
