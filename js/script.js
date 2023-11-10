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

  var cachedData = localStorage.getItem(customRules);
  var cacheTime = localStorage.getItem(customRules + '-time');
  var now = new Date().getTime();
  if (cachedData && cacheTime && now - cacheTime < 10 * 60 * 1000) {
    var diff = Math.round((now - cacheTime) / 1000);
    var size = Math.round(cachedData.length / 1024);
    console.log(`从缓存中加载数据：${ruleName}，已缓存时间：${diff}秒，大小：${size}KB`);
    document.getElementById('json-text').value = cachedData;
  } else {
    console.log(`请求数据：${ruleName}`);
    Promise.all([
      fetch(mainRules).then((response) => {
        return response.text();
      }),
      fetch(customRules).then((response) => {
        return response.text();
      }),
    ]).then(([mainData, customData]) => {
      const lastData = mergeObjects(JSON.parse(mainData), JSON.parse(customData)),
        data = JSON.stringify(lastData);
      localStorage.setItem(customRules, data);
      localStorage.setItem(customRules + '-time', now);
      var size = Math.round(data.length / 1024);
      console.log(`缓存数据：${ruleName}，大小：${size}KB`);
      document.getElementById('json-text').value = data;
    });
  }
}

function mergeObjects(obj1, obj2) {
  // 使用深度复制以避免修改原始对象
  let result = JSON.parse(JSON.stringify(obj1));

  // 遍历第二个对象
  obj2.forEach((item2) => {
    // 获取第二个对象的键
    let key2 = Object.keys(item2)[0];

    // 如果第一个对象中已经存在相同的键，则将popup_rules合并
    if (result.some((item1) => Object.keys(item1)[0] === key2)) {
      let index = result.findIndex((item1) => Object.keys(item1)[0] === key2);
      let rules1 = JSON.parse(result[index][key2]);
      let rules2 = JSON.parse(item2[key2]);

      // 合并popup_rules
      rules1.popup_rules = rules1.popup_rules.concat(rules2.popup_rules);

      // 更新合并后的值
      result[index][key2] = JSON.stringify(rules1);
    } else {
      // 如果第一个对象中不存在相同的键，则直接将第二个对象添加到结果中
      result.push(item2);
    }
  });

  return result;
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
