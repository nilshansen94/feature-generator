import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {spawnSync} from 'node:child_process';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function feature(options: any): Rule {
  console.log('v5', options);
  return (tree: Tree, _context: SchematicContext) => {
    //console.log('current dir', __dirname);
    const path = process.cwd();
    console.log('PATH', path);
    //const workspace = tree.read('/angular.json')?.toString();
    //console.log('WORKSPACE', workspace);
    //console.log(tree);
    console.log('will execute: ', ['generate', 'component', options.name, '--path', path + '/component', '--flat'].join(' '));
    spawnSync('ng', ['generate', 'component', options.name, '--path', 'component', '--flat'], { stdio: 'inherit' });

    // Generiere die Container-Komponente in der "container"-Ordner
    spawnSync('ng', ['generate', 'component', `${options.name}Container`, '--path', 'container', '--flat', 'true', '--inline-style', 'true', '--inline-template', 'true'], { stdio: 'inherit' });

    if(options.generateService){
      spawnSync('ng', ['generate', 'service', options.name, '--path', 'service'], { stdio: 'inherit' });
    }

    return tree;
  };
}
