var Module = {
  canvas: (function () {
    const canvas = document.getElementById('canvas')
    canvas.addEventListener(
      'webglcontextlost',
      e => {
        alert('WebGL context lost. You will need to reload the page.')
        e.preventDefault()
      },
      false
    )
    return canvas
  })(),
  setStatus: (function () {
    const status = document.getElementById('status')
    const progress = document.getElementById('progress')
    const spinner = document.getElementById('spinner')
    return function (text) {
      if (!Module.setStatus.last)
        Module.setStatus.last = {
          time: Date.now(),
          text: ''
        }
      if (text !== Module.setStatus.last.text) {
        const time = Date.now()
        const match = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/)
        if (match && time - Module.setStatus.last.time < 30) {
          return // if this is a progress update, skip it if too soon
        }
        Module.setStatus.last.time = time
        Module.setStatus.last.text = text
        if (match) {
          text = match[1]
          progress.value = parseInt(match[2]) * 100
          progress.max = parseInt(match[4]) * 100
          progress.hidden = false
          spinner.hidden = false
        } else {
          progress.value = null
          progress.max = null
          progress.hidden = true
          if (!text) {
            spinner.hidden = true
          }
        }
        status.innerHTML = text
      }
    }
  })(),
  totalDependencies: 0,
  monitorRunDependencies: function (left) {
    this.totalDependencies = Math.max(this.totalDependencies, left)
    Module.setStatus(
      left
        ? 'Preparing... (' +
            (this.totalDependencies - left) +
            '/' +
            this.totalDependencies +
            ')'
        : 'All downloads complete.'
    )
  },
  setWindowTitle: undefined,
  locateFile: path => {
    const { src } = document.currentScript
    return src.substr(0, src.lastIndexOf('/') + 1) + path
  },
  muteAudio: (function () {
    let mute = false
    return function () {
      if (mute) {
        SDL2.audio.gainNode.gain.value = 0.3
        const volume = document.getElementsByClassName('fa-volume-mute')[0]
        volume.classList.remove('fa-volume-mute')
        volume.classList.add('fa-volume-up')
        mute = false
      } else {
        SDL2.audio.gainNode.gain.value = 0
        const volume = document.getElementsByClassName('fa-volume-up')[0]
        volume.classList.remove('fa-volume-up')
        volume.classList.add('fa-volume-mute')
        mute = true
      }
    }
  })(),
  postRun: function () {
    const { audio, audioContext } = SDL2
    audio.scriptProcessorNode.disconnect(audioContext.destination)
    const gainNode = audioContext.createGain()
    gainNode.gain.value = 0.3
    gainNode.connect(audioContext.destination)
    audio.scriptProcessorNode.connect(gainNode)
    audio.gainNode = gainNode
  }
}
var SDL2 = {}
