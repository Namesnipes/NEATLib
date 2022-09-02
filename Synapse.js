class Synapse{
  constructor(from, to){
    this.to = to
    this.from = from
    this.weight = NeuralNet.getRandomWeight()
    this.disabled = false
    this.innovationNumber;
    from.addOutConnection(this)
    to.addInConnection(this)
  }

  setWeight(weight){
    this.weight = weight
  }

  setInnovationNumber(num){
    this.innovationNumber = num
  }
}
