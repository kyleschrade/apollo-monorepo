import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
// tests
export default function (schema: any): Rule {
  return chain([
    externalSchematic('@nrwl/node', 'application', {
      name: schema.name,
    }),
  ]);
}
