//rem移动端适配代码， 1rem = 100px
(function () {
    var currClientWidth,
        fontValue,
        originWidth;
    originWidth = 750; //ui设计稿的宽度，一般750或640
    __resize();

    window.addEventListener('resize', __resize, false);

    function __resize() {
        currClientWidth = document.documentElement.clientWidth;
        if (currClientWidth > 768) {
            currClientWidth = 768;
        }
        if (currClientWidth < 320) {
            currClientWidth = 320;
        }
        fontValue = ((625 * currClientWidth) / originWidth).toFixed(2);
        document.documentElement.style.fontSize = fontValue + '%';
    }

    
})();
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
    console.log(lang);
    if (lang == "zh_CN") {
        $('[data-lang]').i18n("cn");
    } else if (lang == "en_US") {
        $('[data-lang]').i18n("en");
    }
})
function getUrlParam (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
}

var LANG={};
$.ajaxSettings.async = false;//同步加载

var lang = getUrlParam("language");
console.log(lang);
if (lang == "zh_CN") {
    $.getJSON("js/lang/i18n_cn.json", function(data) {
        LANG = data;
    });
} else if (lang == "en_US") {
    $.getJSON("js/lang/i18n_en.json", function(data) {
        LANG = data;
    });
}