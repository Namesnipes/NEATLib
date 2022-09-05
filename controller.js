var POPULATION = 150;
var GEN_TIME = 1; // in miliseconds
var DRAW_NETS = false



console.log("----------------------------------")
var canvases = [document.getElementById("canvas")]
for(var i = 1; i < POPULATION; i++){
  var dupe = document.getElementById("canvas").cloneNode()
  document.body.appendChild(dupe)
  canvases.push(dupe)
}
var generationTitle = document.getElementById("gen")

var myPop1;
const timer = ms => new Promise(res => setTimeout(res, ms))


async function newPop(){
  myPop1 = new Population(POPULATION)

  async function go(){
    generationTitle.textContent = myPop1.generation
    myPop1.updateAll()
    if(DRAW_NETS){
      for(var i = 0; i < POPULATION; i++){
        var ctx = canvases[i].getContext("2d")
        myPop1.agents[i].brain.drawMe(ctx)
      }
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
