(async function () {
    if(settings.openOcr){
        await ocr()
        return;
    }
    await main()
})();
async function main() {
    await ocrPhysical()
}
async function ocr() {
    let imagePath = settings.url
    // 创建识别对象
    let recognitionObject = RecognitionObject.TemplateMatch(file.ReadImageMatSync(imagePath));

    // 识别图标
    const ro = captureGameRegion();
    let result = ro.find(recognitionObject);
    ro.dispose();
    // 输出坐标和识图范围推荐
    log.info(`图标 ${imagePath} 的坐标: x=${result.x}, y=${result.y}, width=${result.width}, height=${result.height}，识图范围推荐: ${result.x - 1}, ${result.y - 1}, ${result.width + 2}, ${result.height + 2}`);

    await sleep(50); // 确保识别之间有足够的时间间隔
    let recognitionObjectOcr = RecognitionObject.Ocr(result.x-1, result.y-1, result.width+2, result.height+2);
    let region = captureGameRegion()
    let res = region.find(recognitionObjectOcr);
    region.Dispose()
    log.info(`[-]识别结果: ${res.text}, 原始坐标: x=${res.x}, y=${res.y},width:${res.width},height:${res.height}`);
}
//====================
const genshinJson = {
    width: 1920,//genshin.width,
    height: 1080,//genshin.height,
}
const commonPath = 'assets/'
const commonMap = new Map([
    ['main_ui', {
        path: `${commonPath}`,
        name: '主界面',
        type: '.png',
    }],
    ['yue', {
        path: `${commonPath}`,
        name: 'yue',
        type: '.jpg',
    }],
])

function getJsonPath(key) {
    return commonMap.get(key);
}

async function saveOnlyNumber(str) {
    return parseInt(str.match(/\d+/g).join(''));
}
async function ocrPhysical(){
    let ms = 600
    await toMainUi();
    //设置最小可执行体力值
    let minPhysical = parseInt(settings.minPhysical)
    //打开地图
    await keyPress('M')
    await sleep(ms)
    //点击+ 按钮 x=1264,y=39,width=18,height=19
    let add_obj = {
        x: 1264,
        y: 39,
    }
    await click(add_obj.x, add_obj.y)
    await sleep(ms)
    //定位月亮
    let jsonPath = getJsonPath('yue');
    let tmJson = {
        path: `${jsonPath.path}${jsonPath.name}${jsonPath.type}`,
        x: 1600,
        y: 20,
        width: 186,
        height: 52,
    }
    let templateMatchButtonRo = RecognitionObject.TemplateMatch(file.ReadImageMatSync(`${tmJson.path}`), tmJson.x, tmJson.y, tmJson.width, tmJson.height);
    let region = captureGameRegion()
    let button = region.find(templateMatchButtonRo);
    region.Dispose()
    if (!button.isExist()) {
        throwError(`未找到${tmJson.path}，请检查路径是否正确`)
    }
    //识别体力 x=1625,y=31,width=79,height=30 / x=1689,y=35,width=15,height=26
    let ocr_obj = {
        // x: 1623,
        x: button.x + button.width,
        y: 32,
        width: 61,
        height: 30
    }
    try {
        let recognitionObjectOcr = RecognitionObject.Ocr(ocr_obj.x, ocr_obj.y, ocr_obj.width, ocr_obj.height);
        region = captureGameRegion()
        let res = region.find(recognitionObjectOcr);
        region.Dispose()
        log.info(`[-]识别结果: ${res.text}, 原始坐标: x=${res.x}, y=${res.y},width:${res.width},height:${res.height}`);
        let remainder = await saveOnlyNumber(res.text)
        let execute = (remainder - minPhysical) >= 0
        log.info(`最小可执行原粹树脂:{min},原粹树脂:{key}`, minPhysical, remainder,)
        log.info(`是否执行:{key}`, execute)
        return {
            ok: execute,//是否执行
            min: minPhysical,//最小可执行体力值
            remainder: remainder,//当前体力值
        }
    } catch (e) {
        throwError(`识别失败,err:{err}`, e)
    } finally {
        await toMainUi()
    }

}

function throwError(msg) {
    notification.error(`${msg}`);
    throw new Error(`${msg}`);
}

// 判断是否在主界面的函数
const isInMainUI = () => {
    // let name = '主界面'
    let main_ui = getJsonPath('main_ui');
    // 定义识别对象
    let paimonMenuRo = RecognitionObject.TemplateMatch(
        file.ReadImageMatSync(`${main_ui.path}${main_ui.name}${main_ui.type}`),
        0,
        0,
        genshinJson.width / 3.0,
        genshinJson.width / 5.0
    );
    let captureRegion = captureGameRegion();
    let res = captureRegion.find(paimonMenuRo);
    captureRegion.Dispose()
    return !res.isEmpty();
};

async function toMainUi() {
    let ms = 300
    let index = 1
    await sleep(ms);
    while (!isInMainUI()) {
        await sleep(ms);
        await genshin.returnMainUi(); // 如果未启用，则返回游戏主界面
        await sleep(ms);
        if (index > 3) {
            throwError(`多次尝试返回主界面失败`);
        }
        index += 1
    }

}