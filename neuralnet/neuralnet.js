var brain = require('brain.js')

module.exports = function(RED){
  function Brain(config){
    RED.nodes.createNode(this, config)
    this.nntype = config.nntype;
    var node = this

    node.status({
      fill: 'grey',
      shape: 'dot',
      text: 'waiting'
    })

    if(this.nntype=='0') {
    	node.net = new brain.NeuralNetwork(config);
    } else if(this.nntype=='1') {
    	node.net = new brain.recurrent.RNN(config);
    } else if(this.nntype=='2') {
    	node.net = new brain.recurrent.LSTM(config);
    } else if(this.nntype=='3') {
    	node.net = new brain.recurrent.GRU(config);
    } else {
    	node.net = new brain.NeuralNetwork(config);
    }

    this.on('input', function(msg){

      if (!!msg.neuralNetworkOptions && !!msg.trainData) {
    	  if(this.nntype=='0') {
    	    	node.net = new brain.NeuralNetwork(msg.neuralNetworkOptions||config);
    	    } else if(this.nntype=='1') {
    	    	node.net = new brain.recurrent.RNN(msg.neuralNetworkOptions||config);
    	    } else if(this.nntype=='2') {
    	    	node.net = new brain.recurrent.LSTM(msg.neuralNetworkOptions||config);
    	    } else if(this.nntype=='3') {
    	    	node.net = new brain.recurrent.GRU(msg.neuralNetworkOptions||config);
    	    } else {
    	    	node.net = new brain.NeuralNetwork(msg.neuralNetworkOptions||config);
    	    }
      }

      if (msg.netJSON) {
        //load network from external source
        node.net.fromJSON(msg.netJSON)
      }
      if (!!msg.runData){
        //got data to test, running current network
        msg.decision = node.net.run(msg.runData)
        node.status({
          fill: 'green',
          shape: 'dot',
          text: 'running done'
        })
        node.send(msg)
      } 
      else if (!!msg.trainData) {
        //got train data, training
        node.status({
          fill: 'yellow',
          shape: 'dot',
          text: 'training'
        })

        var res = node.net.train(msg.trainData);
        node.status({
            fill: 'green',
            shape: 'dot',
            text: 'trainning done'
          });
        msg.net = node.net.toJSON();
        msg.result = res;
        node.send(msg);
      }
    })
  }

  RED.nodes.registerType('neuralnet', Brain)
}
