let grpc = require('grpc');
let protoDescriptor = grpc.load(__dirname + '/cxmate.proto');
let proto = protoDescriptor.proto;

class Service {
  process(elementStream) {
    throw new Error('Service.process must have a subclass implementation');
  }

  streamNetworks(elementStream) {
    let parameters = {};
    const callProcess = () => {
      let networkElement;
      while (null !== (networkElement = elementStream.read())) {
        if (networkElement.element == 'parameter') {
          let param = networkElement.parameter;
          parameters[param.name] = this.readParamValue(param);
        } else {
          elementStream.removeListener('readable', callProcess);
          elementStream.push(networkElement);
          this.process(parameters, elementStream);
        }
      }
    };
    elementStream.on('readable', callProcess);
  }

  readParamValue(param) {
    switch (param.value) {
      case 'stringValue': {
        return param.stringValue;
      }
      case 'booleanValue': {
        return param.booleanvalue.toLower() == 'true';
      }
      case 'integerValue': {
        return parseInt(param.integerValue);
      }
      case 'numberValue': {
        return parseFloat(param.numberValue);
      }
    }
  }

  run(listenOn = '0.0.0.0:8080') {
    const server = new grpc.Server();
    server.addService(proto.cxMateService.service, {
      streamNetworks: this.streamNetworks.bind(this),
    });
    server.bind(listenOn, grpc.ServerCredentials.createInsecure());
    server.start();
  }
}

module.exports = Service;
