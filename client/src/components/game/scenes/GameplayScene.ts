import Phaser from 'phaser';

export default class GameplayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameplayScene' });
  }

  init() {
    this.timeLeft = 60; // Đồng hồ 60 giây (US-04)
    this.totalScore = 0; // Tổng điểm (US-09)
    this.isGameOver = false; // Trạng thái khóa phím
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // ==========================================
    // UI: ĐIỂM, ĐỒNG HỒ & AVATAR
    // ==========================================
    this.scoreText = this.add.text(40, 40, 'SCORE: 0', { 
      fontSize: '32px', color: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold' 
    }).setShadow(2, 2, '#000', 3, true, true);

    this.timerText = this.add.text(width - 200, 40, 'TIME: ' + this.timeLeft, { 
      fontSize: '32px', color: '#FF4D4D', fontFamily: 'Arial', fontStyle: 'bold' 
    }).setShadow(2, 2, '#000', 3, true, true);

    // Avatar (US-08)
    this.add.circle(70, height - 70, 40, 0xcccccc).setStrokeStyle(4, 0xffffff);
    this.add.text(130, height - 80, 'Player 1', { 
      fontSize: '24px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold' 
    }).setShadow(1, 1, '#000', 2, true, true);

    // ==========================================
    // UI: CÂU HỎI TRÊN - ĐÁP ÁN DƯỚI (US-06)
    // ==========================================
    this.add.text(width / 2, height / 2 - 80, 'I drink a cup of ___ every morning.', {
      fontSize: '36px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5).setShadow(2, 2, '#000', 4, true, true);

    this.targetWord = "coffee";
    this.currentInput = "";
    
    this.answerText = this.add.text(width / 2, height / 2 + 50, '_ _ _ _ _ _', {
      fontSize: '64px', color: '#ffffff', fontFamily: 'Monospace', letterSpacing: 15
    }).setOrigin(0.5).setShadow(3, 3, '#000', 5, true, true);

    // ==========================================
    // BỘ ĐẾM TIME-OUT (Chạy mỗi 1 giây)
    // ==========================================
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // ==========================================
    // ENGINE GÕ PHÍM & ĐỔI MÀU
    // ==========================================
    this.input.keyboard.on('keydown', (event) => {
      // HẾT GIỜ -> KHÓA BÀN PHÍM
      if (this.isGameOver) return; 

      if (event.keyCode >= 65 && event.keyCode <= 90) { // A-Z
        let char = event.key.toLowerCase();
        let expectedChar = this.targetWord[this.currentInput.length];

        if (char === expectedChar) {
          this.currentInput += char;
          this.updateAnswerDisplay(true);

          if (this.currentInput === this.targetWord) {
            this.handleCorrectAnswer();
          }
        } else {
          this.answerText.setColor('#ff4d4d'); // Đỏ khi gõ sai
          this.time.delayedCall(200, () => this.updateAnswerDisplay(true)); // Trả màu lại
        }
      } else if (event.keyCode === 8) { // Phím Backspace
        this.currentInput = this.currentInput.slice(0, -1);
        this.updateAnswerDisplay(true);
      }
    });
  }

  // Cập nhật giao diện chữ và dấu '_'
  updateAnswerDisplay(isNormalColor) {
    let displayText = '';
    for (let i = 0; i < this.targetWord.length; i++) {
      if (i < this.currentInput.length) {
        displayText += this.currentInput[i] + ' ';
      } else {
        displayText += '_ ';
      }
    }
    this.answerText.setText(displayText.trim());
    if (isNormalColor) this.answerText.setColor('#00FF00'); // Xanh khi đúng
  }

  // Xử lý nảy điểm khi gõ xong
  handleCorrectAnswer() {
    this.totalScore += 20;
    this.scoreText.setText('SCORE: ' + this.totalScore);
    
    // Nảy số điểm bự lên rồi thu lại
    this.tweens.add({ targets: this.scoreText, scaleX: 1.5, scaleY: 1.5, duration: 150, yoyo: true });

    this.time.delayedCall(300, () => {
      this.currentInput = "";
      this.answerText.setColor('#ffffff');
      this.updateAnswerDisplay(true);
      // Mở rộng sau: Load câu hỏi tiếp theo ở đây (US-05)
    });
  }

  // Xử lý Time-out
  updateTimer() {
    if (this.isGameOver) return;

    this.timeLeft--;
    this.timerText.setText('TIME: ' + this.timeLeft);

    if (this.timeLeft <= 0) {
      this.isGameOver = true;
      this.timerText.setText('TIME: 0');
      
      // Chữ TIME OUT siêu to giữa màn hình
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'TIME OUT!', {
        fontSize: '120px', color: '#ff0000', fontFamily: 'Arial', fontStyle: 'bold'
      }).setOrigin(0.5).setShadow(5, 5, '#000', 10, true, true);
    }
  }
}