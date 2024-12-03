(function () {
  'use strict';

  // Generate a unique string for use as an identifier
  function generateUniqueString(key) {
    function getRandomString(length = 6) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomString = '';
      for (let i = 0; i < length; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return randomString;
    }

    let uniqueString = getRandomString();
    while (localStorage.getItem(key + uniqueString)) {
      uniqueString = getRandomString();
    }

    localStorage.setItem(key + uniqueString, 'true');
    return uniqueString;
  }

  // Generate a random integer within a specified range
  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // Generate a random hex color code
  function getRandomHexColor() {
    return (
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    );
  }

  // Update the color of a specific stop in a gradient
  function changeStopColor(gradientId, stopIndex, newColor) {
    const gradient = document.getElementById(gradientId);
    const stops = gradient.querySelectorAll('stop');
    if (stopIndex >= 0 && stopIndex < stops.length) {
      stops[stopIndex].setAttribute('stop-color', newColor);
    } else {
      console.error('Invalid stop index');
    }
  }
  async function loop(path, i) {
    let isDragging = false,
      offsetX,
      offsetY;

    // Add event listeners for dragging functionality
    path.addEventListener('mousedown', e => {
      isDragging = true;
      const rect = path.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      offsetX = e.clientX - (rect.left - svgRect.left - svgMatrix.e);
      offsetY = e.clientY - (rect.top - svgRect.top - svgMatrix.f);
      path.style.cursor = 'move';
    });

    document.addEventListener('mousemove', e => {
      if (isDragging) {
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        path.setAttribute('transform', `translate(${newX}, ${newY})`);
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        path.style.cursor = 'default';
      }
    });

    // Wait for the timeout to complete
    await new Promise(resolve => {
      setTimeout(async () => {
        path.style.removeProperty('transform');
        resolve();
      }, 9); // Use 'i' for delay
    });
  }

  async function init() {
    // Handle gradient color pickers
    ['color1', 'color2', 'color3'].forEach((id, index) => {
      document.getElementById(id).addEventListener('input', function () {
        changeStopColor('b', index, this.value);
      });
    });

    // Randomize gradient colors
    document.getElementById('randomize').addEventListener('click', () => {
      for (let i = 0; i < 3; i++) {
        changeStopColor('b', i, getRandomHexColor());
      }
    });

    // Handle SVG path movements
    const elements = document.querySelectorAll('path');
    const svg = document.getElementById('svg');
    const svgMatrix = svg.getScreenCTM();

    async function movePaths(randomize = false) {
      if (randomize) {
        elements.forEach(path => {
          path.style.transform = `translate(${randomIntFromInterval(-2000, -5000)}px, ${randomIntFromInterval(-2000, -5000)}px)`;
        });
      } else {
        // Sequentially execute the loop function for each element
        for (let i = 0; i < elements.length; i++) {
          await loop(elements[i], i);
        }

        // Command to execute after all loops finish
        document.getElementById('loader').classList.add('hidden');
      }
    }

    document.addEventListener(
      'click',
      () => {
        [document.getElementsByClassName('hidden')[1], document.getElementById('loader')].forEach(e => e.classList.remove('hidden'));
        movePaths(false);
      },
      {
        once: true,
      }
    );

    // Export the SVG content
    document.getElementById('exportButton').addEventListener('click', () => {
      const uniqueId = generateUniqueString('my-car_');
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svg);
      svgString = svgString.replace(/>\s+</g, '><').replace(/\s*<!--.*?-->\s*/g, '');

      const blob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `my-car-${uniqueId}.svg`;
      link.click();
      URL.revokeObjectURL(link.href);
    });
    movePaths(true);
  }

  document.addEventListener('DOMContentLoaded', init, {
    once: true,
  });
  document.getElementById('close').addEventListener('click', e => {
    e.currentTarget.parentElement.className = 'hidden';
  });
})();
