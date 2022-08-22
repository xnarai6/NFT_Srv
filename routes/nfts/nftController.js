const codeList = require('../../module/code.js');
const resulter = require('../../module/resulter.js');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const Web3 = require('web3')
const ethTx = require('ethereumjs-tx').Transaction
const readline = require('readline');
const Tx = require('ethereumjs-tx').Transaction;



// 메타마스크지갑
//var addressTo = '0xA3794E7260C4B203A4d4B89A23B343E851136508';
//var addressFrom = '0x4182b1C4E550A6AAC6030Ccdb599C0A6290D9F00';
//var privKey = 'cfb29a2c9d53ed440ca3e2c19257b016cc4943e74b1ec40f3f95278f8e92efe7';

var addressFrom = '0xE47DAC199E84B18E4Ccc16eF864a5549d4F43320';
var privKey = '08d3c52bcc7bfe3a57464c65f77ec75594d4229e15d60bebb9e43ec42b530d85';

var Contract_ADDRESS = "0x83ae22b8e00fb7c2c899feff462991c461f5b3a3";
//https://ropsten.etherscan.io/address/0xe2a5dc9a248df3ccd4bb87572ba556d5565b7327
var provider = 'https://ropsten.infura.io/v3/9fd7c4869a8249a995d03cc1d7d66630';
        
var GAS_PRICE = 0.00042;
var gasPrice = 0;
var web3 = new Web3(new Web3.providers.HttpProvider(provider))

var request = require('request');
const { getLogger } = require('nodemailer/lib/shared');
var options = {
    headers: { 'user-agent': 'node.js' },
};

/***
 * NFT 발급 사전검증
 * description
 *  NFT 발급전에 QRcode + GPS 정보확인
 * 
 jwt payload content
{
    "version": "001", // QRcode 버전
	"booth_no": A01,  // Booth 번호
    "booth_name":"시냅틱웨이브부스", // booth 이름
    "type": "BOOTH",  // BOOTH : 부스타입, STAGE : 행사장
    "iss": "SYNAPTICWAVE", // booth 개설사업자이름  
}
 */

exports.getPre_nft = async (req, res, next) => {
    console.log("getPre_nft");
    var cid = req.body.cid;    
    var content = req.body.content;
    var GPS_lat = req.body.lat; //37.51884700; //37.51874700;
    var GPS_lng = req.body.lng; //127.11691600; //127.11691600;
    
    var QRcode = new Object();
    QRcode.version = req.body.version;
    QRcode.gubun = req.body.gubun; //1 : booth, 2:program
	QRcode.booth_no = req.body.booth_no;
    QRcode.program_no = req.body.program_no;
    QRcode.booth_name = req.body.booth_name;
    QRcode.type = req.body.type;
    QRcode.iss = req.body.iss;
/*
    QRcode.version = "001"; // QRcode 버전
	QRcode.booth_no = "BTO-DDP-01";  // Booth 번호
    QRcode.booth_name = "시냅틱웨이브부스"; // booth 이름
    QRcode.type = "BOOTH";  // BOOTH : 부스타입, STAGE : 행사장
    QRcode.iss = "SYNAPTICWAVE"; // booth 개설사업자이름   
*/
    //0. 사전체크(QRCdoe)    

    //1. 코스의 GPS 정보를 조회함   
    var sql = "";
    if(QRcode.gubun == 1){         // booth 일 경우 
        sql = "select open_datetime, close_datetime, booth_lat as lat, booth_lng as lng from wafflestay_test.yd_booth ";        
        sql += " where booth_code= '" + QRcode.booth_no+"' ";     
    }else{ // 2 : program 일 경우
        sql = "select program_start_dttm as open_datetime, program_end_dttm as close_datetime,  program_lat as lat, program_lng as lng from wafflestay_test.yd_program ";
        sql += " where program_code = '" + QRcode.booth_no+"' ";     
    }
     
     console.log(sql);

     let [rows] = await global.mysqlPool.query(sql).catch((e) => {
         console.error(e);
     });
     var data_ret = new Object();    

     console.log(rows.length);
     if(rows.length == 0){

        data_ret.msg = "부스정보가 부정확합니다..";
        data_ret.status = "FAIL";
        return res.json(data_ret);
    
     }else{
        console.log(rows[0].lat);
        console.log(rows[0].lng);
        console.log(rows[0].open_datetime);
        console.log(rows[0].close_datetime);

        const open_datetime = new Date(rows[0].open_datetime);
        const close_datetime = new Date(rows[0].close_datetime);
        const date_now = new Date();

        //행사시간비교
        if(date_now.getTime() < open_datetime.getTime()){
            //행사전
            data_ret.msg = "행사전시간";
            data_ret.status = "FAIL";
            return res.json(data_ret);
        }else{
            if(date_now.getTime() > close_datetime.getTime()){
                //행사종료후
                data_ret.msg = "행사종료후시간";
                data_ret.status = "FAIL";
                return res.json(data_ret);
            }
        }

        //코스 위치와 모바일 GPS 위치를 비교하여 20m이내여부확인
        var booth_lat = rows[0].booth_lat;
        var booth_lng = rows[0].booth_lng;

        var distance_diff = getDistanceFromLatLonInKm(booth_lat,booth_lng,GPS_lat,GPS_lng) ;
        console.log("distance_diff:"+distance_diff);//단위 km

        if(distance_diff > 0.02){ //20m 내외에 있을 경우
            data_ret.status = "FAIL";
            return res.json(data_ret);
        }else{
            data_ret.code = 0;
            var data = new Object();
            data.ctk = "ctk"
            data_ret.status = "SUCCESS";
            data_ret.data = data;
            return res.json(data_ret);
        }
    }
};

/****
 * NFT 발급
 * 
 *"userID": "xnarai6@naver.com",
  "title": "리뷰제목이들어갑니다.",
  "body": "내용",
  "content": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",		// jwt content
  "nftcontract" : "swsedfgvsrdgfweargf3erwgfg56476ye56thrt5d6hj",  
    "booth_no": "A-001",  // Booth 번호
    "booth_name":"시냅틱웨이브부스", // booth 이름
    "img1" : "1423rfewsgfergtser5yhr6thyrthjntydjn.jpg",
    "img2" : "1423rfewsgfergtser5yhr6thyrthjntydjn.jpg",
    "lat" : 31.25466, //모바일 GPS 정보
    "lng" : 125.266165,//모바일 GPS 정보
    "create_date" : 2022-08-25 14:58:12 //요청일시
  
    "nft_type" :  "booth" //'attend','booth'
 */

exports.getIssure_nft = async (req, res, next) => {
    console.log("getIssure_nft");
    //var userID = req.query.userID;   
    
    var userID = req.body.userID;   
    console.log("userID:"+userID);
  
    var title = req.body.title;    
    var body = req.body.body;    
    var content = req.body.content;    
    var nftcontract = req.body.nftcontract; 

    var nft_type =  req.body.nft_type;   
    var booth_no =  req.body.booth_no;
    var booth_name =  req.body.booth_name;
    var img1 =  req.body.img1;
    var img2 =  req.body.img2;
    var lat =  req.body.lat;
    var lng =  req.body.lng;
    var create_date =  req.body.create_date;

    var nft_type = 1; //1: "booth", 2:stamp, 3:coupon;
    console.log("userID:"+userID);
    console.log("title:"+title);
    console.log("body:"+body);
    console.log("content:"+content);
    console.log("img1:"+img1);
    console.log("img2:"+img2);
    
   
    //1. 회원정보조회
    var aes_key = process.env["PK_ENC_AES_KEY"];

    //var sql = "SELECT * from wafflestay_test.yd_user_pk as a ";
    var sql = "SELECT  AES_DECRYPT(unhex(pk), '"+aes_key+"') as pkk, a.member_seq, a.addr from wafflestay_test.yd_user_pk as a ";
    sql +=" LEFT JOIN wafflestay_test.tbl_member as b   ";
    sql +=" ON a.member_seq = b.member_seq AND ";
    sql +=" a.member_seq = (select member_seq from wafflestay_test.tbl_member where member_email='"+userID+"')";

    console.log(sql);
    let [rowsm]  = await global.mysqlPool.query(sql).catch((e) => {
        console.error(e);
    });
    var member_seq = 0;
    var addr =""
    var user_pk =""
    if(rowsm.length ==1 ){
        member_seq = rowsm[0].member_seq; 
        addr = rowsm[0].addr;
        pk = rowsm[0].pkk;
        console.log("pkk:" + pk);
    }else{
    
        //1.1 주소생성    
        let private_key  = await createETHAddress().catch((e) => {
            console.error(e);
        });
        console.log(private_key.address);
        //console.log(private_key.privateKey);
        
        var sql = "INSERT INTO wafflestay_test.yd_user_pk (addr, pk, member_seq, insert_dttm, insert_id,update_dttm, update_id) values"
        //sql += "('"+private_key.address+"','"+private_key.privateKey+"',"+member_seq;    
        sql += "('"+private_key.address+"',HEX(AES_ENCRYPT('"+ private_key.privateKey+"','"+aes_key+"')),"+member_seq;    
        
        sql += ", SYSDATE(), '"+userID+"',SYSDATE(), '"+userID+"')";    
        console.log(sql);
        let [rows]  = await global.mysqlPool.query(sql).catch((e) => {
            console.error(e);
        });
        addr = private_key.address;
        user_pk = private_key.privateKey;  
        console.log("pkk:" + user_pk);  
    }

    //2. Review 저장
    var sql = "INSERT INTO wafflestay_test.yd_review (booth_seq, member_seq, review_content, review_img, insert_dttm, insert_id,update_dttm, update_id) values"
    sql += "((select booth_seq from wafflestay_test.yd_booth where booth_code='"+ booth_no + "'),";
    sql += "(select member_seq from wafflestay_test.tbl_member where member_email='"+ userID + "'),";
    sql += "'"+body+"','" + img1+"', SYSDATE(), '"+userID+"',SYSDATE(), '"+userID+"')";    
    console.log(sql);
    let [rows]  = await global.mysqlPool.query(sql).catch((e) => {
        console.error(e);
    });
    //console.log("rows:"+JSON.stringify(rows));
    //console.log("rows.insertId:"+rows.insertId);
    var review_insertId = rows.insertId;


    //3. 그림 경로저장
    // - 그림 1 이 없는 경우는 저장하지 않음, 그림2으 체크하지 않음 
    var pic_insertId = 0;   
    var multi_pic = 0;
    if((img1 =='null')||(img1 =='')){
        console.log("img1 null");
    }else{
        var subquery = "";
        if((img2 =='null')||(img2 =='')){
            console.log("img1 null");
        }else{
            subquery = ",((select member_seq from wafflestay_test.tbl_member where member_email='"+ userID + "'),"+ review_insertId+",'"+img2+"', SYSDATE(), '"+userID+"',SYSDATE(), '"+userID+"')";
        }
        var sql = "INSERT INTO wafflestay_test.yd_image (member_seq, review_seq, image_url, insert_dttm, insert_id,update_dttm, update_id) values"
        sql += "((select member_seq from wafflestay_test.tbl_member where member_email='"+ userID + "'),"+ review_insertId+",'"+img1+"', SYSDATE(), '"+userID+"',SYSDATE(), '"+userID+"')";    
        sql += subquery;

        console.log(sql);

        let [rows] = await global.mysqlPool.query(sql).catch((e) => {
            console.error(e);
        });
        console.log("rows:"+JSON.stringify(rows));
        console.log("rows.insertId:"+rows.insertId);
        pic_insertId = Number(rows.insertId); // img1_index, img2_index= img1_index+1  
        multi_pic = pic_insertId + 1;       
    }
   
    //4. NFT 저장
    var sql = "INSERT INTO wafflestay_test.yd_nft (member_seq, nft_type,booth_no, insert_dttm, insert_id,update_dttm, update_id) values"
    sql += "((select member_seq from wafflestay_test.tbl_member where member_email='"+ userID + "'),'"+ nft_type+"','"+booth_no+"', SYSDATE(), '"+userID+"',SYSDATE(), '"+userID+"')";
    console.log(sql);
    let [rowsn] = await global.mysqlPool.query(sql).catch((e) => {
        console.error(e);
    });
    var nft_insertId = rowsn.insertId;  

    //5. metadata.js 생성   
    var nft_info = new Object();
    nft_info.userID = userID;
    nft_info.member_seq = member_seq;
    nft_info.booth_no = booth_no;
    nft_info.img1 = img1;
    nft_info.img2 = img2;
    nft_info.lat = lat;
    nft_info.lng = lng;

    var  metadata_url = await createMetadataFile(nft_info, nft_type,nft_insertId).catch((e) => {
        console.error(e);
    });
    console.log("metadata_url:"+metadata_url);
/*
    var metadata_url = process.env["NFT_METADATA_URI"] +nft_insertId +"_metadata.js";
    //var metadata_url = "public/NFT_metadata/" +nft_insertId +"_metadata.js";
    var writeStream = fs.createWriteStream(metadata_url);
    var metdata_temp = new Object();
    metdata_temp.nft_type = 1;
    metdata_temp.nft_version = "0.1";
    metdata_temp.userID = userID;
    metdata_temp.member_seq = member_seq;
    var property = new Object();
    property.booth_no = booth_no;    
    property.img1 = img1;
    property.img2 = img2;
    property.lat = lat;
    property.lng = lng;        
    metdata_temp.property = property;
    writeStream.write(JSON.stringify(metdata_temp));    
    writeStream.end();
*/

    //2. NFT 발행    
    var url = process.env["NFT_METATDATA_REPOSITORY"] + "/NFT_metadata/14_metadata.js";
    let ret = await mintNFT(metadata_url, addr,user_pk).catch((e) => {
        console.error(e);
    });
    var hashid = ret.data;


    //3. NFT DB 업데이트
    //var sql = "UPDATE wafflestay_test.yd_nft SET nft_value = '"+JSON.stringify(metdata_temp)+"', nft_hashid = '"+hashid+"'";
    var sql = "UPDATE wafflestay_test.yd_nft SET nft_value = '"+metadata_url+"', nft_hashid = '"+hashid+"'";
    
    sql += "where nft_seq="+nft_insertId;
    console.log(sql);
    let [rows1] = await global.mysqlPool.query(sql).catch((e) => {
        console.error(e);
    });
    // 그림 DB 업데이트
    var sql = "UPDATE wafflestay_test.yd_image SET nft_seq = "+nft_insertId
    sql += " where review_seq="+ review_insertId;
    
    console.log(sql);
    let [rows5] = await global.mysqlPool.query(sql).catch((e) => {
        console.error(e);
    });
    //Review DB 업데이트
    var sql = "UPDATE wafflestay_test.yd_review SET nft_seq = "+nft_insertId
    sql += " where review_seq="+review_insertId;
   
    console.log(sql);
    let [rows6] = await global.mysqlPool.query(sql).catch((e) => {
        console.error(e);
    });    
 
    //4. 응답
    var ret_data = new Object();
    ret_data.code = 0;
    ret_data.msg ="정상발급";
    ret_data.status = "SUCCESS";
    var data = new Object();
    data.nftid = nft_insertId;
    data.nfthashid = hashid;
    ret_data.data = data;

    return res.json(ret_data);    

};

/***
 * 회원보유 NFT 목록 조회
 * 
 * param
 * - "userID": "xnarai6@naver.com",
 */

exports.getList_nft = async (req, res, next) => {
    console.log("getList_nft");

    var userID  = req.query.userId ;    
    console.log("userID:"+userID);

    var sql = "SELECT a.nft_seq as nftid, a.nft_type,a.booth_no as booth_no,  ";
    sql +=" b.booth_title as booth_name,b.booth_lat as lat, b.booth_lng as lng,a.nft_hashid, a.insert_dttm as create_date ";
    sql +=" from wafflestay_test.yd_nft as a ";
    sql +=" LEFT JOIN wafflestay_test.yd_booth as b   ";
    sql +=" ON a.booth_no = b.booth_code ";
    sql +=" AND a.member_seq = (select member_seq from wafflestay_test.tbl_member where member_email='"+userID+"') ";
    sql +=" WHERE a.nft_hashid <> '0'";

    console.log(sql);
    let [rowsm]  = await global.mysqlPool.query(sql).catch((e) => {
        console.error(e);
    });
    var ret_data = new Object();
    ret_data.userID = userID;
    ret_data.nftcnt = rowsm.length;
    ret_data.nftdata =  rowsm;

    //console.log(rowsm);

    if(rowsm.length > 0 ){
        
        console.log(rowsm[0].member_seq);
        ret_data.status = "SUCCESS";
    }else{
        ret_data.status = "FAIL";
    }
    return res.json(ret_data);
};


/***
 * 단건 NFT 조회
 */

exports.getDetail_nft = async (req, res, next) => {
    console.log("getDetail_nft");
    let { ntfId } = req.params;  
    console.log(ntfId);

    console.log("ntfId:"+ntfId);

    var sql = "SELECT a.nft_seq as nftid, a.nft_type,a.booth_no as booth_no,  ";
    sql +=" b.booth_title as booth_name,b.booth_lat as lat, b.booth_lng as lng,a.nft_hashid, a.insert_dttm as create_date ";
    sql +=" from wafflestay_test.yd_nft as a ";
    sql +=" LEFT JOIN wafflestay_test.yd_booth as b   ";
    sql +=" ON a.booth_no = b.booth_code ";
    sql +=" where a.nft_seq = "+ntfId+" ";    

    console.log(sql);
    let [rowsm]  = await global.mysqlPool.query(sql).catch((e) => {
        console.error(e);
    });
    var ret_data = new Object();        
    ret_data =  rowsm[0];

    //console.log(rowsm);

    if(rowsm.length > 0 ){
        
        console.log(rowsm[0].member_seq);
        ret_data.status = "SUCCESS";
    }else{
        ret_data.status = "FAIL";
    }
    return res.json(ret_data);
};

/***
 * NFT 발급
 */
async function mintNFT(uri, addressTo) {
    // Return new promise
    return new Promise(function (resolve, reject) {
      // Do async job
       // web3 initialization - must point to the HTTP JSON-RPC endpoint
        //var provider = 'https://rinkeby.infura.io/v3/9fd7c4869a8249a995d03cc1d7d66630';

        //console.log("******************************************");
        //console.log("Using provider : " + provider);
        //console.log("******************************************");        

        web3.transactionConfirmationBlocks = 1;

        var data = new Object ();
        data.token_address = Contract_ADDRESS;
        data.user_address = addressFrom;
        data.dest_address = addressTo;
        data.amount = 0.01;
        data.private_key = privKey;

        //const contractABI = JSON.parse(fs.readFileSync('BNFT.abi', 'utf-8'));
        //var jsonfile = "static/smartcontract/BNFT.js";
        var jsonfile = "C://waffle_dev/NFT_Srv/public/smartcontract/BNFT.abi";
        //var jsonfile = process.env["NET_ABI_URI"] +"/BNFT.abi";
        //var jsonfile = process.env["NET_ABI_URI"] +"/BNFT.js";


        const contractABI = JSON.parse(fs.readFileSync(jsonfile, 'utf-8'));
        
        var response = {};
        var token_Address = data.token_address
        
        var userAddress = data.user_address;
        var destAddress = data.dest_address
        var amount = data.amount
        //var tokenContract = new web3.eth.Contract(JSON.parse(token_ABI), token_Address);
        var tokenContract = new web3.eth.Contract(contractABI, token_Address);

        var private_key = Buffer.from(privKey.toUpperCase(), 'hex')
        var nonce = ''
        let gasPriceForTransfer = GAS_PRICE

        console.log("userAddress:"+userAddress);
        console.log("addressTo:"+addressTo);

        web3.eth.getTransactionCount(userAddress).then((result) => {
            console.log("getTransactionCount: ", result)
            getPriceOfGasFun((gas_result) => {
                if (gas_result.status == 1) {
                    gasPrice = gas_result.gasPrice

                    var gasLimit = Math.floor(gasPriceForTransfer * gasPrice);
                    //console.log("The gasLimit is 1: ", gasLimit)
                    var gasPriceHex = web3.utils.toHex(gasPrice);
                    //var gasLimitHex = web3.utils.toHex(gasLimit);
                    var gasLimitHex = web3.utils.toHex(420000);
                    
                    nonce = web3.utils.toHex(result)                
                                    
                    console.log("uri:"+uri);

                    let func_contract = tokenContract.methods.safeMint(addressTo, uri);

                    var rawTx = {
                        nonce: nonce,
                        gasPrice: gasPriceHex,
                        gasLimit: gasLimitHex,
                        to: Contract_ADDRESS,
                        data: func_contract.encodeABI(),
                        chainId: 3,
                        from: userAddress
                    }
                
                    var tx = new Tx(rawTx ,{ chain: 'ropsten' })
                    tx.sign(private_key)
                    
                    var serializedTx = tx.serialize()
                    //console.log("serializedTx:"+serializedTx);  
                    var rawwww = '0x' + serializedTx.toString('hex')

                    web3.eth.sendSignedTransaction(rawwww)
                        .on('transactionHash', function (hash) {
                            response.message = "Successfully send"
                            response.status = 1
                            response.data = hash
                            cb(response)
                            resolve(response);
                        })
                        .on('error', function (error) {
                            response.message = "Something went wrong"
                            response.status = 0
                            response.data = error
                            cb(response)
                            reject(response);
                        })
                    
                        
                } else {
                    response.message = "Error in get gas price"
                    response.status = 0
                    response.data = gas_result.gasPrice
                    cb(response);
                    reject(response);
                }
            })
    
        }).catch(err => {
            console.log("error in get transaction count : ", err)
            response.message = "Error in get transaction"
            response.status = 0
            response.data = []
            cb(response)
            reject(response);
        });

       
});
/*****
 * NFT metadat file 생성
 */
}
async function createMetadataFile(nft_info, nft_type,nft_insertId) {

    var metadata_url = process.env["NFT_METADATA_URI"] +nft_insertId +"_metadata.js";
    //var metadata_url = "public/NFT_metadata/" +nft_insertId +"_metadata.js";
    var writeStream = fs.createWriteStream(metadata_url);
    var metdata_temp = new Object();
    var property = new Object();
       
    var create_date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');     // delete the dot and everything after

    if(nft_type == 1){    // 행사 NFT
        metdata_temp.nft_type = nft_type;
        metdata_temp.nft_version = "0.1";
        metdata_temp.userID = nft_info.userID;
        metdata_temp.member_seq = nft_info.member_seq;
        metdata_temp.create_date = create_date;
        
        property.booth_no = nft_info.booth_no;    
        property.img1 = nft_info.img1;
        property.img2 = nft_info.img2;
        property.lat = nft_info.lat;
        property.lng = nft_info.lng;        
        metdata_temp.property = property;
    }else if(nft_type == 2){  // 스탭프 NFT
        metdata_temp.nft_type = nft_type;
        metdata_temp.nft_version = "0.1";
        metdata_temp.userID = nft_info.userID;
        metdata_temp.member_seq = nft_info.member_seq;
        metdata_temp.create_date = create_date;
        
        property.course_no ="BTO-DDP-01",    
        property.qr_point="BTO-DDP-01-01",        
        property.img1 = nft_info.img1;
        property.img2 = nft_info.img2;
        property.lat = nft_info.lat;
        property.lng = nft_info.lng;          
        metdata_temp.property = property;

    }else if(nft_type == 3){  // 쿠폰 NFT
        metdata_temp.nft_type = nft_type;
        metdata_temp.nft_version = "0.1";
        metdata_temp.creator_userID = nft_info.userID;
        metdata_temp.creator_member_seq = nft_info.member_seq;
        metdata_temp.coupon_no = nft_info.coupon_no;
        metdata_temp.create_date = create_date;
        
        property.iss_name = nft_info.iss_name; //"YoungAndFuture";    
        property.iss_code = nft_info.iss_code; //"001";
        property.reason = nft_info.reason; //"monthlycoupon";
        property.amount = nft_info.amount; //10000;
        property.str_date = nft_info.str_date; //"2022-08-20 00:00:00";        
        property.exp_date = nft_info.exp_date; //"2023-08-20 00:00:00";        
        
        metdata_temp.property = property;

    }
    writeStream.write(JSON.stringify(metdata_temp));    
    writeStream.end();
    return metadata_url;
}
/***
 * 이더리움 주소생성
 */
 async function createETHAddress() {
    // Return new promise
    return new Promise(function (resolve, reject) {
        var response = {};
        //const web3 = new Web3API(new Web3API.providers.HttpProvider('https://mainnet.infura.io'));
        let account = web3.eth.accounts.create(web3.utils.randomHex(32));
        let wallet = web3.eth.accounts.wallet.add(account);
        let keystore = wallet.encrypt(web3.utils.randomHex(32));
        console.log("address:" + account.address);
        console.log("privateKey:"+ account.privateKey);  
        response.address = account.address;
        response.privateKey = account.privateKey;
        resolve(response);            
    });
}

function getPriceOfGasFun(cb) {
    if (gasPrice == 0) {
        web3.eth.getGasPrice((err, gasPrice) => {
            var data = {
                status: 1,
                gasPrice: gasPrice
            }
            return cb(data)            
        }).catch((error) => {
            var data = {
                status: 0,
                gasPrice: error
            }
            return cb(data)
        })
    } else {
        var data = {
            status: 1,
            gasPrice: gasPrice
        }
        return cb(data)
    }
}
function cb(data){
    console.log(data)

}
/***
 * 2지점간의 거리를 계산
 */
function getDistanceFromLatLonInKm(lat1,lng1,lat2,lng2) {
    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lng2-lng1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}