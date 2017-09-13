let cytoscape = require('cytoscape');

class Adapter {
  static fromCyJS(models, callback) {
    for (let model of models) {
      const label = model.data.label
      let cy = cytoscape(model);
      for (let node of cy.elements('node').toArray()) {
        let id = this.stripId(node.data().id);
        let data = node.data();
        callback({
          label: label,
          element: 'node',
          node: {
            id: id,
            name: data.name,
            represents: data.represents,
          },
        });
        delete data.id;
        delete data.name;
        delete data.represents;
        for (let nodeAttr in data) {
          let type = typeof data[nodeAttr];
          callback({
            label: label,
            element: 'nodeAttribute',
            nodeAttribute: {
              nodeId: id,
              name: nodeAttr,
              value: data[nodeAttr].toString(),
              type: type,
            },
          });
        }
      }
      for (let edge of cy.elements('edge').toArray()) {
        let id = this.stripId(edge.data().id);
        let data = edge.data();
        callback({
          label: label,
          element: 'edge',
          edge: {
            id: id,
            sourceId: this.stripId(data.source),
            targetId: this.stripId(data.target),
            interaction: data.interaction,
          },
        });
        delete data.id;
        delete data.source;
        delete data.target;
        delete data.interaction;
        for (let edgeAttr in data) {
          let type = typeof data[edgeAttr];
          callback({
            label: label,
            element: 'edgeAttribute',
            edgeAttribute: {
              edgeId: id,
              name: edgeAttr,
              value: data[edgeAttr].toString(),
              type: type,
            },
          });
        }
      }
      for (let networkAttr in model.data) {
        let type = typeof model.data[networkAttr];
        callback({
          label: label,
          element: 'networkAttribute',
          networkAttribute: {
            name: networkAttr,
            value: model.data[networkAttr].toString(),
            type: type,
          },
        });
      }
    }
  }

  static toCyJS(inputStream, callback) {
    let networks = {};
    inputStream.on('data', (networkElement) => {
      let label = networkElement.label;
      if (!(label in networks)) {
        networks[label] = {
          data: {},
          nodes: {},
          edges: {},
        };
      }
      let network = networks[label];
      switch (networkElement.element) {
        case 'node': {
          let node = networkElement.node;
          network.nodes[node.id] = {
            group: 'nodes',
            data: {
              id: this.convertId('node', node.id),
              name: node.name,
              represents: node.represents,
            },
          };
          break;
        }
        case 'edge': {
          let edge = networkElement.edge;
          network.edges[edge.id] = {
            group: 'edges',
            data: {
              id: this.convertId('edge', edge.id),
              source: this.convertId('node', edge.sourceId),
              target: this.convertId('node', edge.targetId),
              interaction: edge.interaction,
            },
          };
          break;
        }
        case 'nodeAttribute': {
          let nodeAttr = networkElement.nodeAttribute;
          let value = this.castAttribute(nodeAttr.value, nodeAttr.type);
          if (nodeAttr.nodeId in network.nodes) {
            network.nodes[nodeAttr.nodeId].data[nodeAttr.name] = value;
          } else {
            network.nodes[nodeAttr.nodeId] = {
              group: 'nodes',
              data: {
                id: this.convertId('node', nodeAttr.nodeId),
                [nodeAttr.name]: value,
              },
            };
          }
          break;
        }
        case 'edgeAttribute': {
          let edgeAttr = networkElement.edgeAttribute;
          let value = this.castAttribute(edgeAttr.value, edgeAttr.type);
          if (edgeAttr.edgeId in network.edges) {
            network.edges[edgeAttr.edgeId].data[edgeAttr.name] = value;
          } else {
            network.edges[edgeAttr.edgeId] = {
              group: 'edges',
              data: {
                id: this.convertId('edge', edgeAttr.edgeId),
                [edgeAttr.name]: value,
              },
            };
          }
          break;
        }
        case 'networkAttribute': {
          let networkAttr = networkElement.networkAttribute;
          let value = this.castAttribute(networkAttr.value, networkAttr.type);
          network.data[networkAttr.name] = value;
          break;
        }
      }
    });
    inputStream.on('end', () => {
      let networkList = Object.keys(networks).map((label) => {
        let network = networks[label];
        let nodeList = Object.keys(network.nodes).map((key) => network.nodes[key]);
        let edgeList = Object.keys(network.edges).map((key) => network.edges[key]);
        network.data['label'] = label;
        return {
          elements: [...nodeList, ...edgeList],
          data: network.data,
        };
      });
      callback(networkList);
    });
  }

  static castAttribute(value, type) {
    switch (type.toLowerCase()) {
      case 'float', 'double', 'number': {
        return parseFloat(value);
      }
      case 'integer': {
        return parseInt(value);
      }
      case 'bool', 'boolean': {
        return value.toLowerCase() == 'true';
      }
      default: {
        return value;
      }
    }
  }

  static convertId(type, id) {
    if (type == 'node') {
      return 'n' + id.toString();
    } else {
      return 'e' + id.toString();
    }
  }

  static stripId(id) {
    return id.substr(1);
  }
}

module.exports = Adapter;
