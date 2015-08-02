var title = document.querySelector('input')
var panesAll = document.querySelectorAll('input')
var comments = document.querySelectorAll('textarea')
var paneRender = document.getElementsByClassName('pane')
var commentRender = document.getElementsByClassName('comment')
var panes = []
for (var i = 1; i < 4; i++) {
  panes.push(panesAll[i])
}

// panes = Array.prototype.splice.call(panes,1,3)


document.body.addEventListener('change', function (e) {
  if (e.target.className === 'panes') {
    var img = document.createElement('img');
    img.src = e.target.value
    img.className = 'paneImage'
    console.log(e.target.id[4]);
    paneRender[e.target.id[4] - 1].appendChild(img)
  }
})

document.body.addEventListener('keyup', function (e) {
  if (e.target.className === 'comments'){
    var text = e.target.value;
    commentRender[e.target.id[7] - 1].innerHTML = text;
  }
})
