let enemies = {
  shaker: {
    hp:2,
    power:0.001,
    css: { width:"40px", height:"40px", background:"red" },
    update: function(self, player) {
      let newX = parseInt(self.css("left")) + Math.random() * (4) - 2;
      let newY = parseInt(self.css("top")) + Math.random() * (4) - 2;

      self.css({left: String(newX) + "px", top: String(newY) + "px"});
    }
  }
}
