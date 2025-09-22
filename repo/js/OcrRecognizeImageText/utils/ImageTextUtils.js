function info(msg, must = false, log_off = false) {
    if (log_off || must) {
        log.info(msg)
    }
}

function warn(msg, must = false, log_off = false) {
    if (log_off || must) {
        log.warn(msg)
    }
}

function debug(msg, must = false, log_off = false) {
    if (log_off || must) {
        log.debug(msg)
    }
}

function error(msg, must = false, log_off = false) {
    if (log_off || must) {
        log.error(msg)
    }
}

function throwError(msg) {
    notification.error(`${msg}`);
    throw new Error(msg);
}

function openCaptureGameRegion() {
    return captureGameRegion()
}

function closeCaptureGameRegion(region) {
    region.Dispose()
}

function findByCaptureGameRegion(region, templateMatchObject) {
    return region.find(templateMatchObject)
}

function findMultiByCaptureGameRegion(region, templateMatchObject) {
    return region.findMulti(templateMatchObject)
}

function mTo(x, y) {
    moveMouseTo(x, y);
}

function recognitionObjectOcr(x, y, width, height) {
    return RecognitionObject.Ocr(x, y, width, height)
}

function downLeftButton() {
    leftButtonDown();
}

function upLeftButton() {
    leftButtonUp();
}

function moveByMouse(x, y) {
    moveMouseBy(x, y);
}

async function wait(ms = 1000) {
    // 等待300毫秒，确保按下操作生效
    await sleep(ms);
}

function downClick(x, y) {
    click(x, y);
}

/**
 * 检查资源是否存在
 * @param {Object} res - 需要检查的资源对象
 * @returns {Boolean} 返回资源是否存在的结果
 *                  true表示资源存在，false表示资源不存在
 */
function isExist(res) {
    return res.isExist() // 调用资源对象的isExist方法获取存在状态
}

function sendMessage(msg) {
    notification.Send(msg);
}

// 更新settings.json文件
async function updateSettingsFile(settingsArray) {
    const settingsPath = "./settings.json";
    // let settingsArray = JSON.parse(await file.readText(settingsPath));
    if (!(settingsArray.length >= 2)) {
        try {
            // 读取现有设置
            const content = file.readTextSync(settingsPath);
            settingsArray = JSON.parse(content);
        } catch (e) {
            // 文件不存在或解析失败时创建默认设置
            throw new Error("设置文件不存在");
        }
        warn("设置文件格式不正确，请检查settings.json文件", true)
    }
    let json = JSON.stringify(settingsArray, null, 2)
        .replaceAll(']"', ']')
        .replaceAll('"[','[')
        .replaceAll('\\"', '"')
        .replaceAll('\\\\n', '\\n')
    // warn("settings==>"+json, true)
    // 写入更新后的设置
    const success = file.writeTextSync(settingsPath, json);
    if (!success) {
        throwError("写入设置文件失败");
    }
}
// 定义一个异步函数来绘制红框并延时清除
async function drawAndClearRedBox(result, delay) {
    // 绘制红框
    let drawRegion = openCaptureGameRegion().DeriveCrop(result.x, result.y, result.width, result.height).DrawSelf("icon");

    // 延时
    await wait(delay);

    // 清除红框
    if (drawRegion) {
        drawRegion = openCaptureGameRegion().DeriveCrop(0, 0, 0, 0).DrawSelf("icon");
        drawRegion = null; // 释放对象
    }
}
function templateMatchFind(path, x = 0, y = 0, width = genshinJson.width, height = genshinJson.height, threshold = undefined) {
    // 使用模板匹配方法创建识别对象
    // 从指定路径读取图像矩阵并进行模板匹配
    let templateMatchButtonRo = RecognitionObject.TemplateMatch(file.ReadImageMatSync(`${path}`), x, y, width, height);
    if (threshold) {
        templateMatchButtonRo.threshold = threshold;
    }
    // 捕获游戏区域并查找匹配的识别对象
    let region = openCaptureGameRegion()
    let button = region.find(templateMatchButtonRo);
    closeCaptureGameRegion(region)
    // 返回查找到的按钮对象
    return button
}

function templateMatchFindByJson(json) {
    return templateMatchFind(`${json.path_base}${json.text}${json.type}`, json.x, json.y, json.width, json.height, json.threshold)
}

this.ImageTextUtils = {
    isExist,
    info,
    warn,
    debug,
    error,
    throwError,
    openCaptureGameRegion,
    closeCaptureGameRegion,
    findByCaptureGameRegion,
    findMultiByCaptureGameRegion,
    mTo,
    recognitionObjectOcr,
    downLeftButton,
    upLeftButton,
    moveByMouse,
    wait,
    downClick,
    updateSettingsFile,
    sendMessage,
    drawAndClearRedBox,
    templateMatchFind,
    templateMatchFindByJson,
};