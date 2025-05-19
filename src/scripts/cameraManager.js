/**
 * 摄像头管理器 - 负责摄像头捕获和处理
 * 包含对 Windows Edge 浏览器的特殊兼容性处理
 */
class CameraManager {
  constructor() {
    this.videoElement = document.createElement('video');
    this.videoElement.setAttribute('autoplay', '');
    this.videoElement.setAttribute('playsinline', ''); // 对iOS很重要
    this.videoElement.setAttribute('muted', '');
    this.videoElement.style.display = 'none';
    document.body.appendChild(this.videoElement);
    
    this.stream = null;
    this.active = false;
    this.texture = null;
    this.videoWidth = 640;
    this.videoHeight = 480;
  }
  
  /**
   * 启动摄像头捕获
   * @returns {Promise<boolean>} 是否成功启动
   */
  async startCapture() {
    try {
      // 如果已经激活，先停止
      if (this.active) {
        this.stopCapture();
      }
      
      // 请求摄像头权限并获取流
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      // 将流设置到视频元素
      this.videoElement.srcObject = this.stream;
      
      // 等待视频加载完成
      return new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.active = true;
          this.videoWidth = this.videoElement.videoWidth;
          this.videoHeight = this.videoElement.videoHeight;
          console.log('摄像头已启动', this.videoWidth, this.videoHeight);
          this.videoElement.play();
          resolve(true);
        };
      });
    } catch (error) {
      console.error('无法访问摄像头:', error);
      return false;
    }
  }
  
  /**
   * 停止摄像头捕获
   */
  stopCapture() {
    if (this.stream) {
      const tracks = this.stream.getTracks();
      tracks.forEach(track => track.stop());
      this.videoElement.srcObject = null;
      this.stream = null;
      this.active = false;
      
      if (this.texture) {
        this.texture.dispose();
        this.texture = null;
      }
    }
  }
  
  /**
   * 创建或更新Three.js纹理
   * @param {THREE} THREE Three.js库引用
   * @returns {THREE.VideoTexture|null} 视频纹理对象
   */
  getVideoTexture(THREE) {
    if (!this.active) {
      return null;
    }
    
    // 检查视频是否准备好
    const isVideoReady = this.videoElement.readyState >= 2; // HAVE_CURRENT_DATA或更高
    
    if (!isVideoReady && !this.isEdge) {
      console.log("视频还未准备好，等待中...");
      return null;
    }
    
    // 检查视频元素的宽高，确保有效
    if (this.videoElement.videoWidth === 0 || this.videoElement.videoHeight === 0) {
      console.log("视频尺寸无效，等待中...");
      return null;
    }
    
    // Edge浏览器特殊处理 - 即使视频没准备好也尝试创建纹理
    if (!this.texture) {
      try {
        console.log("创建视频纹理...");
        this.texture = new THREE.VideoTexture(this.videoElement);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        this.texture.format = THREE.RGBFormat; // 使用RGB而不是RGBA可能会更兼容
        this.texture.colorSpace = THREE.SRGBColorSpace; // 确保正确的颜色空间
        
        // 如果是Edge，额外设置
        if (this.isEdge) {
          this.texture.generateMipmaps = false;
        }
        
        console.log("视频纹理创建成功");
      } catch (error) {
        console.error('创建视频纹理失败:', error);
        return null;
      }
    }
    
    // 确保纹理被标记为需要更新
    if (this.texture) {
      this.texture.needsUpdate = true;
    }
    
    return this.texture;
  }
  
  /**
   * 检查摄像头是否可用
   * @returns {Promise<boolean>} 是否可用
   */
  static async checkAvailability() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('检查摄像头可用性出错:', error);
      return false;
    }
  }
  
  /**
   * 销毁资源
   */
  dispose() {
    this.stopCapture();
    if (this.videoElement && this.videoElement.parentNode) {
      this.videoElement.parentNode.removeChild(this.videoElement);
    }
  }
}

export default CameraManager;
