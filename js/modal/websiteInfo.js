/**
 * 加载所有
 */
export function loadAll() {
  // 获取建站时间
  loadRunTime();
  setInterval(loadRunTime, 1000);

  // 获取线路2流量信息
  loadDownWay2Info();
}

/**
 * 更新建站时间信息
 */
export function loadRunTime() {
  const timeString = getRunTime();
  const displayElement = document.getElementById('xf_runTime');

  if (displayElement) {
    displayElement.textContent = timeString;
  }
}

/**
 * 获取当前时间与建站时间的时间差（精确到天）
 * @returns {string} 格式化后的时间差字符串（非零单位：天、小时、分钟、秒）
 */
export function getRunTime() {
  const startDate = new Date(2025, 2, 19, 2, 19, 45); // 建站时间（月份0-based）
  const now = Date.now();

  if (now < startDate) return "0秒";

  const UNITS = [
    { value: 24 * 60 * 60 * 1000, label: "天" },
    { value: 60 * 60 * 1000, label: "时" },
    { value: 60 * 1000, label: "分" },
    { value: 1000, label: "秒" }
  ];

  let diff = now - startDate;
  const parts = [];

  for (const unit of UNITS) {
    const count = Math.floor(diff / unit.value);
    if (count > 0) {
      parts.push(`${count}${unit.label}`);
      diff %= unit.value;
    }
  }

  return parts.length > 0 ? parts.join('') : "0秒";
}

/**
 * 流量信息：获取并填充线路2的流量使用信息
 */
export async function loadDownWay2Info() {
  try {
    const response = await fetch('https://frostlynx.work/external/fcl/file_tree.json');

    if (!response.ok) {
      throw new Error(`HTTP出错：${response.status}`);
    }

    const data = await response.json();

    const targetElement = document.getElementById('xf_fclWay2Info');

    if (targetElement) {
      targetElement.textContent = data.traffic + 'GiB';
    } else {
      console.error('流量信息：未找到显示元素');
    }
  } catch (error) {
    console.error('流量信息：', error);
    const targetElement = document.getElementById('xf_fclWay2Info');
    if (targetElement) {
      targetElement.textContent = error;
    }
  }
}
