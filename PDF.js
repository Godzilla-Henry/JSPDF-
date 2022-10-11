const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

// 建立PDF
var doc = new jsPDF('', 'pt', 'a4');

$(document).ready(function() {
    generateRandomData($("#randomData1"));
    generateRandomData($("#randomData2"));
});

//產生隨機筆數資料
function generateRandomData(jqueryEl){
    let dom = "";
    let count = getRandom(5,20);
    for (var i = 0; i < count; i++) {
        dom += "在本單元我們來討論非同步的（ asynchronous ） JavaScript ，為何其如此重要，並了解它如何有效率的處理像是從伺服器獲取資源的這類潛在性阻塞（ blocking ）操作 <br/>";
    }
    jqueryEl.html(dom);
}

//產生min到max之間的亂數
function getRandom(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
};

function main(element){
    // 節點元素跟畫布會差8倍
    html2canvas(element[0],{
        dpi: 96 * 8,
        scale: 8
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
        doc.save('TEST.pdf');
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
function calBP(element, ImgHeight){
    // 比率
    var rate = ImgHeight / element.height();

    // 需要完整的元素的高 陣列
    var completeEl = [];
    $(".checkComplete").each(function (i) {
        // console.log($(this).height());
        completeEl.push($(this).height());
    });

    // 計算後各頁的高 陣列
    var pageHeight = [];
    var sum = 0;
    completeEl.forEach(el => {
        el *= rate;
        // console.log("總和", sum);
        sum += el;
        if(sum > A4_HEIGHT){
            pageHeight.push(sum - el);
            sum = el;
        }
    });
    pageHeight.push(sum);

    pageHeight.forEach(el => {
        BP.push( A4_HEIGHT - el);
    });

    // BP[BP.length -1] + 0.22;
}

function download(){
    main($("#content"));
}