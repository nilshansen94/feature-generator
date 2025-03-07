import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function feature(options: any): Rule {
  console.log('v5', options);
  const name = options.name;

  const chainItems = [
    externalSchematic('@schematics/angular', 'component', {name: `${name}/component/${name}`, flat: true}),
    externalSchematic('@schematics/angular', 'component', {name: `${name}/container/${name}Container`, flat: true, inlineStyle: true, inlineTemplate: true}),
  ];

  if(options.generateService) {
    chainItems.push(externalSchematic('@schematics/angular', 'service', {name: `${name}/service/${name}`}));
  }

  return chain(chainItems);
}
