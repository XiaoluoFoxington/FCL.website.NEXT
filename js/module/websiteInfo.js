import utils from '/js/module/utils.js';

export default class websiteInfo {

  /**
   * 加载所有
   */
  static loadAll() {
    this.loadRunTime(); // 获取建站时间
    this.loadUserVisitCount(); // 加载用户访问次数
    setInterval(this.loadRunTime, 1000); // 每1秒更新一次建站时间
  }

  /**
   * 加载用户访问次数
   */
  static async loadUserVisitCount() {
    const visitCountInt = await this.xf_getUserVisitCount();
    const displayElement = document.getElementById('xf_visitCount');
    if (displayElement) {
      displayElement.textContent = visitCountInt;
    }
  }

  /**
   * 更新建站时间信息
   */
  static loadRunTime() {
    const websiteInfoa = new websiteInfo();
    const timeString = websiteInfoa.getRunTime();
    const displayElement = document.getElementById('xf_runTime');

    if (displayElement) {
      displayElement.textContent = timeString;
    }
  }

  /**
   * 获取当前时间与建站时间的时间差（精确到天）
   * @returns {string} 格式化后的时间差字符串（非零单位：天、小时、分钟、秒）
   */
  getRunTime() {
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
 * 获取用户访问次数
 * @returns {number} - 访问次数
 */
  static async xf_getUserVisitCount() {
    const visitCount = utils.xf_readLocalStorage('visitCount') || 0;
    const visitCountInt = parseInt(visitCount);
    return visitCountInt;
  }

  /**
   * 增加用户访问次数
   */
  static async xf_increaseUserVisitCount() {
    const visitCountInt = await this.xf_getUserVisitCount();
    utils.xf_writeLocalStorage('visitCount', (visitCountInt + 1).toString());
  }


}
