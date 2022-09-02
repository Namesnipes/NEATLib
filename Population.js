//A collection of agents
class Population {
  static genSolvedSum = 0
  static numPops = 0
  static nodesInSolutionSum = 0;
  constructor(size) {
    Population.numPops++

    this.innovationHistory = []
    this.agents = []
    this.species = []
    this.generation = 0;
    this.nextSpecieId = 0
    this.popSize = size


    for (var i = 0; i < size; i++) {
      var a = new Agent(this,false)
      this.agents.push(a)
      a.brain.mutate()
    }

    this.species.push(new Species(this.agents[0],this.nextSpecieId))
    this.nextSpecieId++
  }

  updateAll(){
    for (var i = 0; i < this.agents.length; i++) {
      var agent = this.agents[i]
      agent.setBrainInputs()
      agent.getBrainOutputs()
    }
  }

  nextGeneration() {
    for (var i = 0; i < this.agents.length; i++) {
      if(this.agents[i].unAdjustedFitness > 15) {
        Population.genSolvedSum += this.generation
        Population.nodesInSolutionSum += this.agents[i].brain.neurons.length-3
        console.log("Avg gens:", Population.genSolvedSum/Population.numPops, "for", Population.numPops, "populations")
        console.log("Avg nodes:", Population.nodesInSolutionSum/Population.numPops, "for", Population.numPops, "populations")
        console.log("----------")
        for(var j = 0; j < POPULATION; j++){
          //var ctx = canvases[j].getContext("2d")
          //this.agents[i].brain.drawMe(ctx)
        }
        //debugger
        newPop()
        return
      }
    }

    this.calculateFitnesses()
    this.speciate()
    this.sortSpecies()
    this.cullSpecies()
    this.killStaleSpecies()
    this.killInfertileSpecies()
    //get sum of species average fitnesses
    var averageSum = 0
    for (var i = 0; i < this.species.length; i++) {
      averageSum += this.species[i].averageFitness
    }

    //get children
    var children = []
    for (var i = 0; i < this.species.length; i++) {
      var specie = this.species[i]
      children.push(specie.players[0]) //add best player without mutation
      var numChildren = Math.floor((specie.averageFitness/averageSum) * this.agents.length ) -1;
      for (var j = 0; j < numChildren; j++) {
        children.push(specie.SEXSEXSEXSEXSEX())
      }
    }

    //get best species
    var bestSpecie = this.species[0]

    //get children from best species until population cap is hit
    while(children.length < this.popSize){
      children.push(bestSpecie.SEXSEXSEXSEXSEX())
    }

    this.agents = children

    this.generation++
  }

  mutate() {
    for (var i = 0; i < this.popSize; i++) {
      this.agents[i].brain.mutate()
    }
  }

  getAgentsHighFit(){
    var c = 0
    for (var i = 0; i < this.agents.length; i++) {
      if(this.agents[i].unAdjustedFitness >= 50) c++
    }
    return c
  }

  speciate() {
    for (var i = 0; i < this.species.length; i++) {
      this.species[i].clearPlayers()
    }

    var speciesInOrder = this.species.sort(function(a, b) {
      return b["id"] - a["id"];
    })

    /*
    var notAddedToSpecies = []
    for (var i = 0; i < this.agents.length; i++) {
      notAddedToSpecies.push(agents[i])
    }
    */


    for (var i = 0; i < this.agents.length; i++) {
      var agent = this.agents[i]
      var addedToSpecies = false
      var loops = this.species.length
      for (var j = 0; j < loops; j++) {
        var specie = speciesInOrder[j]
        if (specie.sameSpecies(agent.brain)) {
          specie.addPlayer(agent)
          agent.setSpecies(specie)
          addedToSpecies = true
          break
        }
      }
      if (!addedToSpecies) {
        var newSpecie = new Species(agent,this.nextSpecieId)
        this.nextSpecieId++
        this.species.push(newSpecie)
        agent.setSpecies(newSpecie)
      }
    //  if(agent.unAdjustedFitness >= 100) console.log('holy', agent.species.id)
    }
    for (var i = 0; i < this.species.length; i++) {
      this.species[i].setNewRandomRepresentative()
    }

  }

  calculateFitnesses() {
    for (var i = 0; i < this.agents.length; i++) {
      var agent = this.agents[i]
      var agentFitness = agent.getFitness()
      agent.setFitnessUnadjusted(agentFitness)
    }
  }

  sortSpecies(){
    for (var i = 0; i < this.species.length; i++) {
      this.species[i].sortPlayers()
    }

    this.species = this.species.sort(function(a, b) {
      if(b.players.length === 0) return -1
      if(a.players.length === 0) return 1
      return b.players[0].unAdjustedFitness - a.players[0].unAdjustedFitness
    })
  }

  cullSpecies(){ //kill off bottom half of species
    for (var i = 0; i < this.species.length; i++) {
      this.species[i].cull()
      this.species[i].fitnessSharing()
      this.species[i].setAverageFitness()
    }
  }

  killStaleSpecies(){
    this.species = this.species.filter(function(specie,i){
      var good = (specie.staleness < 15) || (i < 2)
      return good;
    });
  }

  killInfertileSpecies(){
    var averageSum = 0
    for (var i = 0; i < this.species.length; i++) {
      averageSum += this.species[i].averageFitness
    }
    var ppl = this.agents.length
    this.species = this.species.filter(function(specie, i){
      var good = (specie.averageFitness/averageSum * ppl) >= 1 || i === 0;
      return good;
    })
  }
}
