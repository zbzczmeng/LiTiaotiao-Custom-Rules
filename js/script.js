function loadJSON() {
  var urls = {
    basic: 'https://raw.githubusercontent.com/zbzczmeng/LiTiaotiao-Custom-Rules/main/BasicRules.json',
    all: 'https://raw.githubusercontent.com/zbzczmeng/LiTiaotiao-Custom-Rules/main/AllRules.json',
    custom: 'https://raw.githubusercontent.com/zbzczmeng/LiTiaotiao-Custom-Rules/p60pro/MyCustomRules.json',
  };
  var mainRules = urls['all'];
  var customRules = urls['custom'];
  var ruleName = '全部规则';

  var ruleType = document.getElementById('rule-type');
  ruleType.innerHTML = `<b>当前选择的是<span class="highlight">${ruleName}</span></b>`;

  Promise.all([
    fetch(mainRules).then((response) => {
      return response.text();
    }),
    fetch(customRules).then((response) => {
      return response.text();
    }),
  ]).then(([mainData, customData]) => {
    let object1 = reconstruction(JSON.parse(mainData)),
      object2 = reconstruction(JSON.parse(customData));

    const lastData = mergeObjects(object1, object2),
      data = JSON.stringify(lastData);
    var size = Math.round(data.length / 1024);
    console.log(`缓存数据：${ruleName}，大小：${size}KB`);
    document.getElementById('json-text').value = data;
  });
}

function mergeObjects(baseObj, newObj) {
  // Iterate through each object in the base array
  for (let baseItem of baseObj) {
    const baseId = Object.keys(baseItem)[0];
    const baseRules = JSON.parse(baseItem[baseId]).popup_rules;

    // Find the corresponding object in the new array
    const newObjItem = newObj.find((item) => Object.keys(item)[0] === baseId);

    if (newObjItem) {
      const newRules = JSON.parse(newObjItem[baseId]).popup_rules;

      // Merge rules based on "id" content
      const mergedRules = baseRules.map((baseRule) => {
        const newRule = newRules.find((rule) => rule.id === baseRule.id);
        return newRule ? newRule : baseRule;
      });

      // Update the base object with merged rules
      baseItem[baseId] = JSON.stringify({ popup_rules: mergedRules });
    }
  }

  return baseObj;
}

function reconstruction(arr) {
  return arr.reduce((acc, item) => {
    let newItem = {};
    for (let key in item) {
      if (typeof item[key] === 'string') {
        newItem[key] = fixTrailingComma(item[key]);
      }
    }
    if (Object.keys(newItem).length > 0) {
      acc.push(newItem);
    }
    return acc;
  }, []);
}
// 修复JSON字符串末尾逗号的问题
function fixTrailingComma(jsonString) {
  // 移除末尾逗号
  return jsonString.replace(/,(\s*}]|\s*])/, '$1');
}

function copyText() {
  var text = document.getElementById('json-text');
  text.select();
  document.execCommand('copy');

  var message = document.getElementById('copy-message');
  message.textContent = '文本已成功复制到剪贴板中！';

  setTimeout(function () {
    message.textContent = '';
  }, 8000);
}

window.addEventListener('beforeunload', function () {
  localStorage.clear();
});
