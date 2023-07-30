function init () {
  const elements = document.querySelectorAll('path')

  function move (p) {
    if (p) elements.forEach(e => { e.style.transform = `translate(${randomIntFromInterval(-2000, -5000)}px,${randomIntFromInterval(-2000, -5000)}px)` })
    else {
      const arr = Array.from(elements)
      for (let i = 0; i < arr.length; i++) {
        setTimeout(() => {
          arr[i].style.removeProperty('transform')
        }, i * 100)
      }
    }
  }

  function randomIntFromInterval (min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  move(1)

  document.addEventListener('click', (e) => {
    document.getElementsByClassName('hidden')[0].classList.remove('hidden')
    setTimeout(() => move(), 1000)
  }, { once: true })
}
document.addEventListener('DOMContentLoaded', init, { once: true })
document.getElementById('close').addEventListener('click', e=>e.currentTarget.parentElement.className = 'hidden')
