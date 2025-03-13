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
 * This schematic generates a pure component and it's container and if specified also a service.
 * Example:
 * `ng g feature:feature --name abc`
 * This leads to the following file structure:
 *
 * abc/
 *  ├── component/
 *  │   ├── abc.component.scss
 *  │   ├── abc.component.html
 *  │   └── abc.component.ts
 *  ├── container/
 *  │   └── abc-container.component.ts
 *  ├── service/
 *  │   └── abc.service.ts
 *  └── specs/
 *      ├── abc.component.spec.ts
 *      ├── abc-container.component.spec.ts
 *      ├── abc.service.spec.ts
 *      └── abc.component.stories.ts
 *
 * How to run the schematic
 * 1. Pull this repository.
 * 2. run `npm install`
 * 2. In this repository:
 *    1. run `npm run build`
 *    2. only once: `npm link`
 * 3. In you angular project:
 *    1. only once: `npm link feature`
 *    2. `ng g feature:feature --name abc`
 *
 * If you modify the schematic, it is sufficient to run `npm run build` in the schematic, and then you can test the schematic in your angular project by simply executing again the `ng g feature:feature --name abc` command.
 */

interface FeatureOptions {
  name: string;
  generateService: boolean;
  path: string;
}

export function feature(options: FeatureOptions): Rule {
  const name = options.name;

  return (_tree: Tree, _context: SchematicContext) => {
    const chainItems = [
      externalSchematic('@schematics/angular', 'component', {
        name: `${strings.dasherize(name)}/component/${name}`,
        flat: true,
        changeDetection: 'OnPush',
      }),
      externalSchematic('@schematics/angular', 'component', {
        name: `${strings.dasherize(name)}/container/${name}Container`,
        flat: true,
        inlineStyle: true,
        inlineTemplate: true,
        changeDetection: 'OnPush',
      }),
      editContainerComponent(options)
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

function moveSpecFiles(options: FeatureOptions, folders: string[]): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    folders.forEach(folder => {
      const folderPath = `${options.path}/${strings.dasherize(options.name)}/${folder}`;
      const specsFolderPath = `${folderPath}/../specs`;

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

function editContainerComponent(options: FeatureOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const containerPath = `${options.path}/${strings.dasherize(options.name)}/container/${strings.dasherize(options.name)}-container.component.ts`;
    let containerFileContent = tree.read(containerPath)?.toString();

    containerFileContent = `import {${strings.classify(options.name)}Component} from '../component/${strings.dasherize(options.name)}.component';\n` + containerFileContent;
    const updatedContent = containerFileContent
      .replace(/imports: \[\],/, `imports: [${strings.classify(options.name)}Component],`)
      .replace(/<p>\n\s*abc-container works!\n\s*<\/p>/, `<app-${strings.dasherize(options.name)} />`);

    tree.overwrite(containerPath, updatedContent);
    return tree;
  }
}

const templateSource = (options: FeatureOptions) => apply(url('./files'), [
  applyTemplates({
    classify: strings.classify,
    dasherize: strings.dasherize,
    name: options.name,
  }),
  move(normalize(options.path)),
]);
