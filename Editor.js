class Editor{
  constructor(){
    this.RectDraw = false
    this.RectDrawX
    this.RectDrawY
    this.RectDrawing = false
    this.rectDrawn = false
    this.id = 0
    this.world = new b2World(new b2Vec2(0, 50))
    this.bodies = []
    this.bodyScales = []
    this.TestButton = this.makeButton("Test Creature", [255, 255, 0], 10, 100, 100, 50, 19)
    this.TestButton.mousePressed(this.addShitToWorld)
    this.drawMode = true

  }


  show(){
    if (this.RectDraw){


      push()
      fill(255, 255, 255, 50)
      rect(this.RectDrawX, this.RectDrawY, mouseX-this.RectDrawX, mouseY-this.RectDrawY)
      pop()



    }
    else{
      this.RectDrawX = null
      this.RectDrawY = null


    }
    if (this.drawMode){
      for (var i=0;i<bodyData.length;i++){
        push()
        fill(255, 255, 255, 50)
        rect(bodyData[i][0], bodyData[i][1], bodyData[i][2], bodyData[i][3])
        pop()
      }
    }
    else{
      for (var i=0;i<this.bodies.length;i++){
        var pos = this.bodies[i].GetPosition()
        var angle = this.bodies[i].GetAngle()

        rotate(angle)
        rectMode(CENTER)
        rect(pos.x*SCALE, pos.y*SCALE, this.bodyScales[i][0], this.bodyScales[i][1])
      }
    }
  }


  addShitToWorld(){
    for (var i=0;i<bodyData.length;i++){
      editor.bodies.push(makeBox(editor.world, b2Body.b2_dynamicBody, bodyData[i][0], bodyData[i][1], bodyData[i][2], bodyData[i][3], 1, 0.3, 0.1, 1))
      editor.bodyScales.push([bodyData[i][2], bodyData[i][3]])
    }
    editor.drawMode = false
  }


  setRectMode(){
    editor.RectDraw = true

  }

  update(){
    //-----------RECT




    //-------------------

  }


  makeButton(text, bgcolor, x, y, w, h, size){
    var button
    button = createButton(text)
    button.style("background-color", color(bgcolor[0], bgcolor[1], bgcolor[2]))
    button.position(x, y)
    button.size(w, h)
    button.style("font-size", size)
    button.mouseOver(function(){button.style("background-color", color(bgcolor[0], bgcolor[1], bgcolor[2], 100))})
    button.mouseOut(function(){button.style("background-color", color(bgcolor[0], bgcolor[1], bgcolor[2], 255))})

    return button

  }



}


function mouseClicked(){
  if (editor.RectDraw){

    bodyData.push([editor.RectDrawX, editor.RectDrawY, mouseX-editor.RectDrawX, mouseY-editor.RectDrawY, editor.id])
    editor.RectDraw = false
    editor.id++
    console.log(bodyData)

  }
}

function keyPressed(){
  if (keyCode === 82){
    editor.RectDraw = true
    editor.RectDrawX = mouseX
    editor.RectDrawY = mouseY

  }
}
