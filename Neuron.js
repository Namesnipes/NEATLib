//Neuron/Node class used in the neural network
class Neuron{

  constructor(layer, num, order){
    this.layer = layer
    this.number = num
    this.output = 0
    this.order = order

    this.bias = this.layer > 0 ? NeuralNet.getRandomWeight() : 0
    this.inConnections = []
    this.outConnections = []
  }

  sigmoid(x){
    return 1/(1+Math.pow(Math.E,-4.9 * x))
  }

  activate(){
    if(this.layer == 0) return;

    var output = 0
    for(var i = 0; i < this.inConnections.length; i++){
      var con = this.inConnections[i]
      if(con.disabled) continue
      output += this.inConnections[i].weight * this.inConnections[i].from.output
    }
    output += this.bias
    //Output = W1*In1 + W2*In2 + W3*In3 + W4*In4 + W5*In5 + Bias_Neuron1
    var activation = this.sigmoid(output)
    this.output = activation
    return activation

  }

  isConnectedTo(neuron){
    if(this.layer == neuron.layer) return false

    if(this.layer < neuron.layer){
      for(var i = 0; i < this.outConnections.length; i++){
        var syn = this.outConnections[i]
        if(syn.to == neuron) return true
      }
    } else {
      for(var i = 0; i < this.inConnections.length; i++){
        var syn = this.inConnections[i]
        if(syn.from == neuron) return true
      }
    }

  }

  setNumber(num){
    this.number = num
  }

  setBias(bias){
    this.bias = bias
  }

  setOutput(put){
    this.output = put
  }

  addOutConnection(con){
    this.outConnections.push(con)
  }

  addInConnection(con){
    this.inConnections.push(con)
  }

}
