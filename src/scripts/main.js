import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'stats.js';
import { Howl, Howler } from 'howler';
// import * as tf from '@tensorflow/tfjs';

import LectureScene from './scene.js';
import AudienceSystem from './audience.js';
import SpeechAnalyzer from './speechAnalyzer.js';
import ScoringSystem from './scoring.js';
import UI from './ui.js';

class LectureSimulator {
  constructor() {
    // 初始化性能监控
    this.stats = new Stats();
    document.getElementById('stats').appendChild(this.stats.dom);

    this.scene = new LectureScene();
    this.audience = new AudienceSystem(this.scene);
    this.speechAnalyzer = new SpeechAnalyzer();
    this.scoringSystem = new ScoringSystem();
    this.ui = new UI();
    
    this.gameState = 'intro'; // intro, preparation, speech, feedback
    this.speechDuration = 180; // 3分钟演讲
    this.speechTimer = 0;
    
    this.init();
  }
  
  init() {
    // 初始化声音
    Howler.volume(0.8);
    
    this.ui.showIntro(() => {
      this.startPreparation();
    });
    
    this.setupEventListeners();
    this.gameLoop();
  }
  
  setupEventListeners() {
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.scene.camera.aspect = window.innerWidth / window.innerHeight;
      this.scene.camera.updateProjectionMatrix();
      this.scene.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // 其他事件监听...
  }
  
  startPreparation() {
    this.gameState = 'preparation';
    this.ui.showPreparation(() => {
      this.startSpeech();
    });
  }
  
  startSpeech() {
    this.gameState = 'speech';
    this.speechTimer = this.speechDuration;
    this.speechAnalyzer.startAnalyzing();
    this.ui.showSpeech();
    
    // 倒计时显示
    const timerInterval = setInterval(() => {
      this.speechTimer--;
      this.ui.updateTimer(this.speechTimer);
      
      if (this.speechTimer <= 0) {
        clearInterval(timerInterval);
        this.endSpeech();
      }
    }, 1000);
  }
  
  endSpeech() {
    this.gameState = 'feedback';
    
    // 获取演讲数据
    const speechData = this.speechAnalyzer.getSpeechData();
    const audienceMood = this.audience.currentMood;
    
    // 评分
    const result = this.scoringSystem.evaluateSpeech(speechData, audienceMood);
    
    // 显示结果
    this.ui.showFeedback(result, () => {
      this.resetGame();
    });
  }
  
  resetGame() {
    // 重置游戏状态
    this.gameState = 'intro';
    this.ui.showIntro(() => {
      this.startPreparation();
    });
  }
  
  gameLoop() {
    requestAnimationFrame(() => this.gameLoop());
    
    // 更新性能统计
    this.stats.begin();
    
    // 更新场景
    this.scene.update();
    
    // 游戏状态更新
    if (this.gameState === 'speech') {
      const speechData = this.speechAnalyzer.getSpeechData();
      this.audience.updateAudienceMood(speechData);
    }
    
    // 渲染
    this.scene.renderer.render(this.scene.scene, this.scene.camera);
    
    this.stats.end();
  }
}

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
  new LectureSimulator();
});
