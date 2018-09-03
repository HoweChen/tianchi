let express = require("express");
let utils = require("../utils.js");
const {CHAINCODE_ID, SALT} = require("../constants.js");
let router = express.Router();

// register a new company

/**
 * @api {post} /finins/newfin  新增金融机构
 * @apiDescription 新增金融机构
 * @apiName newfin
 * @apiGroup fin
 * @apiParam {string} name 金融机构名称
 * @apiParam {string} address 金融机构地址
 * @apiParam {string} password 金融机构密码
 * @apiParam {list} [projectInvolvement] 参与项目
 * @apiSampleRequest http://localhost:4000/finins/newfin
 * @apiVersion 1.0.0
 */
router.post("/newfin", function (req, res) {
  const {name, password} = req.body;
  const plaintext = name + password;
  let ID = utils.encrypted(plaintext, SALT);
  // const request = "{\"id\":\""+ID+"\",\"name\":\""+name+"\",\"address\":\""+address+"\",\"projectInvolvement\":[]}"
  // const request2case="{\"id\":\"FIx1\",\"name\":\"中国银行\",\"address\":\"故宫里头\",\"projectInvolvement\":[]}"
  let request = req.body;
  delete request.password;
  request.id = ID;
  request = JSON.stringify(req.body);
  let results = utils.asyncInvoke(CHAINCODE_ID, "addFI", [request]);
  results.then(data => {
    res.send(
      {code: 1, payload: "Successfully register new finiancial institution"});
  })
    .catch(err => res.status(400)
      .send({error: "create finiancial institution fail " + err}));
});

// login finiancial institution

/**
 * @api {post} /finins/login/  登录金融机构
 * @apiDescription 登录金融机构
 * @apiName loginfin
 * @apiGroup fin
 * @apiParam {string} name 金融机构名称
 * @apiParam {string} password 金融机构密码
 * @apiSampleRequest http://localhost:4000/finins/login/
 * @apiVersion 1.0.0
 */
router.post("/login/", function (req, res) {
  const plaintext = req.body.name + req.body.password;
  let ID = utils.encrypted(plaintext, SALT);
  const results = utils.asyncQuery(CHAINCODE_ID, "query", [ID]);
  results.then(data => {
    data = JSON.parse(data);
    let decryptedPassword = utils.decrypted(ID, SALT);
    if (decryptedPassword === plaintext) {
      res.cookie("id", data.ID);
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
 * @api {get} /finins/fetchfinins/:id  查询金融机构
 * @apiDescription 查询金融机构
 * @apiName querryfin
 * @apiGroup fin
 * @apiParam {string} id 金融机构ID
 * @apiSampleRequest http://localhost:4000/finins/fetchfinins/:id
 * @apiVersion 1.0.0
 */
router.get("/fetchfinins/:id", function (req, res) {
  const results = utils.asyncQuery(CHAINCODE_ID, "query", [req.params.id]);
  results.then(data => {
    data = JSON.parse(data);
    res.send({code: 1, payload: data});
  }).catch(err => {
    res.send({error: "doesnt exist:" + err});
  });
});

module.exports = router;
