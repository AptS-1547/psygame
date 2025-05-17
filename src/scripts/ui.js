class UI {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'ui-container';
    document.body.appendChild(this.container);
    
    this.createUIElements();
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
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      screen.style.display = 'none';
    });
  }
  
  showIntro(callback) {
    this.hideAllScreens();
    this.introScreen.style.display = 'block';
    
    // 清空之前的内容
    while (this.introScreen.children.length > 1) {
      this.introScreen.removeChild(this.introScreen.lastChild);
    }
    
    // 添加介绍内容
    const intro = document.createElement('div');
    intro.innerHTML = `
      <p>欢迎来到演讲模拟器！</p>
      <p>这个应用将帮助你克服公开演讲焦虑，通过逼真的3D环境模拟演讲情境。</p>
      <p>你将进行一次3分钟的演讲，系统会分析你的表现并给予反馈。</p>
    `;
    this.introScreen.appendChild(intro);
    
    // 添加开始按钮
    const startButton = document.createElement('button');
    startButton.textContent = '开始';
    startButton.addEventListener('click', callback);
    this.introScreen.appendChild(startButton);
  }
  
  showPreparation(callback) {
    this.hideAllScreens();
    this.preparationScreen.style.display = 'block';
    
    // 清空之前的内容
    while (this.preparationScreen.children.length > 1) {
      this.preparationScreen.removeChild(this.preparationScreen.lastChild);
    }
    
    // 添加准备内容
    const prep = document.createElement('div');
    prep.innerHTML = `
      <p>准备你的演讲内容。以下是一些可选的主题：</p>
      <ul>
        <li>我的兴趣爱好</li>
        <li>我最近学到的一项新技能</li>
        <li>一本我喜欢的书或一部电影</li>
        <li>一次难忘的旅行</li>
      </ul>
      <p>或者选择你自己的话题。</p>
      <p>点击"开始演讲"按钮开始你的演讲。</p>
    `;
    this.preparationScreen.appendChild(prep);
    
    // 添加开始演讲按钮
    const startButton = document.createElement('button');
    startButton.textContent = '开始演讲';
    startButton.addEventListener('click', callback);
    this.preparationScreen.appendChild(startButton);
  }
  
  showSpeech() {
    this.hideAllScreens();
    this.speechScreen.style.display = 'block';
    
    // 清空之前的内容
    while (this.speechScreen.children.length > 0) {
      this.speechScreen.removeChild(this.speechScreen.lastChild);
    }
    
    // 添加计时器
    const timer = document.createElement('div');
    timer.id = 'timer';
    timer.className = 'timer';
    timer.textContent = '3:00';
    this.speechScreen.appendChild(timer);
  }
  
  updateTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      timerElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }
  
  showFeedback(result, callback) {
    this.hideAllScreens();
    this.feedbackScreen.style.display = 'block';
    
    // 清空之前的内容
    while (this.feedbackScreen.children.length > 1) {
      this.feedbackScreen.removeChild(this.feedbackScreen.lastChild);
    }
    
    // 添加评分和反馈
    const feedback = document.createElement('div');
    feedback.innerHTML = `
      <h3>你的得分: ${result.finalScore}/10</h3>
      
      <h4>详细评分:</h4>
      <ul>
        <li>语速控制: ${result.detailedScores.pacing.score}/10</li>
        <li>音量适当: ${result.detailedScores.volume.score}/10</li>
        <li>清晰度: ${result.detailedScores.clarity.score}/10</li>
        <li>观众参与度: ${result.detailedScores.engagement.score}/10</li>
        <li>内容质量: ${result.detailedScores.content.score}/10</li>
      </ul>
      
      <h4>改进建议:</h4>
      <ul>
        ${result.feedback.map(item => `<li>${item}</li>`).join('')}
      </ul>
    `;
    this.feedbackScreen.appendChild(feedback);
    
    // 添加再试一次按钮
    const retryButton = document.createElement('button');
    retryButton.textContent = '再试一次';
    retryButton.addEventListener('click', callback);
    this.feedbackScreen.appendChild(retryButton);
  }
}

export default UI;
