let express = require("express");
let utils = require("../utils.js");
const {CHAINCODE_ID, SALT} = require("../constants.js");
let router = express.Router();

// register a new company

/**
 * @api {post} /enterprises/newenterprise   新增企业
 * @apiDescription 新增一个企业
 * @apiName addCompany
 * @apiGroup Compangy
 * @apiParam {string} username 用户名
 * @apiParam {string} password 用户密码
 * @apiParam {string} name 公司名称
 * @apiParam {string} legalPersonality 法人代表
 * @apiParam {string} registeredCaptial 注册资本
 * @apiParam {string} dateOfEstablishment 成立日期
 * @apiParam {string} businessScope 营业范围
 * @apiParam {string} basicFIName 基本开户银行名称
 * @apiParam {string} basicFIAccount 基本开户银行账号
 * @apiParam {list} [projectInvolvement] 参与项目

 * @apiSampleRequest http://localhost:4000/enterprises/newenterprise
 * @apiVersion 1.0.0
 */
router.post("/newenterprise", function (req, res) {
  const {username, password, name, legalPersonality, registeredCaptial, dateOfEstablishment, businessScope, basicFIName, basicFIAccount, projectInvolvement} = req.body;
  const plaintext = username + password;
  let ID = utils.encrypted(plaintext, SALT);
  // const request ="{\"id\":\""+ID+"\",\"name\":\""+name+"\",\"legalPersonality\":\""+legalPersonality+"\",\"registeredCapital\":\""+registeredCaptial+"\",\"dateOfEstablishment\":\""+dateOfEstablishment+"\",\"businessScope\":\""+businessScope+"\",\"basicFIName\":\""+basicFIName+"\",\"basicFIAccount\":\""+basicFIAccount+"\",\"projectInvolvement\":[]}"
  let request = req.body;
  delete request.username;
  delete request.password;
  request.id = ID;
  request = JSON.stringify(req.body);
  let results = utils.asyncInvoke(CHAINCODE_ID, "addEnterprise", [request]);
  results.then(data => {
    res.send({code: 1, payload: "Successfully register new enterprise"});
  })
    .catch(err => res.status(400).send({error: "create company fail " + err}));
});

/**
 * @api {post} /login  企业登录
 * @apiDescription 企业登录
 * @apiName login
 * @apiGroup Compangy
 * @apiParam {string} username 企业名称
 * @apiParam {string} password 企业密码
 * @apiSampleRequest http://localhost:4000/enterprises/login
 * @apiSuccess {json} result 返回当前企业所有数据.
 * @apiSuccessExample {json} 返回样例:
 * {
 *   "code": 1,
 *   "payload": {
 *       "basicFIAccount": "10086",
 *       "basicFIName": "china bank",
 *       "businessScope": "game",
 *        "dateOfEstablishment": "2018.08.20",
 *       "id": "049f36a18084c13ea375dd7979565584",
 *       "legalPersonality": "MAhuateng",
 *       "name": "company1",
 *       "projectInvolvement": [],
 *       "registeredCapital": "10"
 *  }
 * @apiVersion 1.0.0
 */
router.post("/login/", function (req, res) {
  const plaintext = req.body.username + req.body.password;
  let ID = utils.encrypted(plaintext, SALT);
  const results = utils.asyncQuery(CHAINCODE_ID, "query", [ID]);
  // const results= asyncQuery(CHAINCODE_ID,'readMarble',[ID])
  results.then(data => {
    data = JSON.parse(data);
    let decryptedPassword = utils.decrypted(ID, SALT);
    if (decryptedPassword === plaintext) {
      res.cookie("id", ID);
      res.send({code: 1, payload: data});
    }
    else {
      res.send({error: "password/name is incorrect"});
    }
  })
    .catch(err => res.send({
      error: err,
    }));
});

// query company

/**
 * @api {get} /enterprises/fetchcompany/:id  企业查询
 * @apiDescription 企业查询
 * @apiName querryCompany
 * @apiGroup Compangy
 * @apiParam {string} id 企业ID
 * @apiSampleRequest http://localhost:4000/enterprises/fetchcompany/:id
 * @apiVersion 1.0.0
 */
router.get("/fetchcompany/:id", function (req, res) {
  const results = utils.asyncQuery(CHAINCODE_ID, "query", [req.params.id]);
  results.then(data => {
    data = JSON.parse(data);
    res.send({code: 1, payload: data});
  }).catch(err => {
    res.send({error: "doesnt exist:" + err});
  });
});

module.exports = router;
