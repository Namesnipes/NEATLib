//A being with a neural network as a brain
class Agent{

  constructor(population, s){
    this.population = population
    this.brain = new NeuralNet(false,population.innovationHistory)
    if(s) this.setSpecies(s)
    this.unAdjustedFitness;
    this.adjustedFitness;
    this.myDecision;
  }

  setSpecies(s){
    this.species = s
    this.brain.setSpeciesId(s.id)
    if(this.brain.synapses[0] === undefined || s.representativeBrain.synapses[0] === undefined){
      console.log(this)
    }
    if(this.brain.synapses[0].weight == s.representativeBrain.synapses[0].weight){
      this.brain.rep = true
    } else {
      this.brain.rep = false
    }
  }

  setBrainInputs(a,b){
    var in1;
    var in2;

    if(a === undefined){
      in1 = (Math.random() < 0.5 ? 0 : 1)
    } else {
      in1 = a
    }
    if(b === undefined){
      in2 = (Math.random() < 0.5 ? 0 : 1)
    } else {
      in2 = b
    }

    this.brain.setNetworkInputs(in1,in2)
  }

  getBrainOutputs(){
    this.myDecision = this.brain.getNetworkOutputs()
    return this.myDecision
  }

  getFitness(){
    var dist = 0
    var solved = true

    this.setBrainInputs(1,1)
    var out3 = this.getBrainOutputs()[0]
    dist += Math.abs(0 - out3)
    solved = solved && (out3 < 0.5)

    this.setBrainInputs(0,0)
    var out1 = this.getBrainOutputs()[0]
    dist += Math.abs(0 - out1)
    solved = solved && (out1 < 0.5)

    this.setBrainInputs(1,0)
    var out2 = this.getBrainOutputs()[0]
    dist += Math.abs(1 - out2)
    solved = solved && (out2 > 0.5)

    this.setBrainInputs(0,1)
    var out4 = this.getBrainOutputs()[0]
    dist += Math.abs(1 - out4)
    solved = solved && (out4 > 0.5)
    var fit = (4-dist)**2
    if(solved) fit = 100
    return fit
  }

  setFitnessUnadjusted(fa){
    this.unAdjustedFitness = fa
    this.brain.fitness = fa
  }

  setFitnessAdjusted(f){
    this.adjustedFitness = f
  }

  setBrain(b){
    this.brain = b
  }

  crossover(parent){
    var child = new Agent(this.population)
    child.setBrain(this.brain.crossover(parent.brain))
    child.setSpecies(this.species)
    return child
  }

  reinitialize(){
    this.brain = new NeuralNet(false,this.population.innovationHistory)
  }

  clone(){
    var a = new Agent(this.population)
    a.setBrain(this.brain.clone())
    a.setSpecies(this.species)
    a.unAdjustedFitness = this.unAdjustedFitness
    a.adjustedFitness = this.adjustedFitness
    a.brain.fitness = this.unAdjustedFitness
    return a
  }
}
