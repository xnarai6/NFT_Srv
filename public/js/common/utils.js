/*
 * 공백을 지우고 싶을 경우, 아래의 명령어를 이용하면 됩니다.
 * strValue.replaceAll(String.fromCharCode(parseInt("00".substr(0, 2), 16)),'');
 */

function btn1Clicked() {
    const hexValue = $('#input-1-hex').val();
    const strValue = hexToString(hexValue);

    $('#input-1-result-hex').val(hexValue.trim());
    $('#input-1-result-string').val(strValue.trim());
}

function btn2Clicked() {
    const hexValue = $('#input-2-hex').val();
    const strValue = hexToString(hexValue);

    const trimStrValue = strValue.replaceAll(String.fromCharCode(parseInt("00".substr(0, 2), 16)), '');
    const fullDatetime = timestampToDatetime(Number(trimStrValue));

    $('#input-2-result-hex').val(hexValue.trim());
    $('#input-2-result-string').val(strValue.trim());
    $('#input-2-result-datetime').val(fullDatetime);
}

function btn3Clicked() {
    const encoderIp = $('#input-3-encoder-ip').val();
    const encoderPort = $('#input-3-encoder-port').val();
    const cardType = $('input[name=radio-3-type]:checked').val();
    const uid = $('#input-3-uid').val();
    const timestamp = $('#input-3-timestamp').val();
    const hotelCode = $('#input-3-hotel-code').val();
    const startDatetime = $('#input-3-start-datetime').val();
    const endDatetime = $('#input-3-end-datetime').val();

    Swal.fire({
        title: '카드를 올려주세요.',
        text: '카드 발급기에 카드를 올리고 확인 버튼을 눌러주세요.',
        imageUrl: '/static/image/card.gif',
        showCancelButton: true,
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: "btn btn-default"
        },
    }).then(function (result) {
        if (result.isConfirmed) {

            Swal.fire({
                title: '카드키 발급 중',
                text: '잠시만 기다려주세요',
                icon: 'success',
                allowOutsideClick: false,
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-success'
                },
                didOpen: () => {
                    Swal.showLoading()

                    $.ajax({
                        type: 'post',
                        url: '/utils/3',
                        data: {
                            'encoderIp': encoderIp,
                            'encoderPort': encoderPort,
                            'cardType': cardType,
                            'uid': uid,
                            'timestamp': timestamp,
                            'hotelCode': hotelCode,
                            'startDatetime': startDatetime,
                            'endDatetime': endDatetime,
                        },
                        success: function (data) {
                            const resultCode = data['resultCode'];
                            const resultMsg = data['resultMsg'];

                            if (resultCode == 0) {
                                Swal.hideLoading();
                                Swal.fire({
                                    title: "카드키 발급",
                                    text: "Card Key Complete!",
                                    icon: "success",
                                    buttonsStyling: false,
                                    confirmButtonText: "확인!",
                                    customClass: {
                                        confirmButton: "btn btn-success"
                                    }
                                });
                            } else {
                                Swal.hideLoading();
                                Swal.fire({
                                    title: "카드 발급 실패",
                                    text: resultMsg,
                                    icon: "error",
                                    buttonsStyling: false,
                                    confirmButtonText: "확인!",
                                    customClass: {
                                        confirmButton: "btn btn-danger"
                                    }
                                });
                            }
                        },
                        error: function (data) {
                            alertError(data.responseJSON['resultMsg']);
                            Swal.hideLoading();
                        }
                    });
                },
                willClose: () => {

                }
            }).then((result) => {

            });
        }
    });
}

function btn4Clicked() {
    const encoderIp = $('#input-4-encoder-ip').val();
    const encoderPort = $('#input-4-encoder-port').val();
    const cardType = $('input[name=radio-4-type]:checked').val();
    const uid = $('#input-4-uid').val();
    const timestamp = $('#input-4-timestamp').val();
    const hotelCode = $('#input-4-hotel-code').val();
    const startDatetime = $('#input-4-start-datetime').val();
    const endDatetime = $('#input-4-end-datetime').val();
    const macAddressList = $('#input-4-mac-address').val();

    Swal.fire({
        title: '카드를 올려주세요.',
        text: '카드 발급기에 카드를 올리고 확인 버튼을 눌러주세요.',
        imageUrl: '/static/image/card.gif',
        showCancelButton: true,
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: "btn btn-default"
        },
    }).then(function (result) {
        if (result.isConfirmed) {

            Swal.fire({
                title: '카드키 발급 중',
                text: '잠시만 기다려주세요',
                icon: 'success',
                allowOutsideClick: false,
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-success'
                },
                didOpen: () => {
                    Swal.showLoading()

                    $.ajax({
                        type: 'post',
                        url: '/utils/4',
                        data: {
                            'encoderIp': encoderIp,
                            'encoderPort': encoderPort,
                            'cardType': cardType,
                            'uid': uid,
                            'timestamp': timestamp,
                            'hotelCode': hotelCode,
                            'startDatetime': startDatetime,
                            'endDatetime': endDatetime,
                            'macAddressList': macAddressList,
                        },
                        success: function (data) {
                            const resultCode = data['resultCode'];
                            const resultMsg = data['resultMsg'];

                            if (resultCode == 0) {
                                Swal.hideLoading();
                                Swal.fire({
                                    title: "카드키 발급",
                                    text: "Card Key Complete!",
                                    icon: "success",
                                    buttonsStyling: false,
                                    confirmButtonText: "확인!",
                                    customClass: {
                                        confirmButton: "btn btn-success"
                                    }
                                });
                            } else {
                                Swal.hideLoading();
                                Swal.fire({
                                    title: "카드 발급 실패",
                                    text: resultMsg,
                                    icon: "error",
                                    buttonsStyling: false,
                                    confirmButtonText: "확인!",
                                    customClass: {
                                        confirmButton: "btn btn-danger"
                                    }
                                });
                            }
                        },
                        error: function (data) {
                            alertError(data.responseJSON['resultMsg']);
                            Swal.hideLoading();
                        }
                    });
                },
                willClose: () => {

                }
            }).then((result) => {

            });
        }
    });
}

function btn5Clicked() {
    const encoderIp = $('#input-5-encoder-ip').val();
    const encoderPort = $('#input-5-encoder-port').val();
    const uid = $('#input-5-uid').val();
    const timestamp = $('#input-5-timestamp').val();
    const hotelCode = $('#input-5-hotel-code').val();
    const startDatetime = $('#input-5-start-datetime').val();
    const endDatetime = $('#input-5-end-datetime').val();
    const macAddressList = $('#input-5-mac-address').val();

    Swal.fire({
        title: '카드를 올려주세요.',
        text: '카드 발급기에 카드를 올리고 확인 버튼을 눌러주세요.',
        imageUrl: '/static/image/card.gif',
        showCancelButton: true,
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: "btn btn-default"
        },
    }).then(function (result) {
        if (result.isConfirmed) {

            Swal.fire({
                title: '카드키 발급 중',
                text: '잠시만 기다려주세요',
                icon: 'success',
                allowOutsideClick: false,
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-success'
                },
                didOpen: () => {
                    Swal.showLoading()

                    $.ajax({
                        type: 'post',
                        url: '/utils/5',
                        data: {
                            'encoderIp': encoderIp,
                            'encoderPort': encoderPort,
                            'uid': uid,
                            'timestamp': timestamp,
                            'hotelCode': hotelCode,
                            'startDatetime': startDatetime,
                            'endDatetime': endDatetime,
                            'macAddressList': macAddressList,
                        },
                        success: function (data) {
                            const resultCode = data['resultCode'];
                            const resultMsg = data['resultMsg'];

                            if (resultCode == 0) {
                                Swal.hideLoading();
                                Swal.fire({
                                    title: "카드키 발급",
                                    text: "Card Key Complete!",
                                    icon: "success",
                                    buttonsStyling: false,
                                    confirmButtonText: "확인!",
                                    customClass: {
                                        confirmButton: "btn btn-success"
                                    }
                                });
                            } else {
                                Swal.hideLoading();
                                Swal.fire({
                                    title: "카드 발급 실패",
                                    text: resultMsg,
                                    icon: "error",
                                    buttonsStyling: false,
                                    confirmButtonText: "확인!",
                                    customClass: {
                                        confirmButton: "btn btn-danger"
                                    }
                                });
                            }
                        },
                        error: function (data) {
                            alertError(data.responseJSON['resultMsg']);
                            Swal.hideLoading();
                        }
                    });
                },
                willClose: () => {

                }
            }).then((result) => {

            });
        }
    });
}

function hexToString(hexValue) {
    const hex = hexValue.toString();
    let str = '';
    for (let n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
}

function stringToHex(strValue) {
    let hex = '';
    for (let i = 0; i < strValue.length; i++) {
        hex += '' + strValue.charCodeAt(i).toString(16);
    }
    return hex;
}

function timestampToDatetime(timestamp) {
    const date = new Date(0);
    date.setUTCSeconds(timestamp);

    const momentDate = moment.unix(timestamp);

    if (!momentDate.isValid()) {
        return '날짜 형식이 아닙니다.';
    } else {
        return momentDate.format("YYYY년 MM월 DD일 HH:mm:ss");
    }
}