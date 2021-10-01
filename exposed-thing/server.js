console.log("Hello from WoT Thing");
RoboticArm = require("./dist/roboticArm.js");

const TD_FILE = "./td/robotic-arm-td.jsonld";

Servient = require("@node-wot/core").Servient;
//Import the Coap binding
CoapServer = require("@node-wot/binding-coap").CoapServer;

//Create the instances of the binding server
var coapServer = new CoapServer({port: 5683});

//Build the servient object
var servient = new Servient();
//Add binding to the server
servient.addServer(coapServer);

servient.start().then((WoT) => {
    roboticArm = RoboticArm.init(WoT, TD_FILE);
});
