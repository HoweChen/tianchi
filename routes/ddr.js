let express = require("express");
let utils = require("../utils.js");
const {CHAINCODE_ID, SALT} = require("../constants.js");
let router = express.Router();

// register a new company

/**
 * @api {post} /ddr/newddr  新增尽职报告调查
 * @apiDescription 新增尽职报告调查
 * @apiName newddr
 * @apiGroup ddr
 * @apiParam {json} [balanceSheet] 资产负债表
 * @apiParam {string} description 其他描述
 * @apiSampleRequest http://localhost:4000/ddr/newddr
 * @apiVersion 1.0.0
 */
router.post("/newddr", function (req, res) {
  const {id, balanceSheet, description} = req.body;

  // const request = "{\"id\":\""+id+"\",\"balanceSheet\":\"\",\"description\":\""+description+"\"}"
  let request = JSON.stringify(req.body);

  let results = utils.asyncInvoke(CHAINCODE_ID, "addDDR", [request]);
  results.then(data => {
    res.send({code: 1, payload: "Successfully register new ddr "});
  })
    .catch(err => res.status(400).send({error: "create ddr fail " + err}));
});

// fetchddr
/**
 * @api {get} /ddr/fetchddr/:id  查询尽职报告调查
 * @apiDescription 查询尽职报告调查
 * @apiName querryddr
 * @apiGroup ddr
 * @apiParam {string} id 资产负债ID
 * @apiSampleRequest http://localhost:4000/ddr/fetchddr/:id
 * @apiVersion 1.0.0
 */
router.get("/fetchddr/:id", function (req, res) {
  const results = utils.asyncQuery(CHAINCODE_ID, "query", [req.params.id]);
  results.then(data => {
    data = JSON.parse(data);
    res.send({code: 1, payload: data});
  }).catch(err => {
    res.send({error: "doesnt exist:" + err});
  });
});

module.exports = router;
