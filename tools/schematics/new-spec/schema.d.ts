export interface ApplicationSchema extends CoreSchema {
  name: string;
  portNumber: string;
  directory?: string;
  tags?: string;
  projectRoot?: string;
}
