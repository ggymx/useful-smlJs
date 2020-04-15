/**
 * version:1.7.0
 * updatetime:2020-4-14
 * new：定义addOtherKey（恢复元素聚焦） removeOtherKey（禁用除目标外的其他元素的聚焦能力） refresh：刷新面板...
 */
// `use strict`;
//console.log('*************************自定义光标逻辑启用*************************');
//当前光标控制类型：手动/自动
var focusController = "手动";
var keyFocus;
var screenWidth = window.screen.width || document.body.scrollWidth;
/**
 *@method H5环境下keydown触发时的执行逻辑
 *@param{*} evt event对象
 */
function getH5DownKey() {
    //console.log('执行');
    var StbType = sTBConfig.getSTBType();
    //提前判断盒子型号，避免每次执行监听器都要判断
    if (sTBConfig.isAutoStbType(StbType)) {
        focusController = "自动";
        window.onload = function () {
            if (document.getElementById("debug")) {
                //console.log('光标控制权',focusController);
                // var debugString = getDebugString(this.lastFoucusObject, this.focusObject);
                // document.getElementById("debug").innerHTML = debugString;
                keyfocus.refresh();
            }
        };

        //console.log(focusController);

        return function (evt) {
            evt = evt ? evt : window.event;
            var keyNum = evt.which ? evt.which : evt.keyCode;
            //不屏蔽问题盒子的返回键
            if (keyNum != 8) {
                // saveLogInfo("return function keyNum != 8");
                return;
            }
            // saveLogInfo("return function keyNum == 8");
            var direct = setDirect(keyNum);
            direct && keyfocus.focusMove(direct);
        }
    } else {
        // saveLogInfo("return function else");
        return function (evt) {
            evt = evt ? evt : window.event;
            var keyNum = evt.which ? evt.which : evt.keyCode;
            var direct = setDirect(keyNum);
            direct && keyfocus.focusMove(direct);
        }
    }
}

/**
 *@method 安卓环境下keydown触发时的执行逻辑
 *@param{*} key 键盘码
 */
function getAndroidDownKey(key) {
    var direct = setDirect(key);
    direct && keyfocus.focusMove(direct);
}

/**
 *@method 根据键盘码返回相应跳转方向
 *@param{*} keyCode 键盘码
 *@return direct 光标将要跳转的方向
 */
function setDirect(keyCode) {
    var direct;
    switch (keyCode) {
        case 37:
            //left
            direct = "l";
            break;
        case 39:
            //right
            direct = "r";
            break;
        case 38:
            //up
            direct = "u";
            break;
        case 40:
            //down
            direct = "d";
            break;
        case 8:
            //back
            direct = "-1";
            break;
        default:
            return null;
    }
    return direct;
}

/**
 *@method 重定向页面
 *@param{*} url 相应页面的URL
 */
function goBack(url, middleware) {
    //console.log("goback:" + url);
    if (url) {
        //先执行插入函数
        for (var i = 0; i < middleware.length; i++) {
            var func = middleware[i];
            //console.log('执行中间件方法：', func);
            typeof func === 'function' ? func() : '';
        }
        window.location.href = url;
    } else {
        window.history.back(-1);
    }
}

/**
 *@method 返回调试模式下调试面板实时更新的串
 *@for KeyFocus
 *@param{*} lastFoucusObject：上一个光标元素 focusObject：预期的当前光标元素
 @return 实时更新的串
 */
function getDebugString(lastFoucusObject, focusObject, logInfo) {
    //视口的宽度和高度
    var screenHeight = window.screen.height || document.body.scrollHeight;
    //获得本次实际得到光标的元素
    var realGetFocusEle = document.querySelectorAll(":focus")[0];
    //sTBConfig.getSTBType()
    var debugString = '<h2 style="margin:0">调试模式</h2>' +
        '<p style="margin:0">当前分辨率：' + screenWidth + 'x' + screenHeight + '</p>' +
        '<p style="margin:0">盒子型号：' + sTBConfig.getSTBType() + '</p>' +
        '<p style="margin:0">具有自动光标逻辑：' + (sTBConfig.isAutoStbType(sTBConfig.getSTBType()) ? '是' : '否') + '</p>' +
        '<p style="margin:0">光标控制权：' + focusController + '</p>' +
        '<p style="margin:0">浏览器内核：' + navigator.userAgent + '</p>' +
        '<p style="margin:0">上一个光标：' + lastFoucusObject + '</p>' +
        '<p style="margin:0">预期当前光标：' + focusObject + '</p>' +
        '<p style="margin:0">实际当前光标：' + (realGetFocusEle ? realGetFocusEle.getAttribute("id") : focusObject) + '</p>' +
        '<p style="margin:0">当前光标的对应关系：' + (keyfocus.monitorKeyboard[focusObject] ? keyfocus.monitorKeyboard[focusObject].toString() : null) + '</p>';
    if (logInfo) {
        debugString += '<p style="margin:0">日志：' + logInfo + '</p>'
    }
    return debugString;
}

//重写object的toString()
Object.prototype.toString = function () {
    var objString = "";
    //Object.keys方法返回一个由对象的key组成的数组
    var thisLength = Object.keys(this).length;
    //objCount：计数
    var objCount = 0;
    for (var key in this) {
        objCount++;
        //对象输出的末尾不加逗号
        objString += (objCount === thisLength) ? (key + ": " + this[key]) : (key + ": " + this[key] + ", ");
    }
    return "{" + objString + "}";
};

function getStyle(node, styleType) {
    //浏览器中有node.currentStyle方法就用，没有就用另一个
    // return node.currentStyle? node.currentStyle[styleType]: getComputedStyle(node)[styleType]
    return node && (node.currentStyle ? node.currentStyle : getComputedStyle(node));
}

/**
 *@method 发送get请求 超时销毁
 *@for KeyFocus
 *@param{*} lastFoucusObject：上一个光标元素 focusObject：预期的当前光标元素
 @return 实时更新的串
 */
function timedAjax(url, time, callback, method) {
    method = method || "GET";
    var request = new XMLHttpRequest();
    var timeout = false;
    var timer = setTimeout(function () {
        timeout = true;
        request.abort();
    }, time);
    request.open(method, url);
    request.onreadystatechange = function () {
        if (request.readyState !== 4) return;
        if (timeout) return;
        clearTimeout(timer);
        if (request.status === 200) {
            callback(request.responseText);
        }
    };
    request.send(null);
}

/**
 * KeyFocus 光标跳转系统类
 */
function KeyFocus() {
    //上一个光标
    this.lastFoucusObject = null;
    //当前光标
    this.focusObject = null;
    //传入的光标调转关系：Object
    this.monitorKeyboard = null;
    //指定按返回键需要跳转的页面（默认跳转上一级）
    this.goBackUrl = null;
    //需要特殊返回键的页面
    this.goBackPageContext = null;
    //跳转页面时需要执行的方法
    this.middleware = [];
    this.count = 0; //记录递归次数（检验光标调转是否进行了递归）
    this.sourceEle = null;
    this.realCanUseEle = null; //若预测三次还没有找到相应的元素，则回到最初的能用的id
    this.lastMonitorKeyboard = null; //光标系统的临时存放
}

KeyFocus.prototype = {
    constructor: KeyFocus,
    /**
     *@method 设置光标跳转逻辑
     *@for KeyFocus
     *@param{*} Keyboard 光标跳转逻辑的对象，isHideOutline可聚焦元素是否去除outLine（默认去除）
     */
    setKeyboard: function (keyboard, isHideOutline, addTabIndex) {
        //isHideOutline：是否隐藏聚焦元素的outline
        this.monitorKeyboard = keyboard;
        //console.log('初始化光标逻辑************************', this.monitorKeyboard);
        // focusController = "手动";
        //未传入该参数或者该参数为true
        if ((isHideOutline === undefined || isHideOutline) || (addTabIndex === undefined || addTabIndex)) {
            for (var foucusItem in this.monitorKeyboard) {
                var focusEle = document.getElementById(foucusItem);
                if (focusEle) {
                    //非IE的解决方式
                    if (isHideOutline === undefined || isHideOutline) {
                        focusEle.style.outline = 'none';
                        //IE的解决方式
                        focusEle.setAttribute("hidefocus", "true");
                        //中兴盒子的解决方式
                        focusEle.style.setProperty('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');
                    }
                    (addTabIndex === undefined || addTabIndex) && focusEle.setAttribute('tabindex', "0");
                }
            }
        }
    },
    /**
     *@method 设置默认光标元素
     *@for KeyFocus
     *@param{*} focusObj 默认光标元素的ID
     */
    setDefaultFocusObj: function (focusObj) {
        this.focusObject = focusObj;
        //console.log('初始化起始光标************************', this.focusObject);
        focusObjMapEle = document.getElementById(focusObj);
        if (focusObjMapEle && focusObjMapEle.style.display != 'none' && focusObjMapEle.style.visibility != 'hidden') {
            focusObjMapEle.focus();
        } else {
            var moKeyboardOfKey = Object.keys(this.monitorKeyboard);
            //若默认光标元素不存在或被隐藏时，则自动设置默认光标为光标配置的后一个元素
            var keyboardLength = moKeyboardOfKey.indexOf(focusObj) + 1;
            if (keyboardLength === moKeyboardOfKey.length) {
                return;
            }
            this.setDefaultFocusObj(moKeyboardOfKey[keyboardLength]);
        }
    },

    /**
     *@method 修改某个元素的跳转关系
     *@for KeyFocus
     *@param{*} keyboardOfKey 重定义某元素的跳转逻辑 如('zh',{'u': 'th'})
     */
    updateKey: function (key, value) {
        this.monitorKeyboard[key] = value;
    },
    /**
     *@method 移除光标系统的某个光标元素
     *@for KeyFocus
     *@param{*} key 要移除的光标元素ID isRealRmove：是否真实移除（false：只禁用 true：真实移除）
     */
    removeKey: function (key, isRealRmove) {
        if (!isRealRmove) {
            //禁用光标系统中的该元素,不真实移除
            console.log('禁用该光标元素-------')
            document.getElementById(key).removeAttribute("tabindex");
            return;
        }
        //真实移除光标系统中的该元素包括及所对应的关系
        console.log('真实删除该光标元素-------');
        //深拷贝一个临时对象
        var monitorKeyboardCopy = JSON.parse(JSON.stringify(this.monitorKeyboard))
        //保留一份上次光标系统的拷贝，在某种特定情况下还原
        this.lastMonitorKeyboard = this.monitorKeyboard;
        console.log('lastMonitorKeyboard',this.lastMonitorKeyboard);
        for (var index in this.monitorKeyboard) {
            if (index === key && this.monitorKeyboard.hasOwnProperty(index)) {
                console.log('一层找到相应的键值：', index);
                delete monitorKeyboardCopy[index];
            } else if (index != key && this.monitorKeyboard.hasOwnProperty(index)) {
                var indexArr = Object.keys(this.monitorKeyboard[index]);
                console.log('indexArr', indexArr);
                for (var secondIndex = 0; secondIndex < indexArr.length; secondIndex++) {
                    console.log(this.monitorKeyboard[index][indexArr[secondIndex]]);
                    if (this.monitorKeyboard[index][indexArr[secondIndex]] === key) {
                        console.log('二层找到相应的键值', indexArr[secondIndex]);
                        delete monitorKeyboardCopy[index][indexArr[secondIndex]];
                    }
                }
            }
        }
        console.log('删除后', monitorKeyboardCopy);
        this.monitorKeyboard = monitorKeyboardCopy;
    },
    /**
     *@method 往光标系统中添加元素
     *@for KeyFocus
     *@param{*} key 要添加的元素ID isRealRestore：要添加的光标元素ID（false：启用 true：还原到上一个未删除时的状态）
     */
    addKey: function (key, isRealRestore) {
        if (!isRealRestore) {
            //启用光标系统中的该元素
            console.log('启用该光标元素--------');
            document.getElementById(key).setAttribute("tabindex", "0");
            return;
        }
        //将光标系统还原到未删除该元素的状态前
        console.log('将光标系统还原到该元素未删除前---------',this.lastMonitorKeyboard);
        this.monitorKeyboard = this.lastMonitorKeyboard;
    },
    /**
     *@method 除某个元素外的其他元素都禁止聚焦（避免某个盒子重定向后，光标依然可以走到别的元素）
     *@for KeyFocus
     *@param{*} isAllowFocus 唯一允许被聚焦的元素
     */
    removeOtherKey:function(isAllowFocus){
        console.log('光标逻辑--------',this.monitorKeyboard);
        console.log('允许忽略的元素---',isAllowFocus);
        for(var item in this.monitorKeyboard){
            if(this.monitorKeyboard.hasOwnProperty(item)){
                console.log('禁用------遍历到自己的光标元素', document.getElementById(item));
                document.getElementById(item).removeAttribute("tabindex");
            }
        }
        document.getElementById(isAllowFocus).setAttribute("tabindex","0");
    },
    /**
     *@method 恢复元素重新聚焦的能力
     *@for KeyFocus
     */
    addOtherKey:function(){
        console.log('光标逻辑--------',this.monitorKeyboard);
        for(var item in this.monitorKeyboard){
            if(this.monitorKeyboard.hasOwnProperty(item)){
                console.log('启用------遍历到自己的光标元素', document.getElementById(item));
                document.getElementById(item).setAttribute("tabindex","0");
            }
        }
    },
    /**
     *@method 刷新调试面板
     *@for KeyFocus
     */
    refresh:function(info){
        console.log('刷新显示面板');
        if (document.getElementById("debug")) {
            //console.log('光标控制权',focusController);
            var debugString = info ? getDebugString(this.lastFoucusObject, this.focusObject,info):getDebugString(this.lastFoucusObject, this.focusObject);
            document.getElementById("debug").innerHTML = debugString;
        } else {
            console.log('err：应先打开调试面板')
        }
    },
    /**
     *@method 重定向当前的光标元素
     *@for KeyFocus
     *@param{*} target 光标重定向到的元素id    notAllowRedirect:不执行重定向操作的元素
     */
    redirectFocus: function (target, notAllowRedirect) {
        //console.log('重定向光标元素-----', target);
        //修复focusObject指向
        notAllowRedirect = notAllowRedirect || []; //设置默认值
        if (notAllowRedirect.length) {
            for (var i = 0; i < notAllowRedirect.length; i++) {
                if (this.lastFoucusObject === notAllowRedirect[i]) {
                    return;
                }
            }
        }
        this.focusObject = target;
        document.getElementById(target).focus();
        //如果打开了调试面板则刷新调试面板
        this.refresh();
    },
    /**
     *@method 按指定方向执行光标跳转
     *@for KeyFocus
     *@param{*} direct 光标跳转的方向 u/d/l/r/-1
     */
    focusMove: function (direct) {
        //返回到上一页面
        if (direct === '-1') {
            if (this.goBackUrl) {
                //配置按返回键跳转到指定页面（默认返回上一级）
                goBack(this.goBackUrl, this.middleware);
                return;
            } else {
                goBack();
                return;
            }

        }
        //首先记录第一次跳转时的出发元素，当递归结束仍然没找到下一个要跳转的元素，则默认跳转到出发元素
        if (this.count === 0) {
            this.sourceEle = this.focusObject;
        }
        if (this.monitorKeyboard.hasOwnProperty(this.focusObject)) {
            // console.log('预设的光标--------------', this.focusObject);
            if (this.monitorKeyboard[this.focusObject].hasOwnProperty(direct)) {
                this.lastFoucusObject = this.focusObject;
                this.focusObject = this.monitorKeyboard[this.focusObject][direct];
                //本次应获得光标的元素
                var focusObjEle = document.getElementById(this.focusObject);
                //如果本次应获得光标的元素不存在或者被隐藏
                if (!focusObjEle || focusObjEle.style.display === 'none' || focusObjEle.style.visibility === 'hidden' || !focusObjEle.getAttribute("tabindex")) {
                    this.count++;
                    //若光标元素不存在，则进行递归
                    this.focusMove(direct);
                    //  return;
                }
                if (focusObjEle) {
                    this.realCanUseEle = this.focusObject;
                    focusObjEle.focus();
                    //找到光标后清空递归计数和出发元素
                    this.count = 0;
                    this.sourceEle = null;
                }
            } else {
                /*count等于0说明该元素该方向没有对应的跳转元素，则默认跳转到自己，若不等于0，
                则说明进行了递归且没有找到下一个要跳转的元素，则默认跳转到出发元素*/
                /*
                若某个光标元素某个方向键无明显配置，则默认跳到自己
                （解决盒子h5环境上无某光标元素无默认配置时光标乱跳）
                */
                if (this.count === 0) {
                    console.log('当前光标元素该方向未配置任何元素！！！');
                    if (document.getElementById(this.focusObject)) {
                        this.realCanUseEle = this.focusObject;
                        this.redirectOwn(this.focusObject);
                    } else {
                        this.redirectOwn(this.lastFoucusObject);
                        this.lastFoucusObject = this.focusObject;
                        this.realCanUseEle = this.focusObject;
                    }

                } else {
                    console.log('经过递归未发现能聚焦的光标元素！！！');
                    this.redirectOwn(this.sourceEle);
                    this.focusObject = this.sourceEle;
                }
            }
        }
        //若开启调试模式，则实时更新debugString
        // if (document.getElementById("debug")) {
        //     var debugString = getDebugString(this.lastFoucusObject, this.focusObject);
        //     document.getElementById("debug").innerHTML = debugString;
        // }
        this.refresh();
    },

    /**
     *@method keyFocus的调试模式
     *@for KeyFocus
     *@param{*} bgColor 调试面板的背景色    opacity:调试面板的透明度
     */
    openDebug: function (bgColor, opacity) {
        //printLogByPage可能先于openDebug调用
        if(document.getElementById("debug")){
            console.log("调试面板已经打开！");
            return;
        }
        bgColor = bgColor || 'black';
        opacity = opacity || 0.6;
        var fontSize = screenWidth > 700 ? '20px' : '14px';
        var width = screenWidth > 700 ? '600px' : '400px';
        var body = document.getElementsByTagName("body")[0];
        body.innerHTML += '<div id="debug" style="background: ' + bgColor + ';opacity: ' + opacity + ';position: fixed;top: 0;' +
            'color: #FFF;border-radius: 10px;padding-left:10px;font-size:' + fontSize + ';width: ' + width + ';">' + getDebugString(this.lastFoucusObject, this.focusObject) +
            '</div>';
        // body.innerHTML += '<div id="debug" style="background: black;opacity: 0.6;width: 600px;position: fixed;top: 0;' +
        //     'color: #FFF;border-radius: 10px;padding-left:10px;font-size: 20px;">' + getDebugString(this.lastFoucusObject, this.focusObject) +
        //     '</div>';
        document.getElementById(this.focusObject).focus();
    },

    //重定向自己
    redirectOwn: function (own) {
        document.getElementById(own).blur();
        setTimeout(function () {
            document.getElementById(own).focus();
        }, 1);
    },
    /**
     *@method 返回键配置
     *@for KeyFocus
     *@param{*} goBackUrl：按返回键跳转的页面 pageContext：需要特殊返回键的当前页面,middleware：需要调用的函数
     */
    setGoBackConfig: function (goBackUrl, pageContext, middleware) {
        //console.log(goBackUrl)
        this.goBackUrl = goBackUrl;
        if (pageContext && !middleware) {
            var tmp = middleware;
            middleware = pageContext;
            pageContext = tmp;
        }
        this.goBackPageContext = pageContext;
        if (Array.isArray(middleware)) {
            this.middleware = middleware;
        } else {
            //console.error('err:middleware应该是一个函数数组！');
        }
        //console.log('pageContext----------', pageContext);
        //console.log('中间件-------', middleware[0]);
    },
    /**
     *@method 创建过渡光标元素：自有逻辑盒子的跳转中间元素
     *@for KeyFocus
     *@param{*} refChildId：插入的位置的目标元素ID，location：过渡元素的位置,action：聚焦时的触发方法
     *@example createTransitEle('test',{left:'20px',top:'50px'},function(){...})
     */
    createTransitEle: function (refChildId, location, action) {
        if (typeof action != 'function') {
            //console.error('action必须是方法！！！');
            return;
        }
        var transitEle = document.createElement('div');
        transitEle.setAttribute('id', 'transit');
        transitEle.setAttribute('tabindex', "0");
        transitEle.style.cssText = 'width:1px;height:1px;opacity:0;' + 'left:' + location.left + ';' + location.top + ';position:relative;';
        document.getElementById().addEventListener('focus', action);
        document.getElementsByTagName('body')[0].insertBefore(transitDiv, document.getElementById(refChildId));
    },
    /**
     *@method 页面调试面板上打印日志信息
     *@for KeyFocus
     *@param{*} info：要打印的信息
     */
    printLogByPage: function (info) {
        // if (document.getElementById("debug")) {
        //     //console.log('光标控制权',focusController);
        //     var debugString = getDebugString(this.lastFoucusObject, this.focusObject, info);
        //     document.getElementById("debug").innerHTML = debugString;
        // } else {
        //     console.log('err：应先打开调试面板')
        // }
        //调用时自动打开调试面板
        this.openDebug();
        this.refresh(info);
    },
    /**
     *@method 控制台（后端）打印日志信息
     *@for KeyFocus
     *@param{*} info：要打印的信息
     *@ps：需要后端处理相应的请求
     */
    printLogByConsole: function (info) {
        /* just for development */
        timedAjax("/integral/log/saveInfo?info=" + info, 10000, function (data) {});
    }
};

//型号对象
function STBConfig() {
    this.StbType = null;
    if (typeof (Authentication) != 'undefined' && Authentication != null) {
        if ('CTCSetConfig' in Authentication) {
            this.StbType = Authentication.CTCGetConfig("STBType");
        } else {
            this.StbType = Authentication.CUGetConfig("STBType");
        }
        if (this.StbType == null) {
            this.StbType = Authentication.CTCGetAuthInfo();
        }
    }
    //测试代码
    // this.StbType='B700V5C';
}

STBConfig.prototype = {
    constructor: STBConfig,
    /**
     *@method 根据分辨率载入相应的css样式
     *@for STBConfig
     *@param{*} cssPath：需要载入的样式表路径 ele：将css样式表绑定到的link元素
     *@ps：需要后端处理相应的请求
     */
    bindCssFile: function (cssPath, ele) {
        STBType = this.StbType;
        var screenWidth = window.screen.width || document.body.scrollWidth;
        if (STBType === "EC6108V9E_pub_jljlt" || STBType === "EC6108V9I_pub_jljlt" || STBType === "EC6109_pub_jljlt" ||
            STBType === "EC6108V9U_pub_jljlt" || STBType === "EC6108V9A_pub_jljlt" || STBType === "B860A" ||
            STBType === "B860AV2.2" || STBType === "B760EV3" || STBType === "B860AV1.1" || STBType === "B860AV2.2U" ||
            STBType === "GF-WM18A" || STBType === "S65" || STBType === "EC6108V8" || STBType === "Q21A_sdllt" ||
            STBType === "B860AV1.2" || STBType === "B760H" || STBType === "B860AV2.1U") {
            screenWidth = 1280;
        }
        // var sc = $("sc");
        if (screenWidth > 1280) { //获取屏幕的的宽度
            ele.setAttribute("href", cssURL + "app1920.css"); //设置css引入样式表的路径
        } else {
            ele.setAttribute("href", cssURL + "app1280.css");
        }
    },
    /**
     *@method 获取盒子型号
     *@for STBConfig
     @return 当前盒子的型号
     */
    getSTBType: function () {
        return this.StbType || 'PC';
    },
    /**
     *@method 判断盒子是否是自有逻辑的盒子
     *@for STBConfig
     @param stbType 传入的盒子型号
     @return 布尔值
     */
    isAutoStbType: function (stbType) {
        //console.log('传入的盒子型号',StbType);
        return stbType === "Q21_hnylt" || stbType === "TCL_A360" || stbType === "EC1308H_pub" || stbType === "IP108H" ||
            stbType === "B700V5C";
    }
};


/**
 *@method 根据环境添加相应keydown监听
 *@for KeyFocus
 *@param{*} type 执行环境（安卓或h5） key：键盘码：仅对安卓有效
 */
function setKeyAction(type, key) {
    if (type === "android") {
        getAndroidDownKey(key);
    } else {
        //添加键盘监听
        window.document.addEventListener("keydown", getH5DownKey());
    }

}

var sTBConfig = new STBConfig();

var keyfocus = getKeyFocusInstance();

/**
 *@method 创建KeyFocus实例
 *@param{*} keyboard：光标逻辑 defaultEle：起始光标
 */
function getKeyFocusInstance(keyboard, defaultEle) {
    if (!keyFocus) {
        keyFocus = new KeyFocus();
    }
    if (keyboard) {
        keyFocus.setKeyboard(keyboard);
    }
    if (defaultEle) {
        keyFocus.setDefaultFocusObj(defaultEle);
    }
    return keyFocus;
}

window ? setKeyAction("H5", "") : setKeyAction("android", "key");