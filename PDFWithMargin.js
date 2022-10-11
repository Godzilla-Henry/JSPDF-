// A4尺寸
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
// 左右、上下距
var Margin_x = 20;
var Margin_y = 40;
// 實際在PDF上的寬高
var a4w = A4_WIDTH - (Margin_x * 2);
var a4h = A4_HEIGHT - (Margin_y * 2);
// 控制點 陣列
var ControlPointArrary = [];
//設置pdf
var doc = new jsPDF('', 'pt', 'a4');
//下載檔案
function download() {
    html2img($("#content")[0], function (cb2) {
        if (cb2) {
            //設置頁碼
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(12);
            doc.setTextColor(169, 169, 169);
            for (var i = 1; i <= pageCount; i++) {
                //設定頁面
                doc.setPage(i);
                //a4紙的尺寸[595.28,841.89]
                doc.text(String(i), 300 - 10, 842 - 20);
            }
            doc.save('自主查核表.pdf');
        }
    });
}

//主要轉換
function html2img(element, callback) {
    //將隱藏的div在html2canvas中顯示，提高解析度
    html2canvas(element, {
        dpi: 96 * 8,
        scale: 8,
        onclone: function (clonedDoc) {
            clonedDoc.getElementById('content').style.display = 'block';
        },
        logging: false
    })
    .then(function (canvas) {
        // 建立可畫圖層CTX
        var ctx = canvas.getContext('2d');
        // 圖片高
        var imgHeight = Math.floor(canvas.width * a4h / a4w);

        console.log("imgHeight", imgHeight);
        console.log("canvas.height", canvas.height);
        calBP($("#content"), imgHeight, canvas.height);
        // 從0開始貼
        var renderedHeight = 0;
        for (var i = 0; i < BP.length; i++) {
            // 每頁高寬
            var page = document.createElement("canvas");
            page.width = canvas.width;
            page.height = Math.min(imgHeight, canvas.height - renderedHeight);

            // 複製貼上
            page.getContext('2d').putImageData(ctx.getImageData(0, renderedHeight, canvas.width, page.height), 0, 0);
            doc.addImage(page.toDataURL('image/jpeg', 1.0), 'JPEG', Margin_x, Margin_y, a4w, Math.min(a4h, a4w * page.height / page.width));

            var backPoint = a4w * BP[i] / page.width;
            console.log("backPoint", backPoint);
            addBlank(0, a4h + Margin_y - backPoint, backPoint);
            renderedHeight += imgHeight - BP[i];
            // 分頁
            if (renderedHeight < canvas.height) doc.addPage();
            delete page;
        }
        callback(1)
    });
}
//增加空白
function addBlank(_x, _y, height) {
    doc.setFillColor( 255, 255, 255);
    //doc.setFillColor(0, 0, 0);
    doc.rect(_x, _y, A4_WIDTH, height, 'F');
}

// 回推指標高度 陣列
var BP = [];
function calBP(element, ImgHeight, CanvasHeight) {
    $("#content").show();
    console.log("element.height()", element.height());
    // 比率
    var rate = CanvasHeight / element.height();
    console.log("rate", rate);

    // 需要完整的元素的高 陣列
    var completeEl = [];
    $(".checkComplete").each(function (i) {
        //console.log($(this).height());
        completeEl.push($(this).height());
    });
    console.log("completeEl", completeEl);

    // 計算後各頁的高 陣列
    var pageHeight = [];
    var sum = 0;
    completeEl.forEach(function (el) {
        el = el * rate;
        console.log(el);
        // console.log("總和", sum);
        sum += el;
        if (sum > ImgHeight) {
            pageHeight.push(sum - el);
            sum = el;
        }
    });
    pageHeight.push(sum);
    console.log("pageHeight", pageHeight);
    pageHeight.forEach(function (el) {
        BP.push(ImgHeight - el);
    });
    console.log("BP", BP);
    $("#content").hide();
}

//自主檢核表資料
function SelfCheckListCaseData(callback) {
    console.log("載入資料");
    var Lists = [];
    Lists.push($('#body_content_hf_caseID').val());
    var postdata = { name: Lists };

    $.ajax({
        type: "POST",
        url: 'CaseGmlUplaodSelfCheckList.aspx/SelfCheckListCaseData',
        data: JSON.stringify(postdata),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function (Jdata) {
            data = jQuery.parseJSON(Jdata.d);
            console.log(Jdata.d);
            
            $('#pdf01').html(data[0]["Value"]);
            $('#pdf02').html(data[1]["Value"]);
            (data[2]["Value"] == "01") ?
            $('#pdf03').html("■ 自行施測 □ 外包施測"):
            $('#pdf03').html("□ 自行施測 ■ 外包施測");
            $('#pdf04').html(data[3]["Value"]);
            $('#pdf05').html(data[4]["Value"]);
            if (data[5]["Value"] == "01") {
                $('#pdf06').html("■ 經緯儀  □ 衛星定位儀器  □ 潛盾施工  □ 其它：");
            } else if (data[5]["Value"] == "02") {
                $('#pdf06').html("□ 經緯儀  ■ 衛星定位儀器  □ 潛盾施工  □ 其它：");
            } else if (data[5]["Value"] == "03") {
                $('#pdf06').html("□ 經緯儀  □ 衛星定位儀器  ■ 潛盾施工  □ 其它：");
            } else {
                $('#pdf06').html("□ 經緯儀  □ 衛星定位儀器  □ 潛盾施工  ■ 其它：");
                $('#pdf07').html(data[6]["Value"]);
            }

            ControlPointArrary = data[21]["Value"].split('；');
            var str_controlP = "";
            $.each(ControlPointArrary, function (index, value) {
                var ControlPointSingal = value.split('、');
                str_controlP += "&nbsp;&nbsp;&nbsp;&nbsp;控制點編號：" + ControlPointSingal[0] + "<br />&nbsp;&nbsp;&nbsp;&nbsp;E坐標：" + ControlPointSingal[1] + "  N坐標：" + ControlPointSingal[2] + " 間接高程：" + ControlPointSingal[3] + " 公尺<br />";
            })
            $('#pdf22').html(str_controlP);

            var str_point = "";
            str_point += "&nbsp;&nbsp;&nbsp;&nbsp;孔蓋：" + data[18]["Value"] + " 點；設施物：" + data[19]["Value"] + "點；管線：" + data[20]["Value"] + "點"
            $('#pdf21').html(str_point);

            (data[10]["Value"] == "0") ?
            $('#pdf12').html("&nbsp;&nbsp;&nbsp;&nbsp;□ 是  ■ 否。"):
            $('#pdf12').html("&nbsp;&nbsp;&nbsp;&nbsp;■ 是  □ 否。");
            (data[11]["Value"] == "0") ?
            $('#pdf13').html("□ 是  ■ 否。") :
            $('#pdf13').html("■ 是  □ 否。");
            (data[12]["Value"] == "0") ?
            $('#pdf14').html("□ 是  ■ 否。") :
            $('#pdf14').html("■ 是  □ 否。");
            (data[13]["Value"] == "0") ?
            $('#pdf15').html("□ 是  ■ 否。") :
            $('#pdf15').html("■ 是  □ 否。");
            (data[14]["Value"] == "0") ?
            $('#pdf16').html("□ 是  ■ 否。") :
            $('#pdf16').html("■ 是  □ 否。");
            (data[15]["Value"] == "0") ?
            $('#pdf17').html("□ 是  ■ 否。") :
            $('#pdf17').html("■ 是  □ 否。");
            (data[16]["Value"] == "0") ?
            $('#pdf18').html("□ 是  ■ 否。") :
            $('#pdf18').html("■ 是  □ 否。");
            (data[17]["Value"] == "0") ?
            $('#pdf19').html("□ 是  ■ 否。") :
            $('#pdf19').html("■ 是  □ 否。");

            (data[7]["Value"] == "1") ?
            $('#pdf08').html("■ 是  □ 否。") :
            $('#pdf08').html("□ 是  ■ 否。");
            $('#pdf09').html(data[8]["Value"]);
            $('#pdf10').html(data[9]["Value"]);

            callback(1);
        },
        error: function (Jdata) {
            console.log("error," + Jdata);
        }
    });
}

$(document).ready(function () {
    SelfCheckListCaseData(function (callback) {
        if (callback) {
            console.log("OK");
        }
    })
});