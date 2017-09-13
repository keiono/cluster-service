cxmate-js
=========

<img align="right" height="300" src="http://www.cytoscape.org/images/logo/cy3logoOrange.svg">

---

cxmate-js provides a Javascript SDK for interacting with [cxMate](https://github.com/cxmate/cxmate), an adapter that allows Cytoscape to talk to network services. It can also convert Cytoscape's network interchange format to and from the Cytoscape.js data model. This SDK enables quick and painless development of a cxMate service, follow the Getting Started guide to learn more about the process.

---

_cxMate is an official [Cytoscape](http://www.cytoscape.org) project written by the Cytoscape team._

Installation
------------

Install the cxMate SDK via npm.

```
npm install --save cxmate
```

Getting Started
---------------

Import the cxmate package:
```javascript
let cxmate = require('cxmate');
```

Create a subclass of the `cxMate.Service` class from the package:
```javascript
class MyService extends cxmate.Service
```

Implement a single method in the class called process. It takes two arguments, a dictionary of parameters, and an element stream:
```javascript
class MyService extends cxmate.Service {

  process(params, elementStream) {
    cxmate.Adapter.toCyJS(elementStream, (model) => {
      cxmate.Adapter.fromCyJS(model, (element) => {
        elementStream.write(element);
      });
      elementStream.end();
    });
  }

}
```
Whenever your service is called, cxMate will call your process method for you. you must extract networks from the element stream to create your input networks. cxMate comes with an adapter class to make conversion to popular network formats simple.
To send networks back to cxMate, you must write network elements back to the stream. cxMate's adapter class can handle this also for various popular network formats.

Finally, setup your service to run when envoked. the cxmate.Service superclass implements a run method for you that takes an optional 'address:port' string.
```javascript
let service = new MyService();
service.run();
```

Contributors
------------

We welcome all contributions via Github pull requests. We also encourage the filing of bugs and features requests via the Github [issue tracker](https://github.com/cxmate/cxmate-js/issues/new). For general questions please [send us an email](eric.david.sage@gmail.com).

License
-------

cxmate-js is MIT licensed and a product of the [Cytoscape Consortium](http://www.cytoscapeconsortium.org).

Please see the [License](https://github.com/cxmate/cxmate-js/blob/master/LICENSE) file for details.
