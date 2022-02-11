var ip_adr_port_blockchain = "http://127.0.0.1:8545";

/*function for encoding in hex format by stepping through the chars of the string*/
String.prototype.hexEncode = function(){
    var hex, i;
    
    var result = "";
    for(i=0; i<this.length; i++){
      hex = this.charCodeAt(i).toString(16);
      result += ("000"+hex).slice(-4);
      }
    return result;
    }

module.exports.sendTransaction = function(from_adr, to_adr, form, value)  {
  let data = {}
  data["data"] = value;
  data["form"] = form;
  console.log("This is the data: ", data);
  
  dataText = JSON.stringify(data)
  dataHex = dataText.hexEncode();

  /*creating a child process and execute the send transaction command in it*/
  const { exec } = require('child_process');

  exec('curl -X POST -H "Content-Type: application/json" --data \'{"jsonrpc":"2.0", "method":"eth_sendTransaction", "params":[{"from": ' + from_adr + ', "to": '+ to_adr + ', "gas": "0x76c0", "gasPrice": "0x4A817C800", "value": "0x9184e72a", "data": "0x' + dataHex +'"}],"id":1}\' ' + ip_adr_port_blockchain + '', (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
   }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    console.log(`stdout:\n${stdout}`);
  });

}


