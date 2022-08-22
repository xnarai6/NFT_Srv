/**
 * 숫자 길이 제한
 * maxLength="5"
 * oninput="numberMaxLength(this)"
 */
function numberMaxLength(e) {
    if (e.value.length > e.maxLength) {
        e.value = e.value.slice(0, e.maxLength);
    }
}

/**
 * 숫자만 입력 가능
 * onkeyup="inputNumber(this)"
 */
function inputNumber(obj) {
    const value = obj.value;
    const pattern = /[^(0-9)]/gi;
    if (pattern.test(value)) {
        obj.value = value.replace(pattern, '');
    }
}

/**
 * 한글, 영문만 입력 가능
 * onkeyup="inputKorAndEng(this)"
 */
function inputKorAndEng(obj) {
    const value = obj.value;
    const pattern = /[^ㄱ-힣a-zA-Z0-9]/gi;
    if (pattern.test(value)) {
        obj.value = value.replace(pattern, '');
    }
}

/**
 * [Deprecated] 이메일
 * onkeyup="inputEmail(this)"
 */
function inputEmail(obj) {
    const value = obj.value;
    const pattern = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    if (pattern.test(value)) {
        obj.value = value.replace(pattern, '');
    }
}

/**
 * 문자열 예외처리
 */
function isEmpty(value) {
    return value == undefined || value === '';
}

/**
 * 경고 알림창
 */
function alertWarning(title) {
    Swal.fire({
        title: title,
        icon: 'warning',
        confirmButtonText: '확인',
    });
}

function alertSuccess(title) {
    Swal.fire({
        title: title,
        icon: 'success',
        confirmButtonText: '확인',
    });
}

function alertError(title) {
    Swal.fire({
        title: title,
        icon: 'error',
        buttonsStyling: false,
        confirmButtonText: '확인',
        customClass: {
            confirmButton: 'btn btn-danger',
        },
    });
}

function setCookie(cookie_name, value, days) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + days);
    var cookie_value = escape(value) + (days == null ? '' : '; expires=' + exdate.toUTCString());
    document.cookie = cookie_name + '=' + cookie_value + ';path=/';
}

function getCookie(cookie_name) {
    var x, y;
    var val = document.cookie.split(';');

    for (var i = 0; i < val.length; i++) {
        x = val[i].substr(0, val[i].indexOf('='));
        y = val[i].substr(val[i].indexOf('=') + 1);
        x = x.replace(/^\s+|\s+$/g, ''); // 앞과 뒤의 공백 제거하기
        if (x == cookie_name) {
            return unescape(y); // unescape로 디코딩 후 값 리턴
        }
    }
}

/**
 * 오늘 날짜 가져오기
 * separator: 구분자(ex: - => 2022-04-08)
 */
function getTodayDate(separator) {
    var rsp = separator ? separator : '';

    var date = new Date();
    var year = date.getFullYear();
    var month = ('00' + (date.getMonth() + 1)).slice(-2);
    var day = ('00' + date.getDate()).slice(-2);

    var today = `${year}${rsp}${month}${rsp}${day}`;

    return today;
}

/**
 * async ajax
 *
 * required: asyncAjaxError function
 */
async function asyncAjax(contentType, method, url, data, error) {
    let defaultObject = { type: method, url: url };
    let addObject = {};

    if (contentType == 'application/json') addObject = { contentType: contentType, data: JSON.stringify(data) };
    else if (contentType == 'multipart/form-data') addObject = { encType: contentType, processData: false, contentType: false, cache: false, data: data };
    else addObject = { data: data };


    //에러처리 필요
    let result;
    if (error) result = await $.ajax(Object.assign(defaultObject, addObject));
    else result = await $.ajax(Object.assign(defaultObject, addObject));

    return result ? result : null;
}

/**
 * async ajax error alert
 *
 * required: sweetalert2
 */
function asyncAjaxError(error) {
    Swal.fire({
        icon: 'error',
        title: `ERROR - ${error.responseJSON['code']}`,
        text: error.responseJSON['message'],
    });
}

function sideMenuActive() {
    let pathName = window.location.pathname;

    $('#kt_aside_menu')
        .find('a.menu-link')
        .each(function (i, e) {
            if (pathName.indexOf($(e).data('url')) != -1) {
                $(e).parent('li.menu-item').addClass('menu-item-active');
                $(e).parent('li.menu-item').parent('ul.menu-subnav').parent('div.menu-submenu').parent('li.menu-item-submenu').addClass('menu-item-open');
                return;
            }
        });
}

sideMenuActive();
