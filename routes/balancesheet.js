let express = require("express");
let utils = require("../utils.js");
const {CHAINCODE_ID, SALT} = require("../constants.js");
let router = express.Router();

/**
 * @api {post} /balancesheet/newbalancesheet  新增资产负债表
 * @apiDescription 新增资产负债表
 * @apiName newbalancesheet
 * @apiGroup balancesheet
 * @apiParam {string} [lrfs] 法人代表家族史
 * @apiParam {list} actualControllers 实际控制人列表List
 * @apiSampleRequest http://localhost:4000/balancesheet/newbalancesheet


 * @apiErrorExample {json} 错误返回:
 * {error:"create fin fail "}
 * @apiVersion 1.0.0
 */
router.post("/newbalancesheet", function (req, res) {
  let {id, lrfs, actualControllers} = req.body;
  // actualControllers = actualControllers.split(",").join(`\","`)
  // const request = "{\"id\":\""+id+"\",\"LRFS\":\"\",\"actualControllers\":[\""+actualControllers+"\"]}"
  let request = JSON.stringify(req.body);

  let results = utils.asyncInvoke(CHAINCODE_ID, "addBalanceSheet", [request]);
  results.then(data => {
    res.send({code: 1, payload: "Successfully register new balancesheet"});
  })
    .catch(
      err => res.status(400).send({error: "create balancesheet fail " + err}));
});

// fetchddr
/**
 * @api {get} /balancesheet/fetchbalancesheet/:id  获得资产负债表
 * @apiDescription 获得资产负债表信息
 * @apiName getbalancesheet
 * @apiGroup balancesheet
 * @apiParam {string} id 资产负债表id
 * @apiSampleRequest http://localhost:4000/balancesheet/fetchbalancesheet/:id
 * @apiVersion 1.0.0
 */
router.get("/fetchbalancesheet/:id", function (req, res) {
  const results = utils.asyncQuery(CHAINCODE_ID, "query", [req.params.id]);
  results.then(data => {
    data = JSON.parse(data);
    res.send({code: 1, payload: data});
  }).catch(err => {
    res.send({error: "doesnt exist:" + err});
  });
});

module.exports = router;
