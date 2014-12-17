var _ = Underscore.load();

/**
 * <p>ParseDB is a library for Google Apps Script that has an interface like
 * ScriptDB but stores its data on Parse (https://parse.com/products/core).</p>
 *
 * <p>Parse is a popular 3rd party, cloud-based JSON object store
 * and provides many of the core features of ScriptDB. The library makes it
 * easier to transition your code from using Apps Script's native ScriptDB to
 * Parse. For more information on how to migrate off of ScriptDB see the
 * migration guide
 * (https://developers.google.com/apps-script/migration/script-db)</p>
 *
 * <p>This method gets an instance of a ParseDB database. You must have already
 * registered for an account on parse.com and created a project/app. The
 * application ID and REST API key can be found under
 * "Settings > Application keys" in the parse.com dashboard.</p>
 *
 * <p>Unlike ScriptDB, parse uses classes to segment out different types of
 * objects. Classes do not need to be defined ahead of time, but all items
 * stored within a class much conform to the same schema (if the field "foo" is
 * a number in one item it must be a number in all items).</p>
 *
 * <p>Other difference between ParseDB and ScriptDB are:</p>
 * <ul>
 *   <li>ParseDB doesn't support selecting which type of
 *   <code>SortStrategy</code> (<code>LEXICAL</code> or <code>NUMERIC</code>) to
 *   use when sorting. Number fields will always be sorted numerically, and
 *   string fields will always be sorted lexically. The parameter is silently
 *   ignored if passed in to the <code>sortBy()</code> function.</li>
 *   <li>ParseDB doesn't support querying on nested values. Nested objects can
 *   be stored in Parse, but only top-level values can be queried on. For
 *   example, <code>firstName</code> can be queried on, but
 *   <code>name.first</code> cannot.</li>
 * </ul>
 *
 * @param {string} applicationId The application ID from the parse.com
 *     dashboard.
 * @param {string} restApiKey The REST API key from the parse.com dashboard.
 * @param {string} class The class of objects within your parse.com project to
 *     read and write to.
 * @returns {ParseDbInstance} A database instance, with the same interface as
 *     <code>ScriptDbIntance</code>
 *     (https://developers.google.com/apps-script/reference/script-db/script-db-instance).
 */
function getMyDb(applicationId, restApiKey, class) {
  if (!applicationId) {
    throw 'Application ID required.';
  }
  if (!restApiKey) {
    throw 'REST API key required.';
  }
  if (!class) {
    throw 'Class required.';
  }
  return new ParseDbInstance_(applicationId, restApiKey, class);
}
