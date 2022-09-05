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
    //for each species, clear all the players in it,
    for (var i = 0; i < this.species.length; i++) {
      this.species[i].clearPlayers()
    }

    //create a species array sorted by the time they were created (lowest ids first)
    var speciesInOrder = this.species.sort(function(a, b) {
      return a["id"] - b["id"];
    })

    //create a helper players array, the same as this.agents
    var notAddedToSpecies = []
    for (var i = 0; i < this.agents.length; i++) {
      notAddedToSpecies.push(this.agents[i])
    }

    //put all of the players into species, if a specie doesnt exist for them then make a new one which they will represent
    for (var i = 0; i < speciesInOrder.length; i++) {
      var specie = speciesInOrder[i]
      for (var j = 0; j < notAddedToSpecies.length; j++) {
        var agent = notAddedToSpecies[j]
        if (specie.sameSpecies(agent.brain)) {
          specie.addPlayer(agent)
          agent.setSpecies(specie)
          notAddedToSpecies[j] = undefined
        }
      }
      notAddedToSpecies = notAddedToSpecies.filter(agent => agent !== undefined); // remove all agents who have a species

      if(i === (this.species.length-1) && notAddedToSpecies.length > 0){ //no more species, but players are still left, so make new species
        var newSpecie = new Species(notAddedToSpecies[0],this.nextSpecieId)
        notAddedToSpecies.shift()
        this.nextSpecieId++
        this.species.push(newSpecie)
        agent.setSpecies(newSpecie)
      }
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
