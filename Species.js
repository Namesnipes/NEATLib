class Species{
  static excessCoefficient = 1
  static weightCoefficient = 0.4
  static compatibilityThreshold = 3;

  static species_Num = 0


  static getExcessDisjoint(brain1, brain2) {
    var loops = Math.max(brain1.genome.length,brain2.genome.length)
    var excess = 0
    var disjoint = 0;
    var count = 0;


    for (var i = 0; i < loops; i++) {
      var synapse1 = brain1.genome[i]
      var synapse2 = brain2.genome[i]
      if((synapse1 === undefined) != (synapse2 === undefined)){
        if((synapse1 === undefined || !synapse1.disabled) && (synapse2 === undefined || !synapse2.disabled)){ // only enabled connections are counted
          count++
        }
      }
    }

    return count
  }

  static getAverageWeightDiff(brain1, brain2){
    var loops = Math.max(brain1.genome.length,brain2.genome.length)
    var totalWeight = 0;
    var totalCount = 0;

    for (var i = 0; i < loops; i++) {
      var synapse1 = brain1.genome[i]
      var synapse2 = brain2.genome[i]
      if((synapse1 !== undefined) && (synapse2 !== undefined)){
        totalWeight += Math.abs(synapse1.weight - synapse2.weight)
        totalCount++
      }
    }
    if(totalCount === 0) totalCount = 100
    return totalWeight / totalCount
  }

  static getDistance(brain1,brain2){
    var excessDisjoint = Species.getExcessDisjoint(brain1, brain2)
    var avgWeight = Species.getAverageWeightDiff(brain1, brain2)

    var normalizationConstant = 1



    if (brain1.synapses.length > 20 && brain2.synapses.length > 20) {
      var largerGenome;

      if(brain1.synapses.length > brain2.synapses.length){
        largerGenome = brain1
      } else {
        largerGenome = brain2
      }

      normalizationConstant = largerGenome.synapses.length
    }


    var d = (Species.excessCoefficient * excessDisjoint/normalizationConstant) + (Species.weightCoefficient * avgWeight)
    return d
  }

  constructor(player,number){
    this.players = []
    this.playerHistory = []
    this.staleness = 0;
    this.id = number
    this.averageFitness = 0;

    this.representativeBrain = player.brain.clone()

    this.addPlayer(player)
  }

  sameSpecies(brain){
    var dist = Species.getDistance(brain, this.representativeBrain)
    if(dist < Species.compatibilityThreshold){
      return true
    }
    return false
  }

  addPlayer(p){
    this.players.push(p)
    p.setSpecies(this)
  }

  clearPlayers(){
    this.players = []
  }

  sortPlayers(){
    if(this.players.length <= 0) return

    var oldBest = this.players[0].unAdjustedFitness
    this.players = this.players.sort(function(a, b) {
      return b["unAdjustedFitness"] - a["unAdjustedFitness"];
    })

    if(oldBest >= this.players[0].unAdjustedFitness){
      this.staleness++
    }
  }

  setNewBestRepresentative(){
    if(this.players <= 0) return
    var sorted = this.players.sort(function(a, b) {
      return b["unAdjustedFitness"] - a["unAdjustedFitness"];
    })
    this.representativeBrain = sorted[0].brain
  }

  setNewRandomRepresentative(){
    if(this.players <= 0) return
    this.representativeBrain = this.players[Math.floor(Math.random() * this.players.length)].brain
  }

  setAverageFitness(){
    if(this.players.length <= 0) {
      this.averageFitness = 0
      return
    }
    var sum = 0;
    for (i = 0; i < this.players.length; i ++) {
      sum += this.players[i].adjustedFitness;
    }
    this.averageFitness = sum/this.players.length;
  }

  cull(){
    if (this.players.length > 2) {
    //console.log("killing:", Math.floor(this.players.length/2))
      var loops = Math.floor(this.players.length/2)
      for (i = 0; i<loops; i++) {
        this.players.pop()
      }
    }
  }

  fitnessSharing(){
    for (var i = 0; i < this.players.length; i++) {
      var agent = this.players[i]
      var agentFitness = agent.getFitness()
      var adjustedFitness = agentFitness/(this.players.length-1) // ∑nj=1 sh(δ(i, j)) reduces to the number of organisms in the same species as organism i
      if(!isFinite(adjustedFitness)){
        adjustedFitness = agentFitness
      }
      agent.setFitnessAdjusted(adjustedFitness)
    }
  }

  selectPlayer(){
    var fitnessSum = 0
    for(var i = 0; i < this.players.length; i++){
      fitnessSum += this.players[i].adjustedFitness
    }
    var target = randInRange(0,fitnessSum)
    var runningSum = 0
    for(var i = 0; i < this.players.length; i++){
      runningSum += this.players[i].adjustedFitness
      if(runningSum > target){
        return this.players[i]
      }
    }
    debugger
  }

  SEXSEXSEXSEXSEX(){
    var baby;
    if(Math.random() < 0.25){
      var parent = this.selectPlayer()
      baby = parent.clone()
    } else { //crossover
      var parent1 = this.selectPlayer();
      var parent2 = this.selectPlayer();
      if (parent1.adjustedFitness < parent2.adjustedFitness) {
        baby =  parent2.crossover(parent1);
        baby.unAdjustedFitness = parent2.unAdjustedFitness
        baby.adjustedFitness = parent2.adjustedFitness
        baby.brain.fitness = parent2.unAdjustedFitness
      } else {
        baby =  parent1.crossover(parent2);
        baby.unAdjustedFitness = parent1.unAdjustedFitness
        baby.adjustedFitness = parent1.adjustedFitness
        baby.brain.fitness = parent1.unAdjustedFitness
      }
    }
    baby.brain.mutate()
    return baby;
  }

}
