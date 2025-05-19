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

    // 检测是否为Edge浏览器
    this.isEdge = /Edge/.test(navigator.userAgent) || 
                  /Edg/.test(navigator.userAgent) || 
                  (window.navigator.userAgent.indexOf("Edge") > -1);
    
    if (this.isEdge) {
      console.log("检测到Edge浏览器，将使用兼容模式");
    }
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
      
      // Edge浏览器特殊处理
      if (this.isEdge) {
        return this._startCaptureEdge();
      }
      
      // 检查是否支持mediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // 兼容性处理
        const getUserMedia = navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia;
        
        if (!getUserMedia) {
          console.error('浏览器不支持getUserMedia API');
          return false;
        }
        
        // 使用老式API
        return new Promise((resolve) => {
          getUserMedia.call(navigator, 
            { video: true, audio: false },
            (stream) => {
              this.stream = stream;
              this.videoElement.srcObject = stream;
              this.videoElement.onloadedmetadata = () => {
                this.active = true;
                this.videoWidth = this.videoElement.videoWidth;
                this.videoHeight = this.videoElement.videoHeight;
                console.log('摄像头已启动(兼容模式)', this.videoWidth, this.videoHeight);
                this.videoElement.play();
                resolve(true);
              };
            },
            (error) => {
              console.error('无法访问摄像头(兼容模式):', error);
              resolve(false);
            }
          );
        });
      }
      
      // 使用现代API
      try {
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
          
          // 添加超时处理，防止某些Edge浏览器中onloadedmetadata事件不触发
          setTimeout(() => {
            if (!this.active) {
              console.log('等待元数据超时，尝试直接播放');
              this.active = true;
              this.videoElement.play();
              resolve(true);
            }
          }, 3000);
        });
      } catch (error) {
        console.error('无法访问摄像头(现代API):', error);
        return false;
      }
    } catch (error) {
      console.error('摄像头访问过程中发生错误:', error);
      return false;
    }
  }
  
  /**
   * Edge浏览器特殊处理的摄像头启动
   * @private
   * @returns {Promise<boolean>}
   */
  async _startCaptureEdge() {
    try {
      // Edge可能在调用getUserMedia时需要简化参数
      const constraints = { 
        video: true,
        audio: false
      };
      
      // 尝试使用标准API
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      } 
      // 回退到旧式API
      else if (navigator.getUserMedia) {
        return new Promise((resolve) => {
          navigator.getUserMedia(constraints, 
            (stream) => {
              this.stream = stream;
              this._setupVideoWithStream(stream, resolve);
            },
            (error) => {
              console.error('Edge浏览器无法访问摄像头:', error);
              resolve(false);
            }
          );
        });
      }
      // Edge可能有自己特殊的API
      else if (navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
        return new Promise((resolve) => {
          const legacyAPI = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
          legacyAPI.call(navigator, constraints, 
            (stream) => {
              this.stream = stream;
              this._setupVideoWithStream(stream, resolve);
            },
            (error) => {
              console.error('Edge浏览器无法访问摄像头(旧API):', error);
              resolve(false);
            }
          );
        });
      } else {
        console.error('Edge浏览器不支持任何已知的摄像头API');
        return false;
      }
      
      // 如果使用标准API成功获取了流
      if (this.stream) {
        return new Promise((resolve) => {
          this._setupVideoWithStream(this.stream, resolve);
        });
      }
      
      return false;
    } catch (error) {
      console.error('Edge浏览器摄像头访问失败:', error);
      return false;
    }
  }
  
  /**
   * 设置视频元素使用指定的流
   * @private
   * @param {MediaStream} stream 媒体流
   * @param {Function} resolve Promise解析函数
   */
  _setupVideoWithStream(stream, resolve) {
    try {
      // 先尝试使用srcObject（现代API）
      try {
        this.videoElement.srcObject = stream;
      } catch (error) {
        // 如果srcObject失败，尝试使用src (URL.createObjectURL) - 旧版API
        try {
          const url = (window.URL || window.webkitURL).createObjectURL(stream);
          this.videoElement.src = url;
        } catch (e) {
          console.error('无法设置视频源:', e);
          resolve(false);
          return;
        }
      }
      
      // 确保播放
      this.videoElement.onloadedmetadata = () => {
        this.active = true;
        this.videoWidth = this.videoElement.videoWidth || 640;
        this.videoHeight = this.videoElement.videoHeight || 480;
        this.videoElement.play().catch(e => console.warn('自动播放失败:', e));
        resolve(true);
      };
      
      // 添加超时，以防事件不触发
      setTimeout(() => {
        if (!this.active) {
          console.log('等待元数据超时，尝试直接播放');
          this.active = true;
          this.videoWidth = 640;
          this.videoHeight = 480;
          this.videoElement.play().catch(e => console.warn('自动播放失败:', e));
          resolve(true);
        }
      }, 2000);
      
      // 手动触发播放（有些浏览器可能需要）
      this.videoElement.play().catch(e => console.warn('初始播放失败，将在元数据加载后重试:', e));
    } catch (error) {
      console.error('设置视频流时出错:', error);
      resolve(false);
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
      return null;
    }
    
    // Edge浏览器特殊处理 - 即使视频没准备好也尝试创建纹理
    if (!this.texture) {
      try {
        this.texture = new THREE.VideoTexture(this.videoElement);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        this.texture.format = THREE.RGBAFormat;
        
        // 如果是Edge，额外设置
        if (this.isEdge) {
          this.texture.generateMipmaps = false;
        }
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
      // 检测Edge浏览器
      const isEdge = /Edge/.test(navigator.userAgent) || 
                    /Edg/.test(navigator.userAgent) || 
                    (window.navigator.userAgent.indexOf("Edge") > -1);
                    
      if (isEdge) {
        console.log("检测到Edge浏览器，将简化摄像头检测");
        
        // Edge浏览器下简化检测 - 仅检查是否有API可用
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          return true;
        }
        if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia) {
          return true;
        }
        return false;
      }
      
      // 非Edge浏览器使用正常检测流程
      // 检查是否支持mediaDevices API
      if (!navigator.mediaDevices) {
        // 尝试使用旧版API检测
        const oldGetUserMedia = navigator.getUserMedia ||
                               navigator.webkitGetUserMedia ||
                               navigator.mozGetUserMedia ||
                               navigator.msGetUserMedia;
        
        if (!oldGetUserMedia) {
          console.warn('浏览器不支持getUserMedia API');
          return false;
        }
        
        // 假设有摄像头，但我们不知道具体有多少个
        return true;
      }
      
      // 如果enumerateDevices不可用，尝试直接调用getUserMedia来检测
      if (!navigator.mediaDevices.enumerateDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          if (stream) {
            // 记得释放捕获的流
            stream.getTracks().forEach(track => track.stop());
            return true;
          }
          return false;
        } catch (e) {
          console.warn('无法获取摄像头权限，假设不可用:', e);
          return false;
        }
      }
      
      // 正常使用enumerateDevices检测
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('检查摄像头可用性出错:', error);
      // 出错时保守地假设摄像头可用，让用户尝试
      return true;
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
