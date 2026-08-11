import fs from 'fs';
import * as babel from '@babel/core';

const code = fs.readFileSync('src/components/Header.tsx', 'utf8');

const ast = babel.parse(code, {
  presets: ['@babel/preset-typescript', '@babel/preset-react'],
  filename: 'Header.tsx'
});

function traverse(node, path = "") {
  if (node.type === 'JSXElement') {
    const name = node.openingElement.name.name;
    console.log(path + (name || node.openingElement.name.property?.name));
    node.children.forEach((child, i) => traverse(child, path + "  "));
  } else if (node.type === 'JSXFragment') {
    node.children.forEach(child => traverse(child, path));
  } else if (node.type === 'JSXExpressionContainer') {
    // try to find elements inside expressions (conditional rendering)
    if (node.expression.type === 'LogicalExpression' && node.expression.right) {
       // e.g. isPortalOpen && <div />
       if (node.expression.right.type === 'JSXElement' || node.expression.right.type === 'JSXFragment') {
           traverse(node.expression.right, path + "  [cond] ");
       }
    } else if (node.expression.type === 'ConditionalExpression') {
       if (node.expression.consequent.type === 'JSXElement' || node.expression.consequent.type === 'JSXFragment') {
           traverse(node.expression.consequent, path + "  [true] ");
       }
       if (node.expression.alternate.type === 'JSXElement' || node.expression.alternate.type === 'JSXFragment') {
           traverse(node.expression.alternate, path + "  [false] ");
       }
    }
  } else if (node.type === 'ReturnStatement') {
    if (node.argument) traverse(node.argument, path);
  } else {
    for (let key in node) {
      if (node[key] && typeof node[key] === 'object') {
        traverse(node[key], path);
      }
    }
  }
}

traverse(ast);
