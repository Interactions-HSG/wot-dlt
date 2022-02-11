const fs = require('fs');
const DltClient = require("./dltClient.js");

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
 
        let tdBase = roboticArm.getThingDescription().base;
        let elbowAction = roboticArm.getThingDescription().actions.elbow;
        let elbowMin = elbowAction.input.minimum;
        let elbowMax = elbowAction.input.maximum;
        let form = elbowAction.forms[0];
        let to_adr = tdBase+form.href;
        let from_adr = "coap://172.26.90.109:35447";
        
        //Set handler for the ActionAffordance elbow
        roboticArm.setActionHandler('elbow', (value) => {

          return new Promise((resolve, reject) => {
            console.log("Received request for setting /elbow", value)
            if (value >= elbowMin && value <= elbowMax) {
                DltClient.sendTransaction(from_adr, to_adr, form, value);
                resolve();
                //setElbow(value);
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
