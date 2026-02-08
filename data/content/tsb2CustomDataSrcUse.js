import { loadModule } from '/js/module/moduleLoader.js';
const defaultDataSource = '/data/down/root.json';

const srcInput = document.getElementById('tsb2CustomDataSrcInput');
const srcApiVerInput = document.getElementById('tab2CustomDataSrcApiVerInput');
const disableDebounce = document.getElementById('tab2CustomDataDisableDebounce');
const debounceInput = document.getElementById('tab2CustomDataDebounceInput');
const btnMoreParams = document.getElementById('tab2CustomDataSrcMoreParams');
const srcMoreParamsContainer = document.getElementById('tab2CustomDataMoreParamsContainer');
const btnReset = document.getElementById('tab2CustomDataSrcReset');
const btnSubmit = document.getElementById('tab2CustomDataSrcSubmit');

btnSubmit.addEventListener('click', xf_tab2CustomDataSrcSubmit_Click);
btnReset.addEventListener('click', xf_tab2CustomDataSrcReset_Click);
btnMoreParams.addEventListener('click', xf_tab2CustomDataSrcMoreParams_Click);

/**
* 自定义数据源提交按钮的click
*/
async function xf_tab2CustomDataSrcSubmit_Click() {
  const loadSelector = await loadModule('/js/module/loadSelector.js');
  const source = srcInput.value;
  let final = source;
  if (source.startsWith('[')) {
    // 如果输入的是JSON数组
    final = JSON.parse(source);
  }
  loadSelector.loadSelector({
    containerId: 'xf_selectors',
    dataSource: final,
    sourceApiVer: srcApiVerInput.value,
    disableDebounce: disableDebounce.checked,
    debounceDelay: debounceInput.value,
  });
}

/**
 * 自定义数据源还原默认按钮的click
 */
async function xf_tab2CustomDataSrcReset_Click() {
  const loadSelector = await loadModule('/js/module/loadSelector.js');
  srcInput.value = defaultDataSource;
  srcApiVerInput.value = '';
  disableDebounce.checked = false;
  debounceInput.value = '10';
  mdui.mutation();
  loadSelector.loadSelector({
    containerId: 'xf_selectors',
    dataSource: defaultDataSource,
  });
}

/**
 * 自定义数据源更多参数按钮的click
 */
async function xf_tab2CustomDataSrcMoreParams_Click() {
  srcMoreParamsContainer.classList.toggle('xf-hide');
  mdui.mutation();
}
