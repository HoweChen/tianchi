let express = require("express");
let utils = require("../utils.js");
const {CHAINCODE_ID, SALT} = require("../constants.js");
let router = express.Router();

// register a new company

/**
 * @api {post} /offer/newoffer  提交金融机构报价
 * @apiDescription 提交金融机构
 * @apiName newoffer
 * @apiGroup offer
 *  @apiParam {string} id id
 * @apiParam {string} loanAmount 放款金额
 * @apiParam {string} interestRate 利率
 * @apiSampleRequest http://localhost:4000/offer/newoffer
 * @apiVersion 1.0.0
 */
router.post("/newoffer", function (req, res) {
  // let {id,loanAmount,interestRate} = req.body
  // let request= "{\"id\":\""+id+"\",\"loanAmount\":\""+loanAmount+"\",\"interestRate\":\""+interestRate+"\"}"
  let request = JSON.stringify(req.body);

  let results = utils.asyncInvoke(CHAINCODE_ID, "addOffer", [request]);
  results.then(data => {
    res.send({code: 1, payload: "Successfully register new offer"});
  })
    .catch(err => res.status(400).send({error: "create offer fail " + err}));
});

// fetchbid

/**
 * @api {get} /offer/fetchoffer/:id  查询金融机构报价
 * @apiDescription 查询金融机构
 * @apiName querryoffer
 * @apiGroup offer
 * @apiParam {string} id 金融机构报价ID
 * @apiSampleRequest http://localhost:4000/offer/fetchoffer/:id
 * @apiVersion 1.0.0
 */
router.get("/fetchoffer/:id", function (req, res) {
  const results = utils.asyncQuery(CHAINCODE_ID, "query", [req.params.id]);
  results.then(data => {
    data = JSON.parse(data);
    res.send({code: 1, payload: data});
  }).catch(err => {
    res.send({error: "doesnt exist:" + err});
  });
});

module.exports = router;
