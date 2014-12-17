var ParseDbInstance_ = function(applicationId, restApiKey, class) {
  this.applicationId_ = applicationId;
  this.restApiKey_ = restApiKey;
  this.class_ = class;
};

ParseDbInstance_.DEFAULT_CLASS_ = 'item';
ParseDbInstance_.BATCH_SIZE_ = 50;

ParseDbInstance_.prototype.ASCENDING = 'ASCENDING';
ParseDbInstance_.prototype.DESCENDING = 'DESCENDING';
ParseDbInstance_.prototype.LEXICAL = 'LEXICAL';
ParseDbInstance_.prototype.NUMERIC = 'NUMERIC';

ParseDbInstance_.prototype.anyOf = function(mutationResults) {
  for (var i = 0; i < mutationResults.length; i++) {
    var result = mutationResults[i];
    if (result.success && !result.success()) {
      return false;
    }
  }
  return true;
};

ParseDbInstance_.prototype.anyOf = function(values) {
  return {
    '$in': values
  };
};

ParseDbInstance_.prototype.anyValue = function() {
  return {
    '$exists': true
  };
};

ParseDbInstance_.prototype.between = function(value1, value2) {
  return {
    '$gte': value1,
    '$lt': value2
  };
};

ParseDbInstance_.prototype.count = function(query) {
  return this.query(query).getSize();
};

ParseDbInstance_.prototype.greaterThan = function(value) {
  return {
    '$gt': value
  };
};

ParseDbInstance_.prototype.greaterThanOrEqualTo = function(value) {
  return {
    '$gte': value
  };
};

ParseDbInstance_.prototype.lessThan = function(value) {
  return {
    '$lt': value
  };
};

ParseDbInstance_.prototype.lessThanOrEqualTo = function(value) {
  return {
    '$lte': value
  };
};

ParseDbInstance_.prototype.load = function(ids) {
  if (ids instanceof Array) {
    var result = this.query({
      objectId: this.anyOf(ids)
    });
    var items = {};
    while (result.hasNext()) {
      var item = result.next();
      items[item.getId()] = item;
    }
    return ids.map(function(id) {
      return items[id];
    });
  } else {
    try {
      var item = this.call_({
        id: ids
      });
      return new ParseDbMap_(item);
    } catch (e) {
      return null;
    }
  }
};

ParseDbInstance_.prototype.not = function(value) {
  return {
    '$ne': value
  };
}

ParseDbInstance_.prototype.query = function(query) {
  return new ParseDbResult_(this, query);
};

ParseDbInstance_.prototype.remove = function(item) {
  if (!item.getId) {
    throw 'Not a ParseDB object.';
  }
  this.removeById(item.getId());
};

ParseDbInstance_.prototype.removeBatch = function(items, atomic) {
  var ids = items.map(function(item) {
    if (!item.getId) {
      throw 'Not a ParseDB object.';
    }
    return item.getId();
  });
  return this.removeByIdBatch(ids, atomic);
};

ParseDbInstance_.prototype.removeById = function(id) {
  this.call_({
    id: id,
    method: 'delete'
  });
};

ParseDbInstance_.prototype.removeByIdBatch = function(ids, atomic) {
  var self = this;
  if (atomic) {
    throw 'Atomic saves not supported.';
  }
  var start = 0;
  var results = [];
  do {
    var batch = ids.slice(start, start + ParseDbInstance_.BATCH_SIZE_);
    var requests = batch.map(function(id) {
      return {
        method: 'DELETE',
        path: '/1/classes/' + self.class_ + '/' + id
      };
    });
    var response = this.call_({
      url: 'https://api.parse.com/1/batch',
      method: 'post',
      payload: {
        requests: requests
      }
    });
    results = results.concat(response.map(function(result, i) {
      return {
        success: function() {
          return Boolean(result.success);
        }
      };
    }));

    start += ParseDbInstance_.BATCH_SIZE_;
  } while(start < ids.length);
  return results;
};

ParseDbInstance_.prototype.save = function(item) {
  var result;
  if (item.getId) {
    result = this.call_({
      id: item.getId(),
      method: 'put',
      payload: item
    });
  } else {
    result = this.call_({
      method: 'post',
      payload: item
    });
  }
  item = _.extend(_.clone(item), result);
  return new ParseDbMap_(item);
};

ParseDbInstance_.prototype.saveBatch = function(items, atomic) {
  var self = this;
  if (atomic) {
    throw 'Atomic saves not supported.';
  }
  var start = 0;
  var results = [];
  do {
    var batch = items.slice(start, start + ParseDbInstance_.BATCH_SIZE_);
    var requests = batch.map(function(item) {
      if (item.getId) {
        return {
          method: 'PUT',
          path: '/1/classes/' + self.class_ + '/' + item.getId(),
          body: item
        };
      } else {
        return {
          method: 'POST',
          path: '/1/classes/' + self.class_,
          body: item
        };
      }
    });
    var response = this.call_({
      url: 'https://api.parse.com/1/batch',
      method: 'post',
      payload: {
        requests: requests
      }
    });
    var updateItems = response.map(function(result, i) {
      if (result.success) {
        var item = _.extend(_.clone(batch[i]), result.success);
        return new ParseDbMap_(item);
      } else {
        return {
          success: function() {
            return false;
          }
        }
      }
    });
    results = results.concat(updateItems);

    start += ParseDbInstance_.BATCH_SIZE_;
  } while(start < items.length);
  return results;
};

/**
 * Makes a call to the Parse API, using the arguments provided.
 * @param {Object} args The arguments to use.
 * @param {string} args.id The ID of the object to operate on (optional).
 * @param {Object} args.params The URL parameters to incude (optional).
 * @param {string} args.method The HTTP method to use (optional).
 * @param {Object} args.payload The payload of the request (optional).
 * @param {string} args.url The API URL to make the request to.
 * @return {Object} The parsed JSON response from the API.
 */
ParseDbInstance_.prototype.call_ = function(args) {
  args = args || {};

  var url = args.url || 'https://api.parse.com/1/classes/' + this.class_;
  if (args.id) {
    url += '/' + args.id;
  }

  var params = args.params || {};
  url = buildUrl_(url, params);
  var options = {
    headers: {
      'X-Parse-Application-Id': this.applicationId_,
      'X-Parse-REST-API-Key': this.restApiKey_
    },
    muteHttpExceptions: true
  };
  if (args.method) {
    options.method = args.method;
  }
  if (args.payload) {
    options.payload = JSON.stringify(args.payload);
    options.contentType = 'application/json';
  }
  var content = UrlFetchApp.fetch(url, options).getContentText();
  var response = JSON.parse(content);
  if (response.error) {
    throw response.error;
  }
  return response;
};
