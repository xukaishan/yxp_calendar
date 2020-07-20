# yxp_calendar 日历插件


## Example
```js
// html
<div
    class="home"
    id="home"
/>
// js
import Calendar from 'yxp_calendar'
// 标注
var marksOpts = [//标注 类型[Array] 非必须
    {
        bgColor: '#3ac26d',
        color: '#fff',
        name: '已打卡',
        list: ['2020-07-02','2020-07-03']
    },
    {
        bgColor: '#ccc',
        color: '#fff',
        name: '未打卡',
        list: []
    },
    {
        bgColor: '#fcc800',
        color: '#fff',
        name: '已请假',
        list: []
    },
    {
        bgColor: '#3ac26d',//激活项 背景颜色 非必须
        color: '#f15725',//激活项 文字颜色 非必须
        bgImg: './dist/imgs/pic_01.png',//激活项图标， 不传默认为bgColor
        bgImgBar: './dist/imgs/pic_01_small.png',//底部标注图标,不传默认为bgImg图片
        name: '已完成', // 底部标注文字
        list: [] //激活项数组
    },
];
var el = document.querySelector('#home');
var myCalendar = new Calendar(el, {//el 为dom对象或选择器字符串
    date: new Date, //初始日期 类型[Date|String] 非必须，不传默认当前日期, ex: new Date | '2020-06-01'
    width: el.offsetWidth,//  类型[Number] 非必须，不传默认父容器宽, ex: 320
    height: el.offsetWidth * 0.9, // 类型[Number] 非必须，不传默认父容器宽, ex: 320
    isSwipeToggle: true,//是否开启滑动切换 非必须,不传默认关闭
    marks: marksOpts //标注 类型[Array] 非必须
})
```

