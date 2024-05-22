document.addEventListener('DOMContentLoaded', () => {
    const runButton = document.getElementById('run-button');
    runButton.addEventListener('click', runBubbleSort);

    function runBubbleSort() {
        const arraySize = parseInt(document.getElementById('array-size').value);
        const arrayValues = document.getElementById('array-values').value.split(',').map(Number);
        let array;

        if (arrayValues.length && arrayValues.length === arraySize) {
            array = arrayValues;
        } else {
            array = generateRandomArray(arraySize);
        }

        visualizeArray(array);
        bubbleSort(array);
    }

    function generateRandomArray(size) {
        const array = [];
        for (let i = 0; i < size; i++) {
            array.push(Math.floor(Math.random() * 100));
        }
        return array;
    }

    function visualizeArray(array) {
        const container = document.querySelector('.visualizer');
        const arrayContainer = document.createElement('div');
        arrayContainer.className = 'array-container';

        container.appendChild(arrayContainer);

        array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            bar.style.height = `${value}px`;
            arrayContainer.appendChild(bar);
        });
    }

    function bubbleSort(array) {
        const arrayContainer = document.querySelector('.array-container');
        let bars = Array.from(arrayContainer.children);
        let len = array.length;
        let swapped;

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function sort() {
            do {
                swapped = false;
                for (let i = 0; i < len - 1; i++) {
                    if (array[i] > array[i + 1]) {
                        let temp = array[i];
                        array[i] = array[i + 1];
                        array[i + 1] = temp;
                        swapped = true;

                        // Swap bars
                        bars[i].style.height = `${array[i]}px`;
                        bars[i + 1].style.height = `${array[i + 1]}px`;

                        await sleep(100); // Zeitverzögerung für Visualisierung
                    }
                }
                len--;
            } while (swapped);
        }

        sort();
    }
});