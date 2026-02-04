document.getElementById('tab2Way3historyBtn').addEventListener('click', async () => {
  const tag = document.getElementById('tab2Way3historyTag').value;
  const arch = document.getElementById('tab2Way3historyArch').value;
  const archMap = {
    '0': 'all',
    '1': 'arm64-v8a',
    '2': 'armeabi-v7a',
    '3': 'x86',
    '4': 'x86_64',
  };
  const archStr = archMap[arch];
  const downloadUrl = `https://download.fishcpy.top/dl/fcl/${tag}/FCL-release-${tag}-${archStr}.apk`;
  console.log("选择器模块：FCL：线3：构建下载链接：" + downloadUrl);
  window.open(downloadUrl, '_blank');
})
