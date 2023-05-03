// https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
document.addEventListener("DOMContentLoaded", () => {
  console.log("learnify JS imported successfully!");
});

// DOM Elements
const body = document.querySelectorAll('.sectionB')
const darkModeSwitch = document.querySelector('#dark-mode-switch')

// Event Listeners

darkModeSwitch.addEventListener('change', () => {
    document.querySelector('.sectionB').classList.toggle('darkmode')
    localStorage.setItem('jstabs-darkmode', JSON.stringify(!darkmode))
})

// Retrieve stored data
let darkmode = JSON.parse(localStorage.getItem('jstabs-darkmode'))
const opentab =  JSON.parse(localStorage.getItem('jstabs-opentab')) || '3'

// and..... Action!
if (darkmode === null) {
    darkmode = window.matchMedia("(prefers-color-scheme: dark)").matches // match to OS theme
}
if (darkmode) {
    document.querySelector('.sectionB').classList.add('darkmode')
    document.querySelector('#dark-mode-switch').checked = 'checked'
}
activateTab(opentab)

tinymce.init({
  selector: '#mytextarea'
});