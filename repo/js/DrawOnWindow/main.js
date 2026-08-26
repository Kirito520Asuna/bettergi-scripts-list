async function main() {
    let x = parseInt((settings.x||'0').replace(/\D/g, ""))
    let y = parseInt((settings.y||'0').replace(/\D/g, ""))
    let w = parseInt((settings.w||'1980').replace(/\D/g, ""))
    let h = parseInt((settings.h||'1080').replace(/\D/g, ""))
    log.info(`OCR:${x},${y},${w},${h}`)
    let recognitionObject = RecognitionObject.Ocr(x, y, w, h);
    recognitionObject.Name = "debug";
    recognitionObject.DrawOnWindow = true;
    const gameRegion = captureGameRegion();
    try {

        const region = gameRegion.find(recognitionObject);
        log.info(`OCR:${region.text}`)
    }finally {
        gameRegion?.dispose();
    }

    await drawAndClearBox({x: x, y:y, width: w, height: h});
}

/**
 * 在游戏画面上绘制红框并在延时后自动清除
 * 通过截取游戏区域并绘制图标来实现红框标记效果，延时结束后通过重绘同一区域来清除红框
 * @param {Object} result - 目标区域坐标对象，包含 x、y、width、height 属性
 * @param {number} [delay=1000] - 红框显示的延时（毫秒），默认1000ms
 * @param {Pen} [pen=new Pen(Color.Red, 2)] - 红框的画笔对象，默认红色实线
 * @returns {Promise<void>}
 */
export async function drawAndClearBox(result, delay = 1000, pen ) {
    const ro1 = captureGameRegion();
    const de_pen=new Pen(Color.FromArgb(255,209,87,255), 2)
    try {
        const drawRegion = ro1.DeriveCrop(result.x, result.y, result.width, result.height);
        if (pen){
            drawRegion.DrawSelf("icon", pen);
        }else {
            drawRegion.DrawSelf("icon",de_pen);
        }
    } finally {
        ro1.dispose();
    }

    await sleep(delay);

    const ro2 = captureGameRegion();
    try {
        const drawRegion2 = ro2.DeriveCrop(result.x, result.y, result.width, result.height);
        try {
            if (pen){
                drawRegion2.DrawSelf("icon", pen);
            }else {
                drawRegion2.DrawSelf("icon",de_pen);
            }
        } finally {
            drawRegion2.dispose();
        }
    } finally {
        ro2.dispose();
    }
}

(async function () {
    await main()
})()