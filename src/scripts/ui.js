class UI {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'ui-container';
    document.body.appendChild(this.container);
    
    // 添加现代化样式
    this.addStyles();
    this.createUIElements();
  }
  
  addStyles() {
    // 添加现代化的CSS样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .ui-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        font-family: 'Roboto', 'Helvetica Neue', sans-serif;
        color: #333;
        z-index: 100;
        pointer-events: none; /* 允许点击穿透UI容器到下面的3D场景 */
      }
      
      .screen {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        box-sizing: border-box;
        background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.95) 100%);
        backdrop-filter: blur(10px);
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
        overflow-y: auto;
        pointer-events: auto; /* 恢复屏幕的点击事件 */
      }
      
      /* 演讲模式的UI样式 */
      #speech-screen {
        height: auto;
        background: none;
        backdrop-filter: none;
        padding: 0;
        pointer-events: none; /* 演讲模式下默认点击穿透 */
      }
      
      /* 其他样式保持不变 */
      .screen.active {
        opacity: 1;
        transform: translateY(0);
      }
      
      .screen h2 {
        font-size: 2.5rem;
        margin-bottom: 2rem;
        color: #1a73e8;
        font-weight: 300;
        text-align: center;
      }
      
      .screen-content {
        max-width: 800px;
        width: 100%;
        background-color: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        pointer-events: auto; /* 确保内容可以点击 */
      }
      
      .btn {
        background-color: #1a73e8;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        margin-top: 1.5rem;
        outline: none;
      }
      
      .btn:hover {
        background-color: #0d62d3;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transform: translateY(-2px);
      }
      
      .btn:active {
        transform: translateY(0);
      }
      
      .btn-secondary {
        background-color: #f1f3f4;
        color: #1a73e8;
      }
      
      .btn-secondary:hover {
        background-color: #e8eaed;
      }
      
      p {
        line-height: 1.6;
        color: #555;
        margin-bottom: 1rem;
      }
      
      ul {
        margin-bottom: 1.5rem;
      }
      
      li {
        margin-bottom: 0.8rem;
        position: relative;
        padding-left: 1.5rem;
      }
      
      li:before {
        content: '';
        position: absolute;
        left: 0;
        top: 8px;
        width: 8px;
        height: 8px;
        background-color: #1a73e8;
        border-radius: 50%;
      }
      
      .timer {
        position: fixed;
        top: 1rem;
        left: 50%;
        transform: translateX(-50%);
        font-size: 2.5rem;
        font-weight: 300;
        color: #1a73e8;
        padding: 0.8rem 1.5rem;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        transition: all 0.3s ease;
        pointer-events: auto; /* 确保计时器可以点击 */
        margin-top: 0;
      }
      
      .timer.warning {
        color: #f57c00;
      }
      
      .timer.danger {
        color: #d32f2f;
        animation: pulse 1s infinite;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .viewpoint-controls {
        position: fixed;
        top: 1rem;
        right: 2rem;
        display: flex;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50px;
        padding: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        pointer-events: auto; /* 确保视角控制可以点击 */
      }
      
      .viewpoint-btn {
        background-color: transparent;
        border: none;
        color: #5f6368;
        padding: 8px 16px;
        border-radius: 50px;
        margin: 0 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .viewpoint-btn.active {
        background-color: #1a73e8;
        color: white;
      }
      
      .feedback-card {
        border-left: 4px solid #1a73e8;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 0 8px 8px 0;
        margin-bottom: 1rem;
      }
      
      .score-item {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .score-label {
        flex: 1;
      }
      
      .progress-bar {
        flex: 2;
        height: 8px;
        background-color: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .progress-value {
        height: 100%;
        background-color: #1a73e8;
        border-radius: 4px;
        width: 0%;
        transition: width 1s ease;
      }
      
      .progress-text {
        margin-left: 1rem;
        font-weight: 500;
      }
      
      .topic-card {
        padding: 1.5rem;
        border-radius: 8px;
        background-color: #f8f9fa;
        margin-bottom: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;
      }
      
      .topic-card:hover {
        background-color: #f1f3f4;
        transform: translateY(-2px);
      }
      
      .topic-card.selected {
        border-color: #1a73e8;
        background-color: rgba(26, 115, 232, 0.05);
      }
      
      @media (max-width: 768px) {
        .screen-content {
          padding: 1.5rem;
        }
        
        .screen h2 {
          font-size: 2rem;
        }
        
        .timer {
          font-size: 2rem;
          padding: 0.8rem 1.2rem;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    // 添加Roboto字体
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
    document.head.appendChild(fontLink);
  }
  
  createUIElements() {
    // 创建所有UI元素
    this.introScreen = this.createScreen('intro-screen', '演讲模拟器');
    this.preparationScreen = this.createScreen('preparation-screen', '准备演讲');
    this.speechScreen = this.createScreen('speech-screen', '');
    this.feedbackScreen = this.createScreen('feedback-screen', '演讲反馈');
    
    // 隐藏所有屏幕
    this.hideAllScreens();
  }
  
  createScreen(id, title) {
    const screen = document.createElement('div');
    screen.id = id;
    screen.className = 'screen';
    
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    screen.appendChild(titleElement);
    
    this.container.appendChild(screen);
    return screen;
  }
  
  hideAllScreens() {
    // 记录当前活跃的屏幕
    this.activeScreen = null;
    
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      // 移除激活类，触发淡出动画
      screen.classList.remove('active');
      
      // 仅对当前显示的屏幕设置延迟隐藏
      if (screen.style.display !== 'none') {
        // 将屏幕元素添加到setTimeout的闭包中，确保引用正确
        const currentScreen = screen;
        setTimeout(() => {
          // 只有在没有被设为活跃屏幕的情况下才隐藏
          if (this.activeScreen !== currentScreen) {
            currentScreen.style.display = 'none';
          }
        }, 500);
      }
    });
  }
  
  showScreen(screen, setupCallback) {
    // 设置这个屏幕为活跃屏幕，防止它被hideAllScreens隐藏
    this.activeScreen = screen;
    
    // 确保屏幕显示
    screen.style.display = 'flex';
    
    // 调用传入的设置回调函数（如果有的话）
    if (typeof setupCallback === 'function') {
      setupCallback();
    }
    
    // 使用双重requestAnimationFrame确保浏览器完成了重绘后再添加动画类
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        screen.classList.add('active');
      });
    });
  }
  
  showIntro(callback, cameraAvailable = false) {
    // 先隐藏所有屏幕
    this.hideAllScreens();
    
    // 清空之前的内容
    while (this.introScreen.children.length > 1) {
      this.introScreen.removeChild(this.introScreen.lastChild);
    }
    
    // 设置内容
    const contentContainer = document.createElement('div');
    contentContainer.className = 'screen-content';
    
    // 添加介绍内容
    const intro = document.createElement('div');
    intro.innerHTML = `
      <h3 style="color: #1a73e8; margin-bottom: 1.5rem; font-weight: 400;">克服演讲焦虑，提升公众表达能力</h3>
      
      <p>欢迎来到<strong>演讲模拟器</strong>，这是一个专为帮助你克服公开演讲焦虑而设计的沉浸式3D环境。</p>
      
      <div class="feedback-card">
        <p><strong>这个应用可以帮助你：</strong></p>
        <ul>
          <li>在逼真的虚拟环境中练习演讲</li>
          <li>获得即时反馈和表现分析</li>
          <li>通过反复练习建立自信</li>
          <li>改进你的演讲技巧和表达能力</li>
        </ul>
      </div>
      
      <p>你将进行一次3分钟的演讲，系统会分析你的表现并给予详细反馈。</p>
      ${cameraAvailable ? '<p>您可以在下一步中选择是否打开摄像头，将自己融入演讲中。</p>' : ''}
      
      <p style="margin-top: 1.5rem;">准备好开始你的演讲之旅了吗？</p>
    `;
    contentContainer.appendChild(intro);
    
    // 添加开始按钮
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.marginTop = '1rem';
    
    const startButton = document.createElement('button');
    startButton.textContent = '开始练习';
    startButton.className = 'btn';
    startButton.addEventListener('click', callback);
    buttonContainer.appendChild(startButton);
    
    contentContainer.appendChild(buttonContainer);
    this.introScreen.appendChild(contentContainer);
    
    // 显示屏幕
    this.showScreen(this.introScreen);
  }
  
  showPreparation(callback) {
    // 先隐藏所有屏幕
    this.hideAllScreens();
    
    // 清空之前的内容
    while (this.preparationScreen.children.length > 1) {
      this.preparationScreen.removeChild(this.preparationScreen.lastChild);
    }
    
    // 添加内容容器
    const contentContainer = document.createElement('div');
    contentContainer.className = 'screen-content';
    
    // 添加准备内容
    const prep = document.createElement('div');
    prep.innerHTML = `
      <h3 style="color: #1a73e8; margin-bottom: 1.5rem; font-weight: 400;">选择一个演讲主题</h3>
      
      <p>选择以下主题之一，或创建你自己的主题：</p>
    `;
    contentContainer.appendChild(prep);
    
    // 添加主题卡片
    const topicsContainer = document.createElement('div');
    
    const topics = [
      { title: '我的兴趣爱好', description: '讨论你的爱好以及它们如何影响你的生活' },
      { title: '我最近学到的新技能', description: '分享学习过程和这项技能带给你的影响' },
      { title: '一本我喜欢的书或电影', description: '介绍作品内容并讨论为什么它对你有特别意义' },
      { title: '一次难忘的旅行', description: '描述这次旅行的体验以及你的收获' }
    ];
    
    let selectedTopic = null;
    
    topics.forEach((topic, index) => {
      const topicCard = document.createElement('div');
      topicCard.className = 'topic-card';
      topicCard.innerHTML = `
        <h4>${topic.title}</h4>
        <p>${topic.description}</p>
      `;
      
      topicCard.addEventListener('click', () => {
        // 移除之前选中的样式
        document.querySelectorAll('.topic-card').forEach(card => {
          card.classList.remove('selected');
        });
        
        // 添加新的选中样式
        topicCard.classList.add('selected');
        selectedTopic = index;
      });
      
      topicsContainer.appendChild(topicCard);
    });
    
    // 自定义主题选项
    const customTopicCard = document.createElement('div');
    customTopicCard.className = 'topic-card';
    customTopicCard.innerHTML = `
      <h4>自定义主题</h4>
      <div id="custom-topic-container" style="display: none;">
        <input type="text" id="custom-topic-input" placeholder="输入你的主题" 
               style="width: 100%; padding: 8px; margin-top: 10px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
    `;
    
    customTopicCard.addEventListener('click', () => {
      // 移除之前选中的样式
      document.querySelectorAll('.topic-card').forEach(card => {
        card.classList.remove('selected');
      });
      
      // 添加新的选中样式
      customTopicCard.classList.add('selected');
      selectedTopic = 'custom';
      
      // 显示输入框
      document.getElementById('custom-topic-container').style.display = 'block';
    });
    
    topicsContainer.appendChild(customTopicCard);
    contentContainer.appendChild(topicsContainer);
    
    // 提示文本
    const tipsSection = document.createElement('div');
    tipsSection.innerHTML = `
      <h3 style="color: #1a73e8; margin: 1.5rem 0; font-weight: 400;">演讲准备提示</h3>
      
      <div class="feedback-card">
        <ul>
          <li>保持简洁明了，确保主要观点清晰</li>
          <li>使用自然的语调和语速</li>
          <li>适当利用肢体语言增强表达效果</li>
          <li>与观众保持目光接触</li>
          <li>展示自信，即使你感到紧张</li>
        </ul>
      </div>
    `;
    contentContainer.appendChild(tipsSection);
    
    // 添加摄像头选项
    const cameraSection = document.createElement('div');
    cameraSection.innerHTML = `
      <h3 style="color: #1a73e8; margin: 1.5rem 0; font-weight: 400;">摄像头选项</h3>
      
      <div class="toggle-container">
        <label class="toggle-switch">
          <input type="checkbox" id="camera-toggle">
          <span class="toggle-slider"></span>
        </label>
        <span class="toggle-label">打开摄像头（将出现在讲台中央）</span>
      </div>
    `;
    
    // 添加开关样式
    const style = document.createElement('style');
    style.textContent = `
      .toggle-container {
        display: flex;
        align-items: center;
        margin: 1rem 0;
      }
      
      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
        margin-right: 10px;
      }
      
      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 34px;
      }
      
      .toggle-slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      
      input:checked + .toggle-slider {
        background-color: #1a73e8;
      }
      
      input:checked + .toggle-slider:before {
        transform: translateX(26px);
      }
      
      .toggle-label {
        font-size: 1rem;
        color: #555;
      }
    `;
    document.head.appendChild(style);
    
    contentContainer.appendChild(cameraSection);
    
    // 添加开始演讲按钮
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.marginTop = '1.5rem';
    
    const startButton = document.createElement('button');
    startButton.textContent = '开始演讲';
    startButton.className = 'btn';
    startButton.addEventListener('click', () => {
      if (selectedTopic !== null) {
        let topicText = '';
        if (selectedTopic === 'custom') {
          topicText = document.getElementById('custom-topic-input').value || '自定义主题';
        } else {
          topicText = topics[selectedTopic].title;
        }
        
        // 获取摄像头选项的值
        const useCameraOption = document.getElementById('camera-toggle').checked;
        
        callback(topicText, useCameraOption);
      } else {
        // 如果没有选择主题，提示用户
        alert('请选择一个演讲主题');
      }
    });
    buttonContainer.appendChild(startButton);
    
    contentContainer.appendChild(buttonContainer);
    this.preparationScreen.appendChild(contentContainer);
    
    // 显示屏幕
    this.showScreen(this.preparationScreen);
  }
  
  showSpeech(changeViewCallback) {
    // 先隐藏所有屏幕
    this.hideAllScreens();
    
    // 清空之前的内容
    while (this.speechScreen.children.length > 0) {
      this.speechScreen.removeChild(this.speechScreen.lastChild);
    }
    
    // 添加调试按钮，可以重新加载摄像头
    const debugContainer = document.createElement('div');
    debugContainer.style.position = 'fixed';
    debugContainer.style.left = '10px';
    debugContainer.style.bottom = '10px';
    debugContainer.style.zIndex = '1000';
    debugContainer.style.pointerEvents = 'auto';
    
    const reloadCameraBtn = document.createElement('button');
    reloadCameraBtn.textContent = '重载摄像头';
    reloadCameraBtn.className = 'btn btn-secondary';
    reloadCameraBtn.style.fontSize = '0.8rem';
    reloadCameraBtn.style.padding = '5px 10px';
    reloadCameraBtn.addEventListener('click', () => {
      // 发布一个事件，让主应用重新加载摄像头
      const event = new CustomEvent('reload-camera');
      window.dispatchEvent(event);
    });
    
    debugContainer.appendChild(reloadCameraBtn);
    document.body.appendChild(debugContainer);
    
    // 添加计时器 - 直接添加到body以确保显示
    const timer = document.createElement('div');
    timer.id = 'timer';
    timer.className = 'timer';
    timer.textContent = '3:00';
    document.body.appendChild(timer);
    
    // 添加视角控制按钮
    const viewpointControls = document.createElement('div');
    viewpointControls.className = 'viewpoint-controls';
    
    const viewpoints = [
      { id: 'stage', text: '讲台视角' },
      { id: 'audience', text: '观众视角' },
      { id: 'side', text: '侧面视角' }
    ];
    
    viewpoints.forEach(view => {
      const button = document.createElement('button');
      button.className = 'viewpoint-btn';
      button.textContent = view.text;
      button.dataset.viewpoint = view.id;
      
      if (view.id === 'stage') {
        button.classList.add('active');
      }
      
      button.addEventListener('click', (e) => {
        // 移除其他按钮的active类
        document.querySelectorAll('.viewpoint-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // 添加active类到当前按钮
        button.classList.add('active');
        
        // 调用视角切换回调，确保回调存在
        if (typeof changeViewCallback === 'function') {
          changeViewCallback(view.id);
        } else {
          console.warn('视角切换回调未定义');
        }
      });
      
      viewpointControls.appendChild(button);
    });
    
    // 将视角控制添加到页面
    document.body.appendChild(viewpointControls);
    
    // 在页面上添加一个标记类，以便应用特定样式
    document.body.classList.add('speech-mode');
    
    // 显示屏幕
    this.showScreen(this.speechScreen);
  }
  
  updateTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      timerElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
      
      // 添加颜色提示
      if (seconds <= 30 && seconds > 10) {
        timerElement.classList.add('warning');
        timerElement.classList.remove('danger');
      } else if (seconds <= 10) {
        timerElement.classList.add('danger');
        timerElement.classList.remove('warning');
      } else {
        timerElement.classList.remove('warning', 'danger');
      }
    }
  }
  
  showFeedback(result, callback) {
    // 移除speech模式标记
    document.body.classList.remove('speech-mode');
    
    // 移除timer
    const existingTimer = document.getElementById('timer');
    if (existingTimer && existingTimer.parentNode === document.body) {
      existingTimer.remove();
    }
    
    // 移除可能遗留的视角控制
    const existingControls = document.querySelector('.viewpoint-controls');
    if (existingControls && existingControls.parentNode === document.body) {
      existingControls.remove();
    }
    
    // 先隐藏所有屏幕
    this.hideAllScreens();
    
    // 清空之前的内容
    while (this.feedbackScreen.children.length > 1) {
      this.feedbackScreen.removeChild(this.feedbackScreen.lastChild);
    }
    
    // 添加内容容器
    const contentContainer = document.createElement('div');
    contentContainer.className = 'screen-content';
    
    // 添加评分和反馈
    const feedback = document.createElement('div');
    
    // 总分展示区域
    const scoreHeader = document.createElement('div');
    scoreHeader.style.textAlign = 'center';
    scoreHeader.style.marginBottom = '2rem';
    scoreHeader.innerHTML = `
      <h3 style="color: #1a73e8; font-size: 1.8rem; margin-bottom: 0.5rem;">演讲评分</h3>
      <div style="font-size: 3.5rem; font-weight: 300; color: #1a73e8;">${result.finalScore}/10</div>
    `;
    feedback.appendChild(scoreHeader);
    
    // 详细评分区域
    const detailedScores = document.createElement('div');
    detailedScores.innerHTML = `<h4 style="margin-bottom: 1.5rem;">详细评分：</h4>`;
    
    const scoreCategories = [
      { key: 'pacing', label: '语速控制' },
      { key: 'volume', label: '音量适当' },
      { key: 'clarity', label: '清晰度' },
      { key: 'engagement', label: '观众参与度' },
      { key: 'content', label: '内容质量' }
    ];
    
    scoreCategories.forEach(category => {
      const scoreItem = document.createElement('div');
      scoreItem.className = 'score-item';
      
      const score = result.detailedScores[category.key].score;
      
      scoreItem.innerHTML = `
        <div class="score-label">${category.label}</div>
        <div class="progress-bar">
          <div class="progress-value" style="width: 0%"></div>
        </div>
        <div class="progress-text">${score}/10</div>
      `;
      
      detailedScores.appendChild(scoreItem);
    });
    
    feedback.appendChild(detailedScores);
    
    // 改进建议区域
    const suggestionsSection = document.createElement('div');
    suggestionsSection.innerHTML = `
      <h4 style="margin: 2rem 0 1rem;">改进建议：</h4>
      <div class="feedback-card">
        <ul>
          ${result.feedback.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
    feedback.appendChild(suggestionsSection);
    
    contentContainer.appendChild(feedback);
    
    // 添加按钮区域
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.gap = '1rem';
    buttonContainer.style.marginTop = '2rem';
    
    const retryButton = document.createElement('button');
    retryButton.textContent = '再次练习';
    retryButton.className = 'btn';
    retryButton.addEventListener('click', callback);
    buttonContainer.appendChild(retryButton);
    
    contentContainer.appendChild(buttonContainer);
    this.feedbackScreen.appendChild(contentContainer);
    
    // 显示屏幕
    this.showScreen(this.feedbackScreen, () => {
      // 使用动画效果展示进度条（在showScreen的回调中执行）
      setTimeout(() => {
        const progressBars = document.querySelectorAll('.progress-value');
        scoreCategories.forEach((category, index) => {
          const score = result.detailedScores[category.key].score;
          progressBars[index].style.width = `${score * 10}%`;
        });
      }, 700); // 稍微延迟一点，确保元素已经可见
    });
  }

  // 在组件销毁前清理
  dispose() {
    // 移除speech模式标记
    document.body.classList.remove('speech-mode');
    
    // 移除timer
    const existingTimer = document.getElementById('timer');
    if (existingTimer && existingTimer.parentNode === document.body) {
      existingTimer.remove();
    }
    
    // 移除可能遗留的视角控制
    const existingControls = document.querySelector('.viewpoint-controls');
    if (existingControls && existingControls.parentNode === document.body) {
      existingControls.remove();
    }
  }
}

export default UI;
