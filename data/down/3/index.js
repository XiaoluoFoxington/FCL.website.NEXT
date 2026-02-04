document.getElementById('tab2Way3historyBtn').addEventListener('click', async () => {
  const app = document.getElementById('tab2Way3historyApp').value;
  const tag = document.getElementById('tab2Way3historyTag').value || 'latest';
  const version = document.getElementById('tab2Way3historyVersion').value || tag;
  const arch = document.getElementById('tab2Way3historyArch').value;

  const appMap = {'0': 'fcl', '1': 'zl' };
  const urlAppMap = { 'fcl': 'FCL', 'zl': 'ZalithLauncher' };
  const archMap = { '0': 'all', '1': 'arm64-v8a', '2': 'armeabi-v7a', '3': 'x86', '4': 'x86_64' };

  const appStr = appMap[app];
  const urlAppStr = urlAppMap[appStr];
  const archStr = archMap[arch];

  let fileName = '';
  if (appStr === 'fcl') {
    // FCL规则：带release字段，latest时省略版本号，始终拼接架构。
    fileName = tag === 'latest'
      ? `${urlAppStr}-release-${archStr}.apk`
      : `${urlAppStr}-release-${version}-${archStr}.apk`;
  } else if (appStr === 'zl') {
    // ZL规则：无release字段，all架构不拼后缀，非all才拼架构。
    fileName = archStr === 'all'
      ? `${urlAppStr}-${version}.apk`
      : `${urlAppStr}-${version}-${archStr}.apk`;
  }

  const downloadUrl = `https://download.fishcpy.top/dl/${appStr}/${tag}/${fileName}`;
  console.log("选择器模块：线3：构建下载链接：" + downloadUrl);
  window.open(downloadUrl, '_blank');
})
