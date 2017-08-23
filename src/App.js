import React, { Component } from "react"
import { parse } from "babylon"
import "./App.css"

const code = `
import createStore from "./createStore"
import HttpClient from "./HttpClient"
import UrlConstants from "./UrlConstants"
import AlertDialog from "./AlertDialog"

const store = createStore()

class App {
  constructor() {
    this.store = store
    this.api = new HttpClient(UrlConstants.baseUrl)
    this.api.getPainting()
      .then(res => {
        this.painting = res
        this.draw()
      })
      .catch(e => {
        const alert = new AlertDialog(e.message)
        alert.show()
      })
  }

  mount(elm) {
    this.elm = elm
    this.ctx = elm.getContext("2d")
    this.draw()
  }

  draw() {
    const { painting } = this
    this.ctx.beginPath()
  }
}
`

const res = parse(code, {
  sourceType: "module"
})

function walkTree(node, func) {
  func(node)

  if (node.callee !== undefined) {
    walkTree(node.callee, func)
  }

  if (node.left !== undefined) {
    walkTree(node.left, func)
  }

  if (node.right !== undefined) {
    walkTree(node.right, func)
  }

  if (node.type === "ExpressionStatement") {
    walkTree(node.expression, func)
  }

  if (node.body !== undefined) {
    if (Array.isArray(node.body)) {
      node.body.forEach(n =>
        walkTree(n, func)
      )
    } else {
      walkTree(node.body, func)
    }
  }
}

function findNodes(node, test) {
  const list = []
  walkTree(node, n => {
    if (test(n)) {
      list.push(n)
    }
  })
  return list
}

function findNodesByType(node, type) {
  return findNodes(node, n => n.type === type)
}

function flatten(arr) {
  return arr.reduce((a, b) => a.concat(b))
}

const imports = findNodesByType(res.program, "ImportDeclaration")
const modules = flatten(imports.map(n => n.specifiers.map(s => s.local.name)))
const blockStatements = findNodesByType(res.program, "BlockStatement")
const expressions = findNodesByType(res.program, "ExpressionStatement")
const usages = findNodes(res.program, n => modules.includes(n.name))

debugger

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Shidare</h1>
        <pre><code>{code}</code></pre>
      </div>
    )
  }
}

export default App
