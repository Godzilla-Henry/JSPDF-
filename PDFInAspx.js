// A4尺寸
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
// 控制點 陣列
var ControlPointArrary = [];
// 設置pdf
var doc = new jsPDF('', 'pt', 'a4');
// 下載檔案
function download() {
    main($("#content") , function (cb2) {
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
// 主要轉換
function main(element, callback){
    console.log(element);
    // 節點元素跟畫布會差8倍
    html2canvas(element[0],{
        dpi: 96 * 8,
        scale: 8,
        onclone: function (clonedDoc) {
            clonedDoc.getElementById('content').style.display = 'block';
        },
    })
    .then(function(canvas) {
        // 畫布寬高
        var CanvasWidth = canvas.width;
        var CanvasHeight = canvas.height;
        console.log("canvas.width", canvas.width);
        console.log("CanvasWidth", CanvasWidth);
        console.log("CanvasHeight", CanvasHeight);
        // 圖片寬高
        var ImgWidth = 555.28; //content width
        var ImgHeight = 555.28/CanvasWidth * CanvasHeight;
        console.log("ImgHeight", ImgHeight);
        calBP($("#content"), ImgHeight);
        // 暫存
        var ImgHeightTmp = ImgHeight;
        // 結束指標
        var position = 0;

        // HTML轉IMG
        var ImgData = canvas.toDataURL('image/jpeg', 1.0);

        if (ImgHeightTmp < 841.89) {
            doc.addImage(ImgData, 'JPEG', 20, 0, ImgWidth, ImgHeight);
        }else {
            var i = 0;
            while(ImgHeightTmp > 0) {
                doc.addImage(ImgData, 'JPEG', 20, position, ImgWidth, ImgHeight);
                ImgHeightTmp -= 841.89;
                position -= (841.89 - BP[i]);
                addBlank(0, A4_HEIGHT - BP[i], A4_WIDTH, BP[i]);
                if(ImgHeightTmp > 0) {
                    doc.addPage();
                }
                i += 1;
            }
        }
        callback(1);
    })
}

// 增加空白
function addBlank(_x, _y, width,height){
    console.log("遮罩");
    doc.setFillColor(0,0,0);
    doc.rect(_x, _y, width, height, 'F');
}

// 回推指標高度 陣列
var BP = [];
function calBP(element, ImgHeight) {
    $("#content").show();
    console.log("element.height()", element.height());
    // 比率
    var rate = ImgHeight / element.height();
    // 需要完整的元素的高 陣列
    var completeEl = [];
    $(".checkComplete").each(function (i) {
         console.log($(this).height());
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
        if(sum > A4_HEIGHT){
            pageHeight.push(sum - el);
            sum = el;
        }
    });
    pageHeight.push(sum);
    console.log("pageHeight", pageHeight);
    pageHeight.forEach(function (el) {
        BP.push( A4_HEIGHT - el);
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