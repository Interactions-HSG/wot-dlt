// Required steps to create a servient for a client
const { Servient, Helpers } = require("@node-wot/core");
const FileClientFactory = require("@node-wot/binding-file").FileClientFactory
const CoapClientFactory = require("@node-wot/binding-coap").CoapClientFactory
const DltClient = require("./dltClient.js");

//const { CoapClientFactory } = require('@node-wot/binding-coap');

const TD_FILE = "file://./td/robotic-arm-td.jsonld";
const TARGET_VALUE = 500;

const servient = new Servient();
servient.addClientFactory(new FileClientFactory());
servient.addClientFactory(new CoapClientFactory());

const WoTHelpers = new Helpers(servient);
WoTHelpers.fetch(TD_FILE).then( async (td) => {
  try {
    servient.start().then((WoT) => {
      WoT.consume(td).then( async (thing) => {

        roboticArm = thing;
        let tdBase = roboticArm.getThingDescription().base;
        let elbowAction = roboticArm.getThingDescription().actions.elbow;
        let form = elbowAction.forms[0];
        let to_adr = tdBase+form.href;
        let from_adr = "coap://172.26.90.109:35447";

        //Set elbow joint value to 500
        console.log("Invoking action set elbow: /elbow", TARGET_VALUE)
        actionRes= thing.invokeAction("elbow", TARGET_VALUE);
        console.log(actionRes);
        DltClient.sendTransaction(from_adr, to_adr, form, TARGET_VALUE);

        //Observe elbow joint value
        eventNotif = await thing.subscribeEvent("elbow", value => {
          console.info("Notification received for /elbow value:", value);

          if (value == TARGET_VALUE) {
            console.info("Unsubscribing from /elbow");
            thing.unsubscribeEvent("elbow", value => {});
            servient.shutdown();
            
          }
        },
        err => console.error("Error: %s", e),
          () => console.info("Completed")
        );
      });
    });
  } catch(err) {
  		console.error("Script error:", err.message);
  }
}).catch((err) => { console.error("Fetch error:", err); });
