let express = require("express");
let utils = require("../utils.js");
const {CHAINCODE_ID, SALT} = require("../constants.js");
let router = express.Router();

// register a new company

/**
 * @api {post} /project/newproject  新增项目
 * @apiDescription 新增项目
 * @apiName newproject
 * @apiGroup project
 * @apiParam {string} id 项目ID
 * @apiParam {string} name 项目名称
 * @apiParam {string} description 项目简介
 * @apiParam {list} coreFirm 核心企业列表
 * @apiParam {list} [updownFirm] 上下游企业列表
 * @apiParam {json} [progress] 项目进展
 * @apiParam {string} [bidInfo]  招标信息
 * @apiParam {string} [winnerFI] 中标金融机构
 * @apiParam {json} [capitalFlow] 资金流信息（时间+信息）
 * @apiParam {json} [cargoFlow] 货物流信息（时间+信息）
 * @apiParam {string} [creditLimit] 授信额度
 * @apiParam {string} [usedLimit] 已用额度
 * @apiParam {string} [ddr] 中标银行
 * @apiSampleRequest http://localhost:4000/project/newproject
 * @apiVersion 1.0.0

 */
router.post("/newproject", function (req, res) {
  // const {id,name,description,ddr,coreFirm,updownFirm,progress,bidInfo,winnerFI,creditLimit,usedLimit,capitalFlow,cargoFlow} = req.body
  // const request="{\"id\":\""+id+"\",\"name\":\""+name+"\",\"description\":\""+description+"\",\"ddr\":\"\",\"coreFirm\":[],\"updownFirm\":[],\"progress\":{},\"bidInfo\":\"\",\"winnerFI\":\"\",\"creditLimit\":\"0\",\"usedLimit\":\"0\",\"capitalFlow\":{},\"cargoFlow\":{}}"
  let request = JSON.stringify(req.body);
  let results = utils.asyncInvoke(CHAINCODE_ID, "addProject", [request]);
  results.then(data => {
    res.send(
      {code: 1, payload: "Successfully register new finiancial institution"});
  })
    .catch(err => res.status(400)
      .send({error: "create finiancial institution fail " + err}));
});

// login finiancial institution

/**
 * @api {get} /project/fetchproject/:id  查询项目
 * @apiDescription 查询项目
 * @apiName querryproject
 * @apiGroup project
 * @apiParam {string} id 项目id
 * @apiSampleRequest http://localhost:4000/project/fetchproject/:id
 * @apiVersion 1.0.0
 */


router.get("/fetchproject/:id", function (req, res) {
  const results = utils.asyncQuery(CHAINCODE_ID, "query", [req.params.id]);
  results.then(data => {
    data = JSON.parse(data);
    res.send({code: 1, payload: data});
  }).catch(err => {
    res.send({error: "doesnt exist:" + err});
  });
});

module.exports = router;
