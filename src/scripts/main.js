import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'stats.js';
import { Howl, Howler } from 'howler';
// import * as tf from '@tensorflow/tfjs';

import LectureScene from './scene.js';
import AudienceSystem from './audience.js';
import SpeechAnalyzer from './speechAnalyzer.js';
import ScoringSystem from './scoring.js';
import CameraManager from './cameraManager.js';
import UI from './ui.js';

class SpeechApp {
  constructor() {
    this.init();
  }
  
  async init() {
    // 初始化场景
    this.lectureScene = new LectureScene();
    
    // 初始化摄像头管理器
    this.cameraManager = new CameraManager();
    
    // 初始化UI
    this.ui = new UI();
    
    // 检查摄像头可用性
    let cameraAvailable = false;
    try {
      cameraAvailable = await CameraManager.checkAvailability();
    } catch (error) {
      console.warn('检查摄像头可用性时出错，假设摄像头不可用', error);
      cameraAvailable = false;
    }
    
    console.log('摄像头是否可用:', cameraAvailable);
    
    // 显示介绍屏幕
    this.ui.showIntro(() => {
      this.startPreparation();
    }, cameraAvailable);
    
    // 开始渲染循环
    this.lastTime = 0;
    this.animate();
  }
  
  startPreparation() {
    this.ui.showPreparation((topic, useCameraOption) => {
      this.startSpeech(topic, useCameraOption);
    });
  }
  
  async startSpeech(topic, useCameraOption = false) {
    console.log(`开始演讲，主题: ${topic}，使用摄像头: ${useCameraOption}`);
    
    // 如果选择使用摄像头，启动摄像头
    if (useCameraOption) {
      try {
        const success = await this.cameraManager.startCapture();
        if (!success) {
          console.warn('摄像头启动失败，继续无摄像头模式');
          alert('摄像头启动失败，将继续无摄像头模式。请检查您的浏览器是否具有摄像头访问权限。');
        }
      } catch (error) {
        console.error('启动摄像头时发生错误:', error);
        alert('启动摄像头时发生错误，将继续无摄像头模式。');
      }
    }
    
    // 启动演讲界面，传入视角切换回调
    this.ui.showSpeech(this.lectureScene.changeViewCallback);
    
    // 开始计时器
    this.remainingTime = 180; // 3分钟 = 180秒
    this.updateTimer();
    
    // 计时器倒计时
    this.timerInterval = setInterval(() => {
      this.remainingTime--;
      this.updateTimer();
      
      if (this.remainingTime <= 0) {
        clearInterval(this.timerInterval);
        this.endSpeech();
      }
    }, 1000);
  }
  
  updateTimer() {
    this.ui.updateTimer(this.remainingTime);
  }
  
  endSpeech() {
    // 停止摄像头捕获
    if (this.cameraManager) {
      this.cameraManager.stopCapture();
    }
    
    // 清除讲台上的视频
    this.lectureScene.updatePresenterVideo(null);
    
    // 模拟评分结果（这里应该是真实分析的结果）
    const result = {
      finalScore: 7.5,
      detailedScores: {
        pacing: { score: 8, comment: "语速控制良好" },
        volume: { score: 7, comment: "音量适中，但有时声音过小" },
        clarity: { score: 8, comment: "表达清晰" },
        engagement: { score: 6, comment: "可以增加更多与观众的互动" },
        content: { score: 8, comment: "内容组织合理" }
      },
      feedback: [
        "演讲表现良好，逻辑清晰",
        "适当增加与观众的目光接触会提高参与感",
        "声音可以更有抑扬顿挫，避免音量过小",
        "可以适当使用手势增强表达效果",
        "演讲结构完整，但可以优化开场和结尾部分"
      ]
    };
    
    this.ui.showFeedback(result, () => {
      // 再次开始准备
      this.startPreparation();
    });
  }
  
  animate(currentTime) {
    requestAnimationFrame((time) => this.animate(time));
    
    if (!this.lastTime) {
      this.lastTime = currentTime;
      return;
    }
    
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    // 更新场景
    this.lectureScene.update(deltaTime);
    
    // 如果摄像头激活，更新视频纹理
    if (this.cameraManager && this.cameraManager.active) {
      try {
        const videoTexture = this.cameraManager.getVideoTexture(THREE);
        if (videoTexture) {
          this.lectureScene.updatePresenterVideo(videoTexture);
        }
      } catch (e) {
        console.error('更新视频纹理时出错:', e);
      }
    }
    
    // 渲染场景
    this.lectureScene.renderer.render(this.lectureScene.scene, this.lectureScene.camera);
  }
  
  dispose() {
    // 清理定时器
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    // 清理摄像头资源
    if (this.cameraManager) {
      this.cameraManager.dispose();
    }
    
    // 清理UI资源
    if (this.ui) {
      this.ui.dispose();
    }
    
    // 清理场景资源
    if (this.lectureScene) {
      this.lectureScene.dispose();
    }
  }
}

// 启动应用
window.addEventListener('DOMContentLoaded', () => {
  const app = new SpeechApp();
  
  // 添加卸载处理
  window.addEventListener('beforeunload', () => {
    app.dispose();
  });
});
