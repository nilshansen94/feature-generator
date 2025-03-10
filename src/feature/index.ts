import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  strings,
  Tree,
  url
} from '@angular-devkit/schematics';
import {normalize} from '@angular-devkit/core';

/**
 * This schematic generates a pure component and it's container and if specified also a service
 * Example:
 * ng g feature:feature --name abc
 * this leads to the following file structure
 *
 * abc/
 * ├── component/
 * │   ├── abc.component.scss
 * │   ├── abc.component.html
 * │   ├── abc.component.ts
 * │   └── specs/
 * │       └── abc.component.spec.ts
 * │       └── abc.component.stories.ts
 * ├── container/
 * │   ├── abc-container.component.ts
 * │   └── specs/
 * │       └── abc-container.component.spec.ts
 * └── service/
 *     ├── abc.service.spec.ts
 * │   └── specs/
 * │       └── abc.service.spec.ts
 */
export function feature(options: any): Rule {
  const name = options.name;

  return (_tree: Tree, _context: SchematicContext) => {
    const chainItems = [
      externalSchematic('@schematics/angular', 'component', {
        name: `${strings.dasherize(name)}/component/${name}`,
        flat: true
      }),
      externalSchematic('@schematics/angular', 'component', {
        name: `${strings.dasherize(name)}/container/${name}Container`,
        flat: true,
        inlineStyle: true,
        inlineTemplate: true
      }),
    ];

    const folders = ['component', 'container'];

    if (options.generateService) {
      chainItems.push(externalSchematic('@schematics/angular', 'service', {
        name: `${strings.dasherize(name)}/service/${name}`
      }));
      folders.push('service');
    }

    chainItems.push(moveSpecFiles(options, folders));
    chainItems.push(mergeWith(templateSource(options)));

    return chain(chainItems);
  }
}

function moveSpecFiles(options: any, folders: string[]): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    folders.forEach(folder => {
      const folderPath = `${options.path}/${strings.dasherize(options.name)}/${folder}`;
      const specsFolderPath = `${folderPath}/specs`;

      // Move .spec.ts files
      const files = tree.getDir(folderPath).subfiles;
      files.forEach(file => {
        if (file.endsWith('.spec.ts')) {
          const oldPath = `${folderPath}/${file}`;
          const newPath = `${specsFolderPath}/${file}`;
          const fileContent1 = tree.read(oldPath);
          if (fileContent1) {
            const fileContent2 = fileContent1.toString().replace('./', '../');
            tree.create(newPath, fileContent2);
            tree.delete(oldPath);
          }
        }
      });
    });

    return tree;
  };
}

const templateSource = (options: any) => apply(url('./files'), [
  applyTemplates({
    classify: strings.classify,
    dasherize: strings.dasherize,
    name: options.name,
  }),
  move(normalize(options.path as string)),
]);
