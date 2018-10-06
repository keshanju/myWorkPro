var ourURL = "http://api2.bohe.com";

$(function () {
    var getLanguage = {

        /**获取url 中的参数
         * @param {String} name
         */
        getUrlParam: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg); //匹配目标参数
            if (r != null) return unescape(r[2]);
            return null; //返回参数值
        }
    }
    var lang = getLanguage.getUrlParam("language");
    if (lang == "zh_CN") {
        $('[data-lang]').i18n("cn");
    } else if (lang == "en_US") {
        $('[data-lang]').i18n("en");
    }
})

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
}

var LANG = {};
var lang = getUrlParam("language");
if (lang == "zh_CN") {
    $.ajax({
        type: "get",
        url: "js/lang/i18n_cn.json",
        dataType:"json",
        async:false,
        success: function(data){
            LANG = data;
        }
     });
} else if (lang == "en_US") {
    $.ajax({
        type: "get",
        url: "js/lang/i18n_en.json",
        dataType:"json",
        async:false,
        success: function(data){
            LANG = data;
        }
     });
}


/**
 * 会员中心部分
 */

/**
 * 充值续费部分
 */

/**
 * 套餐转换部分
 */

/**
 * 第三方登录
 */
