const e = require('connect-flash');
const express = require('express');
const asyncify = require('express-asyncify');
const router = asyncify(express.Router());


const passport = require('passport');
const user = require('./user');



router.post('/login', passport.authenticate('local', {
  failureRedirect: '/'
}), (req, res) => {
  res.redirect('/');
});


// 카카오톡 소셜 로그인
router.get('/kakao', passport.authenticate('kakao'));
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    failureRedirect: '/account/login',  // 로그인에 실패했을 경우 해당 라우터로 이동한다
}), (req, res) => { // 로그인에 성공했을 경우, 다음 라우터가 실행된다
    

  //회원정보가 존재하면 로그인
  if(req.session.user){
  
    return res.redirect("/index");
  }//회원정보가 없을 경우 소셜회원가입 폼으로 이동
  else{
    return res.redirect("/account/socialForm");
  }
  
});



router.get('/naver', passport.authenticate('naver'));

router.get(
  '/naver/callback',
  passport.authenticate('naver', {
    failureRedirect: '/account/login',  // 로그인에 실패했을 경우 해당 라우터로 이동한다
}), (req, res) => { // 로그인에 성공했을 경우, 다음 라우터가 실행된다
    

  
  //회원정보가 존재하면 로그인
  if(req.session.user){
    return res.redirect("/index");
  }//회원정보가 없을 경우 소셜회원가입 폼으로 이동
  else{
    return res.redirect("/account/socialForm");
  } 
  
  
});


router.get('/google', passport.authenticate('google',{
  scope: ['profile', 'email']
}));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/account/login',  // 로그인에 실패했을 경우 해당 라우터로 이동한다
    
}), (req, res) => { // 로그인에 성공했을 경우, 다음 라우터가 실행된다
    

  
  //회원정보가 존재하면 로그인
  if(req.session.user){
    return res.redirect("/index");
  }//회원정보가 없을 경우 소셜회원가입 폼으로 이동
  else{
    return res.redirect("/account/socialForm");
  } 
  
  
});



router.get('/apple', passport.authenticate('apple',
));

router.get(
  '/apple/callback',
  passport.authenticate('apple', {
    failureRedirect: '/account/login',  // 로그인에 실패했을 경우 해당 라우터로 이동한다
    
}), (req, res) => { // 로그인에 성공했을 경우, 다음 라우터가 실행된다
    

  
  //회원정보가 존재하면 로그인
  if(req.session.user){
    return res.redirect("/index");
  }//회원정보가 없을 경우 소셜회원가입 폼으로 이동
  else{
    return res.redirect("/account/socialForm");
  } 
  
  
});



module.exports = router;