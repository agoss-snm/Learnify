// https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
document.addEventListener("DOMContentLoaded", () => {
  console.log("learnify JS imported successfully!");
});

// DOM Elements
const body = document.querySelectorAll('body')
const darkModeSwitch = document.querySelector('#dark-mode-switch')

// Event Listeners

darkModeSwitch.addEventListener('change', () => {
  document.querySelector('body').classList.toggle('darkmode')
  localStorage.setItem('jstabs-darkmode', JSON.stringify(!darkmode))
})

// Retrieve stored data
let darkmode = JSON.parse(localStorage.getItem('jstabs-darkmode'))
const opentab = JSON.parse(localStorage.getItem('jstabs-opentab')) || '3'

// and..... Action!
if (darkmode === null) {
  darkmode = window.matchMedia("(prefers-color-scheme: dark)").matches // match to OS theme
}
if (darkmode) {
  document.querySelector('body').classList.add('darkmode')
  document.querySelector('#dark-mode-switch').checked = 'checked'
}


/*effect index*/
let duration = 0.8;
let delay = 0.3;
let revealText = document.querySelector(".reveal");
let middle = letters.filter(e => e !== " ").length / 2;
letters.forEach((letter, i) => {
  let span = document.createElement("span");
  span.textContent = letter;
  span.style.animationDelay = `${delay + Math.abs(i - middle) * 0.1}s`;
  revealText.append(span);
});

/*editor de html*/
function run() {
  let htmlCode = document.getElementById('html-code').value;
  let cssCode = document.getElementById('css-code').value;
  let jsCode = document.getElementById('js-code').value;
  let output = document.getElementById('output');

  output.contentDocument.body.innerHTML = htmlCode + '<style>' + cssCode + '</style>';
  output.contentWindow.eval(jsCode);

}

