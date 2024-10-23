// JavaScript to handle the resizable divider for the left half
const dividerLeft = document.getElementById('divider-left');
const q1 = document.getElementById('q1');
const q2 = document.getElementById('q2');

let isDraggingLeft = false;

dividerLeft.addEventListener('mousedown', function() {
    isDraggingLeft = true;
});

document.addEventListener('mousemove', function(e) {
    if (!isDraggingLeft) return;

    const containerHeight = document.getElementById('container').offsetHeight;
    const offsetY = e.clientY - dividerLeft.offsetHeight / 2 - document.getElementById('header').offsetHeight;

    const topHeight = Math.max(50, Math.min(containerHeight - 100, offsetY));
    document.documentElement.style.setProperty('--divider-position-left', `${(topHeight / containerHeight) * 100}%`);
});

document.addEventListener('mouseup', function() {
    isDraggingLeft = false;
});

// JavaScript to handle the resizable divider for the right half
const dividerRight = document.getElementById('divider-right');
const q3 = document.getElementById('q3');
const q4 = document.getElementById('q4');

let isDraggingRight = false;

dividerRight.addEventListener('mousedown', function() {
    isDraggingRight = true;
});

document.addEventListener('mousemove', function(e) {
    if (!isDraggingRight) return;

    const containerHeight = document.getElementById('container').offsetHeight;
    const offsetY = e.clientY - dividerRight.offsetHeight / 2 - document.getElementById('header').offsetHeight;

    const topHeight = Math.max(50, Math.min(containerHeight - 100, offsetY));
    document.documentElement.style.setProperty('--divider-position-right', `${(topHeight / containerHeight) * 100}%`);
});

document.addEventListener('mouseup', function() {
    isDraggingRight = false;
});
