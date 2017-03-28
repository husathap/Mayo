var prog = `---

main:
  - block:
      - width: 800px
      - height: 600px
      - background: pink
  - add: ['<div id="dialog">Hello _!</div>', "everyone"]
  - replace:
      target: "#dialog"
      content: "I have animal pictures."
  - choices:
      question: "What do you want to see?"
      answers:
      - ["Jackrabbit", "jackrabbit"]
      - ["Canadian Geese", "geese"]
      - ["Loop", "loop"]

jackrabbit:
  - block:
    - var: ["animal", "jackrabbit"]
    - background: url('jackrabbit.jpg')
    - replace: ["#dialog", "JACKS!"]
  - end:

geese:
  - block:
    - var: ["animal", "goose"]
    - background: url('geese.jpg')
    - replace: ["#dialog", "HONK HONK!"]
  - end:

loop:
  - block:
    - remove: "#dialog"
    - main:

end:
  - case:
    - ["$animal $== jackrabbit", "endJack"]
    - ["$animal $== goose", "endGoose"]

endJack:
  - replace: ["#dialog", ["Boing boing! _", $animal]]
  - replace: ["#dialog", "The End!"]

endGoose:
  - replace: ["#dialog", "Honk honk!"]
  - replace: ["#dialog", "The End!"]
`
