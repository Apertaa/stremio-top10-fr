/** Permet d'importer la page de configuration HTML comme une chaîne (règle « Text » de wrangler). */
declare module "*.html" {
  const content: string;
  export default content;
}
