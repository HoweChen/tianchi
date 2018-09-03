let express = require("express");
let utils = require("../utils.js");
const {CHAINCODE_ID, SALT} = require("../constants.js");
let router = express.Router();

/**
 * @api {get} /queryall/:things  query all things
 * @apiDescription query all things
 * @apiName queryall
 * @apiGroup Bid
 * @apiParam {string} things objtctType:eg.Offer
 * @apiSampleRequest http://localhost:4000/queryall/:things
 * @apiVersion 1.0.0
 */
router.get("/:things", function (req, res) {
  const results = utils.asyncQuery(CHAINCODE_ID, "queryByObjectType",
    [req.params.things]);
  results.then(data => {
    data = JSON.parse(data);
    res.send({code: 1, payload: data});
  }).catch(err => {
    res.send({error: "doesnt exist:" + err});
  });
});

module.exports = router;
