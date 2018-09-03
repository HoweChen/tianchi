require("../config.js");
let util = require("util");
let to = require("../to.js");
module.exports.createChannel = async function () {
  let hfc = require("fabric-client");
  let client = hfc.loadFromConfig("connection-profile-standard.json");
  await client.initCredentialStores();
  await client.setUserContext({"username": "admin", "password": "Admin123"});
  client.getStateStore();
  let myObj = client._network_config._network_config.channels;
  let mych_name = Object.keys(myObj)[0];

  let mych_values = Object.values(myObj)[0];

  let ct = client._network_config._network_config.peers;
  let my_peers = Object.values(ct)[0];
  let ctorder = client._network_config._network_config.orderers;

  let my_orders = Object.values(ctorder);
  let mych = client.newChannel(mych_name);
  let ssl_target_name_override = Object.values(my_peers.grpcOptions);

  let cyg = client._network_config._network_config;

  let peer = client.newPeer(my_peers.url, {
    pem: my_peers.tlsCACerts.pem,
    "ssl-target-name-override": ssl_target_name_override[5],
  });

  let orderer = client.newOrderer(my_orders[0].url, {
    pem: my_orders[0].tlsCACerts.pem,
    "ssl-target-name-override": "orderer1.ddg.aliyunbaas.com",
  });

  mych.addPeer(peer);
  mych.addOrderer(orderer);
  let result = {
    client,
    peer,
    my_peers,
    channel: mych,

  };
  return result;

};

module.exports.queryChain = async function (
  client, channel, chaincodeID, fcn, args) {
  // console.log(`------------------------------
  //   make query:`)
  let transaction_id = client.newTransactionID();
  // console.log('Assigning transaction_id: ', transaction_id._transaction_id)

  let query = {
    chaincodeId: chaincodeID,
    txId: transaction_id,
    fcn: fcn,
    args: args,
  };
  let [err, result] = await to(channel.queryByChaincode(query));
  if (err) {
    throw {error: "error occurs in queryChain:" + err};
  }
  return result.toString();

};

module.exports.invokeChain = async function (
  client, channel, peer, my_peers, chaincodeId, fcn, args) {
  console.log(`------------------------------
    invoke blockchain:`);

  let targets = [];
  targets.push(peer);
  tx_id = client.newTransactionID();
  // console.log('Assigning transaction_id :', tx_id._transaction_id)
  let myObj = client._network_config._network_config.channels;
  let mych_name = Object.keys(myObj)[0];

  let request = {
    targets: targets,
    chaincodeId: chaincodeId,
    fcn: fcn,
    args: args,
    chainId: mych_name,
    txId: tx_id,
  };

  let results = await channel.sendTransactionProposal(request);
  let proposalResponses = results[0];
  let proposal = results[1];
  let header = results[2];
  let isProposalGood = false;

  if (proposalResponses && proposalResponses[0].response &&
    proposalResponses[0].response.status === 200) {
    isProposalGood = true;
    console.log("transaction proposal was good");
  }
  else {
    console.log("transaction proposal was bad");
    throw {error: "transaction proposal was bad,please check the info again"};
  }

  if (isProposalGood) {
    console.log(util.format(
      "Successfully sent Proposal and received ProposalResponse: Status - %s, message - %s, metadata - %s, endorsement signature: %s",
      proposalResponses[0].response.status,
      proposalResponses[0].response.message,
      proposalResponses[0].response.payload,
      proposalResponses[0].endorsement.signature));

    let request = {
      proposalResponses: proposalResponses,
      proposal: proposal,
      header: header,
    };

    let transactionID = tx_id.getTransactionID();
    let eventPromises = [];
    let eh = client.newEventHub();

    let grpcOpts = {
      pem: my_peers.tlsCACerts.pem,
      "ssl-target-name-override": "peer1.bank.aliyunbaas.com",
    };

    eh.setPeerAddr("grpcs://peer1.bank.aliyunbaas.com:31113", grpcOpts);
    eh.connect();
    let txPromise = new Promise(function (resolve, reject) {
      var handle = setTimeout(function () {
        eh.disconnect();
        reject();
      }, 3000);

      eh.registerTxEvent(transactionID, function (tx, code) {
        clearTimeout(handle);
        eh.unregisterTxEvent(transactionID);
        eh.disconnect();

        if (code !== "VALID") {
          tom;
          console.error("The transaction was invalid, code = " + code);
          reject();
        } else {
          console.log("The transaction has been commited on peer " +
            eh._ep._endpoint.addr);
          resolve();
        }
      });
    });

    eventPromises.push(txPromise);
    var sendPromise = channel.sendTransaction(request);
    sendPromise.then(res => console.log(res)).catch(err => console.log(err));

    return Promise.all([sendPromise].concat(eventPromises))
      .then(function (results) {
        console.log("event promise all complete and testing complete");

        return results[0];
      })
      .catch(function (err) {
        console.error(
          "Failed to send transaction and get notifications within the timeout period.");
        throw {error: "Failed to send transaction and get notifications within the timeout period."};
      });

  } else {
    console.error(
      "Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...");
    throw {error: "Failed to send Proposal or receive valid response. Response null or status is not 200. exiting..."};
  }

};

/////////////////// test /////////////////////////////////////
// async function main(){
//   const data =await createChannel()
//   const result= await queryChain(data.client,data.channel,"couchdb",'readMarble',['marble3'])
//   // await invokeChain(data.client,data.channel,data.peer,data.my_peers,"couchdb","initMarble",['marble3', 'greens','25','kk'])
//   console.log(result)
// }
//
// main()
