# ParseDb

ParseDB is a library for Google Apps Script that has an interface like the
deprecated service
[ScriptDB](https://developers.google.com/apps-script/guides/script-db/) but
stores its data on in the
[Parse Core datastore](https://parse.com/products/core). The published version
of this library can be included using the following project ID:
`MxhsVzdWH6ZQMWWeAA9tObPxhMjh3Sh48`

Parse is a popular 3rd party, cloud-based JSON object store and provides many of
the core features of ScriptDB. The library makes it easier to transition your
code from using Apps Script's native ScriptDB to Parse. For more information on
how to migrate off of ScriptDB see the
[migration guide](https://developers.google.com/apps-script/migration/script-db).

To use this library, you must have already registered for an account on
parse.com and created a project/app. The application ID and REST API key can be
found under "Settings > Application keys" in the parse.com dashboard.

Unlike ScriptDB, parse uses classes to segment out different types of objects.
Classes do not need to be defined ahead of time, but all items stored within a
class much conform to the same schema (if the field "foo" is a number in one
item it must be a number in all items).

Other difference between ParseDB and ScriptDB are:

- ParseDB doesn't support selecting which type of `SortStrategy` (`LEXICAL` or
  `NUMERIC`) to use when sorting. Number fields will always be sorted
  numerically, and string fields will always be sorted lexically. The parameter
  is silently ignored if passed in to the `sortBy()` function.
- ParseDB doesn't support querying on nested values. Nested objects can be
  stored in Parse, but only top-level values can be queried on. For example,
  `firstName` can be queried on, but `name.first` cannot.

The library relies on the following other libraries:

- Underscore: `MGwgKN2Th03tJ5OdmlzB8KPxhMjh3Sh48`
