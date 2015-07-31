var helpers = {
  createPanes: function (body) {
    var panes = [];
    var pane1 = {};
    var pane2 = {};
    var pane3 = {};
    pane1.imageSource = body.pane1;
    pane2.imageSource = body.pane2;
    pane3.imageSource = body.pane3;
    pane1.comment = body.comment1;
    pane2.comment = body.comment2;
    pane3.comment = body.comment3;
    panes.push(pane1);
    panes.push(pane2);
    panes.push(pane3);
    return panes
  },

  validateComic: function (body) {
    var errors = []
    if (body.pane1.trim() === "") {
      errors.push("First Pane cannot be blank")
    }
    if (body.pane2.trim() === "") {
      errors.push("Second Pane cannot be blank")
    }
    if (body.pane3.trim() === "") {
      errors.push("Third Pane cannot be blank")
    }
    if (body.comment1.trim() === "") {
      errors.push("First Comment cannot be blank")
    }
    if (body.comment2.trim() === "") {
      errors.push("Second Comment cannot be blank")
    }
    if (body.comment3.trim() === "") {
      errors.push("Third Comment cannot be blank")
    }
    if (body.title.trim() === "") {
      errors.push("Title cannot be blank")
    }
    return errors
  },
}

module.exports = helpers
