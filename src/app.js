let cxmate = require('cxmate');
let d3 = require('d3-hierarchy');

class LayoutService extends cxmate.Service {
  process(params, elementStream) {
    this.convertToHeirarchy(elementStream, (heirarchy) => {
      const layout = d3
        .cluster()
        .size([360, 1600])
        .separation((a, b) => (a.parent === b.parent ? 1:2)/a.depth);
      layout(heirarch);
      this.convertToCX(heirarchy, (element) => {
        elementStream.write(element);
      });
    });
  }

  convertToHeirarchy(inputStream, callback) {
    let networks = {};
    inputStream.on('data', (networkElement) => {
      let label = networkElement.label;
      if (!(label in networks)) {
        networks[label] = [{name: 'root', target: ''}];
      }
      if (networkElement.element ==='edge') {
        let edge = networkElement.edge;
        networks[label].push({
          name: edge.sourceId,
          target: edge.targetId,
        });
      }
    });
    inputStream.on('end', () => {
      for (let network in networks) {
        console.log(networks[network]);
        networks[network] = d3.stratify()
            .id((d) => d.name)
            .parentId((d) => d.parent)
            (networks[network]);
      }

    });
  }

  convertToCX(heirarchy, callback) {
    console.log(heirarchy);
  }
}

let layoutService = new LayoutService();
layoutService.run();
