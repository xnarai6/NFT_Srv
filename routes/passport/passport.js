const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy; // 이 부분 추가
const KakaoStrategy = require('passport-kakao').Strategy
const NaverStrategy = require('passport-naver').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple');

const Users = require('./user');

var request = require('request');



module.exports = () => {
  passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨

    
    done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
  });

  passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
    done(null, user); // 여기의 user가 req.user가 됨
  });

  passport.use(new LocalStrategy({ // local 전략을 세움
    usernameField: 'id',
    passwordField: 'pw',
    session: true, // 세션에 저장 여부
    passReqToCallback: false,
  }, (id, password, done) => {
    Users.findOne({ id: id }, (findError, user) => {
      if (findError) return done(findError); // 서버 에러 처리
      if (!user) return done(null, false, { message: '존재하지 않는 아이디입니다' }); // 임의 에러 처리
      return user.comparePassword(password, (passError, isMatch) => {
        if (isMatch) {
          done(null, user); // 검증 성공
        }
        done(null, false, { message: '비밀번호가 틀렸습니다' }); // 임의 에러 처리
      });
    });
  }));


 

  passport.use('kakao', new KakaoStrategy({
    clientID: '38c2497b2e7a37b981853de07ac3fbeb',
    //callbackURL: 'http://localhost:3003/passport/kakao/callback',     // 위에서 설정한 Redirect URI
    callbackURL:  process.env["WAFFLE_SNS_LGOIN_CALLBACK_URL"] + '/kakao/callback',
    session: true, // 세션에 저장 여부
    passReqToCallback: true, //req 생성 여부
    

  }, async (req,accessToken, refreshToken, profile, done) => {
    
    let email = profile._json.kakao_account.email;
    let has_email = profile._json.kakao_account.has_email;
    let sns_id = profile.id;
    

    let data = {
      email:email,
      sns_id: sns_id,
      login_type: "KAKAO",
      fcm_token: ""
    }
    
    let url = process.env.GIFT_WAFFLE_LOGIN_API_URL+'/members/login';
    
    // console.log(url);
    request(
      {
          url: url,
          method: 'POST',
          json: data
      },
      function (error, response, body) {
        console.log(body);

        //세션에 로그인 정보 넣기
        if (body.data) {
          
          req.session.user = {
            id: email,
            memberid: body.data.member_id,
            name: 'UsersNames!!!!!',
            tcode: '',
            tmarket: '',
            tstatus: '',
            useq: 0,
            uname: '',
            uphone: '',
            pname: '',
            pprice: '',
            hid: 0,
            hname: '',
            rno: '',
            rname: '',
            pstart: '',
            pend: '',
            pstay: 0,
            authorized: true,
            token: body.data.access_token,
          };
          
          req.session.isLogined = true;
          //회원정보가 존재하는 경우엔 세션에 회원정보 저장
          return req.session.save(function () {

            done(null, data);
              
          });

        }
        //회원정보가 없을경우 소셜 회원가입 창으로 이동
        else{
          return done(null, data ); 
        }
      }
  );
}))


passport.use(new NaverStrategy({
  clientID: "5atVtqbuBfl2_uhTYaUp",
  clientSecret:"4XVdOvnM12",
 // callbackURL: 'http://localhost:3003/passport/naver/callback',
  callbackURL:  process.env["WAFFLE_SNS_LGOIN_CALLBACK_URL"] + '/naver/callback',
  
  session: true, // 세션에 저장 여부
  passReqToCallback: true, //req 생성 여부
    
},
function(req, accessToken, refreshToken, profile, done) {
  // 이 부분은 자신의 개발환경에 맞게 설정하시면 됩니다.

  // console.log(req, accessToken, refreshToken, profile)

  let sns_id = profile._json.id;
  let email = profile._json.email;

  let data = {
    email:email,
    sns_id: sns_id,
    login_type: "NAVER",
    fcm_token: ""
  }



  let url = process.env.GIFT_WAFFLE_LOGIN_API_URL+'/members/login';
    
  // console.log(url);
  request(
    {
        url: url,
        method: 'POST',
        json: data
    },
    function (error, response, body) {
        console.log(body);

        //세션에 로그인 정보 넣기
        if (body.data) {
          
          req.session.user = {
            id: email,
            memberid: body.data.member_id,
            name: 'UsersNames!!!!!',
            tcode: '',
            tmarket: '',
            tstatus: '',
            useq: 0,
            uname: '',
            uphone: '',
            pname: '',
            pprice: '',
            hid: 0,
            hname: '',
            rno: '',
            rname: '',
            pstart: '',
            pend: '',
            pstay: 0,
            authorized: true,
            token: body.data.access_token,
          };
          // console.log(req.session);
          req.session.isLogined = true;

          //회원정보가 존재하는 경우엔 세션에 회원정보 저장
          return req.session.save(function () {

            done(null, data);
              
          });

        }
        //회원정보가 없을경우 소셜 회원가입 창으로 이동
        else{
          return done(null, data ); 
        }
        
    
        
    }
  );


}
));




passport.use(new GoogleStrategy({
  clientID: "872916299020-2alcsher550go44k3p6v5hi9vn9lugcc.apps.googleusercontent.com",
  clientSecret:"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",
  //callbackURL: 'http://localhost:3003/passport/google/callback',
  callbackURL:  process.env["WAFFLE_SNS_LGOIN_CALLBACK_URL"] + '/google/callback', 

  session: true, // 세션에 저장 여부
  passReqToCallback: true, //req 생성 여부
    
},
function(req, accessToken, refreshToken, profile, done) {
  // 이 부분은 자신의 개발환경에 맞게 설정하시면 됩니다.

  
  let sns_id = profile.id;
  let email = profile._json.email;

  let data = {
    email:email,
    sns_id: sns_id,
    login_type: "GOOGLE",
    fcm_token: ""
  }


  // console.log(profile)
  // console.log(data)
  
  let url = process.env.GIFT_WAFFLE_LOGIN_API_URL+'/members/login';
    
  // console.log(url);
  request(
    {
        url: url,
        method: 'POST',
        json: data
    },
    function (error, response, body) {
        console.log(body);

        //세션에 로그인 정보 넣기
        if (body.data) {
          
          req.session.user = {
            id: email,
            memberid: body.data.member_id,
            name: 'UsersNames!!!!!',
            tcode: '',
            tmarket: '',
            tstatus: '',
            useq: 0,
            uname: '',
            uphone: '',
            pname: '',
            pprice: '',
            hid: 0,
            hname: '',
            rno: '',
            rname: '',
            pstart: '',
            pend: '',
            pstay: 0,
            authorized: true,
            token: body.data.access_token,
          };
          // console.log(req.session);
          req.session.isLogined = true;

          //회원정보가 존재하는 경우엔 세션에 회원정보 저장
          return req.session.save(function () {

            done(null, data);
              
          });

        }
        //회원정보가 없을경우 소셜 회원가입 창으로 이동
        else{
          return done(null, data ); 
        }
        
    
        
    }
  );


}
));


passport.use(new AppleStrategy({

  clientID: "inc.swave.wafflestay" ,
    teamID: "HP3DPBB8GF",
    //callbackURL: `https://test-gift.wafflestay.kr/passport/apple/callback`,
    callbackURL:  process.env["WAFFLE_SNS_LGOIN_CALLBACK_URL"] + '/apple/callback',
    keyID: "72TKMFQQ7C",
    privateKeyLocation: './AuthKey_72TKMFQQ7C.p8',
    // privateKeyString: '-----BEGIN PRIVATE KEY--
  session: true, // 세션에 저장 여부
  passReqToCallback: true, //req 생성 여부
  
},
function(req, accessToken, refreshToken, profile, done) {
  // 이 부분은 자신의 개발환경에 맞게 설정하시면 됩니다.

  
  let sns_id = profile.id;
  let email = profile._json.email;

  let data = {
    email:email,
    sns_id: sns_id,
    login_type: "APPLE",
    fcm_token: ""
  }


  // console.log(profile)
  // console.log(data)
  
  let url = process.env.GIFT_WAFFLE_LOGIN_API_URL+'/members/login';
    
  // console.log(url);
  request(
    {
        url: url,
        method: 'POST',
        json: data
    },
    function (error, response, body) {
        console.log(body);

        //세션에 로그인 정보 넣기
        if (body.data) {
          
          req.session.user = {
            id: email,
            memberid: body.data.member_id,
            name: 'UsersNames!!!!!',
            tcode: '',
            tmarket: '',
            tstatus: '',
            useq: 0,
            uname: '',
            uphone: '',
            pname: '',
            pprice: '',
            hid: 0,
            hname: '',
            rno: '',
            rname: '',
            pstart: '',
            pend: '',
            pstay: 0,
            authorized: true,
            token: body.data.access_token,
          };
          // console.log(req.session);
          req.session.isLogined = true;

          //회원정보가 존재하는 경우엔 세션에 회원정보 저장
          return req.session.save(function () {

            done(null, data);
              
          });

        }
        //회원정보가 없을경우 소셜 회원가입 창으로 이동
        else{
          return done(null, data ); 
        }
        
    
        
    }
  );


}
));





};