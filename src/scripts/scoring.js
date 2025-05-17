class ScoringSystem {
  constructor() {
    this.criteria = {
      pacing: { weight: 0.2, score: 0 }, // 语速控制
      volume: { weight: 0.15, score: 0 }, // 音量适当
      clarity: { weight: 0.25, score: 0 }, // 清晰度
      engagement: { weight: 0.2, score: 0 }, // 观众参与度
      content: { weight: 0.2, score: 0 } // 内容质量
    };
    
    this.finalScore = 0;
    this.feedback = [];
  }
  
  evaluateSpeech(speechData, audienceMood) {
    // 评估语速
    this.criteria.pacing.score = this.evaluatePacing(speechData.pace);
    
    // 评估音量
    this.criteria.volume.score = this.evaluateVolume(speechData.volume);
    
    // 评估清晰度
    this.criteria.clarity.score = this.evaluateClarity(speechData.clarity, speechData.fillerWords);
    
    // 评估观众参与度
    this.criteria.engagement.score = this.evaluateEngagement(audienceMood);
    
    // 评估内容
    this.criteria.content.score = this.evaluateContent(speechData.content);
    
    // 计算总分
    this.calculateFinalScore();
    
    // 生成反馈
    this.generateFeedback();
    
    return {
      finalScore: this.finalScore,
      detailedScores: this.criteria,
      feedback: this.feedback
    };
  }
  
  evaluatePacing(pace) {
    // 理想语速为0.5-0.7
    if (pace >= 0.5 && pace <= 0.7) return 10;
    if (pace > 0.7 && pace <= 0.9) return 8;
    if (pace >= 0.3 && pace < 0.5) return 7;
    return 5; // 过快或过慢
  }
  
  evaluateVolume(volume) {
    // 理想音量为0.4-0.7
    if (volume >= 0.4 && volume <= 0.7) return 10;
    if ((volume > 0.7 && volume <= 0.8) || (volume >= 0.3 && volume < 0.4)) return 7;
    return 5; // 过大或过小
  }
  
  evaluateClarity(clarity, fillerWords) {
    // 根据清晰度和填充词数量评分
    let score = clarity * 10;
    score -= fillerWords * 0.5; // 每个填充词扣0.5分
    return Math.max(0, Math.min(10, score));
  }
  
  evaluateEngagement(audienceMood) {
    // 根据观众情绪评分
    switch(audienceMood) {
      case 'enthusiastic': return 10;
      case 'engaged': return 8;
      case 'neutral': return 6;
      case 'bored': return 3;
      default: return 5;
    }
  }
  
  evaluateContent(content) {
    // 简单内容评估
    // 实际应用中可以使用NLP进行更复杂的分析
    const words = content.join(' ').split(/\s+/).length;
    if (words > 200) return 8; // 内容充足
    if (words > 100) return 6;
    return 4; // 内容较少
  }
  
  calculateFinalScore() {
    let weightedSum = 0;
    let weightSum = 0;
    
    for (const criterion in this.criteria) {
      weightedSum += this.criteria[criterion].score * this.criteria[criterion].weight;
      weightSum += this.criteria[criterion].weight;
    }
    
    this.finalScore = Math.round((weightedSum / weightSum) * 10) / 10;
  }
  
  generateFeedback() {
    this.feedback = [];
    
    // 根据各项分数生成具体反馈
    if (this.criteria.pacing.score < 6) {
      this.feedback.push('您的演讲速度需要调整，尝试保持适中的语速。');
    }
    
    if (this.criteria.volume.score < 6) {
      this.feedback.push('请注意您的音量，确保观众能清晰听到但不过于刺耳。');
    }
    
    if (this.criteria.clarity.score < 6) {
      this.feedback.push('尝试减少填充词的使用，提高表达的清晰度。');
    }
    
    if (this.criteria.engagement.score < 6) {
      this.feedback.push('您可以尝试更多与观众互动的技巧，提高演讲的吸引力。');
    }
    
    // 添加一些鼓励性评语
    if (this.finalScore >= 8) {
      this.feedback.push('总体表现优秀！继续保持。');
    } else if (this.finalScore >= 6) {
      this.feedback.push('表现良好，有一些小的改进空间。');
    } else {
      this.feedback.push('不要气馁，公开演讲是可以通过练习提高的技能。');
    }
  }
}

export default ScoringSystem;
