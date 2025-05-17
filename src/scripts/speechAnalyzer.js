class SpeechAnalyzer {
  constructor() {
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.recognition.continuous = true;
    this.recognition.lang = 'zh-CN';
    
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyzer = this.audioContext.createAnalyser();
    this.microphone = null;
    
    this.speechData = {
      pace: 0, // 语速
      volume: 0, // 音量
      clarity: 0, // 清晰度
      fillerWords: 0, // 填充词数量
      pauses: [], // 停顿时间点
      content: [], // 演讲内容
      duration: 0 // 演讲持续时间
    };
    
    this.setupMicrophone();
    this.setupSpeechRecognition();
  }
  
  setupMicrophone() {
    // 设置麦克风输入
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.microphone.connect(this.analyzer);
        this.startAnalyzing();
      })
      .catch(err => console.error('麦克风访问失败: ', err));
  }
  
  setupSpeechRecognition() {
    // 设置语音识别
    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      this.speechData.content.push(transcript);
      this.analyzeContent(transcript);
    };
    
    this.recognition.start();
  }
  
  startAnalyzing() {
    // 开始实时分析音频特征
    const dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
    
    const analyze = () => {
      this.analyzer.getByteFrequencyData(dataArray);
      
      // 计算音量
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      this.speechData.volume = sum / dataArray.length / 256;
      
      // 更新其他特征...
      
      requestAnimationFrame(analyze);
    };
    
    analyze();
  }
  
  analyzeContent(transcript) {
    // 分析演讲内容
    // 检测填充词（"嗯"、"这个"等）
    const fillerWords = ['嗯', '这个', '就是说', '那个'];
    fillerWords.forEach(word => {
      const regex = new RegExp(word, 'g');
      const matches = transcript.match(regex);
      if (matches) {
        this.speechData.fillerWords += matches.length;
      }
    });
  }
  
  getSpeechData() {
    return this.speechData;
  }
}

export default SpeechAnalyzer;
