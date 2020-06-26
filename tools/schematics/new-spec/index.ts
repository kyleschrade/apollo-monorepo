import {
  addProjectToNxJsonInTree,
  names,
  projectRootDir,
  ProjectType,
  toFileName,
  updateWorkspace,
  addDepsToPackageJson,
} from '@nrwl/workspace';

import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url,
  externalSchematic,
  template,
  applyTemplates,
} from '@angular-devkit/schematics';

import { getProjectConfig } from '@nrwl/workspace';
import { strings } from '@angular-devkit/core';

/**
 * Depending on your needs, you can change this to either `Library` or `Application`
 */
const projectType = ProjectType.Application;

function normalizeOptions(options: any): any {
  const projectName = toFileName(options.name);
  const projectDirectory = options.directory
    ? `${toFileName(options.directory)}/${projectName}`
    : projectName;
  const projectRoot = `${projectRootDir(projectType)}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function generateFiles(schema: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('adding NOTES.md to lib');

    const templateSource = apply(url('./files'), [
      //move(getProjectConfig(tree, schema.name).root),
      applyTemplates({ ...schema, ...strings, ...names(schema.name) }),
    ]);

    return chain([mergeWith(templateSource)])(tree, context);
  };
}

export default function (schema: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    console.log(JSON.stringify(schema));
    const normalizedOptions = normalizeOptions(schema);
    console.log(JSON.stringify(normalizedOptions));
    return chain([
      addDeps,
      updateWorkspace((workspace) => {
        const targetCollection = workspace.projects.add({
          name: normalizedOptions.projectName,
          root: normalizedOptions.projectRoot,
          sourceRoot: `${normalizedOptions.projectRoot}/src`,
          projectType,
        }).targets;

        targetCollection.add({
          name: 'build',
          builder: 'tsc',
        });

        targetCollection.add({
          name: 'serve',
          builder: 'node',
        });
      }),
      addProjectToNxJsonInTree(normalizedOptions.name, {
        tags: normalizedOptions.parsedTags,
      }),
      generateFiles(normalizedOptions),
    ])(tree, context);
  };
}

function addDeps(): Rule {
  return addDepsToPackageJson(
    {
      'apollo-server': '^2.8.0',
    },
    {}
  );
}
