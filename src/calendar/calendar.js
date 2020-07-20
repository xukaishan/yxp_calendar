
/**扩展方法 */
String.prototype.repeats = function (data) {
    return this.replace(/\{\{\w+\}\}/g, function (str) {
        var prop = str.replace(/\{\{|\}\}/g, '');
        return data[prop] || '';
    });
};
Date.prototype.format = function (fmt) {
    var ret;
    var opt = {
        "y+": this.getFullYear().toString(),        // 年
        "m+": (this.getMonth() + 1).toString(),     // 月
        "d+": this.getDate().toString(),            // 日
        "h+": this.getHours().toString(),           // 时
        "s+": this.getMinutes().toString(),         // 分
        "S+": this.getSeconds().toString()          // 秒
    };
    for (var k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
};


/**工具函数 */
// dom 判断
function isDom (obj) {
    return (typeof HTMLElement === 'object') ? obj instanceof HTMLElement : obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
}
// 格式化日期
function formatDate (date, monthNum = 0) {
    if (Object.prototype.toString.call(date) === '[object Date]') {
        date = date.format('yy-mm-dd');
    };
    date = date.replace(/\//g, '-');
    var r = date.split('-');
    r[1] = Number(r[1]) + monthNum + '';
    var m = Number(r[1]) < 10 && r[1].indexOf('0') === -1 ? '0' + r[1] : r[1];
    var d = Number(r[2]) < 10 && r[2].indexOf('0') === -1 ? '0' + r[2] : r[2];
    return r[0] + '-' + m + '-' + d;
};
// 获取上一月
function getPreMonth (date) {
    var arr = date.split('-');
    var year = arr[0]; //获取当前日期的年份 
    var month = arr[1]; //获取当前日期的月份 
    var day = arr[2]; //获取当前日期的日 
    var days = new Date(year, month, 0);
    days = days.getDate(); //获取当前日期中月的天数 
    var year2 = year;
    var month2 = parseInt(month) - 1;
    if (month2 == 0) {
        year2 = parseInt(year2) - 1;
        month2 = 12;
    };
    var day2 = day;
    var days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (day2 > days2) {
        day2 = days2;
    };
    if (month2 < 10) {
        month2 = '0' + month2;
    };
    var t2 = year2 + '-' + month2 + '-' + day2;
    return t2;
};
// 获取下一月
function getNextMonth (date) {
    var arr = date.split('-');
    var year = arr[0]; //获取当前日期的年份 
    var month = arr[1]; //获取当前日期的月份 
    var day = arr[2]; //获取当前日期的日 
    var days = new Date(year, month, 0);
    days = days.getDate(); //获取当前日期中的月的天数 
    var year2 = year;
    var month2 = parseInt(month) + 1;
    if (month2 == 13) {
        year2 = parseInt(year2) + 1;
        month2 = 1;
    };
    var day2 = day;
    var days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (day2 > days2) {
        day2 = days2;
    };
    if (month2 < 10) {
        month2 = '0' + month2;
    };

    var t2 = year2 + '-' + month2 + '-' + day2;
    return t2;
};
/**滑动判断 */
//获得角度
function getAngle (angx, angy) {
    return Math.atan2(angy, angx) * 180 / Math.PI;
};

//根据起点终点返回方向 1向上 2向下 3向左 4向右 0未滑动
function getDirection (startx, starty, endx, endy) {
    var angx = endx - startx;
    var angy = endy - starty;
    var result = 0;

    //如果滑动距离太短
    if (Math.abs(angx) < 2 && Math.abs(angy) < 2) {
        return result;
    };

    var angle = getAngle(angx, angy);
    if (angle >= -135 && angle <= -45) {
        result = 1;
    } else if (angle > 45 && angle < 135) {
        result = 2;
    } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
        result = 3;
    } else if (angle >= -45 && angle <= 45) {
        result = 4;
    };

    return result;
};

/**
 * Calendar
 */
/**Calendar Class */
function Calendar (el, options) {
    var elDom = null;
    if (el) {
        if (isDom(el)) {
            elDom = el;
        } else {
            elDom = document.querySelector('#' + el) || document.querySelectorAll('.' + el)[0];
            if (!elDom) throw new Error('Calendar need to be mounted on a dom element, but not got dom element at new Calendar');
        };
    } else {
        throw new Error('Calendar need a dom element as params at new Calendar');
    };
    this.$el = elDom;
    this.$options = options || { date: new Date, isSwipeToggle: false };
    this.$date = formatDate(this.$options.date || new Date());
    this._init();
};


/**prototype object */
var protoObj = {

    constructor: Calendar,

    _init: function () {
        this.render(this.$date);
        this._event();
    },

    // 事件
    _event: function () {
        var _this = this;

        this.$el.addEventListener('click', function (e) {
            e.stopPropagation();
            var type = e.target.getAttribute('data-type');
            var toggleFlag = e.target.getAttribute('data-toggle');
            var selectDate = e.target.getAttribute('data-date');
            if (!type) return;
            if (type === 'toggle') {//月份切换
                if (toggleFlag === 'pre') {
                    _this.$date = getPreMonth(_this.$date)
                } else if (toggleFlag === 'next') {
                    _this.$date = getNextMonth(_this.$date)
                };
                _this.render(_this.$date, {}, toggleFlag);
                _this.onMonthChange && _this.onMonthChange.call(_this, { type: toggleFlag, curMonth: _this.$date });
            } else if (type === 'date') {//日期day-item选择
                if (selectDate) {//当前月日期点击有效
                    _this.onSelect && _this.onSelect.call(_this, selectDate);
                };
            };
        });

        // move toggle
        if (!this.$options.isSwipeToggle) return;//是否开启滑动切换月份
        var startx, starty;
        this.$el.addEventListener('touchstart', function (e) {
            startx = e.touches[0].pageX;
            starty = e.touches[0].pageY;
        });
        this.$el.addEventListener('touchend', function (e) {
            var type = e.target.getAttribute('data-type');
            if (type === 'move' || type === 'date') {
                var endx = e.changedTouches[0].pageX;
                var endy = e.changedTouches[0].pageY;
                var direction = getDirection(startx, starty, endx, endy);
                if (direction === 3) {//向左
                    _this.$date = getNextMonth(_this.$date);
                    _this.render(_this.$date, {}, 'next');
                    _this.onMonthChange && _this.onMonthChange.call(_this, { type: 'move-next', curMonth: _this.$date });
                } else if (direction === 4) {//向右
                    _this.$date = getPreMonth(_this.$date);
                    _this.render(_this.$date, {}, 'pre');
                    _this.onMonthChange && _this.onMonthChange.call(_this, { type: 'move-pre', curMonth: _this.$date });
                };
            };
        });

    },
    // 渲染函数
    render: function (dateData = formatDate(new Date), options = {}, type = 'next') {
        // 配置
        var _this = this;
        var w = this.$el.offsetWidth || window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var width = options.width || this.$options.width || w;
        var height = options.height || this.$options.height || w;
        var marks = (options.marks || this.$options.marks || []).slice(0, 4);//最多四个
        var resHtml = '';//渲染内容html
        var def = {
            weekTit: ['日', '一', '二', '三', '四', '五', '六'],
        },
            // 模板
            CLASS_NAME = ['week_tit', 'week_wrap', 'botm', 'marks_bar_box'],
            COMMON_TPL = [
                '<ul class="{{className}}" style="{{style}}" data-type="{{dataType}}">{{contentHtml}}</ul>',
                '<div class="{{className}}" style="{{style}}">{{contentHtml}}</div>',
            ],
            TOGGLE_BAR_TPL = '<div class="pre" data-toggle="pre" data-type="toggle"></div><div class="mid">{{contentHtml}}</div><div class="next" data-toggle="next" data-type="toggle"></div>',
            WEEK_TIT_TPL = '<li class="week_tit_item" style="{{style}}">{{weekTitHtml}}</li>',
            ITEM_STYLE = 'width:{{w}}px;height:{{h}}px;line-height:{{h}}px',
            STYLE = 'width:{{w}}px;height:{{h}}px;',
            WEEK_TPL = '<li class="week_item" style="{{style}}">{{weekHtml}}</li>',
            DAY_TPL = '<div class="day_item {{className}}" style="{{style}}" data-date="{{dataDate}}" data-type="date"><div class="circle" style="{{subStyle}}" data-date="{{dataDate}}" data-type="date">{{dayHtml}}</div></div>',
            MARKS_BAR = '<div class="marks_bar_item"><span class="bar-icon" style="{{iconStyle}}"></span><span>{{name}}</span></div>';

        this.$date = formatDate(dateData);

        function setOuterHtml (targetTpl, str, classNameStr, styleStr, dataType) {
            var res = targetTpl;
            res = res.repeats({
                contentHtml: str,
                className: classNameStr,
                style: styleStr || '',
                dataType: dataType || ''
            });
            return res;
        };
        // 月份切换
        function getToggleBarHtml () {
            var r = '';
            var d = new Date(dateData);
            r = COMMON_TPL[1].repeats({
                contentHtml: TOGGLE_BAR_TPL.repeats({
                    contentHtml: d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日' + '&nbsp;' + '星期' + def.weekTit[d.getDay()],
                }),
                className: 'toggleBar',
                style: ITEM_STYLE.repeats({
                    w: '100%',
                    h: height / 5.5,
                }),
            });

            resHtml += r;
            return r;
        };
        // 星期bar
        function getWeekTitHtml () {
            var weekTitRes = [], r = '';
            for (var i = 0, len = def.weekTit.length; i < len; i++) {
                weekTitRes.push(WEEK_TIT_TPL.repeats({
                    weekTitHtml: def.weekTit[i],
                    style: ITEM_STYLE.repeats({
                        w: width / 7,
                        h: height / 7,
                    })
                }));
            };
            r = setOuterHtml(COMMON_TPL[0], weekTitRes.join(''), CLASS_NAME[0]);
            resHtml += r;
            return r;
        };

        function getWeekHtml (week) {
            var weekRes = [], r = '';
            for (var i = 0, len = week.length; i < len; i++) {
                weekRes.push(WEEK_TPL.repeats({
                    weekHtml: week[i],
                    style: ITEM_STYLE.repeats({
                        w: width,
                        h: height / 7,
                    })
                }));
            };
            r = setOuterHtml(COMMON_TPL[0], weekRes.join(''), CLASS_NAME[1], '', 'move');
            resHtml += r;
            return r;
        };
        //marks 标注bar
        function getBottomMarksBarHtml () {
            var barRes = [], r = '';
            if (!marks.length) return r;
            for (var i = 0; i < marks.length; i++) {
                var bgImgBar = '', bgColor = '';
                if (marks[i].bgImgBar || marks[i].bgImg) {
                    bgImgBar = ';background-image: url(' + (marks[i].bgImgBar || marks[i].bgImg || '') + ')';
                } else {
                    bgColor = ';background-color:' + (marks[i].bgColor || '')
                };
                barRes.push(MARKS_BAR.repeats({
                    iconStyle: bgColor + bgImgBar,
                    name: marks[i].name || ''
                }));
            };
            r = setOuterHtml(COMMON_TPL[1], barRes.join(''), CLASS_NAME[3]);
            resHtml += r;
            return r;
        };

        // 日历数组
        function getCalendarArr (dateData) {
            var _date = new Date(dateData);
            var year = _date.getFullYear(); //年
            var month = _date.getMonth() + 1;  //月
            var canlender = [];
            var dates = {
                firstDay: new Date(year, month - 1, 1).getDay(),
                lastMonthDays: [],// 上个月末尾几天
                currentMonthDys: [], // 本月天数
                nextMonthDays: [], // 下个月开始几天
                endDay: new Date(year, month, 0).getDay(),
                weeks: [],
                weeksTpl: [],
            };

            // 循环上个月末尾几天添加到数组
            for (var i = dates.firstDay; i > 0; i--) {
                var d = new Date(year, month - 1, -i + 1).getDate(), fullDate = formatDate(year + '-' + (month - 1) + '-' + d);
                dates.lastMonthDays.push({
                    'year': year,
                    'month': month - 1,
                    'date': d,
                    'fullDate': fullDate,
                    'tpl': DAY_TPL.repeats({
                        dayHtml: d,
                        style: ITEM_STYLE.repeats({
                            w: width / 7,
                            h: height / 7,
                        }),
                        className: 'first-day-item'
                    })
                });
            };

            // 循环本月天数添加到数组
            for (var i = 1, len = new Date(year, month, 0).getDate(); i <= len; i++) {
                var activeCurDay = false,
                    activeIndex = '',
                    fullDate = formatDate(year + '-' + month + '-' + i),
                    subStyle = '',
                    bgImg = '';

                // 激活标注样式
                for (var k = 0, marksLen = marks.length; k < marksLen; k++) {
                    if (marks[k].list.indexOf(fullDate) > -1) {
                        activeIndex = k;
                        if (marks[k].bgImg) {
                            bgImg = ';color:' + (marks[k].color || '#fff') + ';background-image: url(' + marks[k].bgImg + ')';
                        } else if (marks[k].bgColor || marks[k].color) {
                            subStyle = 'color:' + (marks[k].color || '#fff') + ';background-color:' + (marks[k].bgColor || '');
                        };
                    };
                };

                activeCurDay = _this.$date === fullDate;

                dates.currentMonthDys.push({
                    'year': year,
                    'month': month,
                    'date': i,
                    'activeIndex': activeIndex,
                    'activeCurDay': activeCurDay,
                    'tpl': DAY_TPL.repeats({
                        dayHtml: i,
                        style: ITEM_STYLE.repeats({
                            w: width / 7,
                            h: height / 7,
                        }) + bgImg,
                        className: 'cur-day-item' + (activeCurDay ? ' active-cur-day-item' : ''),
                        subStyle: subStyle,
                        dataDate: fullDate
                    })
                });
            };

            // 循环下个月开始几天 添加到数组
            for (var i = 1; i < 7 - dates.endDay; i++) {
                dates.nextMonthDays.push({
                    'year': year,
                    'month': month + 1,
                    'date': i,
                    'fullDate': formatDate(year + '-' + (month + 1) + '-' + i),
                    'tpl': DAY_TPL.repeats({
                        dayHtml: i,
                        style: ITEM_STYLE.repeats({
                            w: width / 7,
                            h: height / 7,
                        }),
                        className: 'end-day-item'
                    })
                });
            };

            // 拼接数组
            canlender = canlender.concat(dates.lastMonthDays, dates.currentMonthDys, dates.nextMonthDays);

            for (var i = 0, canlenderLen = canlender.length; i < canlenderLen; i++) {
                if (i % 7 == 0) {
                    dates.weeks[parseInt(i / 7)] = new Array(7);
                    dates.weeksTpl[parseInt(i / 7)] = '';
                };
                dates.weeks[parseInt(i / 7)][i % 7] = canlender[i];
                dates.weeksTpl[parseInt(i / 7)] = dates.weeksTpl[parseInt(i / 7)] + canlender[i]['tpl'];
            };

            getWeekHtml(dates.weeksTpl);
        }

        var div = document.createElement('div');
        function mounted () {
            _this.$el.innerHTML = '';
            div.setAttribute('class', '__calendar');
            div.setAttribute('style', STYLE.repeats({
                w: width,
            }));
            div.innerHTML = resHtml;
            _this.$el.appendChild(div);
        };

        // set Calendar html
        getToggleBarHtml();
        getWeekTitHtml();
        getCalendarArr(dateData);
        getBottomMarksBarHtml();
        mounted();

        // set anmation
        var anmation_type = type === 'next' ? '__calendar_anmation_out' : '__calendar_anmation_in';
        div.querySelectorAll('.week_wrap')[0].classList.add(anmation_type);
        setTimeout(function () {
            div.querySelectorAll('.week_wrap')[0].classList.remove(anmation_type);
        }, 160);

    },

};

Calendar.prototype = protoObj;

export default Calendar

