var brain = require('brain.js');

module.exports = function(RED){
  function Brain(config){
    RED.nodes.createNode(this, config);
    this.options = config;
    this.nntype = config.nntype;
    var node = this;

    node.status({
      fill: 'grey',
      shape: 'dot',
      text: 'waiting'
    });

    if(this.nntype=='0') {
    	node.net = new brain.NeuralNetwork();
    } else if(this.nntype=='1') {
    	node.net = new brain.recurrent.RNN();
    } else if(this.nntype=='2') {
    	node.net = new brain.recurrent.LSTM();
    } else if(this.nntype=='3') {
    	node.net = new brain.recurrent.GRU();
    }

    var netLog = function(iterationsStr, iter, errorStr, error) {
    	var m = {};
    	m.neuralnetLog = {};
    	m.neuralnetLog.iterations = iter;
    	m.neuralnetLog.error = error;
    	
    	node.log(iterationsStr+" "+iter+" "+errorStr+" "+ error);
    	
    	node.send(m);
    };
    
    this.on('input', function(msg) {
      if (msg.hasOwnProperty('neuralNetworkOptions') && msg.hasOwnProperty('trainData')) {
    	  this.options = msg.neuralNetworkOptions;
      }
      
      if(this.options.hasOwnProperty('log')) {
    	  if(this.options.log) {
    		  this.options.log = netLog;
    	  }
      }

      if (msg.hasOwnProperty('netJSON')) {
        node.net.fromJSON(msg.netJSON);
      }
      
      if (msg.hasOwnProperty('runData')) {

        msg.decision = node.net.run(msg.runData);
        
        node.status({
          fill: 'green',
          shape: 'dot',
          text: 'running done'
        });
        
        node.send(msg);
        
      } else if (msg.hasOwnProperty('trainData')) {
    	  
        node.status({
          fill: 'yellow',
          shape: 'dot',
          text: 'training'
        })

        var res = node.net.train(msg.trainData, this.options);
        
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
