class Editor {
  constructor() {
    this.RectDraw = false
    this.RectDrawX
    this.RectDrawY
    this.RectDrawing = false
    this.rectDrawn = false
    this.id = 0
    this.world = new b2World(new b2Vec2(0, 50))
    this.bodies = []
    this.bodyScales = []
    this.TestButton = this.makeButton("Test Creature", [0, 255, 0], 10, 10, 100, 50, 19)
    this.TestButton.mousePressed(this.addShitToWorld)
    this.UndoButton = this.makeButton("Undo", [255, 255, 0], 110, 10, 100, 50, 19)
    this.UndoButton.mousePressed(this.ridLastPieceOfShit)
    this.ClearButton = this.makeButton("Clear World", [255, 0, 0], 210, 10, 100, 50, 19)
    this.ClearButton.mousePressed(this.ridWorldOfShit)
    this.drawMode = true
    //----Ground
    this.bodies.push(makeBox(this.world, b2Body.b2_staticBody, 0, height, width, 20, 1, 0.3, 0.1, 1))
    this.bodyScales.push([width, 20])
  }

  show() {
    if (this.RectDraw) {
      push()
      fill(255, 255, 255, 50)
      //rectMode(CENTER)
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
        //rectMode(CENTER)
        rect(bodyData[i][0], bodyData[i][1], bodyData[i][2], bodyData[i][3])
        pop()
      }
    } else {
      for (let i = 0; i < this.bodies.length; i++) {
        let pos = this.bodies[i].GetPosition()
        let angle = this.bodies[i].GetAngle()
        push()
        fill(255, 255, 255, 100)
        translate(pos.x*SCALE, pos.y*SCALE)
        rectMode(CENTER)
        rotate(angle)

        rect(0, 0, this.bodyScales[i][0]*2, this.bodyScales[i][1]*2)
        pop()
      }
    }
  }

  addShitToWorld() {
    for (let i = 0; i < bodyData.length; i++) {
      editor.bodies.push(makeBox(editor.world, b2Body.b2_dynamicBody, bodyData[i][0]+bodyData[i][2]/2, bodyData[i][1]+bodyData[i][3]/2, bodyData[i][2]/2, bodyData[i][3]/2, 1, 0.3, 0.1, 1))
      editor.bodyScales.push([bodyData[i][2]/2, bodyData[i][3]/2])
    }
    editor.drawMode = false
  }

  ridWorldOfShit() {
    editor.bodies = []
    editor.bodyScales = []
    bodyData = []
    editor.world = 0
    editor.world = new b2World(new b2Vec2(0, 50))
    this.bodies.push(makeBox(this.world, b2Body.b2_staticBody, 0, height, width, 20, 1, 0.3, 0.1, 1))
    this.bodyScales.push([width, 20])
    editor.drawMode = true
  }

  ridLastPieceOfShit() {
    if (editor.bodyScales.length < 1) {
      return
    }
    let backupBodies = editor.bodies.slice(0, -1)
    let backupBodyScales = editor.bodyScales.slice(0, -1)
    let backupBodyData = bodyData.slice(0, -1)
    editor.ridWorldOfShit()
    editor.bodies = backupBodies
    editor.bodyScales = backupBodyScales
    bodyData = backupBodyData
    // editor.bodies = editor.bodies.slice(0, -1)
    // editor.bodyScales = editor.bodyScales.slice(0, -1)
    // bodyData = bodyData.slice(0, -1)
  }

  setRectMode() {
    editor.RectDraw = true
  }

  update() {
    //-----------RECT
    if (!this.drawMode) {
      this.world.Step(1/60, 10, 10)
    }
    //-------------------
  }

  makeButton(text, bgcolor, x, y, w, h, size) {
    let button
    button = createButton(text)
    button.style("background-color", color(bgcolor[0], bgcolor[1], bgcolor[2]))
    button.position(x, y)
    button.size(w, h)
    button.style("font-size", size)
    button.mouseOver(function() {button.style("background-color", color(bgcolor[0], bgcolor[1], bgcolor[2], 100))})
    button.mouseOut(function() {button.style("background-color", color(bgcolor[0], bgcolor[1], bgcolor[2], 255))})
    return button
  }
}

function mouseClicked() {
  if (editor.RectDraw) {
    bodyData.push([editor.RectDrawX, editor.RectDrawY, mouseX-editor.RectDrawX, mouseY-editor.RectDrawY, editor.id])
    editor.RectDraw = false
    editor.id++
    console.log(bodyData)
  }
}

function keyPressed() {
  if (keyCode === 82) {
    editor.RectDraw = true
    editor.RectDrawX = mouseX
    editor.RectDrawY = mouseY
  }
}
