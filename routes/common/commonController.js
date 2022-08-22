const { default: axios } = require("axios");
var express = require("express");
const { restart } = require("nodemon");
var app = express();
const mysql = require("mysql2");

const pool = mysql
  .createPool({
    host: process.env.NFT_DB_HOST,
    port: process.env.NFT_DB_PORT,
    user: process.env.NFT_DB_USER,
    password: process.env.NFT_DB_PASSWORD,
    database: process.env.NFT_DB_DATABASE,
  })
  .promise();

var request = require("request");
var options = {
  headers: { "user-agent": "node.js" },
};

function getType(target) {
  return Object.prototype.toString.call(target).slice(8, -1);
}


function jsonToMap(jsonString) {
  //var jsonObject = JSON.parse(jsonString);
  var dataMap = new Map(Object.entries(jsonString));
  var keyMap = new Map();
  var resultMap = new Map();
  for (const key of dataMap.keys()) {
    //console.log(key);
    keyMap = new Map(Object.entries(dataMap.get(key)));
    resultMap.set(key, keyMap);
    //console.log(keyMap.get("name"));
  }
  // console.log("done!");
  return resultMap;
}

/***
 * 검색어 : 호텔검색창
 */
exports.getKeywordsearch = async (req, res, next) => {
  
   console.log("getKeywordsearch start");
   var keyword = req.query.keyword;   
   console.log("keyword:"+keyword);
   //https://search-api.wafflestay.kr/search?keyword=%EC%86%8D%EC%B4%88&size=30&rafter=-1&hafter=-1&pafter=-1

  var myaddr = "https://search-api.wafflestay.kr/search?keyword="+encodeURI(keyword)+"&size=30&rafter=-1&hafter=-1&pafter=-1";
  console.log(myaddr);

  let body = await sendURL(myaddr, options).catch((err) =>
    console.log(err)
  );
 
  var jsonObject = JSON.parse(body);
  console.log("body.code:"+jsonObject.code);
  console.log("body.data:"+jsonObject.data);

  //console.log("  JSON.stringify(jsonObject.data):"+  JSON.stringify(jsonObject.data));
  //console.log("property_id:"+JSON.stringify((jsonObject.data)[0]));
  //console.log("name:"+((jsonObject.data)[0]).name);

  if(jsonObject.code == "0"){
    //정상일 경우
    return res.json(jsonObject.data);
  }else{
    //비정상일 경우 
    //var retObject = new Object();    
    return res.json(jsonObject.data);
  }
 };

/****
 * REST 통신
 */
async function sendURL(myaddr, options) {
  // Return new promise
  return new Promise(function (resolve, reject) {
    // Do async job
    request(myaddr, options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}
