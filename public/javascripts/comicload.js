$(document).ready(function () {
  var img = document.createElement('img');
  img.className = 'paneImage';
  img.src = $('#pane1').val();
  $('.pane')[0].appendChild(img);
  var img = document.createElement('img');
  img.className = 'paneImage';
  img.src = $('#pane2').val();
  $('.pane')[1].appendChild(img);
  var img = document.createElement('img');
  img.className = 'paneImage';
  img.src = $('#pane3').val();
  $('.pane')[2].appendChild(img);
  var p = document.createElement('p');
  p.innerHTML = $('#comment1').val();
  $('.comment')[0].appendChild(p);
  var p = document.createElement('p');
  p.innerHTML = $('#comment2').val();
  $('.comment')[1].appendChild(p);
  var p = document.createElement('p');
  p.innerHTML = $('#comment3').val();
  $('.comment')[2].appendChild(p);

});