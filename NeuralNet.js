//A neural network which will act as the brains for each of the agents
//https://nn.cs.utexas.edu/downloads/papers/stanley.phd04.pdf
class NeuralNet {

  static MUTATION_RATE_WEIGHTS = 0.9
  static INITIAL_BRAIN = [
    [undefined, undefined],
    [undefined]
  ]
  static getRandomWeight() {
    return Math.random() * 2 - 1;
  }

  constructor(noNeurons, history) {
    this.brain = structuredClone(NeuralNet.INITIAL_BRAIN);
    this.layers = NeuralNet.INITIAL_BRAIN.length
    this.neurons = []
    this.synapses = []
    this.genome = [] //like this.synapses except they are [node1,node2] pairs ordered based on innovationNumber and there may be an empty index between synapses
    this.speciesId;
    this.agentId;
    this.innovationHistory = history//array with all unique synapse connections
    this.rep = false
    this.nextNeuronId = 0
    this.fitness = 0;

    this.inValues = []
    this.outValues = []

    if(noNeurons) return
    for (var layer = 0; layer < this.layers; layer++) {
      var nodes = this.getLayerLen(layer)
      for (var node = 0; node < NeuralNet.INITIAL_BRAIN[layer].length; node++) {
        this.addNeuron(layer,node)
      }
    }
  }


  //fully connect all neurons to eachother (not used)
  connect() {
    for (var layer = 0; layer < this.brain.length - 1; layer++) {
      for (var neuron = 0; neuron < this.brain[layer].length; neuron++) {
        for (var nextNeuron = 0; nextNeuron < this.brain[layer + 1].length; nextNeuron++) {
          var neuronObj = this.brain[layer][neuron]
          var nextNeuronObj = this.brain[layer + 1][nextNeuron]
          this.addSynapse(neuronObj, nextNeuronObj)
        }
      }
    }
  }

  setNetworkInputs() {
    this.inValues = []
    var inputs = arguments //this is epic wow thanks stackoverflow
    for (var i = 0; i < this.getLayerLen(0); i++) {
      this.getNeuron(0,i).setOutput(inputs[i])
    }

    for (var i = 0; i < inputs.length; i++) {
      this.inValues.push(inputs[i])
    }
  }

  getNetworkOutputs() { //aka feedforward
    this.outValues = []
    var outputs = []
    for (var layer = 1; layer < this.layers; layer++) {
      for (var neuron = 0; neuron < this.getLayerLen(layer); neuron++) {
        var neuronObj = this.getNeuron(layer,neuron)
        neuronObj.activate()
        if (layer == this.layers - 1) outputs.push(neuronObj.output)
      }
    }
    this.outValues = outputs
    return outputs
  }

  //returns if no more connections can be made
  isFullyConnected(){
    var maxConnections = 0
    for(var i = 0; i < this.neurons.length; i++){
      var neuron = this.neurons[i]
      if(neuron.layer == this.layers-1) continue
      for(var j = neuron.layer+1; j < this.layers; j++){
        maxConnections += this.getLayerLen(j)
      }
    }
    return maxConnections === this.synapses.length
  }

  //adds a synapse connecting 2 nodes which are not connected
  addRandomSynapse() {
    if(this.isFullyConnected()){
      return
    }
    //todo: make more efficient plzzzzzzzzzzzzzzzzzzzz Dont use random shit.
    //algo: remove all fully connected nodes then pick random node then pick random node its not connected to
    var randomNode1 = this.neurons[Math.floor(Math.random() * this.neurons.length)]
    var randomNode2 = this.neurons[Math.floor(Math.random() * this.neurons.length)]
    var tries = 0
    while (randomNode1.layer == randomNode2.layer || randomNode1.isConnectedTo(randomNode2)) {
      randomNode1 = this.neurons[Math.floor(Math.random() * this.neurons.length)]
      randomNode2 = this.neurons[Math.floor(Math.random() * this.neurons.length)]
      tries++
    }
  //  console.log("look at how inefficient:", tries)

    var fromNode;
    var toNode;
    if (randomNode1.layer > randomNode2.layer) {
      fromNode = randomNode2
      toNode = randomNode1
    } else {
      fromNode = randomNode1
      toNode = randomNode2
    }


    this.addSynapse(fromNode, toNode)

  }

  addRandomNeuron(){
    if(this.synapses.length == 0) {
      this.addRandomSynapse()
      return
    }
    var randomSynapse = this.synapses[Math.floor(Math.random() * this.synapses.length)]
    var loops = 0

    randomSynapse.disabled = true

    var fromNeuron = randomSynapse.from
    var toNeuron = randomSynapse.to

    var newNeuronLayer = fromNeuron.layer + 1
    //if connection number is new neuron layer number then
    var isNewLayer = (newNeuronLayer == toNeuron.layer)
    if(isNewLayer){
      this.layers++
      for(var i = 0; i < this.neurons.length; i++){
        if(this.neurons[i].layer >= newNeuronLayer){
          this.neurons[i].layer += 1
        }
      }
    }
    var newNeuron = this.addNeuron(newNeuronLayer)
    this.addSynapse(fromNeuron,newNeuron,1)
    this.addSynapse(newNeuron,toNeuron,randomSynapse.weight)
  }


  mutate() {
    if(this.synapses.length === 0){
      this.addRandomSynapse()
      return
    }
    if(Math.random() < 0.8) { //80% of the time mutate weights and biases
      //weights
      for (var i = 0; i < this.synapses.length; i++) {
        if (Math.random() < NeuralNet.MUTATION_RATE_WEIGHTS) {
          var change = randInRange(-1, 1)
          this.synapses[i].weight += change
        } else {
          var newWeight = randInRange(-1, 1)
          this.synapses[i].weight = newWeight
        }
      }
      //mutate biases
      for (var i = 0; i < this.neurons.length; i++) {
        if (this.neurons[i].layer > 0 && Math.random() < NeuralNet.MUTATION_RATE_WEIGHTS) {
          var change = randInRange(-1, 1)
          this.neurons[i].bias += change
        } else {
          var newWeight = randInRange(-1, 1)
          this.neurons[i].bias = newWeight
        }
      }
    }
    if(Math.random() < 0.07) { //8% of the time mutate by adding a synapse

      this.addRandomSynapse()
    }

    if(Math.random() < 0.01){// 2% of the time mutate by adding a neuron
      this.addRandomNeuron()
    }

  }

  drawMe(canvasCtx) {
    var drawer = new Drawer(canvasCtx)
    drawer.clear()

    var circleRad = 20
    var horizontalSpace = drawer.width / (this.layers + 1)

    //draw neuroins
    for (var layer = 0; layer < this.layers; layer++) {
      var verticalSpace = drawer.height / (this.getLayerLen(layer) + 1)
      for (var neuron = 0; neuron < this.getLayerLen(layer); neuron++) {
        drawer.circle(horizontalSpace * (layer + 1), verticalSpace * (neuron + 1), circleRad)
        drawer.text(horizontalSpace * (layer + 1) - circleRad / 2, verticalSpace * (neuron + 1) + circleRad*2, this.getNeuron(layer,neuron).order)
        if (layer == 0) continue
        drawer.text(horizontalSpace * (layer + 1) - circleRad / 2, verticalSpace * (neuron + 1) + circleRad / 2, Math.round(this.getNeuron(layer,neuron).bias * 10) / 10)
      }
    }

    //draw synapses
    for (var i = 0; i < this.synapses.length; i++) {
      var synapse = this.synapses[i]
      if(synapse.disabled) continue
      var fromLayer = this.synapses[i].from.layer
      var fromNum = this.synapses[i].from.number
      var toLayer = this.synapses[i].to.layer
      var toNum = this.synapses[i].to.number

      var fromX = horizontalSpace * (fromLayer + 1) + circleRad
      var toX = horizontalSpace * (toLayer + 1) - circleRad

      var fromY = (drawer.height / (this.getLayerLen(fromLayer) + 1)) * (fromNum + 1)
      var toY = (drawer.height / (this.getLayerLen(toLayer) + 1)) * (toNum + 1)

      var r = synapse.weight < 0 ? 255 : 0
      var g = 0
      var b = synapse.weight > 0 ? 255 : 0
      var transparency = Math.abs(synapse.weight)
      drawer.line(fromX, fromY, toX, toY, r, g, b, transparency)
      drawer.text((fromX+toX)/2,(fromY+toY)/2,synapse.weight.toFixed(4))
    }

    var str = ""
    for (var i = 0; i < this.genome.length; i++) {
      if(!this.genome[i]){
        str += " --- "
        continue
      }
      str += " (" + this.genome[i].from.order + "," + this.genome[i].to.order + ") "
    }

    drawer.text(0, 50,str)
    drawer.text(drawer.width/2,drawer.height-10,this.speciesId,20)
    drawer.text(10,drawer.height/2,this.inValues.toString())
    drawer.text(drawer.width-40,drawer.height/2,this.outValues.toString())
    drawer.text(drawer.width-40,drawer.height/3,this.fitness)
    //if(this.rep) drawer.text(0, 100,"rep" + this.speciesId, 30)
  }

  getInnovationNumber(synapse){
    var fromNodeOrder = synapse.from.order
    var toNodeOrder = synapse.to.order
    var connectionPair = [fromNodeOrder,toNodeOrder]

    var exists = false
    var innovationNumber = 0;
    for(var i = 0; i < this.innovationHistory.length; i++){
      var pair = this.innovationHistory[i]
      if(pair[0] == connectionPair[0] && pair[1] == connectionPair[1]){
        exists = true
        innovationNumber = i
        break
      }
    }

    if(!exists){
      //console.log("New innovation: ", connectionPair, this.innovationHistory.length)
      innovationNumber = this.innovationHistory.length
      this.innovationHistory.push(connectionPair)
    }
    this.genome[innovationNumber] = synapse
    return innovationNumber
  }

  addSynapse(from, to, weight, disabled=false) {
    if(from.layer == to.layer && from.number == to.number) debugger;
    var newSynapse = new Synapse(from, to)
    newSynapse.disabled = disabled
    newSynapse.setInnovationNumber(this.getInnovationNumber(newSynapse))

    if (weight) newSynapse.setWeight(weight)

    this.synapses.push(newSynapse)
    return newSynapse
  }

  addNeuron(layer,number,bias, order) {
    var newNeuron = new Neuron(layer,undefined,this.nextNeuronId)
    this.nextNeuronId++

    if(order) newNeuron.order = order
    if(typeof number === 'number' && isFinite(number)){
      newNeuron.setNumber(number)
    } else {
      newNeuron.setNumber(this.getLayerLen(layer))
    }

    if(bias) newNeuron.setBias(bias)
    this.neurons.push(newNeuron)
    return newNeuron
  }

  matchingGene(parent2, innovationNumber) {
   for (var i = 0; i < parent2.synapses.length; i++) {
     if (parent2.synapses[i].innovationNo === innovationNumber) {
       return i;
     }
   }
   return -1; //no matching gene found
 }

 getNeuron(layer,number){
   for (var i = 0; i < this.neurons.length; i++) {
     if(this.neurons[i].layer === layer && this.neurons[i].number === number){
       return this.neurons[i]
     }
   }
 }

 getNeuronByOrder(order){
   for (var i = 0; i < this.neurons.length; i++) {
     if(this.neurons[i].order === order){
       return this.neurons[i]
     }
   }
 }

 getLayerLen(layer){
   var len = 0
   for (var i = 0; i < this.neurons.length; i++) {
     if(this.neurons[i].layer === layer){
       len++
     }
   }
   return len
 }


  crossover(brain2){ // assume this is the higher fitness brain
    var babyBrain = new NeuralNet(true,this.innovationHistory)
    babyBrain.layers = this.layers
    //neurons are same
    var neuronsInOrder = this.getSortedNeurons()
    for (var i = 0; i < neuronsInOrder.length; i++) {
      var n = neuronsInOrder[i]
      babyBrain.addNeuron(n.layer,n.number,n.bias,n.order)
    }

    //inheritting synapses
    for (var i = 0; i < this.genome.length; i++) {
      var brain1Synapse = this.genome[i]
      if(brain1Synapse === undefined) continue

      var newSynapseDisabled = false
      var brain2Synapse = brain2.genome[i]

      if(brain1Synapse !== undefined && brain2Synapse !== undefined){ //matching genes
        if(brain1Synapse.disabled || brain2Synapse.disabled){ // if either is disabled
          if(Math.random() < 0.75){
            newSynapseDisabled = true
          }
        }

        if(Math.random() < 0.5){
          babyBrain.addSynapse(babyBrain.getNeuronByOrder(brain1Synapse.from.order), babyBrain.getNeuronByOrder(brain1Synapse.to.order), brain1Synapse.weight, newSynapseDisabled)
        } else {
          babyBrain.addSynapse(babyBrain.getNeuronByOrder(brain2Synapse.from.order), babyBrain.getNeuronByOrder(brain2Synapse.to.order), brain2Synapse.weight, newSynapseDisabled)
        }
      } else if(brain1Synapse !== undefined ^ brain2Synapse !== undefined) { // genes dont match (excess / disjoint)
        babyBrain.addSynapse(babyBrain.getNeuronByOrder(brain1Synapse.from.order), babyBrain.getNeuronByOrder(brain1Synapse.to.order), brain1Synapse.weight, newSynapseDisabled)
      }
    }
    if(babyBrain.synapses.length === 0){
      console.log(this,brain2)
      debugger
    }
    babyBrain.speciesId = this.speciesId
    return babyBrain
  }

  setSpeciesId(n){
    this.speciesId = n
  }

  getSortedNeurons(){
    var sortedNeurons = []
    for (var i = 0; i < this.layers; i++) {
      for (var j = 0; j < this.neurons.length; j++) {
        var n = this.neurons[j]
        if(n.layer == i) sortedNeurons.push(n)
      }
    }
    if(sortedNeurons.length != this.neurons.length) debugger;
    return sortedNeurons
  }

  clone() {
    var newNeuralnet = new NeuralNet(true,this.innovationHistory)
    newNeuralnet.layers = this.layers
    var neuronsInOrder = this.getSortedNeurons()
    for (var i = 0; i < neuronsInOrder.length; i++) {
      var n = neuronsInOrder[i]
      newNeuralnet.addNeuron(n.layer,n.number,n.bias,n.order)
    }
    for (var i = 0; i < this.synapses.length; i++) {
      var s = this.synapses[i]
      var newS = newNeuralnet.addSynapse(newNeuralnet.getNeuronByOrder(s.from.order),newNeuralnet.getNeuronByOrder(s.to.order))
      newS.disabled = s.disabled
    }
    return newNeuralnet
  }

}
