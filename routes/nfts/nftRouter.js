const express = require('express');
const asyncify = require('express-asyncify');
const router = asyncify(express.Router());

// const router = express.Router();

const controller = require('./nftController.js');

router.use(async (req, res, next) => {
    next();
});

/***
 * NFT 발급 사전검증
 */
router.route('/pre_nft').post(
    controller.getPre_nft
);
/****
 * NFT 발급
 */
router.route('/issue_nft').post(
    controller.getIssure_nft
);
/****
 * NFT 발급
 */
/*
 router.route('/fullissue_nft').post(
    controller.getFullIssure_nft
);
*/
/***
 * 회원보유 NFT 목록 조회
 */
router.route('/list_nft').get(
    controller.getList_nft
);
/***
 * 단건 NFT 조회
 */
router.route('/detail_nft/:ntfId').get(
    controller.getDetail_nft
);



/***
 * NFT 발급 사전검증

 router.route('/BTOpre_nft').post(
    controller.getBTOPre_nft
);
/****
 * NFT 발급

router.route('/BTOissue_nft').post(
    controller.getBTOIssure_nft
);
/****
 * NFT 발급


 router.route('/fullissue_nft').post(
    controller.getFullIssure_nft
);

/***
 * 회원보유 NFT 목록 조회

router.route('/BTOlist_nft').get(
    controller.getBTOList_nft
);

 * 단건 NFT 조회
 */
router.route('/BTOdetail_nft/:ntfId').get(
    controller.getBTODetail_nft
);

module.exports = router;
