/* jshint esversion: 8 */
(function () {
  'use strict';

  /**
   * Generates a unique string that can be used as an identifier.
   * The generated string is guaranteed to be unique based on the given key,
   * by checking if the key + generated string already exists in localStorage.
   *
   * @param {string} key - The key to check against in localStorage to ensure uniqueness.
   * @returns {string} - A unique string that can be used as an identifier.
   */
  function generateUniqueString(key) {
    /**
     * Generates a random alphanumeric string of a given length.
     * The default length is 6 characters if no length is provided.
     *
     * @param {number} [length=6] - The length of the random string to generate. Defaults to 6.
     * @returns {string} - A random alphanumeric string.
     */
    function getRandomString(length = 6) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomString = '';
      for (let i = 0; i < length; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return randomString;
    }

    // Generate a unique string by checking the key in localStorage
    let uniqueString = getRandomString();

    // Ensure uniqueness by checking localStorage
    while (localStorage.getItem(key + uniqueString)) {
      uniqueString = getRandomString();
    }

    // Store the unique string in localStorage to prevent future conflicts
    localStorage.setItem(key + uniqueString, 'true');

    return uniqueString;
  }

  /**
   * Generates a random integer within the specified range (inclusive).
   * The random number is generated between the `min` and `max` values (both inclusive).
   *
   * @param {number} min - The minimum value of the range (inclusive).
   * @param {number} max - The maximum value of the range (inclusive).
   * @returns {number} - A random integer between `min` and `max` (inclusive).
   */
  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Generates a random hexadecimal color code.
   * The color code is returned in the format of "#RRGGBB", where R, G, and B are hexadecimal values.
   *
   * @returns {string} - A random hex color code in the format "#RRGGBB".
   */
  function getRandomHexColor() {
    return (
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    );
  }

  /**
   * Updates the color of a specific stop in an SVG gradient.
   * This function modifies the `stop-color` attribute of a stop element within the gradient,
   * identified by its index in the list of stops.
   *
   * @param {string} gradientId - The ID of the SVG gradient element.
   * @param {number} stopIndex - The index of the stop to update in the gradient's stops.
   * @param {string} newColor - The new color to set for the specified stop, in a valid CSS color format (e.g., hex, rgb).
   */
  function changeStopColor(gradientId, stopIndex, newColor) {
    const gradient = document.getElementById(gradientId);
    const stops = gradient.querySelectorAll('stop');
    if (stopIndex >= 0 && stopIndex < stops.length) {
      stops[stopIndex].setAttribute('stop-color', newColor);
    } else {
      console.error('Invalid stop index');
    }
  }

  /**
   * Handles dragging functionality for an SVG path element.
   * When the user clicks and holds on the path, it allows the path to be dragged around.
   * The function also includes a timeout after the drag operation to reset the transformation.
   *
   * @param {SVGPathElement} path - The SVG path element to be dragged.
   * @param {number} i - A value used to determine the delay for the timeout (in milliseconds).
   * @returns {Promise} - A promise that resolves after the drag operation and timeout are completed.
   */
  async function loop(path, i) {
    let isDragging = false,
      offsetX,
      offsetY;

    // Add event listeners for dragging functionality
    path.addEventListener('mousedown', e => {
      isDragging = true;
      // Uncomment to enable custom dragging offsets based on SVG position and matrix
      //const rect = path.getBoundingClientRect();
      //const svgRect = svg.getBoundingClientRect();
      //offsetX = e.clientX - (rect.left - svgRect.left - svgMatrix.e);
      //offsetY = e.clientY - (rect.top - svgRect.top - svgMatrix.f);
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

  const colors = [];
  /**
   * Adds input event listeners to color picker elements and updates the `colors` array
   * with the selected color for each corresponding element. It also triggers a callback
   * function with the element's ID, index, and the selected color.
   *
   * @param {string[]} ids - An array of element IDs corresponding to the color pickers.
   * @param {function} callback - A callback function to be executed when the input event is triggered.
   *                              The callback receives the ID of the element, the index in the `ids` array,
   *                              and the selected color as arguments.
   */
  function addListenersAndExport(ids, callback) {
    ids.forEach((id, index) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('input', function () {
          const color = this.value;
          colors[index] = color; // Update the color array
          updateGradientStop(index, color);
          callback(id, index, color);
        });
      } else {
        console.warn(`Element with ID "${id}" not found.`);
      }
    });
  }

  /**
   * Updates gradient stop color, label text, and input value.
   * @param {string} prefix Prefix to identify gradient stop elements (e.g., 'b').
   * @param {number} index The gradient stop index.
   * @param {string} color The new color in HEX format.
   */

  function updateGradientStop(index, color) {
    // Update gradient stop color

    // Update corresponding label text
    const label = document.querySelector(`label[for="color${index + 1}"]`);
    if (label) {
      label.textContent = `${color}`;
    }

    // Update corresponding input value
    const input = document.getElementById(`color${index + 1}`);
    if (input) {
      input.value = color;
    }
  }

  /**
   * Initializes the page by setting up event listeners, handling gradient color pickers,
   * managing SVG path movements, and exporting the SVG content and associated color data.
   * The function is asynchronous and manages multiple tasks in sequence, such as:
   * - Setting up color pickers to update the gradient stops.
   * - Randomizing gradient colors.
   * - Handling SVG path movements either randomly or sequentially.
   * - Exporting the SVG content and color data as files when requested.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when all the tasks are initialized.
   */
  async function init() {
    // Handle gradient color pickers
    addListenersAndExport(['color1', 'color2', 'color3'], (id, index, color) => {
      changeStopColor('b', index, color); // Replace with your actual function logic
    });

    // Randomize gradient colors
    document.getElementById('randomize').addEventListener('click', () => {
      for (let i = 0; i < 3; i++) {
        const color = getRandomHexColor();
        colors[i] = color; // Update the color array
        changeStopColor('b', i, color);
        updateGradientStop(i, color);
      }
    });

    // Handle SVG path movements
    const elements = document.querySelectorAll('path');
    const svg = document.getElementById('svg');
    // const svgMatrix = svg.getScreenCTM();

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

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `my-car-${uniqueId}.svg`;
      link.click();
      URL.revokeObjectURL(link.href);

      const blobs = new Blob([colors.join('\n')], { type: 'text/plain' });
      const links = document.createElement('a');
      links.href = URL.createObjectURL(blobs);
      links.download = `my-car-${uniqueId}.txt`;
      links.click();
    });
    movePaths(true);
  }

  /**
   * Initializes the page by calling the `init` function when the DOM content is fully loaded.
   * The `init` function is executed only once when the DOM is ready.
   */
  document.addEventListener('DOMContentLoaded', init, {
    once: true,
  });

  /**
   * Closes the parent element of the clicked "close" button by adding the 'hidden' class to it.
   * This event listener is triggered when the element with ID 'close' is clicked.
   *
   * @param {MouseEvent} e - The mouse event triggered by clicking the "close" button.
   */
  document.getElementById('close').addEventListener('click', e => {
    e.currentTarget.parentElement.className = 'hidden';
  });
})();
