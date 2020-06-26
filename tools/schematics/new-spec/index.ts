import {
  addProjectToNxJsonInTree,
  names,
  projectRootDir,
  ProjectType,
  toFileName,
  updateWorkspace,
  addDepsToPackageJson,
  formatFiles,
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
import { ApplicationSchema } from './schema';

/**
 * Depending on your needs, you can change this to either `Library` or `Application`
 */
const projectType = ProjectType.Application;

function normalizeOptions(options: ApplicationSchema): any {
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

function generateFiles(schema: ApplicationSchema): Rule {
  console.log({ ...schema, ...strings, ...names(schema.name) });
  const templateSource = apply(url('./files'), [
    //move(getProjectConfig(tree, schema.name).root),
    template({ ...schema, ...strings, ...names(schema.name) }),
    formatFiles({ skipFormat: false }),
  ]);

  return mergeWith(templateSource);
}

export default function (schema: ApplicationSchema): Rule {
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
