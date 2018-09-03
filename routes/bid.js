let express = require("express");
let utils = require("../utils.js");
const {CHAINCODE_ID, SALT} = require("../constants.js");
let router = express.Router();

// register a new company

/**
 * @api {post} /bid/newbid  新增招标
 * @apiDescription 发起招标
 * @apiName newbid
 * @apiGroup Bid
 * @apiParam {string} id id
 * @apiParam {string} startDate 发起时间
 * @apiParam {string} endDate 结束时间
 * @apiParam {string} project 所属项目
 * @apiParam {json} [offers] 金融机构报价
 * @apiParam {string} [winnerFI] 中标银行
 * @apiParam {list} involvedFIs 参与的金融机构列表
 * @apiSampleRequest http://localhost:4000/bid/newbid
 * @apiVersion 1.0.0
 */


router.post("/newbid", function (req, res) {
  let {id, startDate, endDate, project, involvedFIs, offers, winnerFI} = req.body;
  // involvedFIs = involvedFIs.split(",").join(`\","`)
  // const request = "{\"id\":\""+id+"\",\"startDate\"\""+startDate+"\",\"endDate\":\""+endDate+"\",\"project\":\""+project+"\",\"involvedFIs\":[\""+involvedFIs+"\"],\"offers\":{},\"winnerFI\":\"\"}"
  let request = JSON.stringify(req.body);

  let results = utils.asyncInvoke(CHAINCODE_ID, "addBid", [request]);
  results.then(data => {
    res.send({code: 1, payload: "Successfully register new bid"});
  })
    .catch(err => res.status(400).send({error: "create bid fail " + err}));
});

// fetchbid
/**
 * @api {get} /bid/fetchbid/:id  获得招标
 * @apiDescription 获得招标信息
 * @apiName getbid
 * @apiGroup Bid
 * @apiParam {string} id 招标ID
 * @apiSampleRequest http://localhost:4000/bid/fetchbid/:id
 * @apiVersion 1.0.0
 */
router.get("/fetchbid/:id", function (req, res) {
  const results = utils.asyncQuery(CHAINCODE_ID, "query", [req.params.id]);
  results.then(data => {
    data = JSON.parse(data);
    res.send({code: 1, payload: data});
  }).catch(err => {
    res.send({error: "doesnt exist:" + err});
  });
});

module.exports = router;
