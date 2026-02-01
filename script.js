```javascript
// 全局播放状态与配置
const audio = new Audio();
const tracks = Array.from(document.querySelectorAll('.track-item'));
let currentIndex = 0;
let isShuffle = false;    
let loopMode = 'none';    

// 版权弹窗 - 仅下载按钮触发
const globalDownloadBtn = document.getElementById('globalDownloadBtn');
const copyrightModal = document.getElementById('copyrightModal');
const closeCopyrightModal = document.getElementById('closeModal');
const copyrightOverlay = document.getElementById('modalOverlay');

function openCopyrightModal() {
  copyrightModal.style.display = 'flex';
  contactModal.style.display = 'none';
}

function closeCopyrightModalFunc() {
  copyrightModal.style.display = 'none';
}

globalDownloadBtn.addEventListener('click', openCopyrightModal);
closeCopyrightModal.addEventListener('click', closeCopyrightModalFunc);
copyrightOverlay.addEventListener('click', closeCopyrightModalFunc);

// 联系/合作弹窗
const contactModal = document.getElementById('contactModal');
const closeContactModal = document.getElementById('closeContactModal');
const contactOverlay = document.getElementById('contactOverlay');
const contactLinkList = document.querySelectorAll('.contact-link, .business-link');

function openContactModal() {
  contactModal.style.display = 'flex';
  copyrightModal.style.display = 'none';
}

function closeContactModalFunc() {
  contactModal.style.display = 'none';
}

contactLinkList.forEach(item => {
  item.addEventListener('click', function(e) {
    if(this.getAttribute('href') === '#contact') {
      e.preventDefault();
    }
    openContactModal();
  });
});

closeContactModal.addEventListener('click', closeContactModalFunc);
contactOverlay.addEventListener('click', closeContactModalFunc);

// 加载曲目核心函数
function loadTrack(index) {
  if(index < 0 || index >= tracks.length) return;
  currentIndex = index;
  const track = tracks[index];
  const src = track.dataset.src;
  const name = track.dataset.name;
  const mp3 = track.dataset.mp3;
  audio.src = src;
  // 修复原代码中ID错误（原currentTrackName不存在，改为track1.mp3）
  document.getElementById('track1.mp3').textContent = name;
  document.getElementById('currentmp3').textContent = `${mp3} mp3`;
  tracks.forEach(el => el.style.backgroundColor = '');
  track.style.backgroundColor = '#222233';
}

// 下一曲切换函数
function nextTrack() {
  if(isShuffle) {
    let newIndex;
    do { newIndex = Math.floor(Math.random() * tracks.length); }
    while(newIndex === currentIndex && tracks.length > 1);
    currentIndex = newIndex;
  } else {
    currentIndex = (currentIndex + 1) % tracks.length;
  }
  playCurrent();
}

// 播放当前曲目函数
async function playCurrent() {
  loadTrack(currentIndex);
  try {
    await audio.play();
    document.getElementById('playPauseBtn').textContent = '⏸';
  } catch (err) {
    alert('播放失败，请再次点击播放按钮重试');
  }
}

// 播放/暂停按钮逻辑（兼容移动端）
document.getElementById('playPauseBtn').addEventListener('click', async () => {
  if(audio.paused) {
    if(!audio.src) {
      loadTrack(0); // 首次点击才加载曲目，符合移动端交互要求
    }
    try {
      await audio.play(); // 移动端需await确保播放权限
      document.getElementById('playPauseBtn').textContent = '⏸';
    } catch (err) {
      alert('请点击页面任意位置后重试播放');
    }
  } else {
    audio.pause();
    document.getElementById('playPauseBtn').textContent = '▶';
  }
});

// 上一曲按钮逻辑
document.getElementById('prevBtn').addEventListener('click', () => {
  if(isShuffle) {
    currentIndex = Math.floor(Math.random() * tracks.length);
  } else {
    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  }
  playCurrent();
});

// 下一曲按钮逻辑
document.getElementById('nextBtn').addEventListener('click', () => {
  nextTrack();
});

// 曲目播放结束自动切歌
audio.addEventListener('ended', () => {
  if(loopMode === 'single') {
    audio.currentTime = 0;
    try {
      audio.play();
    } catch (err) {
      document.getElementById('playPauseBtn').textContent = '▶';
    }
  } else {
    nextTrack();
  }
});

// 曲目列表点击逻辑（增强移动端兼容）
tracks.forEach((item, idx) => {
  item.addEventListener('click', async () => {
    currentIndex = idx;
    loadTrack(idx);
    try {
      await audio.play();
      document.getElementById('playPauseBtn').textContent = '⏸';
    } catch (err) {
      alert('播放失败，请再次点击曲目重试');
    }
  });
});

// 音量控制逻辑
document.getElementById('volumeSlider').addEventListener('input', (e) => {
  audio.volume = e.target.value;
});

// 随机播放按钮逻辑
const shuffleBtn = document.getElementById('shuffleBtn');
shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.style.backgroundColor = isShuffle ? '#7a3cfd' : '#222233';
  if(isShuffle) loopMode = 'none';
  document.getElementById('loopBtn').style.backgroundColor = '#222233';
  document.getElementById('loopBtn').textContent = '🔁 循环';
});

// 循环播放按钮逻辑
const loopBtn = document.getElementById('loopBtn');
loopBtn.addEventListener('click', () => {
  if(loopMode === 'none') {
    loopMode = 'list';
    loopBtn.textContent = '🔁 列表';
    audio.loop = false;
  } else if(loopMode === 'list') {
    loopMode = 'single';
    loopBtn.textContent = '🔂 单曲';
    audio.loop = true;
  } else {
    loopMode = 'none';
    loopBtn.textContent = '🔁 循环';
    audio.loop = false;
  }
  loopBtn.style.backgroundColor = loopMode !== 'none' ? '#7a3cfd' : '#222233';
  isShuffle = false;
  shuffleBtn.style.backgroundColor = '#222233';
});

// 页面加载完成后唤醒音频上下文（关键兼容iOS/Android）
window.addEventListener('load', () => {
  // 首次点击页面任意位置唤醒音频播放器
  document.body.addEventListener('click', () => {
    if(audio.src) {
      audio.load(); // 唤醒音频上下文，后续播放更顺畅
    }
  }, { once: true });
});
```
