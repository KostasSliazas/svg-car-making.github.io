(function () {
  'use strict';

  function generateUniqueString(key) {
    // Helper function to generate a random string (6 characters by default)
    function getRandomString(length = 6) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomString = '';
      for (let i = 0; i < length; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return randomString;
    }

    // Check if the generated string exists in localStorage, and regenerate if needed
    let uniqueString = getRandomString();
    while (localStorage.getItem(key + uniqueString)) {
      uniqueString = getRandomString(); // Regenerate if not unique
    }

    // Store the unique string in localStorage
    localStorage.setItem(key + uniqueString, 'true');

    return uniqueString; // Return the unique random string
  }

  function getRandomHexColor() {
    // Generate a random 6-digit hex color code and pad it to ensure it's always 6 characters
    const randomColor =
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
    return randomColor;
  }

  // Function to change the color of a stop in gradient 'b'
  function changeStopColor(gradientId, stopIndex, newColor) {
    // Get the gradient element by its ID
    const gradient = document.getElementById(gradientId);

    // Get all the stop elements inside the gradient
    const stops = gradient.querySelectorAll('stop');

    // Check if stopIndex is valid
    if (stopIndex < 0 || stopIndex >= stops.length) {
      console.error('Invalid stop index');
      return;
    }

    // Change the stop-color of the specified stop element
    stops[stopIndex].setAttribute('stop-color', newColor);
  }

  function init() {
    // Event listeners for color input fields
    document.getElementById('color1').addEventListener('input', function () {
      // Get the color from the first input and update the first stop in gradient 'b'
      changeStopColor('b', 0, this.value);
    });

    document.getElementById('color2').addEventListener('input', function () {
      // Get the color from the second input and update the second stop in gradient 'b'
      changeStopColor('b', 1, this.value);
    });

    document.getElementById('color3').addEventListener('input', function () {
      // Get the color from the third input and update the third stop in gradient 'b'
      changeStopColor('b', 2, this.value);
    });

    document.getElementById('randomize').addEventListener('click', () => {
      // Randomize the colors of gradient 'b'
      changeStopColor('b', 0, getRandomHexColor());
      changeStopColor('b', 1, getRandomHexColor());
      changeStopColor('b', 2, getRandomHexColor());
    });

    // Start enabling the drag functionality
    const elements = document.querySelectorAll('path');

    function move(p) {
      const svg = document.getElementById('svg');
      const svgMatrix = svg.getScreenCTM();

      if (p)
        elements.forEach(e => {
          e.style.transform = `translate(${randomIntFromInterval(-2000, -5000)}px,${randomIntFromInterval(-2000, -5000)}px)`;
        });
      else {
        const arr = Array.from(elements);
        for (let i = 0; i < arr.length; i++) {
          const path = arr[i];

          let isDragging = false;
          let offsetX, offsetY;

          // Mouse down event to start dragging
          path.addEventListener('mousedown', e => {
            isDragging = true;

            // Get the position of the path relative to the SVG container
            const rect = path.getBoundingClientRect();
            const svgRect = svg.getBoundingClientRect();

            // Adjust for any transformations on the SVG container
            offsetX = e.clientX - (rect.left - svgRect.left - svgMatrix.e);
            offsetY = e.clientY - (rect.top - svgRect.top - svgMatrix.f);

            // Set cursor style to indicate dragging
            path.style.cursor = 'move';
          });

          // Mouse move event to drag the path
          document.addEventListener('mousemove', e => {
            if (isDragging) {
              // Calculate new position based on mouse movement
              const newX = e.clientX - offsetX;
              const newY = e.clientY - offsetY;

              // Apply the transform to move the path
              path.setAttribute('transform', `translate(${newX},${newY})`);
            }
          });

          // Mouse up event to stop dragging
          document.addEventListener('mouseup', () => {
            if (isDragging) {
              isDragging = false;
              path.style.cursor = 'default'; // Reset cursor style
            }
          });

          // Mouse up event to stop dragging
          document.addEventListener('mouseup', () => {
            isDragging = false;
            path.style.cursor = 'default'; // Reset cursor style
          });

          setTimeout(() => {
            path.style.removeProperty('transform');
          }, i * 30);
        }
      }
    }

    function randomIntFromInterval(min, max) {
      // min and max included
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    move(1);

    document.addEventListener(
      'click',
      e => {
        document.getElementsByClassName('hidden')[0].classList.remove('hidden');
        setTimeout(() => move(), 1000);
      },
      {
        once: true,
      }
    );
    document.getElementById('exportButton').addEventListener('click', () => {
      // Get the SVG element
      const svg = document.getElementById('svg');
      const uniqueId = generateUniqueString('mycar_');

      // Serialize the SVG to a string
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svg);

      // Minify the SVG by removing whitespace and comments
      svgString = svgString.replace(/>\s+</g, '><').replace(/\s*<!--.*?-->\s*/g, ''); // Remove spaces and comments

      // Create a Blob from the string
      const blob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      });

      // Create a download link
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mycar-' + uniqueId + '.svg'; // Filename for the exported SVG

      // Programmatically click the link to trigger the download
      a.click();

      // Revoke the object URL to free memory
      URL.revokeObjectURL(a.href);
    });
  }
  document.addEventListener('DOMContentLoaded', init, {
    once: true,
  });
  document.getElementById('close').addEventListener('click', e => (e.currentTarget.parentElement.className = 'hidden'));
})();
