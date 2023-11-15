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

    console.log(`网络规则：${object1.length}条/${Math.round(mainData.length / 1024)}KB，自定义规则：${object2.length}条/${Math.round(customData.length / 1024)}KB`);
    const lastData = mergeObjects(object1, object2),
      data = JSON.stringify(lastData);
    console.log(`合并后大小：${Math.round(data.length / 1024)}KB`);
    document.getElementById('json-text').value = data;
  });
}

function mergeObjects(baseObj, newObj) {
  // Iterate through each object in the base array
  const result = [];
  for (let newItem of newObj) {
    const newId = Object.keys(newItem)[0];
    const newRules = JSON.parse(newItem[newId]).popup_rules;

    // Find the corresponding object in the new array
    const baseObjItem = baseObj.find((item) => Object.keys(item)[0] === newId);

    if (baseObjItem) {
      const baseRules = JSON.parse(baseObjItem[newId]).popup_rules;
      const baseIds = baseRules.map((item) => item.id);
      const newFilterRules = newRules.filter((item) => !baseIds.includes(item.id));
      const mergedRules = [...baseRules, ...newFilterRules];

      result.push({ [newId]: JSON.stringify({ popup_rules: mergedRules }) });
    } else {
      result.push({ [newId]: JSON.stringify({ popup_rules: newRules }) });
    }
  }

  return result;
}

// 去除相同内容的方法
function removeDuplicates(array) {
  // 创建一个空对象用于存储唯一的元素
  var uniqueMap = {};

  // 过滤数组，仅保留第一次出现的元素
  var uniqueArray = array.filter(function (item) {
    var key = JSON.stringify(item);
    return uniqueMap.hasOwnProperty(key) ? false : (uniqueMap[key] = true);
  });

  return uniqueArray;
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
