import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/neat.css';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/jsx/jsx.js';
import React, { ReactElement } from 'react';
import { Node } from '../../js-tree/types';
import { Mapping } from '../mappings/types';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import './index.scss';

export interface OutputProps {
  mappings: Mapping[];
}

const Output = ({mappings}: OutputProps): ReactElement => {
  let json = mappingsToJson(mappings) as any;
  console.log(JSON.stringify(json));

  for (const key in json) {
    json = json[key];
  }
  return (
    <div style={{height: '100%'}}>
      <CodeMirror className="code-mirror" value={JSON.stringify(json, undefined, 2)}
        options={{
        mode: {name: "javascript", json: true},
        lineNumbers: true,
        lineWrapping: true,
        extraKeys: {"Ctrl-Q": (cm: any) => cm.foldCode(cm.getCursor())},
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        foldOptions: {
          widget: (from: any, to: any) => {
            var count = undefined;

            var startToken = '{', endToken = '}';        
            var prevLine = 'asd';
            if (prevLine.lastIndexOf('[') > prevLine.lastIndexOf('{')) {
              startToken = '['; endToken = ']';
            }

            var internal = 5;
            var toParse = startToken + internal + endToken;

            try {
              var parsed = JSON.parse(toParse);
              count = Object.keys(parsed).length;
            } catch(e) { }        

            return count ? `\u21A4${count}\u21A6` : '\u2194';
          }
        }
      }}>
      </CodeMirror>
    </div>
  )
}

const setByPath = (path: string, obj: any, value: any): any => {
  const firstSeparator = path.indexOf(Node.$separator);
  if (firstSeparator === -1) {
    obj[path] = value;
    return obj;
  }

  let prePath = path.substr(0, firstSeparator);
  if (obj[prePath] === undefined) {
    obj[prePath] = {};
  }

  return setByPath(path.substr(firstSeparator + 1), obj[prePath], value);  
}

const mappingsToJson = (mappings: Mapping[]) => {
  const res = {};

  for (const mapping of mappings) {
    setByPath(mapping.to.$payload, res, mapping.from.$payload);
  }

  return res;
}

export default Output;
