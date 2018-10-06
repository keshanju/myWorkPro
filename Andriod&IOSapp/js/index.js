//入口函数
$(function () {
    /**
     * 接口调用
     */
    var ourUrl = "http://kfapi.bohe.com:8011"; //接口根目录
    
    var Api = {
        /**获取url 中的参数
         * @param {String} name
         */
        getUrlParam: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg); //匹配目标参数
            if (r != null) return unescape(r[2]);
            return null; //返回参数值
        },
        /**
         * 获取用户信息
         */
        getUserInfo: function (json, callback) {
            $.ajax({
                type: 'post',
                url: ourUrl + '/api/user/info',
                data: json,
                success: callback
            })
        },
        /**
         * 展示套餐详细信息
         */
        userCatbuy: function (json, callback) {
            $.ajax({
                type: "post",
                url: ourUrl + "/api/user/package", //套餐和对应的价格信息
                async: true,
                data: json,
                success: callback
            });
        },
        /**
         * 套餐购买
         */
        package_buy: function (json, callback) {
            $.ajax({
                type: "post",
                url: ourUrl + "/api/user/package/buy", //购买套餐
                async: true,
                data: json,
                success: callback
            });
        },
        /**
         * 暂停和恢复
         */
        pause_package: function (json, callback) {
            $.ajax({
                url: ourUrl + '/api/user/pause',
                type: 'post',
                data: json,
                success: callback
            });
        },
        recover_package: function (json, callback) {
            $.ajax({
                url: ourUrl + '/api/user/recover',
                type: 'post',
                data: json,
                success: callback
            });
        },
        // 获取公告信息
        getNewsInfo: function (json, callback) {
            $.ajax({
                type: "get",
                url: ourUrl + "/tools/news",
                data: json,
                success: callback
            });
        },
        // 获取公告详情
        getNewsDetail: function (json, callback) {
            $.ajax({
                type: 'get',
                url: ourUrl + '/tools/news/',
                data: json,
                success: callback
            });
        },
         // 获取公告详情
         getNewsView: function (id, callback) {
            $.ajax({
                type: 'get',
                url: ourUrl + '/tools/news/'+id,
                success: callback
            });
        },
    };
    var nologin_code = 400006;
    var package_id,
        package_id2,
        price_id,
        pay_type,
        billing_type,
        pay_url,
        pause_status,
        pause_status_id,
        new_id,
        is_switch_package;
    var u = navigator.userAgent,
        app = navigator.appVersion;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //安卓终端
    var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    if (isAndroid) {
        //这个是安卓操作系统
        var invoice_from = 3; //如果值为2则表明客户端是iOS，如果为3则表明客户端为安卓，如果为0，则表明是pc端
    }
    if (isIOS) {
        //这个是ios操作系统
        var invoice_from = 2; //如果值为2则表明客户端是iOS，如果为3则表明客户端为安卓，如果为0，则表明是pc端
    }
    /**
     * index-of-BHapp部分
     */
    //获取地址栏中的用户登录token
    var account_token = Api.getUrlParam("account_token");
    var client_token = Api.getUrlParam("client_token");
    var list_id = Api.getNewsDetail("id");
    var recover_time = LANG["p"];
    console.log(recover_time);
    // var recover_time = "恢复";
    // var pause_time = "暂停";
    var pause_time = LANG["r"];
    
    if(location.href.indexOf("noticedetails")>-1){
        var list_id = Api.getUrlParam("id");
        Api.getNewsView(list_id,function(data){
            $("#notice_title").text(data.data.title)
            $("#publish-time-BH").text(data.data.publish_time)
            $("#notice_content").html(data.data.content)
        });
        return;
    }

    if (account_token) {
        /**
         * 获取用户登录后的详细信息
         */
        Api.getUserInfo({
            account_token: account_token
        }, function (res) {
            if (res.code == 0) {
                billing_type = res.data.billing_type; //通过这个值来判定用户是计时还是包月，1为计时，2为包月
                pause_status = res.data.pause_status; //用户暂停恢复信息
                pause_status_id = res.data.pause_status_id; //暂停恢复的id，0表示使用中，1表示暂停中
                package_id2 = res.data.package_id;
                is_switch_package = res.data.is_switch_package; //获取用户是否可以购买两种套餐的判断条件值
                //计时用户更新信息
                var mobile = res.data.mobile; //用户手机号
                $(".userinfo-of-BHapp").find("h4").text(mobile);

                //这里需要对用户类型判断,计时用户显示剩余时间，包月用户则没有显示
                if (billing_type == 1) {
                    var expiry_time = res.data.expiry_time; //有效加速时间
                    $("#expiry_time").text(expiry_time);
                    var arr = expiry_time.match(/\d+/ig);
                    if (expiry_time.indexOf('小时') > 0) {
                        hours = arr[0];
                        minute = arr[1];
                    } else {
                        hours = 0;
                        minute = arr[0];
                    }
                    // 如果为计时用户，则显示剩余加速时间
                    $(".surplus-time-detail").find('i').eq(0).text(hours);
                    $(".surplus-time-detail").find('i').eq(1).text(minute);
                } else if (billing_type == 2) { //包月用户获取有效天数
                    // 包月用户不出现这个页面,并给出提示
                    var expiry_time1 = res.data.expiry_time;
                    $("#expiry_time").text(expiry_time1);
                }
                //暂停恢复文字提示
                if (pause_status_id == 1) { //1代表已暂停，换成暂停中的样式
                    $("#pause-time").text(recover_time);
                    $(".surplus-time-detail > h5 > i").addClass("time-active");
                    $(".img-container").addClass("img-active");
                    $(this).addClass("alter-status");
                } else if (pause_status_id == 0) { //0代表未暂停,换成使用中的样式
                    $("#pause-time").text(pause_time);
                    $(".surplus-time-detail > h5 > i").removeClass("time-active");
                    $(".img-container").removeClass("img-active");
                    $(this).removeClass("alter-status");
                }
            } else if (res.code == nologin_code) {
                mui.toast("登录过期，请重新登录！");
            } else {
                mui.toast(res.msg);
            }
        });
        /**
         * 获取用户能够看到的套餐信息,页面一上来就直接加载调用该接口
         */
        Api.userCatbuy({
            account_token: account_token
        }, function (res) {
            if (res.code == 0) {
                var aa = res.data;
                var index = 0;
                $.each(aa, function (k, v) {
                    package_id = v.package_id;
                    var alis = "<li data-id=" + package_id + " class=\"common\">" + v.package_title + "</li>";
                    $(".packages-BHapp").append(alis);
                    var bb = v.price;
                    var culs = "<ul id=priceList" + index + "></ul>";
                    $(".packages-list-of-BHapp").append(culs);
                    $.each(bb, function (k, v) {
                        price_id = v.price_id;
                        var price = parseInt(v.price_num);
                        var blis = "<li class=\"show\" data-id=" + price_id + "><p>" + v.price_title + "</p><h5><i>￥</i><span>" + price + "</span></h5><h6>" + v.price_short_desc + "</h6></li>";
                        var ulId = "#priceList" + index;
                        $(ulId).append(blis);
                    });
                    index++;
                });
                //加一个判断，默认点击当前用户已购买的套餐
                if (billing_type == 1) {
                    //默认套餐
                    $(".packages-BHapp").find("li").eq(1).trigger("tap");
                } else if (billing_type == 2) {
                    $(".packages-BHapp").find("li").eq(0).trigger("tap");
                }
                //默认支付方式
                $(".pay-ways").find("li").eq(0).trigger("tap");
                // $(".")
            } else if (res.code == nologin_code) {
                mui.toast("登录过期，请重新登录！");
            } else {
                //如果是套餐不匹配，则提示套餐已过期或者与当前套餐不一致
                mui.toast(res.msg);
            }
        });

        // 通过绑定 tap 事件来改变a标签的背景颜色和文字内容，同时将连通的是否开通提示进行对应的修改
        // $("#isOpenService").on("tap", function () {
        //     $("#isOpenService").toggleClass("open-active");
        //     $("#notOpen").toggleClass("tips-active");
        //     flag = !flag;
        //     $("#notOpen").text(flag ? '已开通' : '未开通');
        //     $("#isOpenService").text(flag ? '开通自动续费' : '取消自动续费');
        // });
        //为套餐列表下的，每一个li绑定事件，点击当前套餐变红，其他套餐变黑，并将价格值获取到赋值给支付的按钮部分显示出来，获取每一套餐的标价，赋值给点击支付的按钮
        $(".packages-list-of-BHapp").on("tap", "li", function () {
            $(this).addClass("packages-active").siblings().removeClass("packages-active");
            var fee = $(this).find("span").text() + "元";
            $(".pay-instance").find("span").text(fee);
        });
        // 切换支付方式的背景图片
        $(".pay-ways li").on("tap", function () {
            $(this).find(".payicon").addClass("payways-active");
            $(this).siblings().find(".payicon").removeClass("payways-active");
        });
        /**
         * 套餐购买
         */
        //点击获取当前套餐类型
        $(".packages-BHapp").on("tap", "li", function (e) {
            package_id = $(this).attr("data-id"); //获取套餐id
            // 做两层判断，通过is_switch_package 判断是否可以购买两种套餐，通过billing_type 的值判断只能购买当前套餐，其他套餐能购买
            if (is_switch_package == 0) {
                //如果当前的套餐id与不同就禁用,阻止事件发生
                if (package_id != package_id2) {
                    mui.toast("充值套餐与当前套餐不同！");
                    e.preventDefault();
                    return false;
                }
            }
            var index = $(this).index();
            $(this).addClass("active").siblings().removeClass("active");
            $(".packages-list-of-BHapp ul").eq(index).show().siblings().hide();
            if (index == 0) {
                var ul = "#priceList" + index;
                $(ul).find("li").eq(0).trigger("tap");
            } else if (index == 1) {
                var ul = "#priceList" + index;
                $(ul).find("li").eq(3).trigger("tap");
            }
        });
        //点击获取价格id
        $(".packages-list-of-BHapp").on("tap", "li", function () {
            price_id = $(this).attr("data-id"); //获取价格id
        });
        //点击获取支付方式
        $(".pay-ways").on("tap", "li", function () {
            pay_type = $(this).attr("data-id"); //获取支付类型
        });
        //点击进行支付
        $(".pay-instance").on("touchend", function (e) {
            //需要对用户的类型进行判断，如果是包月用户点击购买计时套餐，或者计时用户购买包月套餐，都提示后台返回的信息
            e.preventDefault();
            if (billing_type == 1) { //说明是计时用户
                //点击购买套餐，调用封装的方法
                Api.package_buy({
                    account_token: account_token,
                    package_id: package_id,
                    price_id: price_id,
                    pay_type: pay_type,
                    invoice_from: invoice_from,
                    pay_plat: 2
                }, function (res) {
                    if (res.code == 0) {
                        //请求成功的状态，获取到支付的url地址
                        pay_url = res.data.pay_url;
                        location.href = pay_url;
                    } else if (res.code == nologin_code) {
                        mui.toast("登录过期，请重新登录");
                    } else {
                        mui.toast(res.msg);
                    }
                });

            } else if (billing_type == 2) { //说明是包月用户
                //点击购买套餐，调用封装的方法
                Api.package_buy({
                    account_token: account_token,
                    package_id: package_id,
                    price_id: price_id,
                    pay_type: pay_type,
                    invoice_from: invoice_from,
                    pay_plat: 2
                }, function (res) {
                    if (res.code == 0) {
                        //请求成功的状态，获取到支付的url地址
                        pay_url = res.data.pay_url;
                        location.href = pay_url; //调转到这个支付的外联页面
                    } else if (res.code == nologin_code) {
                        mui.toast("登录过期，请重新登录");
                    } else {
                        mui.toast(res.msg);
                    }
                });
            }
        });

        /**
         * pause-recover-of-BHapp部分
         */
        $("#pause-time").on("click", function () {
            // _this = $(this);
            //需要先判断用户当前的状态，是暂停还是使用中，如果是暂停则调用恢复套餐接口，如果是使用中，则调用暂停套餐接口
            if (pause_status_id == 0) { //0代表未暂停,使用中
                Api.pause_package({
                    account_token: account_token, //pc端token
                    client_token: client_token //客户端token
                }, function (res) {
                    mui.confirm("您确定要暂停使用时间?下次暂停时间中间需要间隔12小时哦~", function (e) {
                        if (e.index == 1) {
                            if (res.code == 0) {
                                //成功后状态值就变成1了，这个时候及时变化说明文字之前的是暂停时间，这时应该变成恢复时间了
                                mui.alert("暂停成功！");
                                $("#pause-time").text(recover_time); //这里不能赋值
                                $(".surplus-time-detail > h5 > i").addClass("time-active");
                                $(".img-container").addClass("img-active");
                                $("#pause-time").addClass("alter-status");
                                pause_status_id = 1;
                            } else if (res.code == nologin_code) {
                                mui.toast("登录过期，请重新登录!");
                            } else {
                                mui.toast(res.msg);
                            }
                        }
                    });

                });
            } else if (pause_status_id == 1) { //1代表暂停中
                Api.recover_package({
                    account_token: account_token,
                    client_token: client_token
                }, function (res) {
                    if (res.code == 0) {
                        mui.alert("恢复成功！");
                        pause_status_id = 0;
                        $("#pause-time").text(pause_time);
                        $(".surplus-time-detail > h5 > i").removeClass("time-active");
                        $(".img-container").removeClass("img-active");
                        $("#pause-time").removeClass("alter-status");
                    } else if (res.code == nologin_code) {
                        mui.toast("登录过期，请重新登录！");
                    } else {
                        mui.toast(res.msg);
                    }
                });
            }

        });

        /**
         * normalQuestion-of-BHapp部分
         */
        $(".nomal-selected li").on("touchend", function () {
            $(this).find("a").toggleClass("question-active");
            $(this).find("p:eq(0)").toggleClass("detail-active");
            $(this).find(".detail-content").slideToggle();
        });

    } else {
        mui.alert("您未登录，请先登录！");
    }

    /**
     * 公告列表部分
     */
    // Api.getNewsInfo({
    //     page: 1,
    //     size: 3
    // }, function (res) {
    //     if (res.code == 0) {
    //         //获取到公告列表的参数值
    //         var cc = res.data.list;
    //         $.each(cc, function (k, v) {
    //             var title_info = v.title;
    //             var publish_time = v.publish_time;
    //             new_id = cc.id;
    //             var lis = "<li data-id=" + new_id + "><a href=\"http://kfny.bohe.com/zixun.html\" target=\"_blank\">" + title_info + "</a></li";
    //             $(".statements-to-customs-BH").append(lis);
    //             $("#publish-time-BH").text(publish_time);
    //         })
    //     } else if (res.code == nologin_code) {
    //         mui.toast("登录过期，请重新登录！")
    //     } else {
    //         mui.toast(res.msg)
    //     }
    // });

});
