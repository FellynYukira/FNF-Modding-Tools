const inputButton = document.getElementById('char-file');
const chooseFileButton = document.getElementById('choose-file');
const selectedFileText = document.getElementById("selected-file-txt");
const convertButton = document.getElementById('convert-button');

const isPlayerCheckbox = document.getElementById("is-player-checkbox");
const isGFCheckbox = document.getElementById("is-gf-checkbox");

isPlayerCheckbox.classList.add("not-active");
isGFCheckbox.classList.add("not-active");
convertButton.classList.add("not-active");

var curFiles = null;
var curData = null;

chooseFileButton.addEventListener("click", function() { inputButton.click() });
convertButton.addEventListener("click", function() {
    if (curData == null) return;

    var doc = document.implementation.createDocument("", "", null);
    var charElem = doc.createElement("character");

    if (isPlayerCheckbox.checked) charElem.setAttribute("isPlayer", true);
    if (isGFCheckbox.checked) charElem.setAttribute("isGF", true);
    if (curData.position[0] != 0) charElem.setAttribute("x", curData.position[0]);
    if (curData.position[1] != 0) charElem.setAttribute("y", curData.position[1]);
    if (curData.camera_position[0] != 0) charElem.setAttribute("camx", curData.camera_position[0]);
    if (curData.camera_position[1] != 0) charElem.setAttribute("camy", curData.camera_position[1]);
    if (curData.sing_duration != 4) charElem.setAttribute("holdTime", curData.sing_duration);
    if (curData.flipX) charElem.setAttribute("flipX", true);
    if (curData.healthicon != null) charElem.setAttribute("icon", curData.healthicon.replace("icon-", ""));
    if (curData.healthbar_colors != null) charElem.setAttribute("color", rgbToHex(curData.healthbar_colors[0], curData.healthbar_colors[1], curData.healthbar_colors[2]));
    if (curData.scale != 1) charElem.setAttribute("scale", curData.scale);
    if (curData.no_antialiasing) charElem.setAttribute("antialiasing", false);
    if (curData.image != null) charElem.setAttribute("sprite", curData.image.replace("characters/", ""));

    charElem.appendChild(doc.createComment(" Converted by FNF Moddin' Tools "));

    for (let i in curData.animations) {
        var anim = curData.animations[i];
        if (anim) {
            var animElem = doc.createElement("anim");
            animElem.setAttribute("name", anim.anim);
            animElem.setAttribute("anim", anim.name);
            if (anim.indices.length > 0) animElem.setAttribute("indices", anim.indices.join(','));
            animElem.setAttribute("fps", anim.fps);
            animElem.setAttribute("loop", anim.loop);
            animElem.setAttribute("x", anim.offsets[0]);
            animElem.setAttribute("y", anim.offsets[1]);
            charElem.appendChild(animElem);
        }
    }
    var prettyXml = formatXml(new XMLSerializer().serializeToString(charElem));
    downloadFile(curFiles.replace(".json", ".xml"), "<!DOCTYPE codename-engine-character>\n" + prettyXml);
});

inputButton.addEventListener("change", function() {
    if (inputButton.files.length > 0) {
        var file = inputButton.files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function(event) {
                curData = JSON.parse(event.target.result);
                curFiles = file.name;

                selectedFileText.textContent = file.name;

                isPlayerCheckbox.classList.remove("not-active");
                isGFCheckbox.classList.remove("not-active");
                convertButton.classList.remove("not-active");
            }
            reader.onerror = function() {
                curData = null;
                curFiles = null;

                selectedFileText.textContent = "No file selected";

                isPlayerCheckbox.classList.add("not-active");
                isGFCheckbox.classList.add("not-active");
                convertButton.classList.add("not-active");

                console.log("error reading file");
            }
        }
    }
});

function formatXml(xml) {
    const PADDING = '\t'
    const reg = /(>)(<)(\/*)/g;
    let pad = 0;

    xml = xml.replace(reg, '$1\r\n$2$3');

    return xml.split('\r\n').map((node, index) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/) && pad > 0) {
            pad -= 1;
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        pad += indent;

        return PADDING.repeat(pad - indent) + node;
    }).join('\r\n');
}

function componentToHex(c) {var hex = c.toString(16); return hex.length == 1 ? "0" + hex : hex}
function rgbToHex(r, g, b) {return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)}

function downloadFile(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}