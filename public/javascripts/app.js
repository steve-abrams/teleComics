var title = document.querySelector('input')
var panesAll = document.querySelectorAll('input')
var comments = document.querySelectorAll('textarea')
var paneRender = document.getElementsByClassName('paneImage')
var commentRender = document.getElementsByClassName('comment')
var showOriginal = document.getElementById('original')
var showLanguage = document.getElementById('languages')
var blurbs = document.getElementsByClassName('blurb')
var originalComments = document.getElementsByClassName('original')
var languages = document.getElementsByClassName('language')
var languagesShown = false;
var originalShown = false;
var panes = []
for (var i = 1; i < 4; i++) {
  panes.push(panesAll[i])
}



document.body.addEventListener('change', function (e) {
  if (e.target.className === 'panes') {
    paneRender[e.target.id[4] - 1].src = e.target.value;
  }
})

document.body.addEventListener('keyup', function (e) {
  if (e.target.className === 'comments'){
    var text = e.target.value;
    commentRender[e.target.id[7] - 1].innerHTML = text;
  }
})

if (showOriginal) {
  showOriginal.addEventListener('click', function () {
    if (originalShown) {
      for (var i = 0; i < originalComments.length; i++) {
        originalComments[i].style.display = "none";
        blurbs[i].style.display = "inline-block";
      }
      originalShown = !originalShown;
      showOriginal.innerHTML = "Show Original"
    } else {
      for (var i = 0; i < originalComments.length; i++) {
        originalComments[i].style.display = "inline-block";
        blurbs[i].style.display = "none";
      }
      originalShown = !originalShown;
      showOriginal.innerHTML = "Show Blurbs"
    }
  })
}

if (showLanguage) {
  showLanguage.addEventListener('click', function () {
    if (languagesShown) {
      for (var i = 0; i < languages.length; i++) {
        languages[i].style.display = "none";
      }
      languagesShown = !languagesShown;
      showLanguage.innerHTML = "Show Translation Languages"
    } else {
      for (var i = 0; i < languages.length; i++) {
        languages[i].style.display = "inline-block";
      }
      languagesShown = !languagesShown;
      showLanguage.innerHTML = "Hide Translation Languages"
    }
  })
}
