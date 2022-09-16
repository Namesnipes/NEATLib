var POPULATION = 150;
var GEN_TIME = 1; // in miliseconds
var DRAW_NETS = false



console.log("----------------------------------")
var repCanvas =[]


for(var i = 0; i < 10; i++){
  var dupe = document.getElementById("canvas").cloneNode()
  dupe.style = 'border: solid 5px'
  document.body.appendChild(dupe)
  repCanvas.push(dupe)
}

var canvases = [document.getElementById("canvas")]

for(var i = 1; i < POPULATION; i++){
  var dupe = document.getElementById("canvas").cloneNode()
  document.body.appendChild(dupe)
  canvases.push(dupe)
}

document.getElementById("canvas").remove()
var generationTitle = document.getElementById("gen")

var myPop1;
const timer = ms => new Promise(res => setTimeout(res, ms))


async function newPop(){
  myPop1 = new Population(POPULATION)

  async function go(){
    generationTitle.textContent = myPop1.generation
    myPop1.updateAll()
    if(DRAW_NETS){
      var best = myPop1.agents.sort(function(a, b) {
        return b["unAdjustedFitness"] - a["unAdjustedFitness"];
      })

      var ctx = canvases[0].getContext("2d")
      best[0].brain.drawMe(ctx)

      for(var i = 0; i < POPULATION; i++){
        var ctx = canvases[i].getContext("2d")
        myPop1.agents[i].brain.drawMe(ctx)
      }

      for(var i = 0; i < myPop1.species.length; i++){
        if(i > 9) break
        var ctx = repCanvas[i].getContext("2d")
        myPop1.species[i].representativeBrain.drawMe(ctx)
      }
      console.log(myPop1.species)

    }

    myPop1.nextGeneration()
    await timer(GEN_TIME)
  }

  async function loop(){
    for(var i = 0; i < 1000; i++){
      await go()
    }
  }

  loop()
}

newPop()


function doc_keyUp(e) {

    // this would test for whichever key is 40 (down arrow) and the ctrl key at the same time
    if (e.key === 'q') {
        // call your function to do the thing
        DRAW_NETS = !DRAW_NETS
        console.log(DRAW_NETS)
    }
}
// register the handler
document.addEventListener('keyup', doc_keyUp, false);
