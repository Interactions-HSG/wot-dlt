console.log("Hello from WoT Consumer");

const fs = require('fs');
const EventEmitter = require('events');

let elbowJointValue = 300;
const elbowJointSpeed = 15; // in bits/sec

async function setElbow(value) {
    console.info("Setting elbow to:", value);

    let simulationTime = Math.abs(elbowJointValue - value) / elbowJointSpeed;
    console.log("Simulation time:", Math.floor(simulationTime));

    var inMovement = setInterval(() => {
       elbowJointValue+= 20;
    }, 1000);
    setTimeout(function() {
      clearInterval(inMovement);
      elbowJointValue = value;
      console.info("Setting elbow to:", elbowJointValue, "completed");
    }, Math.floor(simulationTime) * 1000);
    
}

module.exports.init = (WoT, roboticArmTDPath) => {
    let td = JSON.parse(fs.readFileSync(roboticArmTDPath));
    WoT.produce(td).then(thing => {
        roboticArm = thing;

        let elbowMin = thing.getThingDescription().actions.elbow.input.minimum;
        let elbowMax = thing.getThingDescription().actions.elbow.input.maximum;
        let form = thing.getThingDescription().events.elbow.forms[0];
        
        //Set handler for the ActionAffordance elbow
        roboticArm.setActionHandler('elbow', (value) => {

          return new Promise((resolve, reject) => {
            console.log("Received request for setting /elbow", value)
            if (value >= elbowMin && value <= elbowMax) {
                setElbow(value);
                resolve();
            }
            else {
              //If the input value exceeds the pertmitted range
              //the server returns a 5.00
              reject(new Error());
            }
          });
        });

        roboticArm.expose().then( async () => {
           console.log(thing.getThingDescription().title, "is ready");
           setInterval(() => {
              console.log("Current elbow value:", elbowJointValue);
				      thing.emitEvent("elbow", elbowJointValue);
			     }, 8*1000);
		    });
       })
    .then(() => WoT);
};
