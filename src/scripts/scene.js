import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class LectureScene {
  constructor() {
    // 基础场景设置
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333);
    this.scene.fog = new THREE.Fog(0x333333, 10, 50);
    
    // 相机设置 - 修改相机位置和视线方向
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.7, 0.5);
    this.camera.lookAt(0, 1.7, -10);
    
    // 修复渲染器设置
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // 修复 sRGBEncoding 为新版 Three.js 中的正确用法
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.getElementById('scene-container').appendChild(this.renderer.domElement);

    // 加载管理器
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onProgress = (url, loaded, total) => {
      console.log(`加载进度: ${Math.round(loaded / total * 100)}%`);
    };
    
    // 初始化控制器（仅用于开发调试）
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enabled = false; // 默认禁用，可通过按键激活用于调试
    
    // 初始化场景元素
    this.audienceModels = [];
    
    // 初始化演讲者屏幕变量，避免后续为null
    this.presenterScreen = null;
    
    // 添加鼠标控制相关变量
    this.mouseControls = {
      active: false,     // 鼠标控制是否激活
      startX: 0,         // 鼠标起始X位置
      startY: 0,         // 鼠标起始Y位置
      cameraRotation: {  // 相机旋转角度
        x: 0,
        y: 0
      },
      sensitivity: 0.003, // 鼠标灵敏度
      dampingFactor: 0.92 // 阻尼系数，使运动更平滑
    };
    
    // 绑定鼠标控制方法
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    
    this.setupEnvironment();
    this.createAudience();
    this.createVenue();
    this.addLighting();
    
    // 窗口大小变化监听
    window.addEventListener('resize', () => this.onWindowResize());
    
    // 调试键盘控制
    window.addEventListener('keydown', (e) => {
      if (e.key === 'c') { // 按 'c' 键切换控制器
        this.controls.enabled = !this.controls.enabled;
        console.log(`相机控制: ${this.controls.enabled ? '开启' : '关闭'}`);
      }
    });
    this.changeViewpoint('stage');
    
    // 添加视角切换方法的引用，可以由外部调用
    this.changeViewCallback = this.changeViewpoint.bind(this);
  }
  
  setupEnvironment() {
    // 创建地面
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333, 
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // 创建背景墙
    const wallGeometry = new THREE.BoxGeometry(50, 15, 0.5);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x6c6c6c });
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 7, -15);
    backWall.receiveShadow = true;
    this.scene.add(backWall);
    
    const sideWallLeft = new THREE.Mesh(wallGeometry, wallMaterial);
    sideWallLeft.rotation.y = Math.PI / 2;
    sideWallLeft.position.set(-25, 7, 0);
    sideWallLeft.receiveShadow = true;
    this.scene.add(sideWallLeft);
    
    const sideWallRight = new THREE.Mesh(wallGeometry, wallMaterial);
    sideWallRight.rotation.y = Math.PI / 2;
    sideWallRight.position.set(25, 7, 0);
    sideWallRight.receiveShadow = true;
    this.scene.add(sideWallRight);
  }
  
  createAudience() {
    // 创建简单的观众模型
    const rows = 5;
    const seatsPerRow = 10;
    const spacing = 1.5;
    
    // 简单人物材质
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xf1c27d });
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    for (let row = 0; row < rows; row++) {
      const zPos = -5 - (row * spacing);
      for (let seat = 0; seat < seatsPerRow; seat++) {
        const xPos = -7 + (seat * spacing);
        
        // 创建简单人物模型
        const audience = new THREE.Group();
        
        // 头部
        const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.9;
        head.castShadow = true;
        audience.add(head);
        
        // 身体
        const bodyGeometry = new THREE.CapsuleGeometry(0.15, 0.5, 4, 8);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        audience.add(body);
        
        // 随机偏移使观众看起来更自然
        const randomOffset = Math.random() * 0.3 - 0.15;
        audience.position.set(xPos + randomOffset, 0, zPos + Math.random() * 0.2);
        
        // 添加随机旋转，让观众朝向舞台中心但略有变化
        audience.rotation.y = Math.PI + Math.random() * 0.4 - 0.2;
        
        this.scene.add(audience);
        this.audienceModels.push({
          model: audience,
          initialY: audience.position.y,
          phase: Math.random() * Math.PI * 2, // 用于呼吸动画
          blinkTime: Math.random() * 3      // 用于眨眼动画计时
        });
      }
    }
  }
  
  createVenue() {
    // 创建讲台
    const stageGeometry = new THREE.BoxGeometry(5, 0.5, 3);
    const stageMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b4513,
      roughness: 0.7 
    });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.set(0, -0.25, 0);
    stage.receiveShadow = true;
    stage.castShadow = true;
    this.scene.add(stage);
    
    // 创建演讲台
    const podiumGroup = new THREE.Group();
    
    const podiumTopGeometry = new THREE.BoxGeometry(1, 0.1, 0.8);
    const podiumTop = new THREE.Mesh(podiumTopGeometry, stageMaterial);
    podiumTop.position.y = 1.2;
    podiumTop.castShadow = true;
    podiumGroup.add(podiumTop);
    
    const podiumBaseGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.6);
    const podiumBase = new THREE.Mesh(podiumBaseGeometry, stageMaterial);
    podiumBase.position.y = 0.6;
    podiumBase.castShadow = true;
    podiumGroup.add(podiumBase);
    
    // 创建讲台上的演讲者显示屏幕
    const presenterScreenGeometry = new THREE.PlaneGeometry(0.8, 0.6);
    const defaultMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333,
      side: THREE.DoubleSide
    });
    this.presenterScreen = new THREE.Mesh(presenterScreenGeometry, defaultMaterial);
    this.presenterScreen.position.set(0, 1.5, -0.9); // 位于讲台上方
    this.presenterScreen.rotation.x = -Math.PI * 0.05; // 略微倾斜
    
    // 添加调试提示 - 在屏幕周围添加边框以便识别
    const presenterScreenBorder = new THREE.BoxHelper(this.presenterScreen, 0xffff00);
    podiumGroup.add(presenterScreenBorder);
    
    podiumGroup.add(this.presenterScreen);
    
    // 将演讲台移到前面，使其更加明显
    podiumGroup.position.set(0, 0, -0.5);
    
    // 确保演讲台已经添加到场景中
    this.scene.add(podiumGroup);

    // 记录已添加屏幕到日志
    console.log('演讲者屏幕已初始化', this.presenterScreen);
    
    // 创建投影屏幕
    const screenGeometry = new THREE.PlaneGeometry(10, 6);
    const screenMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 5, -14.7);
    this.scene.add(screen);
    
    // 为投影屏幕添加一个简单的边框
    const screenBorderGeometry = new THREE.BoxGeometry(10.4, 6.4, 0.1);
    const screenBorderMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const screenBorder = new THREE.Mesh(screenBorderGeometry, screenBorderMaterial);
    screenBorder.position.set(0, 5, -14.8);
    this.scene.add(screenBorder);
    
    // 创建座椅
    const rows = 5;
    const seatsPerRow = 10;
    const seatSpacing = 1.5;
    
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const seatCushionMaterial = new THREE.MeshStandardMaterial({ color: 0x990000 });
    
    for (let row = 0; row < rows; row++) {
      const zPos = -5 - (row * seatSpacing);
      for (let seat = 0; seat < seatsPerRow; seat++) {
        const xPos = -7 + (seat * seatSpacing);
        
        const seatGroup = new THREE.Group();
        
        // 座椅底座
        const seatBaseGeometry = new THREE.BoxGeometry(0.7, 0.1, 0.7);
        const seatBase = new THREE.Mesh(seatBaseGeometry, seatMaterial);
        seatBase.position.y = 0.3;
        seatBase.castShadow = true;
        seatGroup.add(seatBase);
        
        // 座椅靠背
        const seatBackGeometry = new THREE.BoxGeometry(0.7, 0.6, 0.1);
        const seatBack = new THREE.Mesh(seatBackGeometry, seatMaterial);
        seatBack.position.set(0, 0.65, -0.3);
        seatBack.castShadow = true;
        seatGroup.add(seatBack);
        
        // 座椅坐垫
        const cushionGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.6);
        const cushion = new THREE.Mesh(cushionGeometry, seatCushionMaterial);
        cushion.position.y = 0.38;
        cushion.castShadow = true;
        seatGroup.add(cushion);
        
        // 座椅腿
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        
        const positions = [
          [-0.3, 0.15, 0.3],
          [0.3, 0.15, 0.3],
          [-0.3, 0.15, -0.3],
          [0.3, 0.15, -0.3]
        ];
        
        positions.forEach(pos => {
          const leg = new THREE.Mesh(legGeometry, legMaterial);
          leg.position.set(...pos);
          leg.castShadow = true;
          seatGroup.add(leg);
        });
        
        seatGroup.position.set(xPos, 0, zPos);
        this.scene.add(seatGroup);
      }
    }
  }
  
  addLighting() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    // 舞台聚光灯
    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 10, 2);
    spotLight.target.position.set(0, 0, -2);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.2;
    spotLight.decay = 2;
    spotLight.distance = 0;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    this.scene.add(spotLight);
    this.scene.add(spotLight.target);
    
    // 侧光
    const sideLight1 = new THREE.DirectionalLight(0xffddcc, 0.8);
    sideLight1.position.set(-10, 8, 5);
    sideLight1.castShadow = true;
    this.scene.add(sideLight1);
    
    const sideLight2 = new THREE.DirectionalLight(0xccddff, 0.8);
    sideLight2.position.set(10, 8, 5);
    sideLight2.castShadow = true;
    this.scene.add(sideLight2);
    
    // 屏幕发光效果（模拟投影屏幕）
    const screenLight = new THREE.RectAreaLight(0xffffff, 0.5, 10, 6);
    screenLight.position.set(0, 5, -14);
    screenLight.lookAt(0, 5, 0);
    this.scene.add(screenLight);
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  // 更新场景
  update(deltaTime) {
    // 如果控制器启用，更新控制器
    if (this.controls.enabled) {
      this.controls.update();
    }
    
    // 更新观众动画
    this.updateAudienceAnimations(deltaTime);
  }
  
  updateAudienceAnimations(deltaTime) {
    const time = performance.now() * 0.001; // 当前时间，秒为单位
    
    // 为每个观众添加微小的动画（例如呼吸、轻微移动）
    this.audienceModels.forEach(audience => {
      // 模拟呼吸动作
      const breathingOffset = Math.sin(time + audience.phase) * 0.01;
      audience.model.position.y = audience.initialY + breathingOffset;
      
      // 偶尔随机添加小幅度头部转动
      if (Math.random() < 0.002) {
        const headRotation = (Math.random() * 0.2 - 0.1);
        audience.model.children[0].rotation.y = headRotation;
      }
      
      // 偶尔让观众点头
      if (Math.random() < 0.001) {
        const head = audience.model.children[0];
        const initialRotationX = head.rotation.x;
        
        // 简单的点头动画序列
        setTimeout(() => { head.rotation.x = 0.1; }, 0);
        setTimeout(() => { head.rotation.x = initialRotationX; }, 300);
      }
    });
  }
  
  // 鼠标控制相关方法
  enableMouseControls() {
    if (this.mouseControls.active) return;
    
    this.mouseControls.active = true;
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    
    // 添加鼠标控制提示
    const helpText = document.createElement('div');
    helpText.id = 'mouse-control-help';
    helpText.style.cssText = `
      position: fixed;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      z-index: 1000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;
    helpText.textContent = '按住鼠标左键并拖动来调整视角';
    document.body.appendChild(helpText);
    
    // 显示提示文本一段时间后淡出
    setTimeout(() => {
      helpText.style.opacity = '1';
      setTimeout(() => {
        helpText.style.opacity = '0';
      }, 3000);
    }, 500);
    
    console.log('鼠标控制已启用');
  }
  
  disableMouseControls() {
    if (!this.mouseControls.active) return;
    
    this.mouseControls.active = false;
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    
    // 移除帮助提示
    const helpText = document.getElementById('mouse-control-help');
    if (helpText) {
      helpText.remove();
    }
    
    console.log('鼠标控制已禁用');
  }
  
  onMouseDown(event) {
    // 只响应左键点击，并且不响应UI元素上的点击
    if (event.button !== 0 || event.target.closest('.viewpoint-controls, .timer, .btn')) return;
    
    this.mouseControls.startX = event.clientX;
    this.mouseControls.startY = event.clientY;
    
    // 添加一个视觉提示，表明正在调整视角
    document.body.style.cursor = 'grabbing';
    
    // 阻止拖动时的文本选择
    event.preventDefault();
  }
  
  onMouseMove(event) {
    if (event.buttons !== 1 || !this.mouseControls.active) return;
    
    // 计算鼠标移动的距离
    const deltaX = event.clientX - this.mouseControls.startX;
    const deltaY = event.clientY - this.mouseControls.startY;
    
    // 更新起始点
    this.mouseControls.startX = event.clientX;
    this.mouseControls.startY = event.clientY;
    
    // 更新相机旋转角度
    this.mouseControls.cameraRotation.y -= deltaX * this.mouseControls.sensitivity;
    this.mouseControls.cameraRotation.x -= deltaY * this.mouseControls.sensitivity;
    
    // 限制上下旋转角度，避免相机翻转
    this.mouseControls.cameraRotation.x = Math.max(
      -Math.PI / 3, 
      Math.min(Math.PI / 3, this.mouseControls.cameraRotation.x)
    );
    
    // 应用旋转到相机
    this.applyCustomRotation();
  }
  
  onMouseUp() {
    // 恢复默认光标
    document.body.style.cursor = '';
  }
  
  applyCustomRotation() {
    // 根据当前视角确定基础视点和目标
    let basePosition, targetPosition;
    
    switch (this.currentViewpoint) {
      case 'stage':
        basePosition = new THREE.Vector3(0, 1.7, 0.5);
        targetPosition = new THREE.Vector3(0, 1.7, -10);
        break;
      case 'audience':
        basePosition = new THREE.Vector3(0, 1.4, -8);
        targetPosition = new THREE.Vector3(0, 1.7, 0);
        break;
      case 'side':
        basePosition = new THREE.Vector3(8, 3, -5);
        targetPosition = new THREE.Vector3(0, 1.7, 0);
        break;
      default:
        basePosition = new THREE.Vector3(0, 1.7, 0.5);
        targetPosition = new THREE.Vector3(0, 1.7, -10);
    }
    
    // 计算从基础位置到目标的方向向量
    const direction = new THREE.Vector3().subVectors(targetPosition, basePosition).normalize();
    
    // 计算上下移动的辅助向量 (向上的单位向量)
    const upVector = new THREE.Vector3(0, 1, 0);
    
    // 计算水平旋转轴（与原方向垂直的水平向量）
    const rightVector = new THREE.Vector3().crossVectors(direction, upVector).normalize();
    
    // 创建基于垂直和水平旋转的四元数
    const verticalRotation = new THREE.Quaternion().setFromAxisAngle(
      rightVector, 
      this.mouseControls.cameraRotation.x
    );
    
    const horizontalRotation = new THREE.Quaternion().setFromAxisAngle(
      upVector, 
      this.mouseControls.cameraRotation.y
    );
    
    // 组合两个旋转
    const combinedRotation = new THREE.Quaternion().multiplyQuaternions(horizontalRotation, verticalRotation);
    
    // 应用旋转到方向向量
    const rotatedDirection = direction.clone().applyQuaternion(combinedRotation);
    
    // 计算新的相机位置
    this.camera.position.copy(basePosition);
    
    // 计算新的目标点
    const distance = basePosition.distanceTo(targetPosition);
    const newTarget = new THREE.Vector3().addVectors(
      basePosition, 
      rotatedDirection.multiplyScalar(distance)
    );
    
    // 设置相机朝向新的目标点
    this.camera.lookAt(newTarget);
  }
  
  // 切换视角函数
  changeViewpoint(viewpoint) {
    // 保存当前选择的视角
    this.currentViewpoint = viewpoint;
    
    // 重置鼠标控制的旋转角度
    this.mouseControls.cameraRotation.x = 0;
    this.mouseControls.cameraRotation.y = 0;
    
    switch(viewpoint) {
      case 'stage':
        // 讲台视角 - 调整为更自然的水平视角
        this.camera.position.set(0, 1.7, 0.5);
        this.camera.lookAt(0, 1.7, -10);
        break;
      case 'audience':
        // 观众视角
        this.camera.position.set(0, 1.4, -8);
        this.camera.lookAt(0, 1.7, 0);
        break;
      case 'side':
        // 侧面视角
        this.camera.position.set(8, 3, -5);
        this.camera.lookAt(0, 1.7, 0);
        break;
    }
  }

  /**
   * 更新演讲者摄像头画面
   * @param {THREE.Texture} texture 视频纹理
   */
  updatePresenterVideo(texture) {
    // 增加更详细的日志信息
    console.log("尝试更新演讲者视频", this.presenterScreen ? "屏幕已就绪" : "屏幕未初始化");
    
    if (!this.presenterScreen) {
      console.error("演讲者屏幕未初始化");
      return;
    }
    
    if (texture) {
      console.log("更新视频纹理到演讲者屏幕");
      // 如果提供了纹理，创建新的材质
      const videoMaterial = new THREE.MeshBasicMaterial({ 
        map: texture,
        side: THREE.DoubleSide 
      });
      
      // 修改这里：移除旋转，摄像头已经是正常方向
      // 处理纹理翻转问题
      texture.center = new THREE.Vector2(0.5, 0.5);
      // 移除旋转180度的代码
      // texture.rotation = Math.PI; 
      
      // 清理旧材质并应用新材质
      if (this.presenterScreen.material) {
        if (this.presenterScreen.material.map !== texture) {
          this.presenterScreen.material.dispose();
          this.presenterScreen.material = videoMaterial;
        }
      } else {
        this.presenterScreen.material = videoMaterial;
      }
    } else {
      // 如果没有纹理，恢复默认材质
      const defaultMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x333333,
        side: THREE.DoubleSide
      });
      if (this.presenterScreen.material) {
        this.presenterScreen.material.dispose();
      }
      this.presenterScreen.material = defaultMaterial;
    }
  }
  
  // 销毁和清理场景资源
  dispose() {
    // 移除事件监听器
    window.removeEventListener('resize', this.onWindowResize);
    
    // 清理控制器
    if (this.controls) {
      this.controls.dispose();
    }
    
    // 清理渲染器
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // 从DOM中移除渲染器元素
    const container = document.getElementById('scene-container');
    if (container && this.renderer.domElement) {
      container.removeChild(this.renderer.domElement);
    }

    // 清理材质
    if (this.presenterScreen && this.presenterScreen.material) {
      this.presenterScreen.material.dispose();
    }
    
    // 清理鼠标控制
    this.disableMouseControls();
    
    console.log('场景资源已清理');
  }
}

export default LectureScene;
