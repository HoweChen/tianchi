let express = require("express");
let utils = require("../utils.js");
const {CHAINCODE_ID, SALT} = require("../constants.js");
let router = express.Router();

/**
 * @api {post} /update  更新内容
 * @apiDescription 所有字段均在此处更新
 * @apiGroup Update
 * @apiName update
 * @apiParam {string} structName 需要更新的模块名称，例如企业模块Enterprise, 金融机构模块FI等
 * @apiParam {string} id 对应要更新内容的id号
 * @apiParam {json} stringifyArgument 需要更新的内容，必须json类型，例如 {"projectInvolvement":["Px6"]}
 * @apiSampleRequest http://localhost:4000/update
 * @apiSuccess {json} json返回值 成功返回值
 * @apiVersion 1.0.0
 */
router.post("/", function (req, res) {
  let {structName, id, stringifyArgument} = req.body;
  let results = utils.asyncInvoke(CHAINCODE_ID, "update",
    [structName, id, stringifyArgument]);
  results.then(data => {
    res.send({code: 1, payload: "Successfully update"});
  })
    .catch(err => res.status(400).send({error: "update fail " + err}));
});

module.exports = router;
