/* js/audio.js */
AFRAME.registerComponent('mic-listener', {
  schema: {
    threshold: { type: 'number', default: 0.05 },
    sensitivity: { type: 'number', default: 2.0 }
  },
  init: function () {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.volume = 0;
    this.isCasting = false;

    // クリックでマイク開始
    window.addEventListener('click', () => {
      if (!this.audioContext) this.setupAudio();
    }, { once: true });
  },
  setupAudio: async function () {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 128;
      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      console.log("Microphone connected!");
    } catch (err) {
      console.error("Microphone Access Denied:", err);
    }
  },
  tick: function () {
    if (!this.analyser) return;
    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) sum += this.dataArray[i];
    const avg = sum / this.dataArray.length;
    this.volume = Math.min((avg / 255) * this.data.sensitivity, 1.0);
    this.isCasting = this.volume > this.data.threshold;
    
    // HTML属性に値をセット（他チームが参照用）
    this.el.setAttribute('dataset-volume', this.volume.toFixed(3));
    this.el.setAttribute('dataset-is-casting', this.isCasting);
  }
});